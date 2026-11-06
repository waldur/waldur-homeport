import { translate } from '@/i18n';

import { BulkOffering } from './bulkOfferingActions';

/** How many offering names a summary spells out before counting the rest. */
const NAMED_OFFERINGS = 5;

const formatOfferingNames = (offerings: Pick<BulkOffering, 'name'>[]) => {
  const named = offerings.slice(0, NAMED_OFFERINGS).map(({ name }) => name);
  const rest = offerings.length - named.length;
  return rest > 0
    ? translate('{names} and {count} more', {
        names: named.join(', '),
        count: rest,
      })
    : named.join(', ');
};

/**
 * Which offerings an action will change and, when it leaves some of the
 * selection alone, why, so the user knows before confirming.
 */
export const SelectedOfferingsSummary = ({
  targets,
  skippedNote,
  warning,
}: {
  targets: Pick<BulkOffering, 'name'>[];
  /** A sentence saying which selected offerings are left out and why. */
  skippedNote?: string;
  /** What the action does beyond the offerings themselves. */
  warning?: string;
}) => (
  <div className="flex flex-col gap-1.5" data-testid="bulk-offerings-summary">
    <p className="m-0">
      {translate('Offerings ({count}): {names}', {
        count: targets.length,
        names: formatOfferingNames(targets),
      })}
    </p>
    {skippedNote && <p className="m-0 text-tertiary">{skippedNote}</p>}
    {warning && <p className="m-0 text-warning">{warning}</p>}
  </div>
);
