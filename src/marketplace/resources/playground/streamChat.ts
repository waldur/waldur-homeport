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

// LiteLLM's own set: it serves `responses` models on /chat/completions too,
// bridging to the Responses API.
const CHAT_MODES = new Set(['chat', 'responses']);

// /model/info is optional, so a gateway that never answers it must not leave
// the picker loading.
const MODEL_INFO_TIMEOUT_MS = 5000;

// The ids a LiteLLM gateway marks in `/model/info` as for something other than
// chat (embedding, rerank, ...). It lists one row per deployment and several
// can share a name, so an id is hidden only when none of its rows can chat; a
// row without a mode counts as one that can.
const readNonChatModels = async (
  baseUrl: string,
  apiKey: string | null | undefined,
  signal: AbortSignal,
): Promise<Set<string>> => {
  const response = await fetch(`${baseUrl}/model/info`, {
    signal,
    headers: authHeaders(apiKey),
  });
  if (!response.ok) {
    return new Set();
  }
  const data = await response.json();
  const rows: any[] = Array.isArray(data?.data) ? data.data : [];
  const chat = new Set<string>();
  const other = new Set<string>();
  for (const row of rows) {
    const name = row?.model_name;
    if (typeof name !== 'string') continue;
    const mode = row?.model_info?.mode;
    if (typeof mode === 'string' && mode && !CHAT_MODES.has(mode)) {
      other.add(name);
    } else {
      chat.add(name);
    }
  }
  return new Set([...other].filter((name) => !chat.has(name)));
};

// Hides nothing when the endpoint has no such listing (not every
// OpenAI-compatible gateway does), when it fails, or when it is too slow. Only
// the caller's own cancel comes through, so a cancelled load stays cancelled.
const fetchNonChatModels = async (
  baseUrl: string,
  apiKey?: string | null,
  signal?: AbortSignal,
): Promise<Set<string>> => {
  const controller = new AbortController();
  const cancel = () => controller.abort();
  if (signal?.aborted) cancel();
  signal?.addEventListener('abort', cancel);
  let timer: ReturnType<typeof setTimeout>;
  // Races the request instead of relying on the abort alone, so a body that
  // stalls mid-read can't hold the picker either.
  const timeout = new Promise<Set<string>>((resolve) => {
    timer = setTimeout(() => {
      controller.abort();
      resolve(new Set());
    }, MODEL_INFO_TIMEOUT_MS);
  });
  try {
    return await Promise.race([
      readNonChatModels(baseUrl, apiKey, controller.signal),
      timeout,
    ]);
  } catch (e) {
    if (signal?.aborted) {
      throw e;
    }
    return new Set();
  } finally {
    clearTimeout(timer);
    signal?.removeEventListener('abort', cancel);
  }
};

const fetchModelIds = async (
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

// List the model ids the endpoint exposes (OpenAI `/v1/models`) for the model
// picker. Sends the api key so gateways that gate `/models` don't 401. The
// playground only chats, so a model the gateway marks as for something else
// (an embedding or rerank model, say) is left out; one with no mode is kept.
// Both requests go out together, so the mode lookup adds no round trip.
export const listInferenceModels = async (
  baseUrl: string,
  apiKey?: string | null,
  signal?: AbortSignal,
): Promise<string[]> => {
  const [ids, nonChat] = await Promise.all([
    fetchModelIds(baseUrl, apiKey, signal),
    fetchNonChatModels(baseUrl, apiKey, signal),
  ]);
  const chatIds = ids.filter((id) => !nonChat.has(id));
  if (chatIds.length === 0) {
    throw new Error(translate('The endpoint does not expose any chat model.'));
  }
  return chatIds;
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
