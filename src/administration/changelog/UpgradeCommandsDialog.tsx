import { FunctionComponent } from 'react';
import { UpgradeCommands } from 'waldur-js-client';

import { CopyButton } from 'waldur-ui';

import { translate } from '@/i18n';
import { CloseDialogButton } from '@/modal/CloseDialogButton';
import { ModalDialog } from '@/modal/ModalDialog';

interface UpgradeCommandsDialogProps {
  resolve: {
    latestVersion: string;
    commands: UpgradeCommands;
  };
}

const CommandBlock: FunctionComponent<{ title: string; command: string }> = ({
  title,
  command,
}) => (
  <div className="mt-[16px]">
    <div className="mb-[6px] flex items-center justify-between gap-[8px]">
      <span className="font-medium text-[var(--surface-text-primary)]">
        {title}
      </span>
      <CopyButton
        value={command}
        label={translate('Copy')}
        copiedLabel={translate('Copied')}
      />
    </div>
    <pre className="m-0 overflow-x-auto whitespace-pre rounded-md border-[1px] border-[var(--surface-card-border)] bg-[var(--surface-page-bg)] p-[12px] font-mono text-[var(--surface-text-primary)]">
      {command}
    </pre>
  </div>
);

export const UpgradeCommandsDialog: FunctionComponent<
  UpgradeCommandsDialogProps
> = ({ resolve: { latestVersion, commands } }) => (
  <ModalDialog
    title={translate('Upgrade to {version}', { version: latestVersion })}
    closeButton
    footer={<CloseDialogButton label={translate('Close')} />}
  >
    <p className="text-[var(--surface-text-secondary)]">
      {translate(
        'Review the command for your deployment method and run it where Waldur is deployed. Back up the database first.',
      )}
    </p>
    <CommandBlock title={translate('Helm')} command={commands.helm} />
    <CommandBlock
      title={translate('Docker Compose')}
      command={commands.docker_compose}
    />
  </ModalDialog>
);
