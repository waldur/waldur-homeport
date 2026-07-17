import { translate } from '@/i18n';

export interface PlaygroundMessage {
  role: 'user' | 'assistant';
  content: string;
}

const reachabilityError = () =>
  new Error(
    translate(
      'Could not reach the inference endpoint. It may be offline or not publicly reachable — contact the provider if this persists.',
    ),
  );

const asFetchError = (e: unknown): Error =>
  (e as Error)?.name === 'AbortError' ? (e as Error) : reachabilityError();

// Map a failed HTTP response to a user-facing message. Auth failures are the
// common case — the key is invalid or was minted for a different gateway — and
// aren't user-fixable, so they point at the provider.
const httpError = (status: number): Error =>
  status === 401 || status === 403
    ? new Error(
        translate(
          'The endpoint rejected the API key ({status}). It may be invalid or not authorized for this endpoint — contact the provider if this persists.',
          { status },
        ),
      )
    : new Error(
        translate('The endpoint returned an error ({status}).', { status }),
      );

const OPEN = '<think>';
const CLOSE = '</think>';

// vLLM/Qwen-style replies may prefix a <think>…</think> reasoning block; split
// it from the final answer. Handles the streaming case where </think> hasn't
// arrived yet (reasoning still open).
export const splitReasoning = (
  text: string,
): { reasoning?: string; answer: string; reasoningOpen: boolean } => {
  if (text.startsWith(OPEN)) {
    const closeIdx = text.indexOf(CLOSE);
    if (closeIdx === -1) {
      return {
        reasoning: text.slice(OPEN.length).trim(),
        answer: '',
        reasoningOpen: true,
      };
    }
    return {
      reasoning: text.slice(OPEN.length, closeIdx).trim(),
      answer: text.slice(closeIdx + CLOSE.length).trim(),
      reasoningOpen: false,
    };
  }
  return { answer: text, reasoningOpen: false };
};

// OpenAI-compatible auth: the endpoint (Envoy gateway / LiteLLM / vLLM) expects
// the client's key as a Bearer token.
const authHeaders = (apiKey?: string | null): Record<string, string> =>
  apiKey ? { Authorization: `Bearer ${apiKey}` } : {};

// List the model ids the endpoint exposes (OpenAI `/v1/models`) for the model
// picker. Sends the api key so gateways that gate `/models` don't 401.
export const listInferenceModels = async (
  baseUrl: string,
  apiKey?: string | null,
  signal?: AbortSignal,
): Promise<string[]> => {
  let response: Response;
  try {
    response = await fetch(`${baseUrl}/models`, {
      signal,
      headers: authHeaders(apiKey),
    });
  } catch (e) {
    throw asFetchError(e);
  }
  if (!response.ok) {
    throw httpError(response.status);
  }
  const data = await response.json();
  const ids: string[] = (data?.data ?? [])
    .map((model: any) => model?.id)
    .filter((id: any): id is string => typeof id === 'string' && id.length > 0);
  if (ids.length === 0) {
    throw new Error(translate('The endpoint does not expose any model.'));
  }
  return ids;
};

export async function* streamInferenceReply(
  baseUrl: string,
  model: string,
  messages: PlaygroundMessage[],
  apiKey?: string | null,
  signal?: AbortSignal,
): AsyncGenerator<string> {
  let response: Response;
  try {
    response = await fetch(`${baseUrl}/chat/completions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...authHeaders(apiKey) },
      signal,
      body: JSON.stringify({ model, stream: true, messages }),
    });
  } catch (e) {
    throw asFetchError(e);
  }

  if (!response.ok) {
    throw httpError(response.status);
  }
  if (!response.body) {
    throw new Error(translate('The endpoint returned an empty response.'));
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';
  let text = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop() ?? '';
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed.startsWith('data:')) continue;
      const payload = trimmed.slice(5).trim();
      if (payload === '' || payload === '[DONE]') continue;
      try {
        const chunk = JSON.parse(payload);
        const delta = chunk?.choices?.[0]?.delta?.content;
        if (delta) {
          text += delta;
          yield text;
        }
      } catch {
        // Ignore partial/non-JSON SSE lines.
      }
    }
  }
}
