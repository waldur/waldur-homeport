import { useQuery } from '@tanstack/react-query';
import { FC } from 'react';
import {
  marketplaceProviderOfferingsSiteAgentConfigRetrieve,
  SiteAgentOfferingSecret,
} from 'waldur-js-client';

import { Code, PropertyItem, PropertyList } from 'waldur-ui';

import { ENV } from '@/core/config';
import { LoadingSpinner } from '@/core/LoadingSpinner';
import { translate } from '@/i18n';
import { propVal } from '@/property/propertyFields';
import { waldurApiUrl } from '@/site-agent/waldurApiUrl';
import { SimpleTable } from '@/table/SimpleTable';
import { Column } from '@/table/types';

import { splitSecretsByBlock } from './agentConfiguration';

const getRequirementLabels = () => ({
  required: translate('Required'),
  required_with_parent: translate('Required once its block is set'),
  optional: translate('Optional'),
});

/** The one call that returns this offering's configuration: an agent with
 * configuration_source: waldur makes it at startup, and a script needs no
 * organization or service provider lookup before it. */
export const siteAgentConfigUrl = (
  offeringUuid: string,
  apiEndpoint = ENV.apiEndpoint,
  origin = window.location.origin,
) =>
  waldurApiUrl(
    `marketplace-provider-offerings/${offeringUuid}/site_agent_config/`,
    apiEndpoint,
    origin,
  );

const getSecretColumns = (): Column<SiteAgentOfferingSecret>[] => [
  {
    title: translate('Setting'),
    render: ({ row }) => <Code>{row.field}</Code>,
  },
  { title: translate('Backend'), render: ({ row }) => row.backend },
  {
    title: translate('Needed'),
    render: ({ row }) =>
      getRequirementLabels()[row.requirement] ?? row.requirement,
  },
];

export const AgentLoadsPanel: FC<{ offeringUuid: string }> = ({
  offeringUuid,
}) => {
  const { data, isLoading, error } = useQuery({
    queryKey: ['site-agent-config', offeringUuid],
    queryFn: () =>
      marketplaceProviderOfferingsSiteAgentConfigRetrieve({
        path: { uuid: offeringUuid },
      }).then((response) => response.data),
    refetchOnWindowFocus: false,
  });

  if (isLoading) {
    return <LoadingSpinner />;
  }
  if (error || !data) {
    return (
      <p className="text-danger">
        {translate("Unable to load the agent's configuration.")}
      </p>
    );
  }
  // A secret whose block the offering does not configure is not needed, and
  // Waldur knows which blocks it configures: such a secret is left out here.
  // It shows as needed once the block is set.
  const { needed } = splitSecretsByBlock(
    data.secrets,
    data.offering?.backend_settings,
  );
  return (
    <>
      <p className="text-secondary mb-4">
        {translate(
          'The configuration the site agent loads for this offering. Secrets are not part of it: the agent takes them from its own configuration file.',
        )}
      </p>
      <PropertyList variant="summary" className="mb-5">
        <PropertyItem
          label={translate('Version')}
          value={propVal.code(data.version, { truncate: 'middle' })}
          hasCopy
        />
        <PropertyItem
          label={translate('Backend type')}
          value={data.offering?.backend_type}
        />
        <PropertyItem
          label={translate('API endpoint')}
          description={translate(
            'What a script, or a site agent with configuration_source: waldur, fetches to get this configuration.',
          )}
          value={propVal.code(siteAgentConfigUrl(offeringUuid), {
            truncate: 'middle',
          })}
          hasCopy
        />
      </PropertyList>
      <h3 className="text-base font-semibold mb-2">
        {translate('Secrets the agent configuration file must hold')}
      </h3>
      {needed.length ? (
        <SimpleTable columns={getSecretColumns()} rows={needed} />
      ) : (
        <p className="text-tertiary">
          {translate('The backends in use need no secrets.')}
        </p>
      )}
    </>
  );
};
