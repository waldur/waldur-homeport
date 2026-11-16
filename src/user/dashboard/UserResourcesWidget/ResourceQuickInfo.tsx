import {
  ArrowSquareOutIcon,
  BookOpenIcon,
  CopyIcon,
} from '@phosphor-icons/react';
import { useQuery } from '@tanstack/react-query';
import { FC, MouseEvent, useCallback, useMemo } from 'react';
import {
  marketplaceResourcesOfferingRetrieve,
  Resource,
} from 'waldur-js-client';

import { BaseButton, PropertyItem, PropertyList } from 'waldur-ui';

import { LONG_STALE_TIME } from '@/core/constants';
import { Link } from '@/core/Link';
import { LoadingSpinnerSimple } from '@/core/LoadingSpinner';
import { ModelCard1 } from '@/core/ModelCard1';
import { translate } from '@/i18n';
import {
  findResourcePlan,
  resolvePlanComponents,
} from '@/marketplace/details/plan/effectiveComponents';
import {
  formatQuotaUnits,
  getQuotaCellProps,
} from '@/marketplace/resources/details/ResourceComponentItem';
import { PublicResourceLink } from '@/marketplace/resources/list/PublicResourceLink';
import { ResourceStateField } from '@/marketplace/resources/list/ResourceStateField';
import { useModal } from '@/modal/actions';
import { getResourceAccessEndpoints, isSshFormat } from '@/resource/utils';
import { router } from '@/router';
import { useNotify } from '@/store/notify';

interface ResourceQuickInfoProps {
  resource: Resource;
}

const MAX_COMPONENTS_DISPLAY = 4;

const formatSshCommand = (url: string, username: string) => {
  const [hostname, port] = url.split('://')[1].split(':');
  return `ssh ${username}@${hostname}${port ? ` -p ${port}` : ''}`;
};

export const ResourceQuickInfo: FC<ResourceQuickInfoProps> = ({ resource }) => {
  const { showSuccess } = useNotify();

  // Fetch offering details for endpoints, components, getting_started, and description
  const { data: offering, isLoading: isLoadingOffering } = useQuery({
    queryKey: ['resource-offering-details', resource.uuid],
    queryFn: async () => {
      const response = await marketplaceResourcesOfferingRetrieve({
        path: { uuid: resource.uuid },
      });
      return response.data;
    },
    staleTime: LONG_STALE_TIME, // Cache for 10 minutes
  });

  const endpoints = useMemo(
    () => (offering ? getResourceAccessEndpoints(resource, offering) : []),
    [resource, offering],
  );

  const copyText = useCallback(
    (value: string) => {
      const valueToCopy =
        isSshFormat(value) && resource.username
          ? formatSshCommand(value, resource.username)
          : value;
      navigator.clipboard.writeText(valueToCopy).then(() => {
        showSuccess(translate('Text has been copied'));
      });
    },
    [resource.username],
  );

  // Get components with their values
  const components = useMemo(() => {
    if (!offering?.components) return [];
    return resolvePlanComponents(
      offering.components,
      findResourcePlan(offering.plans, resource.plan_uuid),
    )
      .map((component) => ({
        ...component,
        ...getQuotaCellProps(component, resource),
      }))
      .filter((c) => c.usage || c.limit); // Only show components with values
  }, [offering?.components, resource]);

  const hasGettingStarted = offering?.getting_started || endpoints.length > 0;

  const { closeDialog } = useModal();

  // The card opens the resource, as ProjectCard and OrganizationCard do; its
  // own links and buttons stop the click so they do only what they say.
  const handleCardClick = () => {
    closeDialog();
    router.stateService.go('marketplace-resource-details', {
      resource_uuid: resource.uuid,
    });
  };

  const stopPropagation = (e: MouseEvent) => e.stopPropagation();

  return (
    <ModelCard1
      clickable
      onClick={handleCardClick}
      title={resource.name}
      titleNode={
        <span className="flex items-center justify-between gap-2">
          {/* eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions */}
          <span
            className="flex items-center gap-1 min-w-0"
            onClick={stopPropagation}
          >
            <PublicResourceLink row={resource} />
          </span>
          <ResourceStateField resource={resource} shape="pill" tone="outline" />
        </span>
      }
      body={
        <div className="text-sm">
          <PropertyList
            variant="summary"
            termWidth="sm"
            space={1.5}
            hideIfEmpty
          >
            <PropertyItem
              label={translate('Offering')}
              value={`${resource.offering_name} (${resource.category_title})`}
            />
            <PropertyItem
              label={translate('Access resource')}
              value={
                endpoints.length > 0 && (
                  // eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions
                  <span
                    className="flex flex-wrap gap-x-3 gap-y-1"
                    onClick={stopPropagation}
                  >
                    {endpoints.map((endpoint, index) => (
                      <span key={index} className="flex items-center">
                        <a
                          href={endpoint.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-brand no-underline flex items-center"
                        >
                          <ArrowSquareOutIcon
                            size={14}
                            weight="bold"
                            className="me-1"
                          />
                          {endpoint.name}
                        </a>
                        <BaseButton
                          variant="text-secondary"
                          onClick={() => copyText(endpoint.url)}
                          tooltip={
                            isSshFormat(endpoint.url) && resource.username
                              ? formatSshCommand(
                                  endpoint.url,
                                  resource.username,
                                )
                              : endpoint.url
                          }
                          iconNode={<CopyIcon size={14} weight="bold" />}
                        />
                      </span>
                    ))}
                  </span>
                )
              }
            />
            <PropertyItem
              label={translate('Description')}
              value={offering?.description}
            />
            <PropertyItem
              label={translate('Components')}
              value={
                isLoadingOffering ? (
                  <span className="flex items-center text-quaternary">
                    <LoadingSpinnerSimple className="me-1.5" />
                    {translate('Loading details...')}
                  </span>
                ) : (
                  components.length > 0 && (
                    <span className="flex flex-wrap gap-x-4 gap-y-1">
                      {components
                        .slice(0, MAX_COMPONENTS_DISPLAY)
                        .map((component) => (
                          <span key={component.type}>
                            <span className="font-medium">
                              {component.limit
                                ? `${component.usage}/${component.limit}`
                                : component.usage}
                              {component.isTotal &&
                                ` ${formatQuotaUnits(undefined, true)}`}
                            </span>{' '}
                            <span className="text-quaternary">
                              {component.title}
                            </span>
                          </span>
                        ))}
                      {components.length > MAX_COMPONENTS_DISPLAY && (
                        <span className="text-quaternary">
                          {translate('+{count} more', {
                            count: components.length - MAX_COMPONENTS_DISPLAY,
                          })}
                        </span>
                      )}
                    </span>
                  )
                )
              }
            />
          </PropertyList>
        </div>
      }
      footer={
        hasGettingStarted && (
          // eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions
          <div onClick={stopPropagation}>
            <Link
              state="marketplace-resource-details"
              params={{
                resource_uuid: resource.uuid,
                tab: 'getting-started',
              }}
              buttonVariant="text-primary"
              buttonSize="sm"
            >
              <BookOpenIcon size={16} weight="bold" />
              {translate('Getting started')}
            </Link>
          </div>
        )
      }
    />
  );
};
