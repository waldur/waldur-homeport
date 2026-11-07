import { OfferingComponent } from 'waldur-js-client';

import { formatUsageValue } from '@/core/formatNumber';

import { componentLabel, componentUnit } from './offeringDemand';

export interface RequestedLine {
  key: string;
  label: string;
  amount: number;
  unit: string;
}

/**
 * What a proposal asks of the offering, component by component: named and
 * in the offering's order, with any the offering no longer lists after.
 */
export const getRequestedLines = (
  limits: Record<string, number> | null | undefined,
  components: OfferingComponent[] | null | undefined,
): RequestedLine[] => {
  const requested = limits ?? {};
  const known = (components ?? []).filter(
    (component) => component.type in requested,
  );
  const unknown = Object.keys(requested).filter(
    (type) => !known.some((component) => component.type === type),
  );
  return [
    ...known.map((component) => ({
      key: component.type,
      label: componentLabel(component),
      amount: requested[component.type],
      unit: componentUnit(component),
    })),
    ...unknown.map((type) => ({
      key: type,
      label: type,
      amount: requested[type],
      unit: '',
    })),
  ];
};

/** "CPU Core Hours: 400,000 hours; GPU Hours: 25 hours", in full for export. */
export const formatRequestedLimits = (
  limits: Record<string, number> | null | undefined,
  components: OfferingComponent[] | null | undefined,
): string =>
  getRequestedLines(limits, components)
    .map(({ label, amount, unit }) =>
      [`${label}:`, formatUsageValue(amount), unit].filter(Boolean).join(' '),
    )
    .join('; ');
