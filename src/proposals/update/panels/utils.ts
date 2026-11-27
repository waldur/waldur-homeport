import { CallPanel } from 'waldur-js-client';

/** The domains and sub-domains a panel covers, by code and name. */
export const formatPanelDomains = (
  panel: Pick<
    CallPanel,
    'science_domain_details' | 'science_sub_domain_details'
  >,
): string =>
  [...panel.science_domain_details, ...panel.science_sub_domain_details]
    .map((domain) =>
      domain.code ? `${domain.code} ${domain.name}` : domain.name,
    )
    .join(', ');

export type PanelRowAction = 'export' | 'edit' | 'delete';

/**
 * What a panel's row offers: its sheets to those who may export the call's
 * evaluations, whatever state the call is in, and editing while the call
 * can still change.
 */
export const getPanelRowActions = ({
  canExport,
  isReadOnly,
}: {
  canExport: boolean;
  isReadOnly?: boolean;
}): PanelRowAction[] => [
  ...(canExport ? (['export'] as const) : []),
  ...(isReadOnly ? [] : (['edit', 'delete'] as const)),
];
