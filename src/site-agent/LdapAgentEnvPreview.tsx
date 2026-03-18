import {
  ArrowLeft,
  CheckCircle,
  CopySimple,
  DownloadSimple,
} from '@phosphor-icons/react';
import { FC, useCallback, useState } from 'react';
import { Alert } from 'react-bootstrap';

import { BaseButton } from '@waldur/core/buttons/BaseButton';
import { MonacoEditor } from '@waldur/form/MonacoEditor';
import { translate } from '@waldur/i18n';
import { CloseDialogButton } from '@waldur/modal/CloseDialogButton';
import { ModalDialog } from '@waldur/modal/ModalDialog';

interface LdapAgentEnvPreviewProps {
  config: string;
  onBack: () => void;
  onClose: () => void;
}

export const LdapAgentEnvPreview: FC<LdapAgentEnvPreviewProps> = ({
  config,
  onBack,
  onClose,
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
            iconNode={<ArrowLeft />}
            label={translate('Back')}
            size="lg"
          />
          <div className="d-flex gap-2">
            <BaseButton
              variant="tertiary"
              onClick={handleCopy}
              iconNode={copied ? <CheckCircle weight="fill" /> : <CopySimple />}
              label={
                copied ? translate('Copied!') : translate('Copy to Clipboard')
              }
              size="lg"
            />
            <BaseButton
              variant="primary"
              onClick={handleDownload}
              iconNode={<DownloadSimple />}
              label={translate('Download .env')}
              size="lg"
            />
            <CloseDialogButton label={translate('Close')} onClick={onClose} />
          </div>
        </div>
      }
    >
      {hasPlaceholders && (
        <Alert variant="warning" className="d-flex align-items-center">
          <span className="svg-icon svg-icon-2 me-2 flex-shrink-0">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              fill="currentColor"
              viewBox="0 0 256 256"
            >
              <path d="M236.8,188.09,149.35,36.22h0a24.76,24.76,0,0,0-42.7,0L19.2,188.09a23.51,23.51,0,0,0,0,23.72A24.35,24.35,0,0,0,40.55,224h174.9a24.35,24.35,0,0,0,21.33-12.19A23.51,23.51,0,0,0,236.8,188.09ZM120,104a8,8,0,0,1,16,0v40a8,8,0,0,1-16,0Zm8,88a12,12,0,1,1,12-12A12,12,0,0,1,128,192Z" />
            </svg>
          </span>
          <div>
            <strong>{translate('Action Required:')}</strong>{' '}
            {translate(
              'This file contains CHANGEME placeholder values that must be replaced with actual credentials before use.',
            )}
          </div>
        </Alert>
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
