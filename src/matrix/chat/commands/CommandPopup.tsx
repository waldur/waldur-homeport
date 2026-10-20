import { FC } from 'react';

import { Badge } from 'waldur-ui';

import { translate } from '@/i18n';

import { useComposerPopupList } from '../composerPopupKeys';

import { CommandPrefix, ComposerCommand } from './composerCommands';

export const COMMAND_POPUP_ID = 'tc-command-popup';

export const commandOptionId = (index: number) =>
  `${COMMAND_POPUP_ID}-option-${index}`;

interface CommandPopupProps {
  commands: ComposerCommand[];
  prefix: CommandPrefix;
  activeIndex: number;
  onSelect(command: ComposerCommand): void;
  onActivate(index: number): void;
}

/**
 * The commands matching what is typed after `!` or `/`. Focus stays in the
 * composer, which points at the active option with aria-activedescendant.
 */
export const CommandPopup: FC<CommandPopupProps> = ({
  commands,
  prefix,
  activeIndex,
  onSelect,
  onActivate,
}) => {
  const { listRef, pointAt } = useComposerPopupList(activeIndex, onActivate);
  return (
    <div
      ref={listRef}
      id={COMMAND_POPUP_ID}
      className="tc-mention-popup tc-command-popup"
      role="listbox"
      aria-label={translate('Commands')}
    >
      {commands.map((command, i) => (
        <div
          key={`${command.source}-${command.name}`}
          id={commandOptionId(i)}
          role="option"
          aria-selected={i === activeIndex}
          tabIndex={-1}
          className={`tc-mention-item tc-command-item ${
            i === activeIndex ? 'is-active' : ''
          }`}
          onMouseDown={(e) => {
            e.preventDefault(); // keep focus in the composer
            onSelect(command);
          }}
          onMouseMove={pointAt(i)}
        >
          <span className="tc-command-item__syntax">
            <span className="tc-mention-item__name">
              {prefix}
              {command.name}
            </span>
            {command.args && (
              <span className="tc-command-item__args"> {command.args}</span>
            )}
          </span>
          {command.description && (
            <span className="tc-command-item__description">
              {command.description}
            </span>
          )}
          {command.source === 'client' && (
            <Badge
              variant="secondary"
              shape="pill"
              tone="outline"
              className="tc-command-item__source"
            >
              {translate('Waldur only')}
            </Badge>
          )}
        </div>
      ))}
    </div>
  );
};
