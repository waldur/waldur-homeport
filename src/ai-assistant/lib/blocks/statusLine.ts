import { UIBlock } from '@/ai-assistant/lib/types';
import { translate } from '@/i18n';

// One plain line for a status: no markdown marks, links or line breaks,
// ending in "…" unless it is a question or an exclamation.
export const toStatusLine = (text: string) => {
  const line = text
    .replace(/!?\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/[*`#>]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/[:.…]+$/, '');
  if (!line) return '';
  return /[?!]$/.test(line) ? line : `${line}…`;
};

// The label of a working thinking header: what the model last told the user
// it is doing ("Let me check your projects…"), or "Thinking…", as the
// status line says before the header appears, so the live region that
// carries both does not announce the same word twice.
export const processLabel = (steps: UIBlock[]) =>
  steps
    .filter((step) => step.key !== 'reasoning')
    .map((step) => toStatusLine(step.content))
    .filter(Boolean)
    .pop() ?? translate('Thinking…');
