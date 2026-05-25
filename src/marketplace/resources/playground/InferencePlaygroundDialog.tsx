import { AssistantRuntimeProvider, useLocalRuntime } from '@assistant-ui/react';
import { FC, useMemo } from 'react';

import { translate } from '@/i18n';
import { ModalDialog } from '@/modal/ModalDialog';

import { createOpenAIChatAdapter } from './openaiChatAdapter';
import { PlaygroundThread } from './PlaygroundThread';

interface InferencePlaygroundDialogProps {
  resolve: {
    endpoint: string;
    resourceName: string;
  };
}

export const InferencePlaygroundDialog: FC<InferencePlaygroundDialogProps> = ({
  resolve,
}) => {
  const adapter = useMemo(
    () => createOpenAIChatAdapter(resolve.endpoint),
    [resolve.endpoint],
  );
  const runtime = useLocalRuntime(adapter);

  return (
    <ModalDialog
      title={translate('Playground · {name}', { name: resolve.resourceName })}
    >
      <p className="text-muted fs-7">
        {translate('Connected to {endpoint}', { endpoint: resolve.endpoint })}
      </p>
      <AssistantRuntimeProvider runtime={runtime}>
        <div style={{ height: '60vh' }}>
          <PlaygroundThread />
        </div>
      </AssistantRuntimeProvider>
    </ModalDialog>
  );
};
