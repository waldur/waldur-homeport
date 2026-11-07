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
