import { useQuery } from '@tanstack/react-query';
import { translate } from 'waldur-i18n-runtime';
import {
  marketplaceResourceApiKeysRevealRetrieve,
  ResourceApiKeyStatus,
} from 'waldur-js-client';
import {
  AlertItem,
  CloseDialogButton,
  Code,
  CopyButton,
  LoadingSpinner,
  ModalDialog,
  ModalShell,
} from 'waldur-ui';

import { keyName } from './services';

/**
 * A key's value, fetched when the dialog opens and kept only while it is
 * open: each reveal is recorded, and the value never reaches storage.
 */
const RevealedKey = ({
  apiKey,
  endpoint,
}: {
  apiKey: ResourceApiKeyStatus;
  endpoint?: string | null;
}) => {
  const revealed = useQuery({
    queryKey: ['reveal', apiKey.uuid],
    queryFn: () =>
      marketplaceResourceApiKeysRevealRetrieve({
        path: { uuid: apiKey.uuid },
      }).then((response) => response.data.api_key),
    // Nothing caches it: closing the dialog drops the value.
    gcTime: 0,
    staleTime: Infinity,
    retry: false,
  });

  if (revealed.isLoading) return <LoadingSpinner />;
  if (revealed.isError || !revealed.data) {
    return (
      <AlertItem
        variant="error"
        title={translate('Could not reveal the key')}
        body={translate(
          'It may have changed meanwhile. Close this and try again.',
        )}
      />
    );
  }
  const snippet = [
    endpoint ? `export OPENAI_BASE_URL=${endpoint}` : null,
    `export OPENAI_API_KEY=${revealed.data}`,
  ]
    .filter(Boolean)
    .join('\n');
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <Code className="min-w-0 break-all">{revealed.data}</Code>
        <CopyButton
          value={revealed.data}
          name={translate('Key')}
          label={translate('Copy key')}
          copiedLabel={translate('Copied')}
        />
      </div>
      <div className="flex flex-col gap-1">
        <span className="text-sm font-medium">{translate('Use it')}</span>
        <pre className="m-0 overflow-x-auto rounded-lg bg-secondary p-3 text-xs">
          {snippet}
        </pre>
      </div>
      <AlertItem
        variant="info"
        title={translate('You can reveal it again whenever you need it')}
        body={translate(
          'Each reveal is recorded. Keep it out of code and notebooks you share; if it leaks, replace it and the old value stops working.',
        )}
      />
    </div>
  );
};

export const RevealKeyDialog = ({
  apiKey,
  endpoint,
  onClose,
}: {
  apiKey: ResourceApiKeyStatus | null;
  endpoint?: string | null;
  onClose: () => void;
}) => (
  <ModalShell open={!!apiKey} onHide={onClose} size="md">
    {apiKey ? (
      <ModalDialog
        title={keyName(apiKey) ?? translate('API key')}
        subtitle={apiKey.offering_name}
        footer={<CloseDialogButton label={translate('Done')} />}
      >
        <RevealedKey apiKey={apiKey} endpoint={endpoint} />
      </ModalDialog>
    ) : null}
  </ModalShell>
);
