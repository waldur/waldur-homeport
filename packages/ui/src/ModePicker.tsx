import { CSSProperties, ReactNode } from 'react';

import type { BadgeVariant } from './Badge';
import { cn } from './cn';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from './Dialog';

export interface ModeOption {
  key: string;
  title: string;
  description: string;
  icon?: ReactNode;
  /** Tints the icon tile, reusing badgeColors.css's own light-tone pair
   * (--badge-<variant>-light-bg/-text) rather than a second set of pastel
   * swatches — same colors Badge's light tone already ships. */
  variant?: BadgeVariant;
}

export interface ModePickerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  modes: ModeOption[];
  /** `key` of the mode currently in effect. */
  value?: string;
  onSelect: (key: string) => void;
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
 * The options are toggle buttons (aria-pressed), not a role="radiogroup":
 * activating one applies the mode and closes the dialog, so each is an
 * action that happens to carry pressed state, and every card stays
 * individually Tab-reachable rather than needing the roving-tabindex
 * arrow-key handling a real radio group would owe its users.
 */
export const ModePickerDialog = ({
  open,
  onOpenChange,
  title,
  description,
  modes,
  value,
  onSelect,
}: ModePickerDialogProps) => (
  <Dialog open={open} onOpenChange={onOpenChange}>
    <DialogContent className="max-w-3xl gap-8 p-8">
      <DialogHeader>
        <DialogTitle>{title}</DialogTitle>
        {description && <DialogDescription>{description}</DialogDescription>}
      </DialogHeader>
      <div className="grid gap-4 sm:grid-cols-2">
        {modes.map((mode) => (
          <ModePickerOption
            key={mode.key}
            mode={mode}
            selected={mode.key === value}
            onSelect={onSelect}
          />
        ))}
      </div>
    </DialogContent>
  </Dialog>
);

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
      'flex items-start gap-3 rounded-xl border p-4 text-left transition-colors',
      selected
        ? 'border-[var(--waldur-brand-600)] ring-2 ring-[var(--waldur-brand-100)]'
        : 'border-[var(--surface-card-border)] hover:bg-[var(--surface-hover-bg)]',
    )}
  >
    {mode.icon && (
      <span
        // Same indirection Badge.tsx uses: the variant's own token pair is
        // assigned to two scoped custom properties, so one static pair of
        // Tailwind classes can read whichever variant is in play — a class
        // name built from a template literal would be invisible to
        // Tailwind's static analysis.
        style={
          {
            '--mode-icon-bg': `var(--badge-${mode.variant ?? 'primary'}-light-bg)`,
            '--mode-icon-text': `var(--badge-${mode.variant ?? 'primary'}-light-text)`,
          } as CSSProperties
        }
        className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-[var(--mode-icon-bg)] text-[var(--mode-icon-text)]"
      >
        {mode.icon}
      </span>
    )}
    <span className="flex min-w-0 flex-col gap-1">
      <span className="font-semibold text-[var(--surface-text-primary)]">
        {mode.title}
      </span>
      <span className="text-sm text-[var(--surface-text-secondary)]">
        {mode.description}
      </span>
    </span>
  </button>
);
