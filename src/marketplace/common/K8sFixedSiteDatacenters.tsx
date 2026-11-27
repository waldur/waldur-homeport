import { useQuery } from '@tanstack/react-query';
import React, { useEffect, useRef } from 'react';
import { marketplacePublicOfferingsK8sSitesRetrieve } from 'waldur-js-client';

import { AlertItem, BaseButton } from 'waldur-ui';

import { UI_STALE_TIME } from '@/core/constants';
import { format } from '@/core/ErrorMessageFormatter';
import { LoadingSpinner } from '@/core/LoadingSpinner';
import { translate } from '@/i18n';

import {
  CommonFlavorSource,
  DatacenterConfiguration,
  getFixedSitesState,
  K8sClusterTopology,
  K8sDefaultConfiguration,
  mirrorFixedSiteDatacenters,
} from './k8s-types';
import { K8sDatacenterCard } from './K8sDatacenterCard';

interface K8sFixedSiteDatacentersProps {
  offeringUuid?: string;
  optionName?: string;
  topology: K8sClusterTopology;
  // Whether the option still offers the cluster's topology. When it does
  // not, the sites are not looked up; the form warns about the mismatch.
  topologyAllowed: boolean;
  datacenters: DatacenterConfiguration[];
  onChange: (datacenters: DatacenterConfiguration[]) => void;
  defaultConfigs?: K8sDefaultConfiguration;
  loadBalancer: boolean;
}

/**
 * The datacenters of a cluster on the sites the provider fixed. The sites
 * and the flavors they share come from the offering; the customer defines the
 * node groups once, on the first site, and every other site repeats them with
 * its own flavors.
 *
 * Only a value without sites (a new order, or a topology switch) gets the
 * provider's sites. A stored cluster keeps its own, even when the provider
 * has changed them since: it is shown read-only with a warning, and the
 * customer may move it to the current sites.
 */
export const K8sFixedSiteDatacenters: React.FC<
  K8sFixedSiteDatacentersProps
> = ({
  offeringUuid,
  optionName,
  topology,
  topologyAllowed,
  datacenters,
  onChange,
  defaultConfigs,
  loadBalancer,
}) => {
  const { data, error, isLoading, refetch } = useQuery({
    queryKey: ['k8s-sites', offeringUuid, optionName, topology],
    queryFn: () =>
      marketplacePublicOfferingsK8sSitesRetrieve({
        path: { uuid: offeringUuid },
        query: { option: optionName, topology },
      }).then((response) => response.data),
    enabled: Boolean(offeringUuid && optionName && topologyAllowed),
    staleTime: UI_STALE_TIME,
  });

  const sitesState = data
    ? getFixedSitesState(datacenters, data.sites)
    : undefined;
  const datacentersRef = useRef(datacenters);
  datacentersRef.current = datacenters;
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  // Fill in the sites of a value that has none. The ref holds the current
  // node groups, which the defaults of the topology provide.
  useEffect(() => {
    if (data && sitesState === 'empty') {
      onChangeRef.current(
        mirrorFixedSiteDatacenters(
          data.sites,
          data.flavors,
          datacentersRef.current[0]?.node_groups || [],
        ),
      );
    }
  }, [data, sitesState]);

  const hasSites = datacenters.some(
    (datacenter) => datacenter.openstack_infrastructure,
  );

  const renderCards = (
    editable: boolean,
    commonFlavors?: CommonFlavorSource,
  ) => {
    const [first] = datacenters;
    const shared = datacenters.length > 1;
    return datacenters.map((datacenter, index) => (
      <K8sDatacenterCard
        key={datacenter.id}
        datacenter={datacenter}
        index={index}
        topology={topology}
        defaultConfigs={defaultConfigs}
        loadBalancer={loadBalancer}
        fixedSite
        commonFlavors={commonFlavors}
        sharedNodeGroups={editable && shared}
        mirrorOf={editable && index > 0 ? first.name : undefined}
        readOnly={!editable}
        onUpdate={
          editable && index === 0
            ? (updated) =>
                onChange(
                  mirrorFixedSiteDatacenters(
                    data.sites,
                    data.flavors,
                    updated.node_groups,
                  ),
                )
            : undefined
        }
      />
    ));
  };

  // The form already warns that the option no longer offers this topology.
  if (!topologyAllowed) {
    return <>{renderCards(false)}</>;
  }

  if (!offeringUuid || !optionName) {
    return hasSites ? (
      <>{renderCards(false)}</>
    ) : (
      <AlertItem
        type="floating"
        variant="warning"
        title={translate(
          'The sites of this cluster are set by the service provider and cannot be shown here.',
        )}
      />
    );
  }

  if (error) {
    return (
      <AlertItem
        type="floating"
        variant="error"
        title={translate('Unable to load the sites of this offering.')}
        body={
          <>
            <p className="mb-2">{format(error)}</p>
            <BaseButton
              variant="secondary"
              size="sm"
              label={translate('Reload')}
              onClick={() => refetch()}
            />
          </>
        }
      />
    );
  }

  // Until a new value holds the sites, the cards would show no site at all.
  if (isLoading || !data || sitesState === 'empty') {
    return <LoadingSpinner />;
  }

  if (sitesState === 'mismatch') {
    return (
      <>
        <AlertItem
          type="floating"
          variant="warning"
          className="mb-3"
          title={translate(
            'This cluster runs on other sites than the service provider now offers.',
          )}
          body={
            <>
              <p className="mb-2">
                {translate(
                  'It is kept as it is. To change its node groups, move it to the current sites first.',
                )}
              </p>
              <BaseButton
                variant="secondary"
                size="sm"
                label={translate('Move to the current sites')}
                onClick={() =>
                  onChange(
                    mirrorFixedSiteDatacenters(
                      data.sites,
                      data.flavors,
                      datacenters[0]?.node_groups || [],
                    ),
                  )
                }
              />
            </>
          }
        />
        {renderCards(false)}
      </>
    );
  }

  return (
    <>
      {renderCards(true, {
        key: `${offeringUuid}-${optionName}-${topology}`,
        flavors: data.flavors,
      })}
    </>
  );
};
