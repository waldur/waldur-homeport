import { ReactNode } from 'react';

import { BADGE_STYLES, type BadgeVariant } from '../Badge';
import { cn } from '../cn';
import { ModalDialog, useModalHide } from '../Dialog/Modal';

export interface ModeOption {
  key: string;
  title: string;
  description: string;
  icon?: ReactNode;
  /** Tints the icon tile, reusing Badge's light tone
   * (BADGE_STYLES[variant].light) rather than a second set of pastel
   * swatches. */
  variant?: BadgeVariant;
}

export interface ModePickerDialogProps {
  resolve: {
    title: string;
    description?: string;
    modes: ModeOption[];
    /** `key` of the mode currently in effect. */
    value?: string;
    /** Called with the picked mode's key; the dialog then closes. */
    onSelect: (key: string) => void;
  };
}

/**
 * The workspace/mode switcher SidebarModeCard opens: every mode the user
 * can work in, as a two-column grid of option cards with the current one
 * marked.
 *
 * Which modes exist, and their copy, are the consumer's — the same
 * division as OrgSwitcher, whose org list its consumer composes. This
 * component owns only the dialog shape and the selected/unselected
 * treatment.
 *
 * A dialog like any other: open it with openDialog / ModalService.open
 * (`size: 'lg'`), and it closes itself once a mode is picked.
 *
 * The options are toggle buttons (aria-pressed), not a role="radiogroup":
 * activating one applies the mode and closes the dialog, so each is an
 * action that happens to carry pressed state, and every card stays
 * individually Tab-reachable rather than needing the roving-tabindex
 * arrow-key handling a real radio group would owe its users.
 */
export const ModePickerDialog = ({
  resolve: { title, description, modes, value, onSelect },
}: ModePickerDialogProps) => {
  const hide = useModalHide();
  return (
    <ModalDialog title={title} subtitle={description}>
      <div className="grid gap-3 sm:grid-cols-2">
        {modes.map((mode) => (
          <ModePickerOption
            key={mode.key}
            mode={mode}
            selected={mode.key === value}
            onSelect={(key) => {
              onSelect(key);
              hide?.();
            }}
          />
        ))}
      </div>
    </ModalDialog>
  );
};

interface ModePickerOptionProps {
  mode: ModeOption;
  selected: boolean;
  onSelect: (key: string) => void;
}

const ModePickerOption = ({
  mode,
  selected,
  onSelect,
}: ModePickerOptionProps) => (
  <button
    type="button"
    aria-pressed={selected}
    onClick={() => onSelect(mode.key)}
    className={cn(
      'flex items-start gap-2.5 rounded-xl border-[1px] p-3 text-left transition-colors',
      selected
        ? 'border-brand ring-2 ring-[var(--bg-brand-subtle)]'
        : 'border-secondary hover:bg-primary-hover',
    )}
  >
    {mode.icon && (
      <span
        className={cn(
          'flex size-10 shrink-0 items-center justify-center rounded-lg',
          BADGE_STYLES[mode.variant ?? 'primary'].light,
        )}
      >
        {mode.icon}
      </span>
    )}
    <span className="flex min-w-0 flex-col gap-1">
      <span className="font-semibold text-primary">{mode.title}</span>
      <span className="text-sm text-quaternary">{mode.description}</span>
    </span>
  </button>
);
