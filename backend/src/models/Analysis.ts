import mongoose, { Document, Schema, Types } from 'mongoose';

export interface ISource {
  url: string;
  title: string;
  similarity: number;
  matchedText: string;
}

export interface IAIAnalysis {
  summary: string;
  keyFindings: string[];
  riskLevel: 'low' | 'medium' | 'high';
  recommendations: string[];
  contentType: string;
}

export interface IMLAnalysis {
  semanticSimilarity: number;
  fingerprintMatch: number;
  paraphraseScore: number;
  languageDetected: string;
}

export interface IAnalysis extends Document {
  userId?: Types.ObjectId;
  text: string;
  title?: string;
  plagiarismScore: number;
  aiDetectionScore: number;
  aiDetectionLabel: string;
  sources: ISource[];
  aiAnalysis: IAIAnalysis;
  mlAnalysis: IMLAnalysis;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  processingTime?: number;
  createdAt: Date;
}

const SourceSchema = new Schema<ISource>(
  {
    url: { type: String, default: '' },
    title: { type: String, default: '' },
    similarity: { type: Number, default: 0 },
    matchedText: { type: String, default: '' },
  },
  { _id: false }
);

const AnalysisSchema = new Schema<IAnalysis>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User' },
    text: { type: String, required: [true, 'Text is required'] },
    title: { type: String, default: 'Untitled Analysis' },
    plagiarismScore: { type: Number, default: 0, min: 0, max: 100 },
    aiDetectionScore: { type: Number, default: 0, min: 0, max: 100 },
    aiDetectionLabel: { type: String, default: 'Unknown' },
    sources: { type: [SourceSchema], default: [] },
    aiAnalysis: {
      summary: { type: String, default: '' },
      keyFindings: { type: [String], default: [] },
      riskLevel: {
        type: String,
        enum: ['low', 'medium', 'high'],
        default: 'low',
      },
      recommendations: { type: [String], default: [] },
      contentType: { type: String, default: 'Unknown' },
    },
    mlAnalysis: {
      semanticSimilarity: { type: Number, default: 0 },
      fingerprintMatch: { type: Number, default: 0 },
      paraphraseScore: { type: Number, default: 0 },
      languageDetected: { type: String, default: 'en' },
    },
    status: {
      type: String,
      enum: ['pending', 'processing', 'completed', 'failed'],
      default: 'pending',
    },
    processingTime: { type: Number },
  },
  { timestamps: true }
);

AnalysisSchema.index({ userId: 1, createdAt: -1 });
AnalysisSchema.index({ createdAt: -1 });

export const Analysis = mongoose.model<IAnalysis>('Analysis', AnalysisSchema);
export default Analysis;
