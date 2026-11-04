import { apiFetch } from './api';

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface ChatResponse {
  response: string;
}

export async function sendChatMessage(
  message: string,
  history: ChatMessage[] = []
): Promise<string> {
  const response = await apiFetch('/api/chat', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      message,
      history,
    }),
  });

  if (!response.ok) {
    throw new Error(`Chat API error: ${response.status}`);
  }

  const data: ChatResponse = await response.json();
  if (typeof data.response !== 'string' || !data.response.trim()) throw new Error('Empty chat response');
  return data.response;
}
