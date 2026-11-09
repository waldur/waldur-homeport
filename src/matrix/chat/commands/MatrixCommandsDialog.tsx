import { CaretRightIcon, TerminalWindowIcon } from '@phosphor-icons/react';
import { FC } from 'react';

import {
  Badge,
  Code,
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from 'waldur-ui';

import { translate } from '@/i18n';
import { useModal } from '@/modal/actions';
import { CloseDialogButton } from '@/modal/CloseDialogButton';
import { ModalDialog } from '@/modal/ModalDialog';

import { BOT_PREFIX, ComposerCommand } from './composerCommands';
import { useComposerCommands } from './useComposerCommands';

export interface MatrixCommandsDialogProps {
  resolve: {
    /** Puts the command in the composer. */
    onPick(command: ComposerCommand): void;
  };
  /** Optional static commands list for preview/testing */
  commands?: ComposerCommand[];
}

const CommandRow: FC<{
  command: ComposerCommand;
  onPick?: () => void;
}> = ({ command, onPick }) => {
  const content = (
    <>
      <span className="flex flex-wrap items-center gap-1">
        <Code>/{command.name}</Code>
        {command.source === 'bot' && (
          <>
            {' · '}
            <Code>
              {BOT_PREFIX}
              {command.name}
            </Code>
          </>
        )}
        {command.args && (
          <span className="text-xs text-secondary font-mono">
            {' '}
            {command.args}
          </span>
        )}
        {command.source === 'client' && (
          <Badge variant="secondary" shape="pill" tone="outline">
            {translate('Waldur only')}
          </Badge>
        )}
      </span>
      {command.description && (
        <span className="text-xs">{command.description}</span>
      )}
      {command.name === 'ticket' && command.available && (
        <span className="text-xs text-secondary">
          {translate(
            'A summary of the conversation goes to the helpdesk, and only you can confirm it.',
          )}
        </span>
      )}
      {!command.available && command.reason && (
        <span className="text-xs text-secondary">{command.reason}</span>
      )}
    </>
  );

  const rowBaseClass =
    'w-full flex flex-col gap-0.5 py-2 px-2.5 border-0 rounded-lg bg-transparent text-primary text-start transition-colors';

  return onPick ? (
    <li>
      <button
        type="button"
        className={`${rowBaseClass} cursor-pointer hover:bg-secondary focus-visible:bg-secondary`}
        onClick={onPick}
      >
        {content}
      </button>
    </li>
  ) : (
    <li className={rowBaseClass}>{content}</li>
  );
};

const MatrixCommandsDialogView: FC<
  MatrixCommandsDialogProps & { commands: ComposerCommand[] }
> = ({ resolve: { onPick }, commands }) => {
  const { closeDialog } = useModal();
  const available = commands.filter((c) => c.available);
  const unavailable = commands.filter((c) => !c.available);

  return (
    <ModalDialog
      title={translate('Chat commands')}
      subtitle={translate('Pick a command to put it in the message box.')}
      iconNode={<TerminalWindowIcon weight="bold" />}
      footer={<CloseDialogButton label={translate('Close')} />}
    >
      {available.length > 0 ? (
        <ul className="list-none m-0 p-0 flex flex-col gap-1">
          {available.map((command) => (
            <CommandRow
              key={`${command.source}-${command.name}`}
              command={command}
              onPick={() => {
                onPick(command);
                closeDialog();
              }}
            />
          ))}
        </ul>
      ) : (
        <p className="text-quaternary">
          {translate('No commands are available in this room.')}
        </p>
      )}
      {unavailable.length > 0 && (
        <Collapsible className="mt-4">
          <CollapsibleTrigger className="flex items-center gap-1 mb-1 p-0 border-0 bg-transparent text-secondary cursor-pointer group text-sm">
            <CaretRightIcon
              weight="bold"
              size={14}
              aria-hidden="true"
              className="size-3.5 transition-transform duration-200 group-data-[state=open]:rotate-90"
            />
            {translate('Not available here ({count})', {
              count: unavailable.length,
            })}
          </CollapsibleTrigger>
          <CollapsibleContent>
            <ul className="list-none m-0 p-0 flex flex-col gap-1">
              {unavailable.map((command) => (
                <CommandRow
                  key={`${command.source}-${command.name}`}
                  command={command}
                />
              ))}
            </ul>
          </CollapsibleContent>
        </Collapsible>
      )}
      <p className="text-quaternary text-xs mt-3 mb-0">
        {translate(
          'Type / or ! in the message box to pick a command. In other Matrix apps, type the ! form.',
        )}
      </p>
    </ModalDialog>
  );
};

const MatrixCommandsDialogConnected: FC<MatrixCommandsDialogProps> = ({
  resolve,
}) => {
  const { commands } = useComposerCommands();
  return <MatrixCommandsDialogView resolve={resolve} commands={commands} />;
};

/**
 * The chat commands the user can use in the room, from the same source as
 * the composer's menu, and those they can't, with why. Read live, so a draft
 * made or a call started while it is open shows.
 */
export const MatrixCommandsDialog: FC<MatrixCommandsDialogProps> = (props) => {
  if (props.commands) {
    return <MatrixCommandsDialogView {...props} commands={props.commands} />;
  }
  return <MatrixCommandsDialogConnected {...props} />;
};
