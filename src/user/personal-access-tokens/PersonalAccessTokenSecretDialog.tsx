import {
  DownloadSimpleIcon,
  EyeIcon,
  EyeSlashIcon,
} from '@phosphor-icons/react';
import { FunctionComponent, useCallback, useMemo, useState } from 'react';

import { AlertItem, BaseButton, FormHeading, FormText, Code } from 'waldur-ui';

import { CopyToClipboardButton } from '@/core/CopyToClipboardButton';
import { saveFile } from '@/core/saveFile';
import { translate } from '@/i18n';
import { CloseDialogButton } from '@/modal/CloseDialogButton';
import { ModalDialog } from '@/modal/ModalDialog';
import { SiteAgentConfigView } from '@/site-agent/SiteAgentConfigPreview';
import { getAbsoluteApiUrl } from '@/site-agent/siteAgentTokenConfig';

interface PersonalAccessTokenSecretDialogProps {
  resolve: {
    token: string;
    tokenName: string;
    /** A site agent's configuration with this token in it. */
    agentConfig?: string;
    /** The dedicated user the token was created for, if any. */
    username?: string;
  };
}

export const PersonalAccessTokenSecretDialog: FunctionComponent<
  PersonalAccessTokenSecretDialogProps
> = ({ resolve: { token, tokenName, agentConfig, username } }) => {
  const [showSecret, setShowSecret] = useState(false);
  const toggleSecret = useCallback(() => setShowSecret((prev) => !prev), []);

  const maskedToken = useMemo(
    () => token.slice(0, 10) + '•'.repeat(token.length - 10),
    [token],
  );

  const curlExample = useMemo(
    () =>
      `curl -H "Authorization: Bearer ${token}" ${getAbsoluteApiUrl()}customers/`,
    [token],
  );

  const maskedCurlExample = useMemo(
    () =>
      `curl -H "Authorization: Bearer ${maskedToken}" ${getAbsoluteApiUrl()}customers/`,
    [maskedToken],
  );

  const maskedAgentConfig = useMemo(
    () => agentConfig?.split(token).join(maskedToken),
    [agentConfig, token, maskedToken],
  );

  const downloadAgentConfig = useCallback(() => {
    if (!agentConfig) return;
    saveFile(
      new Blob([agentConfig], { type: 'text/yaml' }),
      'waldur-site-agent-config.yaml',
    );
  }, [agentConfig]);

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

      {username && (
        <div className="mb-2.5" data-testid="agent-username">
          <FormHeading as="p">{translate('New user')}</FormHeading>
          <div className="flex items-center gap-1.5">
            <Code>{username}</Code>
            <CopyToClipboardButton value={username} />
          </div>
          <FormText variant="muted">
            {translate(
              'The token belongs to this user, who manages only this offering and has no password.',
            )}
          </FormText>
        </div>
      )}

      <div className="mb-2.5">
        <FormHeading as="p">{translate('Your token')}</FormHeading>
        <div className="flex items-center gap-1.5 p-2.5 bg-tertiary dark:bg-quaternary rounded-lg">
          <button
            className="bg-transparent border-0 p-0 m-0 cursor-pointer text-quaternary hover:text-secondary shrink-0 inline-flex items-center"
            type="button"
            onClick={toggleSecret}
            aria-label={
              showSecret ? translate('Hide token') : translate('Show token')
            }
          >
            {showSecret ? (
              <EyeSlashIcon size={20} weight="bold" />
            ) : (
              <EyeIcon size={20} weight="bold" />
            )}
          </button>
          <Code className="grow wrap-anywhere">
            {showSecret ? token : maskedToken}
          </Code>
          <CopyToClipboardButton value={token} />
        </div>
      </div>

      <div>
        <FormHeading as="p">{translate('Example usage')}</FormHeading>
        <div className="flex items-start gap-1.5 p-2.5 bg-tertiary dark:bg-quaternary rounded-lg">
          <Code className="grow wrap-anywhere">
            {showSecret ? curlExample : maskedCurlExample}
          </Code>
          <CopyToClipboardButton value={curlExample} />
        </div>
      </div>

      {agentConfig && (
        <div className="mt-2.5" data-testid="site-agent-config">
          <div className="flex items-center gap-1.5 mb-1.5">
            <FormHeading as="p" className="grow">
              {translate('Site agent configuration')}
            </FormHeading>
            <CopyToClipboardButton value={agentConfig} />
            <BaseButton
              variant="tertiary"
              size="sm"
              onClick={downloadAgentConfig}
              iconNode={<DownloadSimpleIcon weight="bold" />}
              label={translate('Download YAML')}
            />
          </div>
          <SiteAgentConfigView
            config={agentConfig}
            displayedConfig={showSecret ? agentConfig : maskedAgentConfig}
          />
        </div>
      )}
    </ModalDialog>
  );
};
