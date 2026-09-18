import { Limits } from '@/marketplace/common/types';

// Exported so a table's `export` can emit the same text the cell renders.
export const limitEntries = (limits?: Limits | null) =>
  limits ? Object.entries(limits).map((entry) => entry.join(': ')) : [];

// Takes any row carrying `limits` — a marketplace Resource or an
// OrderDetails — because the cell reads nothing else off the row.
export const PublicResourcesLimits = ({
  row,
}: {
  row: { limits?: Limits | null };
}) => {
  const keyValues = limitEntries(row.limits);
  if (!keyValues.length) return 'N/A';
  return (
    <div className="text-nowrap">
      {keyValues.map((keyValue, index) => (
        <span key={index} className="d-block">
          {keyValue}
        </span>
      ))}
    </div>
  );
};
