import axios, { AxiosError } from 'axios';

const ML_SERVICE_URL = process.env.ML_SERVICE_URL || 'http://localhost:8000';
const ML_TIMEOUT_MS = 10_000;

let _mlAvailable: boolean | null = null;
let _lastCheck = 0;
const CHECK_INTERVAL_MS = 30_000; // re-check every 30 s

export async function isMLServiceAvailable(): Promise<boolean> {
  const now = Date.now();
  if (_mlAvailable !== null && now - _lastCheck < CHECK_INTERVAL_MS) {
    return _mlAvailable;
  }

  try {
    await axios.get(`${ML_SERVICE_URL}/health`, { timeout: 3_000 });
    _mlAvailable = true;
  } catch {
    _mlAvailable = false;
  }

  _lastCheck = now;
  return _mlAvailable;
}

export async function callMLService(
  endpoint: string,
  data: object
): Promise<Record<string, unknown>> {
  const url = `${ML_SERVICE_URL}${endpoint}`;
  try {
    const response = await axios.post<Record<string, unknown>>(url, data, {
      timeout: ML_TIMEOUT_MS,
      headers: { 'Content-Type': 'application/json' },
    });
    return response.data;
  } catch (err) {
    const axiosErr = err as AxiosError;
    const message = axiosErr.response
      ? `ML service responded with ${axiosErr.response.status}`
      : `ML service unreachable: ${axiosErr.message}`;
    throw new Error(message);
  }
}
