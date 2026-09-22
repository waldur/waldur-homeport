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

interface SiteAgentConfigPreviewProps {
  config: string;
  onBack: () => void;
  onClose: () => void;
}

export const SiteAgentConfigPreview: FC<SiteAgentConfigPreviewProps> = ({
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
    const blob = new Blob([config], { type: 'text/yaml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'waldur-site-agent-config.yaml';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [config]);

  // Check if config contains placeholder secrets
  const hasPlaceholders =
    config.includes('<YOUR_API_TOKEN_HERE>') ||
    config.includes('<YOUR_') ||
    config.includes('PLACEHOLDER');

  return (
    <ModalDialog
      title={translate('Site Agent Configuration')}
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
            <CloseDialogButton label={translate('Close')} onClick={onClose} />
            <BaseButton
              variant="primary"
              onClick={handleDownload}
              iconNode={<DownloadSimpleIcon weight="bold" />}
              label={translate('Download YAML')}
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
            'This configuration contains placeholder values (e.g., <YOUR_API_TOKEN_HERE>) that need to be replaced with actual values before use.',
          )}
        />
      )}

      <div className="border rounded overflow-hidden">
        <MonacoEditor
          value={config}
          onChange={() => {}}
          language="yaml"
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
              'Replace placeholder values with actual credentials and settings.',
            )}
          </li>
          <li>
            {translate(
              'Save this file as config.yaml in your waldur-site-agent installation directory.',
            )}
          </li>
          <li>
            {translate(
              'Restart the waldur-site-agent service to apply the new configuration.',
            )}
          </li>
        </ol>
      </div>
    </ModalDialog>
  );
};
