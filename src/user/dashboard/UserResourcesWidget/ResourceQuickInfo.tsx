import {
  ArrowRightIcon,
  ArrowSquareOutIcon,
  BookOpenIcon,
  CopyIcon,
} from '@phosphor-icons/react';
import { useQuery } from '@tanstack/react-query';
import { FC, useCallback, useMemo } from 'react';
import { Card, Col, Row } from 'react-bootstrap';
import { useDispatch } from 'react-redux';
import {
  marketplaceResourcesOfferingRetrieve,
  Resource,
} from 'waldur-js-client';

import { LONG_STALE_TIME } from '@/core/constants';
import { Link } from '@/core/Link';
import { LoadingSpinnerSimple } from '@/core/LoadingSpinner';
import { Tip } from '@/core/Tooltip';
import { translate } from '@/i18n';
import { getQuotaCellProps } from '@/marketplace/resources/details/ResourceComponentItem';
import { ResourceStateField } from '@/marketplace/resources/list/ResourceStateField';
import { getResourceAccessEndpoints, isSshFormat } from '@/resource/utils';
import { showSuccess } from '@/store/notify';

interface ResourceQuickInfoProps {
  resource: Resource;
}

const MAX_COMPONENTS_DISPLAY = 4;

const formatSshCommand = (url: string, username: string) => {
  const [hostname, port] = url.split('://')[1].split(':');
  return `ssh ${username}@${hostname}${port ? ` -p ${port}` : ''}`;
};

export const ResourceQuickInfo: FC<ResourceQuickInfoProps> = ({ resource }) => {
  const dispatch = useDispatch();

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
        dispatch(showSuccess(translate('Text has been copied')));
      });
    },
    [dispatch, resource.username],
  );

  // Get components with their values
  const components = useMemo(() => {
    if (!offering?.components) return [];
    return offering.components
      .map((component) => ({
        ...component,
        ...getQuotaCellProps(component, resource),
      }))
      .filter((c) => c.usage || c.limit); // Only show components with values
  }, [offering?.components, resource]);

  const hasGettingStarted = offering?.getting_started || endpoints.length > 0;

  return (
    <Card className="card-bordered mb-3">
      <Card.Body className="py-4">
        {/* Header */}
        <div className="d-flex justify-content-between align-items-start mb-2">
          <div className="flex-grow-1">
            <h5 className="mb-1">{resource.name}</h5>
            <small className="text-muted">
              {resource.offering_name} ({resource.category_title})
            </small>
          </div>
          <ResourceStateField resource={resource} pill outline size="sm" />
        </div>

        {/* Offering description */}
        {offering?.description && (
          <p className="text-muted fs-7 mb-3">{offering.description}</p>
        )}

        {/* Components section */}
        {isLoadingOffering ? (
          <div className="d-flex align-items-center text-muted mb-3">
            {}
            <LoadingSpinnerSimple className="me-2" />
            <span className="fs-7">{translate('Loading details...')}</span>
          </div>
        ) : (
          components.length > 0 && (
            <div className="mb-3">
              <div className="text-muted fs-7 fw-bold mb-2">
                {translate('Components')}
              </div>
              <Row className="g-2">
                {components
                  .slice(0, MAX_COMPONENTS_DISPLAY)
                  .map((component) => (
                    <Col key={component.type} xs={6} md={3}>
                      <div className="border rounded p-2 text-center">
                        <div className="fw-bold">
                          {component.limit
                            ? `${component.usage}/${component.limit}`
                            : component.usage}
                        </div>
                        <div className="text-muted fs-8">{component.title}</div>
                      </div>
                    </Col>
                  ))}
              </Row>
              {components.length > MAX_COMPONENTS_DISPLAY && (
                <div className="text-muted fs-8 mt-1">
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
          <div className="mb-3">
            <div className="text-muted fs-7 fw-bold mb-2">
              {translate('Access resource')}
            </div>
            <div className="d-flex flex-wrap gap-2">
              {endpoints.map((endpoint, index) => (
                <div
                  key={index}
                  className="d-flex align-items-center border rounded px-2 py-1"
                >
                  <a
                    href={endpoint.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary text-decoration-none d-flex align-items-center me-2"
                  >
                    <ArrowSquareOutIcon
                      size={14}
                      weight="bold"
                      className="me-1"
                    />
                    <span className="fs-7">{endpoint.name}</span>
                  </a>
                  <Tip
                    id={`endpoint-${index}`}
                    label={
                      isSshFormat(endpoint.url) && resource.username
                        ? formatSshCommand(endpoint.url, resource.username)
                        : endpoint.url
                    }
                  >
                    <button
                      type="button"
                      className="btn btn-link p-0 text-muted"
                      onClick={() => copyText(endpoint.url)}
                    >
                      <CopyIcon size={14} weight="bold" />
                    </button>
                  </Tip>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="d-flex justify-content-between align-items-center">
          <div>
            {hasGettingStarted && (
              <Link
                state="marketplace-resource-details"
                params={{
                  resource_uuid: resource.uuid,
                  tab: 'getting-started',
                }}
                className="btn btn-sm btn-link text-info p-0 me-3"
              >
                <BookOpenIcon size={16} weight="bold" className="me-1" />
                {translate('Getting started')}
              </Link>
            )}
          </div>
          <Link
            state="marketplace-resource-details"
            params={{ resource_uuid: resource.uuid }}
            className="btn btn-sm btn-link text-primary p-0"
          >
            {translate('View details')}
            <ArrowRightIcon size={16} weight="bold" className="ms-1" />
          </Link>
        </div>
      </Card.Body>
    </Card>
  );
};
