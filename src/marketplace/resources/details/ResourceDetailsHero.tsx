import { ArrowsClockwiseIcon } from '@phosphor-icons/react';
import classNames from 'classnames';
import {
  OfferingComponent,
  PublicOfferingDetails,
  Resource,
} from 'waldur-js-client';

import { BaseButton } from 'waldur-ui';

import { PublicDashboardHero } from '@/dashboard/hero/PublicDashboardHero';
import { translate } from '@/i18n';
import { PAGE_CONTAINER_CLASSNAME } from '@/navigation/pageContainer';
import { INSTANCE_TYPE, VOLUME_TYPE } from '@/openstack/constants';
import { isReadOnlyProjectReader } from '@/permissions/isReadOnlyProjectReader';
import { ResourceAccessButton } from '@/resource/ResourceAccessButton';
import { formatResourceType } from '@/resource/utils';
import { ActionsUnavailable } from '@/table/ActionsDropdown';
import { useUser } from '@/workspace/hooks';

import { ProviderResourceActions } from '../list/ProviderResourceActions';
import { OrderErredView } from '../resource-pending/OrderErredView';
import { OrderInProgressView } from '../resource-pending/OrderInProgressView';
import { ResourceActions } from '../ResourceActions';

import { getMarketplaceResourceLogo } from './MarketplaceResourceLogo';
import { InstanceComponents } from './openstack-instance/InstanceComponents';
import { ResourceDetailsAction } from './popup/ResourceDetailsAction';
import { ResourceComponents } from './ResourceComponents';
import { ResourceDetailsHeaderBody } from './ResourceDetailsHeaderBody';
import { ResourceDetailsHeaderTitle } from './ResourceDetailsHeaderTitle';
import { ResourceEndDateConflictBar } from './ResourceEndDateConflictBar';
import { isResourceTerminal } from './ResourceFlags';
import { useIsResourceProjectOnlyViewer } from './useIsResourceProjectOnlyViewer';
import { VolumeComponents } from './VolumeComponents';

// The page already shows the resource's details.
const DETAILS_PAGE_EXCLUDED_ACTIONS = [ResourceDetailsAction];

export const ResourceDetailsHero = ({
  resource,
  scope,
  offering,
  components,
  refetch,
  isLoading,
  providerView = false,
}: {
  resource: Resource;
  scope;
  offering: PublicOfferingDetails;
  components: OfferingComponent[];
  refetch;
  isLoading;
  providerView?: boolean;
}) => {
  const rpOnlyViewer = useIsResourceProjectOnlyViewer(resource);
  const isRPOnly = !providerView && rpOnlyViewer;
  // A call manager reading what their call allocated holds no role that
  // could run any of these actions, so they are left out rather than disabled.
  const user = useUser();
  const isCallReader =
    !providerView &&
    !user?.permissions?.some(
      (p) => p.scope_type === 'resource' && p.scope_uuid === resource.uuid,
    ) &&
    isReadOnlyProjectReader(user, {
      uuid: resource.project_uuid,
      customer_uuid: resource.customer_uuid,
    });
  return (
    <div
      className={offering.state === 'Unavailable' ? 'disabled-view' : undefined}
    >
      <ActionsUnavailable
        reason={
          offering.state === 'Unavailable'
            ? translate('This offering is unavailable.')
            : undefined
        }
      >
        {!isResourceTerminal(resource.state) &&
          resource.end_date &&
          resource.resource_effective_end_date &&
          resource.end_date > resource.resource_effective_end_date && (
            <ResourceEndDateConflictBar />
          )}
        {resource.order_in_progress ? (
          <OrderInProgressView
            resource={resource}
            offering={offering}
            refetch={refetch}
            providerView={providerView}
          />
        ) : resource.creation_order && !providerView ? (
          <OrderErredView resource={resource} />
        ) : null}
        <PublicDashboardHero
          containerClassName={classNames(
            PAGE_CONTAINER_CLASSNAME,
            'my-[1.25rem]',
          )}
          cardBordered
          logo={getMarketplaceResourceLogo(resource)}
          logoAlt={resource.category_title}
          logoTooltip={formatResourceType(resource)}
          logoCircle
          backgroundImage={offering.image}
          title={
            <ResourceDetailsHeaderTitle
              resource={resource}
              refreshButton={
                !isRPOnly && (
                  <BaseButton
                    variant="text-secondary"
                    size="sm"
                    pending={isLoading}
                    onClick={refetch}
                    tooltip={translate('Refresh')}
                    iconNode={<ArrowsClockwiseIcon size={20} weight="bold" />}
                  />
                )
              }
            />
          }
          quickActions={
            <div className="flex flex-col flex-wrap gap-1.5 sm:min-w-[120px]">
              <ResourceAccessButton resource={resource} offering={offering} />
              {/* A reader of the call's projects acts on nothing here. */}
              {!isRPOnly &&
                !isCallReader &&
                (providerView ? (
                  <ProviderResourceActions
                    resource={resource}
                    excludeActions={DETAILS_PAGE_EXCLUDED_ACTIONS}
                    refetch={refetch}
                    labeled
                    side="bottom"
                    disabled={offering.state === 'Unavailable'}
                    size="sm"
                  />
                ) : (
                  <ResourceActions
                    resource={{
                      ...resource,
                      marketplace_resource_uuid: resource.uuid,
                    }}
                    scope={scope}
                    refetch={refetch}
                    labeled
                    side="bottom"
                    disabled={offering.state === 'Unavailable'}
                    size="sm"
                  />
                ))}
            </div>
          }
          quickBody={
            isRPOnly ? null : resource.offering_type === INSTANCE_TYPE ? (
              scope && <InstanceComponents resource={scope} />
            ) : resource.offering_type === VOLUME_TYPE ? (
              scope && <VolumeComponents resource={scope} />
            ) : (
              <ResourceComponents
                resource={resource}
                components={components}
                providerView={providerView}
              />
            )
          }
        >
          <ResourceDetailsHeaderBody
            resource={resource}
            offering={offering}
            providerView={providerView}
          />
        </PublicDashboardHero>
      </ActionsUnavailable>
    </div>
  );
};
