import { PencilSimpleIcon } from '@phosphor-icons/react';
import { FC, KeyboardEvent, useState } from 'react';

import { BaseButton, Input } from 'waldur-ui';

import { translate } from '@/i18n';
import { useNotify } from '@/store/notify';
import { renderFieldOrDash } from '@/table/utils';

interface InlineNumberCellProps {
  value: number | null | undefined;
  label: string;
  editable: boolean;
  /** Integers only, from 1, as a rank is. */
  integer?: boolean;
  onSave(value: number | null): Promise<unknown>;
}

/**
 * A number shown in a table cell and edited in place: click it, type, then
 * Enter or leave the field to save; Escape cancels. A refused value (a rank
 * already taken, say) is reported and the cell goes back to the saved one.
 */
export const InlineNumberCell: FC<InlineNumberCellProps> = ({
  value,
  label,
  editable,
  integer,
  onSave,
}) => {
  const { showErrorResponse } = useNotify();
  const [draft, setDraft] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  if (!editable) {
    return <>{renderFieldOrDash(value)}</>;
  }

  const save = async () => {
    if (draft === null) return;
    const trimmed = draft.trim();
    const parsed = trimmed === '' ? null : Number(trimmed);
    if (
      (parsed === null && integer) ||
      (parsed !== null &&
        (Number.isNaN(parsed) ||
          (integer && (!Number.isInteger(parsed) || parsed < 1))))
    ) {
      setDraft(null);
      return;
    }
    if (parsed === (value ?? null)) {
      setDraft(null);
      return;
    }
    setSaving(true);
    try {
      await onSave(parsed);
    } catch (error) {
      showErrorResponse(
        error,
        translate('Unable to save {label}.', { label: label.toLowerCase() }),
      );
    } finally {
      setSaving(false);
      setDraft(null);
    }
  };

  const onKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      void save();
    } else if (event.key === 'Escape') {
      setDraft(null);
    }
  };

  if (draft !== null) {
    return (
      <Input
        size="sm"
        type="number"
        autoFocus
        aria-label={label}
        min={integer ? 1 : undefined}
        step={integer ? 1 : 'any'}
        value={draft}
        disabled={saving}
        onChange={(event) => setDraft(event.target.value)}
        onBlur={() => void save()}
        onKeyDown={onKeyDown}
        className="max-w-[110px]"
      />
    );
  }

  const editLabel = translate('Edit {label}', { label: label.toLowerCase() });
  return (
    <BaseButton
      variant="text-primary"
      size="sm"
      className="p-0 text-inherit"
      label={
        <>
          <span aria-hidden="true">{renderFieldOrDash(value)}</span>
          <span className="sr-only">{editLabel}</span>
        </>
      }
      iconNode={
        <PencilSimpleIcon size={14} className="text-quaternary" weight="bold" />
      }
      iconRight
      tooltip={editLabel}
      onClick={() =>
        setDraft(value === null || value === undefined ? '' : String(value))
      }
    />
  );
};
