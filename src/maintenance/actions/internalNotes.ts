/**
 * Append a timestamped entry to a maintenance announcement's internal notes.
 *
 * Format: `[<ISO timestamp>] <Action label>: <reason>`
 *
 * Empty existing notes are tolerated — the new entry becomes the first line.
 * Empty reasons are tolerated — the entry is still recorded so the audit
 * trail captures the action.
 */
export const appendInternalNote = (
  existing: string | undefined,
  actionLabel: string,
  reason: string | undefined,
): string => {
  const trimmedReason = (reason || '').trim();
  const timestamp = new Date().toISOString();
  const entry = trimmedReason
    ? `[${timestamp}] ${actionLabel}: ${trimmedReason}`
    : `[${timestamp}] ${actionLabel}`;
  const previous = (existing || '').trim();
  return previous ? `${previous}\n${entry}` : entry;
};

export interface ParsedInternalNote {
  timestamp: Date | null; // null if line was not structured
  action: string | null; // null if line was not structured
  body: string; // the reason (structured) or the full line (unstructured)
}

const ENTRY_RE = /^\[([^\]]+)\]\s*([^:]+):\s*(.*)$/;
const ENTRY_NO_REASON_RE = /^\[([^\]]+)\]\s*(.+)$/;

/**
 * Parse the multi-line internal-notes string into structured entries.
 *
 * Lines that match `[<ISO timestamp>] <Action label>: <reason>` (the format
 * produced by `appendInternalNote`) are returned as structured entries. Lines
 * that don't match (free-form notes written by operators) are returned with
 * `timestamp: null` and `action: null` so the caller can decide how to render
 * them.
 *
 * Entries written without a reason (e.g. `[ts] Action`) are also parsed as
 * structured, with an empty `body`.
 */
export function parseInternalNotes(
  notes: string | null | undefined,
): ParsedInternalNote[] {
  if (!notes) return [];
  return notes
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const m = line.match(ENTRY_RE);
      if (m) {
        const ts = new Date(m[1]);
        return {
          timestamp: Number.isNaN(ts.getTime()) ? null : ts,
          action: m[2].trim(),
          body: m[3].trim(),
        };
      }
      const m2 = line.match(ENTRY_NO_REASON_RE);
      if (m2) {
        const ts = new Date(m2[1]);
        if (!Number.isNaN(ts.getTime())) {
          return {
            timestamp: ts,
            action: m2[2].trim(),
            body: '',
          };
        }
      }
      return { timestamp: null, action: null, body: line };
    });
}
