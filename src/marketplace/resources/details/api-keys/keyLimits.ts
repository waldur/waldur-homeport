import { ApiKeyRow, KeyComponent } from './types';

export const componentLabel = (component: KeyComponent) =>
  component.name || component.type;

export interface ComponentUsage {
  component: KeyComponent;
  used?: number;
  limit?: number;
  inherited: boolean;
  ratio?: number;
  overLimit: boolean;
}

// Zero means "no limit", as for resource limits.
const positive = (value?: number | null) =>
  typeof value === 'number' && value > 0 ? value : undefined;

// Limits are monthly, in UTC months as the backend counts them: usage reported
// for an earlier month counts as none, e.g. before the agent's first report of
// a new month.
const getCurrentUsages = (row: ApiKeyRow, now = new Date()) =>
  row.usage_period?.slice(0, 7) === now.toISOString().slice(0, 7)
    ? row.current_usages
    : undefined;

export const getComponentUsage = (
  row: ApiKeyRow,
  component: KeyComponent,
  resourceLimits: Record<string, number>,
  now = new Date(),
): ComponentUsage => {
  const own = positive(row.limits?.[component.type]);
  const governing = positive(resourceLimits[component.type]);
  // No key can use more than its resource may, so the tighter limit is the one in force.
  const limit =
    own !== undefined && governing !== undefined
      ? Math.min(own, governing)
      : (own ?? governing);
  const used = getCurrentUsages(row, now)?.[component.type];
  // A limited key that reported nothing has used none of its limit.
  const ratio = limit !== undefined ? ((used ?? 0) / limit) * 100 : undefined;
  return {
    component,
    used,
    limit,
    // The applied limit is the resource's unless the key's own limit is the one in force.
    inherited: limit !== undefined && own !== limit,
    ratio,
    overLimit: ratio !== undefined && ratio > 100,
  };
};

// Colours a meter by how close the key is to its limit. A key's own limit pauses
// the key once reached; an inherited one is the resource's, which limits the
// whole resource instead.
export const getMeterVariant = (ratio?: number) =>
  ratio === undefined
    ? undefined
    : ratio >= 100
      ? 'danger'
      : ratio >= 80
        ? 'warning'
        : undefined;

// The component closest to its limit, so a nearly exhausted key stands out.
export const getHeadlineUsage = (
  row: ApiKeyRow,
  components: KeyComponent[],
  resourceLimits: Record<string, number>,
) =>
  components
    .map((component) => getComponentUsage(row, component, resourceLimits))
    .filter((reading) => reading.ratio !== undefined)
    .reduce<ComponentUsage | undefined>(
      (worst, reading) =>
        !worst || reading.ratio! > worst.ratio! ? reading : worst,
      undefined,
    );
