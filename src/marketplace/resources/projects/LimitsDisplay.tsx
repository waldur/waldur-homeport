import { FC } from 'react';

import { Badge } from '@/core/Badge';

type ComponentLike = {
  type: string;
  name?: string;
  measured_unit?: string;
};

export const LimitsDisplay: FC<{
  limits: Record<string, number> | null | undefined;
  components?: ComponentLike[];
}> = ({ limits, components }) => {
  if (!limits || Object.keys(limits).length === 0) return <>—</>;
  const byType = new Map<string, ComponentLike>();
  (components ?? []).forEach((c) => byType.set(c.type, c));
  return (
    <span className="d-inline-flex flex-wrap gap-1">
      {Object.entries(limits).map(([key, value]) => {
        const c = byType.get(key);
        const label = c?.name ?? key;
        const unit = c?.measured_unit ? ` ${c.measured_unit}` : '';
        return (
          <Badge
            key={key}
            variant="default"
            pill
            outline
            tooltip={c?.name ? `${c.name} (${key})` : key}
          >
            {label}: {value}
            {unit}
          </Badge>
        );
      })}
    </span>
  );
};
