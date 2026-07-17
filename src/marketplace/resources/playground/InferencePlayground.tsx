import { AssistantRuntimeProvider, useLocalRuntime } from '@assistant-ui/react';
import { FC, useMemo } from 'react';

import { createOpenAIChatAdapter } from './openaiChatAdapter';
import { PlaygroundThread } from './PlaygroundThread';

interface InferencePlaygroundProps {
  endpoint: string;
  model: string;
  apiKey?: string | null;
  // Endpoint/models error — locks the composer and shows an alert above it.
  error?: string | null;
  // Height of the chat surface; the dialog wants ~60vh, an inline panel can pass less.
  height?: string;
}

export const InferencePlayground: FC<InferencePlaygroundProps> = ({
  endpoint,
  model,
  apiKey,
  error,
  height = '60vh',
}) => {
  const adapter = useMemo(
    () => createOpenAIChatAdapter(endpoint, apiKey, model),
    [endpoint, apiKey, model],
  );
  const runtime = useLocalRuntime(adapter);
  return (
    <div style={{ height }}>
      <AssistantRuntimeProvider runtime={runtime}>
        <PlaygroundThread error={error} disabled={Boolean(error) || !model} />
      </AssistantRuntimeProvider>
    </div>
  );
};
