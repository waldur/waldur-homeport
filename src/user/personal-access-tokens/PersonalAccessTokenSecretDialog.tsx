import { EyeIcon, EyeSlashIcon } from '@phosphor-icons/react';
import { FunctionComponent, useCallback, useMemo, useState } from 'react';

import { AlertItem, FormHeading } from 'waldur-ui';

import { ENV } from '@/core/config';
import { CopyToClipboardButton } from '@/core/CopyToClipboardButton';
import { translate } from '@/i18n';
import { CloseDialogButton } from '@/modal/CloseDialogButton';
import { ModalDialog } from '@/modal/ModalDialog';

interface PersonalAccessTokenSecretDialogProps {
  resolve: {
    token: string;
    tokenName: string;
  };
}

export const PersonalAccessTokenSecretDialog: FunctionComponent<
  PersonalAccessTokenSecretDialogProps
> = ({ resolve: { token, tokenName } }) => {
  const [showSecret, setShowSecret] = useState(false);
  const toggleSecret = useCallback(() => setShowSecret((prev) => !prev), []);

  const maskedToken = useMemo(
    () => token.slice(0, 10) + '•'.repeat(token.length - 10),
    [token],
  );

  const curlExample = useMemo(
    () =>
      `curl -H "Authorization: Bearer ${token}" ${ENV.apiEndpoint}api/customers/`,
    [token],
  );

  const maskedCurlExample = useMemo(
    () =>
      `curl -H "Authorization: Bearer ${maskedToken}" ${ENV.apiEndpoint}api/customers/`,
    [maskedToken],
  );

  return (
    <ModalDialog
      title={translate('Personal access token created')}
      footer={<CloseDialogButton label={translate('Done')} />}
    >
      <AlertItem
        type="floating"
        variant="warning"
        title={translate(
          'Make sure to copy your personal access token now. You will not be able to see it again.',
        )}
        // The secret is shown only once: keep the tinted warning surface.
        className="mb-3 bg-warning-subtle"
      />

      <div className="mb-2.5">
        <FormHeading as="p">{translate('Token name')}</FormHeading>
        <div>{tokenName}</div>
      </div>

      <div className="mb-2.5">
        <FormHeading as="p">{translate('Your token')}</FormHeading>
        <div className="flex items-center gap-1.5 p-2.5 bg-tertiary dark:bg-quaternary rounded">
          <button
            className="text-btn shrink-0"
            type="button"
            onClick={toggleSecret}
          >
            {showSecret ? (
              <EyeSlashIcon size={20} weight="bold" />
            ) : (
              <EyeIcon size={20} weight="bold" />
            )}
          </button>
          <code className="grow text-break">
            {showSecret ? token : maskedToken}
          </code>
          <CopyToClipboardButton value={token} />
        </div>
      </div>

      <div>
        <FormHeading as="p">{translate('Example usage')}</FormHeading>
        <div className="flex items-start gap-1.5 p-2.5 bg-tertiary dark:bg-quaternary rounded">
          <code className="grow text-break">
            {showSecret ? curlExample : maskedCurlExample}
          </code>
          <CopyToClipboardButton value={curlExample} />
        </div>
      </div>
    </ModalDialog>
  );
};
