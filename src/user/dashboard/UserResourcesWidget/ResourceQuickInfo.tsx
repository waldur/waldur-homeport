import {
  ArrowRightIcon,
  ArrowSquareOutIcon,
  BookOpenIcon,
  CopyIcon,
} from '@phosphor-icons/react';
import { useQuery } from '@tanstack/react-query';
import { FC, useCallback, useMemo } from 'react';
import { Card, Col, Row } from 'react-bootstrap';
import {
  marketplaceResourcesOfferingRetrieve,
  Resource,
} from 'waldur-js-client';

import { BaseButton } from 'waldur-ui';

import { LONG_STALE_TIME } from '@/core/constants';
import { Link } from '@/core/Link';
import { LoadingSpinnerSimple } from '@/core/LoadingSpinner';
import { translate } from '@/i18n';
import {
  findResourcePlan,
  resolvePlanComponents,
} from '@/marketplace/details/plan/effectiveComponents';
import {
  formatQuotaUnits,
  getQuotaCellProps,
} from '@/marketplace/resources/details/ResourceComponentItem';
import { ResourceStateField } from '@/marketplace/resources/list/ResourceStateField';
import { getResourceAccessEndpoints, isSshFormat } from '@/resource/utils';
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

  return (
    <Card className="card-bordered mb-2.5">
      <Card.Body className="py-3">
        {/* Header */}
        <div className="flex justify-between items-start mb-1.5">
          <div className="grow">
            <h5 className="mb-1">{resource.name}</h5>
            <small className="text-quaternary">
              {resource.offering_name} ({resource.category_title})
            </small>
          </div>
          <ResourceStateField
            resource={resource}
            shape="pill"
            tone="outline"
            size="sm"
          />
        </div>

        {/* Offering description */}
        {offering?.description && (
          <p className="text-quaternary text-xs mb-2.5">
            {offering.description}
          </p>
        )}

        {/* Components section */}
        {isLoadingOffering ? (
          <div className="flex items-center text-quaternary mb-2.5">
            {}
            <LoadingSpinnerSimple className="me-1.5" />
            <span className="text-xs">{translate('Loading details...')}</span>
          </div>
        ) : (
          components.length > 0 && (
            <div className="mb-2.5">
              <div className="text-quaternary text-xs font-medium mb-1.5">
                {translate('Components')}
              </div>
              <Row className="g-2">
                {components
                  .slice(0, MAX_COMPONENTS_DISPLAY)
                  .map((component) => (
                    <Col key={component.type} xs={6} md={3}>
                      <div className="border rounded p-1.5 text-center">
                        <div className="font-medium">
                          {component.limit
                            ? `${component.usage}/${component.limit}`
                            : component.usage}
                          {component.isTotal &&
                            ` ${formatQuotaUnits(undefined, true)}`}
                        </div>
                        <div className="text-quaternary text-xs">
                          {component.title}
                        </div>
                      </div>
                    </Col>
                  ))}
              </Row>
              {components.length > MAX_COMPONENTS_DISPLAY && (
                <div className="text-quaternary text-xs mt-1">
                  {translate('+{count} more', {
                    count: components.length - MAX_COMPONENTS_DISPLAY,
                  })}
                </div>
              )}
            </div>
          )
        )}

        {/* Access endpoints */}
        {endpoints.length > 0 && (
          <div className="mb-2.5">
            <div className="text-quaternary text-xs font-medium mb-1.5">
              {translate('Access resource')}
            </div>
            <div className="flex flex-wrap gap-1.5">
              {endpoints.map((endpoint, index) => (
                <div
                  key={index}
                  className="flex items-center border rounded px-1.5 py-1"
                >
                  <a
                    href={endpoint.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-brand no-underline flex items-center me-1.5"
                  >
                    <ArrowSquareOutIcon
                      size={14}
                      weight="bold"
                      className="me-1"
                    />
                    <span className="text-xs">{endpoint.name}</span>
                  </a>
                  <BaseButton
                    variant="text-secondary"
                    onClick={() => copyText(endpoint.url)}
                    tooltip={
                      isSshFormat(endpoint.url) && resource.username
                        ? formatSshCommand(endpoint.url, resource.username)
                        : endpoint.url
                    }
                    iconNode={<CopyIcon size={14} weight="bold" />}
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-between items-center">
          <div>
            {hasGettingStarted && (
              <Link
                state="marketplace-resource-details"
                params={{
                  resource_uuid: resource.uuid,
                  tab: 'getting-started',
                }}
                buttonVariant="text-primary"
                buttonSize="sm"
                className="p-0 me-2.5"
              >
                <BookOpenIcon size={16} weight="bold" className="me-1" />
                {translate('Getting started')}
              </Link>
            )}
          </div>
          <Link
            state="marketplace-resource-details"
            params={{ resource_uuid: resource.uuid }}
            buttonVariant="text-primary"
            buttonSize="sm"
            className="p-0"
          >
            {translate('View details')}
            <ArrowRightIcon size={16} weight="bold" className="ms-1" />
          </Link>
        </div>
      </Card.Body>
    </Card>
  );
};
