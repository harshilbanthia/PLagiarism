import logging
import math
import re
import string
from contextlib import asynccontextmanager
from typing import Any

import numpy as np
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# ─── Reference corpus ─────────────────────────────────────────────────────────
REFERENCE_CORPUS = [
    {
        "id": "ref_001",
        "source": "Introduction to Machine Learning (Textbook, 2019)",
        "text": (
            "Machine learning is a branch of artificial intelligence that enables systems to learn "
            "and improve from experience without being explicitly programmed. It focuses on developing "
            "computer programs that can access data and use it to learn for themselves. The process "
            "begins with observations or data, such as examples, direct experience, or instruction, "
            "so that the machine can seek patterns in data and make better decisions in the future."
        ),
    },
    {
        "id": "ref_002",
        "source": "Deep Learning Fundamentals (Academic Paper, 2020)",
        "text": (
            "Deep learning is part of a broader family of machine learning methods based on artificial "
            "neural networks with representation learning. Learning can be supervised, semi-supervised "
            "or unsupervised. Deep learning architectures such as deep neural networks, recurrent neural "
            "networks, and convolutional neural networks have been applied to fields including computer "
            "vision, speech recognition, natural language processing, and bioinformatics."
        ),
    },
    {
        "id": "ref_003",
        "source": "Natural Language Processing Overview (Survey, 2021)",
        "text": (
            "Natural language processing is a subfield of linguistics, computer science, and artificial "
            "intelligence concerned with the interactions between computers and human language, in "
            "particular how to program computers to process and analyze large amounts of natural language "
            "data. The goal is a computer capable of understanding the contents of documents, including "
            "the contextual nuances of the language within them."
        ),
    },
    {
        "id": "ref_004",
        "source": "Climate Change and Global Warming (Environmental Report, 2022)",
        "text": (
            "Climate change refers to long-term shifts in temperatures and weather patterns. These shifts "
            "may be natural, such as through variations in the solar cycle. But since the 1800s, human "
            "activities have been the main driver of climate change, primarily due to burning fossil fuels "
            "like coal, oil and gas. Burning fossil fuels generates greenhouse gas emissions that act like "
            "a blanket wrapped around the Earth, trapping the sun's heat and raising temperatures."
        ),
    },
    {
        "id": "ref_005",
        "source": "Quantum Computing: A Brief Introduction (IEEE, 2021)",
        "text": (
            "Quantum computing is a type of computation that harnesses the collective properties of quantum "
            "states, such as superposition, interference, and entanglement, to perform calculations. The "
            "devices that perform quantum computations are known as quantum computers. They are believed to "
            "be able to solve certain computational problems, such as integer factorization, substantially "
            "faster than classical computers."
        ),
    },
    {
        "id": "ref_006",
        "source": "The History of the Internet (Encyclopedia Britannica, 2020)",
        "text": (
            "The Internet is a global system of interconnected computer networks that uses the Internet "
            "protocol suite to communicate between networks and devices. It is a network of networks that "
            "consists of private, public, academic, business, and government networks of local to global "
            "scope, linked by a broad array of electronic, wireless, and optical networking technologies. "
            "The Internet carries a vast range of information resources and services."
        ),
    },
]

# ─── Global model state ───────────────────────────────────────────────────────
_model_state: dict[str, Any] = {
    "loaded": False,
    "encoder": None,
    "corpus_embeddings": None,
}


def _load_models() -> None:
    try:
        from sentence_transformers import SentenceTransformer

        logger.info("Loading sentence-transformers model 'all-MiniLM-L6-v2' …")
        encoder = SentenceTransformer("all-MiniLM-L6-v2")
        corpus_texts = [item["text"] for item in REFERENCE_CORPUS]
        corpus_embeddings = encoder.encode(corpus_texts, convert_to_numpy=True)
        _model_state["encoder"] = encoder
        _model_state["corpus_embeddings"] = corpus_embeddings
        _model_state["loaded"] = True
        logger.info("Model loaded successfully.")
    except Exception as exc:
        logger.warning("Could not load sentence-transformers model: %s", exc)
        logger.warning("Falling back to heuristic plagiarism detection.")


@asynccontextmanager
async def lifespan(app: FastAPI):
    _load_models()
    yield


app = FastAPI(title="PLagiarism ML Service", version="1.0.0", lifespan=lifespan)


# ─── Schemas ──────────────────────────────────────────────────────────────────
class TextRequest(BaseModel):
    text: str


class PlagiarismResponse(BaseModel):
    score: float
    sources: list[dict]


class AIContentResponse(BaseModel):
    score: float
    label: str
    modelProbabilities: dict
    patterns: list[str]


# ─── Helpers: plagiarism ──────────────────────────────────────────────────────
def _cosine_similarity(a: np.ndarray, b: np.ndarray) -> float:
    denom = np.linalg.norm(a) * np.linalg.norm(b)
    if denom == 0:
        return 0.0
    return float(np.dot(a, b) / denom)


def _heuristic_plagiarism(text: str) -> tuple[float, list[dict]]:
    """
    Simple word-overlap (Jaccard) heuristic used when the model is unavailable.
    """
    def jaccard(a: str, b: str) -> float:
        sa = set(a.lower().split())
        sb = set(b.lower().split())
        if not sa | sb:
            return 0.0
        return len(sa & sb) / len(sa | sb)

    results = []
    for item in REFERENCE_CORPUS:
        sim = jaccard(text, item["text"])
        results.append({"source": item["source"], "similarity": round(sim * 100, 2)})

    results.sort(key=lambda x: x["similarity"], reverse=True)
    top_score = results[0]["similarity"] if results else 0.0
    return top_score, results[:3]


def _model_plagiarism(text: str) -> tuple[float, list[dict]]:
    encoder = _model_state["encoder"]
    corpus_embeddings: np.ndarray = _model_state["corpus_embeddings"]

    query_embedding = encoder.encode([text], convert_to_numpy=True)[0]
    similarities = [
        _cosine_similarity(query_embedding, ce) for ce in corpus_embeddings
    ]

    results = [
        {
            "source": REFERENCE_CORPUS[i]["source"],
            "similarity": round(similarities[i] * 100, 2),
        }
        for i in range(len(REFERENCE_CORPUS))
    ]
    results.sort(key=lambda x: x["similarity"], reverse=True)
    top_score = results[0]["similarity"] if results else 0.0
    return top_score, results[:3]


# ─── Helpers: AI content ──────────────────────────────────────────────────────
def _avg_sentence_length(sentences: list[str]) -> float:
    if not sentences:
        return 0.0
    lengths = [len(s.split()) for s in sentences if s.strip()]
    return float(np.mean(lengths)) if lengths else 0.0


def _punctuation_ratio(text: str) -> float:
    if not text:
        return 0.0
    punct_count = sum(1 for ch in text if ch in string.punctuation)
    return punct_count / len(text)


def _type_token_ratio(words: list[str]) -> float:
    if not words:
        return 0.0
    return len(set(w.lower() for w in words)) / len(words)


def _burstiness(sentences: list[str]) -> float:
    """
    Coefficient of variation of sentence lengths — high burstiness is more human-like.
    AI text tends to have more uniform sentence lengths (lower burstiness).
    """
    lengths = [len(s.split()) for s in sentences if s.strip()]
    if len(lengths) < 2:
        return 0.0
    mean = np.mean(lengths)
    std = np.std(lengths)
    if mean == 0:
        return 0.0
    return float(std / mean)


def _compute_ai_score(text: str) -> tuple[float, list[str]]:
    sentences = re.split(r"(?<=[.!?])\s+", text.strip())
    words = re.findall(r"\b\w+\b", text)

    avg_len = _avg_sentence_length(sentences)
    punct_r = _punctuation_ratio(text)
    ttr = _type_token_ratio(words)
    burst = _burstiness(sentences)

    patterns: list[str] = []
    score = 0.0

    # Long, uniform sentences are typical of AI
    if avg_len > 22:
        score += 25
        patterns.append("Unusually long average sentence length")
    elif avg_len > 18:
        score += 12

    # Low TTR → repetitive vocabulary → AI-like
    if ttr < 0.45:
        score += 25
        patterns.append("Low vocabulary diversity (repetitive word usage)")
    elif ttr < 0.60:
        score += 10

    # Low burstiness → uniform rhythm → AI-like
    if burst < 0.20:
        score += 25
        patterns.append("Highly uniform sentence structure (low burstiness)")
    elif burst < 0.35:
        score += 10

    # Very low or very high punctuation can be AI-like
    if punct_r < 0.02:
        score += 15
        patterns.append("Unusually low punctuation density")
    elif punct_r > 0.12:
        score += 10
        patterns.append("Unusually high punctuation density")

    # Lack of first-person pronouns is common in AI text
    first_person = len(re.findall(r"\b(I|me|my|myself|we|our|us)\b", text, re.I))
    if first_person == 0 and len(words) > 50:
        score += 10
        patterns.append("Absence of first-person perspective")

    # Cap at 100
    score = min(score, 100.0)
    return round(score, 2), patterns


# ─── Routes ───────────────────────────────────────────────────────────────────
@app.get("/health")
def health():
    return {"status": "ok", "models_loaded": _model_state["loaded"]}


@app.post("/detect/plagiarism", response_model=PlagiarismResponse)
def detect_plagiarism(req: TextRequest):
    text = req.text.strip()
    if not text:
        raise HTTPException(status_code=400, detail="text must not be empty")

    if _model_state["loaded"]:
        score, sources = _model_model_plagiarism_safe(text)
    else:
        score, sources = _heuristic_plagiarism(text)

    return PlagiarismResponse(score=score, sources=sources)


def _model_model_plagiarism_safe(text: str) -> tuple[float, list[dict]]:
    try:
        return _model_plagiarism(text)
    except Exception as exc:
        logger.warning("Model inference failed, using heuristic: %s", exc)
        return _heuristic_plagiarism(text)


@app.post("/detect/ai-content", response_model=AIContentResponse)
def detect_ai_content(req: TextRequest):
    text = req.text.strip()
    if not text:
        raise HTTPException(status_code=400, detail="text must not be empty")

    score, patterns = _compute_ai_score(text)

    if score < 40:
        label = "Human Written"
    elif score <= 70:
        label = "Likely AI Generated"
    else:
        label = "AI Generated"

    human_prob = round(100 - score, 2)
    model_probabilities = {
        "human": human_prob,
        "ai": score,
    }

    return AIContentResponse(
        score=score,
        label=label,
        modelProbabilities=model_probabilities,
        patterns=patterns,
    )
