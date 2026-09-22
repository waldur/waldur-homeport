import {
  ArrowLeftIcon,
  CheckCircleIcon,
  CopySimpleIcon,
  DownloadSimpleIcon,
} from '@phosphor-icons/react';
import { FC, useCallback, useState } from 'react';

import { AlertItem } from 'waldur-ui';

import { BaseButton } from '@/core/buttons/BaseButton';
import { MonacoEditor } from '@/form/MonacoEditor';
import { translate } from '@/i18n';
import { CloseDialogButton } from '@/modal/CloseDialogButton';
import { ModalDialog } from '@/modal/ModalDialog';

interface LdapAgentEnvPreviewProps {
  config: string;
  onBack: () => void;
}

export const LdapAgentEnvPreview: FC<LdapAgentEnvPreviewProps> = ({
  config,
  onBack,
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(config);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Silently handle copy failure
    }
  }, [config]);

  const handleDownload = useCallback(() => {
    const blob = new Blob([config], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'refresh-glauth-config.env';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [config]);

  const hasPlaceholders = config.includes('CHANGEME');

  return (
    <ModalDialog
      title={translate('LDAP Agent Environment')}
      footer={
        <div className="d-flex justify-content-between w-100">
          <BaseButton
            variant="tertiary"
            onClick={onBack}
            iconNode={<ArrowLeftIcon weight="bold" />}
            label={translate('Back')}
            size="lg"
          />
          <div className="d-flex gap-2">
            <BaseButton
              variant="tertiary"
              onClick={handleCopy}
              iconNode={
                copied ? (
                  <CheckCircleIcon weight="fill" />
                ) : (
                  <CopySimpleIcon weight="bold" />
                )
              }
              label={
                copied ? translate('Copied!') : translate('Copy to Clipboard')
              }
              size="lg"
            />
            <CloseDialogButton label={translate('Close')} />
            <BaseButton
              variant="primary"
              onClick={handleDownload}
              iconNode={<DownloadSimpleIcon weight="bold" />}
              label={translate('Download .env')}
              size="lg"
            />
          </div>
        </div>
      }
    >
      {hasPlaceholders && (
        <AlertItem
          type="floating"
          variant="warning"
          title={translate('Action Required:')}
          body={translate(
            'This file contains CHANGEME placeholder values that must be replaced with actual credentials before use.',
          )}
        />
      )}

      <div className="border rounded overflow-hidden">
        <MonacoEditor
          value={config}
          onChange={() => {}}
          language="plaintext"
          theme="vs-dark"
          height={400}
          readOnly
        />
      </div>

      <div className="mt-3 text-muted small">
        <p className="mb-1">
          <strong>{translate('Next steps:')}</strong>
        </p>
        <ol className="mb-0 ps-3">
          <li>
            {translate(
              'Replace CHANGEME placeholder values with actual credentials.',
            )}
          </li>
          <li>
            {translate(
              'Save this file as .env in your refresh-glauth-config service installation directory.',
            )}
          </li>
          <li>
            {translate(
              'Restart the refresh-glauth-config service service to apply the new configuration.',
            )}
          </li>
        </ol>
      </div>
    </ModalDialog>
  );
};
