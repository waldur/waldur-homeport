import { useMemo } from 'react';

import { Badge } from '@/core/Badge';
import { formatDateTime, formatRelative } from '@/core/dateUtils';
import { translate } from '@/i18n';
import { Field } from '@/resource/summary';
import { useCustomer, useUser } from '@/workspace/hooks';
import { checkIsOwnerOrStaff } from '@/workspace/selectors';

import {
  parseInternalNotes,
  ParsedInternalNote,
} from './actions/internalNotes';

const formatEntryTimestamp = (date: Date): string => {
  const relative = formatRelative(date);
  if (relative) return relative;
  // Very-recent entries (~now) can yield a null relative formatting; fall
  // back to a compact wall-clock time.
  return formatDateTime(date);
};

const StructuredEntry = ({ entry }: { entry: ParsedInternalNote }) => (
  <div className="d-flex align-items-start gap-2 py-2 border-bottom border-gray-300 border-bottom-dashed">
    {entry.timestamp && (
      <div
        className="text-muted small flex-shrink-0"
        title={entry.timestamp.toISOString()}
        style={{ minWidth: '10ch' }}
      >
        {formatEntryTimestamp(entry.timestamp)}
      </div>
    )}
    {entry.action && (
      <Badge variant="default" outline className="flex-shrink-0">
        {entry.action}
      </Badge>
    )}
    {entry.body && <div className="flex-grow-1 small">{entry.body}</div>}
  </div>
);

const NotesContent = ({ notes }: { notes: string }) => {
  const entries = useMemo(() => parseInternalNotes(notes), [notes]);

  const structured = entries.filter((e) => e.action !== null);
  const freeForm = entries.filter((e) => e.action === null);

  // No structured entries → preserve existing free-form rendering verbatim.
  if (structured.length === 0) {
    return (
      <div className="text-pre-wrap" style={{ whiteSpace: 'pre-wrap' }}>
        {notes}
      </div>
    );
  }

  return (
    <div>
      {structured.map((entry, index) => (
        <StructuredEntry key={`s-${index}`} entry={entry} />
      ))}
      {freeForm.length > 0 && (
        <div className="pt-2 small" style={{ whiteSpace: 'pre-wrap' }}>
          {freeForm.map((entry, index) => (
            <p key={`f-${index}`} className="mb-1">
              {entry.body}
            </p>
          ))}
        </div>
      )}
    </div>
  );
};

export const InternalNotes = ({ maintenance, space = undefined }) => {
  const user = useUser();
  const customer = useCustomer();
  const show = useMemo(
    () => checkIsOwnerOrStaff(customer, user),
    [customer, user],
  );

  if (!show) return null;
  if (!maintenance.internal_notes) return null;

  return (
    <Field
      label={
        <>
          {translate('Internal notes')}:
          <span className="text-quaternary d-block">
            {translate('Providers/staff visible only')}
          </span>
        </>
      }
      value={<NotesContent notes={maintenance.internal_notes} />}
      space={space}
    />
  );
};
