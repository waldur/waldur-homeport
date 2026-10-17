import { CaretRightIcon, TerminalWindowIcon } from '@phosphor-icons/react';
import { FC } from 'react';

import {
  Badge,
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

interface MatrixCommandsDialogProps {
  resolve: {
    /** Puts the command in the composer. */
    onPick(command: ComposerCommand): void;
  };
}

const CommandRow: FC<{
  command: ComposerCommand;
  onPick?: () => void;
}> = ({ command, onPick }) => {
  const content = (
    <>
      <span className="tc-commands-row__forms">
        <code>/{command.name}</code>
        {command.source === 'bot' && (
          <>
            {' · '}
            <code>
              {BOT_PREFIX}
              {command.name}
            </code>
          </>
        )}
        {command.args && (
          <span className="tc-commands-row__args"> {command.args}</span>
        )}
        {command.source === 'client' && (
          <Badge variant="secondary" shape="pill" tone="light">
            {translate('Waldur only')}
          </Badge>
        )}
      </span>
      {command.description && (
        <span className="tc-commands-row__description">
          {command.description}
        </span>
      )}
      {command.name === 'ticket' && command.available && (
        <span className="tc-commands-row__note">
          {translate(
            'A summary of the conversation goes to the helpdesk, and only you can confirm it.',
          )}
        </span>
      )}
      {!command.available && command.reason && (
        <span className="tc-commands-row__note">{command.reason}</span>
      )}
    </>
  );
  return onPick ? (
    <li>
      <button type="button" className="tc-commands-row" onClick={onPick}>
        {content}
      </button>
    </li>
  ) : (
    <li className="tc-commands-row">{content}</li>
  );
};

/**
 * The chat commands the user can use in the room, from the same source as
 * the composer's menu, and those they can't, with why. Read live, so a draft
 * made or a call started while it is open shows.
 */
export const MatrixCommandsDialog: FC<MatrixCommandsDialogProps> = ({
  resolve: { onPick },
}) => {
  const { commands } = useComposerCommands();
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
        <ul className="tc-commands-list">
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
        <Collapsible className="tc-commands-unavailable">
          <CollapsibleTrigger className="tc-commands-unavailable__toggle">
            <CaretRightIcon weight="bold" aria-hidden="true" />
            {translate('Not available here ({count})', {
              count: unavailable.length,
            })}
          </CollapsibleTrigger>
          <CollapsibleContent>
            <ul className="tc-commands-list">
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
      <p className="text-quaternary small mt-4 mb-0">
        {translate(
          'Type / or ! in the message box to pick a command. In other Matrix apps, type the ! form.',
        )}
      </p>
    </ModalDialog>
  );
};
