import { FC, useEffect, useState, useMemo } from 'react';
import { Tab, Tabs } from 'react-bootstrap';
import {
  marketplaceOfferingTermsOfServiceList,
  marketplaceResourcesList,
} from 'waldur-js-client';

import { Badge } from '@waldur/core/Badge';
import { formatDateTime } from '@waldur/core/dateUtils';
import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { translate } from '@waldur/i18n';
import { ResourceNameField } from '@waldur/marketplace/resources/list/ResourceNameField';
import { ResourceStateField } from '@waldur/marketplace/resources/list/ResourceStateField';
import { ActionsDropdown } from '@waldur/table/ActionsDropdown';
import { ExpandableContainer } from '@waldur/table/ExpandableContainer';

import { AcceptTosAction } from './AcceptTosAction';
import { RevokeTosAction } from './RevokeTosAction';
import { ViewTosAction } from './ViewTosAction';

interface OfferingTosExpandableRowProps {
  offering: {
    uuid: string;
    name: string;
  };
  refetch?: () => void;
}

export const OfferingTosExpandableRow: FC<OfferingTosExpandableRowProps> = ({
  offering,
  refetch,
}) => {
  const [tosData, setTosData] = useState<any[]>([]);
  const [resourcesData, setResourcesData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(false);

      // Fetch both ToS and Resources data in parallel
      const [tosResponse, resourcesResponse] = await Promise.all([
        marketplaceOfferingTermsOfServiceList({
          query: { offering_uuid: offering.uuid, is_active: true },
        }),
        marketplaceResourcesList({
          query: { offering_uuid: [offering.uuid] },
        }),
      ]);

      const tosList = tosResponse.data || [];
      const resourcesList = resourcesResponse.data || [];

      setTosData(tosList);
      setResourcesData(resourcesList);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  const handleRefetch = async () => {
    await fetchData();
    if (refetch) {
      refetch();
    }
  };

  const resourceCount = useMemo(() => resourcesData.length, [resourcesData]);

  useEffect(() => {
    fetchData();
  }, [offering.uuid]);

  if (loading) {
    return (
      <ExpandableContainer>
        <div className="p-4 text-center">
          <LoadingSpinner />
        </div>
      </ExpandableContainer>
    );
  }

  if (error) {
    return (
      <ExpandableContainer>
        <div className="p-4 text-center">
          <p className="text-muted">
            {translate('Unable to load Terms of Service.')}
          </p>
        </div>
      </ExpandableContainer>
    );
  }

  return (
    <ExpandableContainer>
      <div className="tabs-container tabs-scrollable">
        <Tabs
          defaultActiveKey="tos"
          id={`offering-tabs-${offering.uuid}`}
          className="nav-line-tabs"
          unmountOnExit
          mountOnEnter
        >
          <Tab eventKey="tos" title={translate('Terms of Service')}>
            <div className="card card-table card-bordered">
              <div className="card-body">
                {tosData.length === 0 ? (
                  <div className="text-center py-3">
                    <p className="text-muted">
                      {translate(
                        'No Terms of Service found for this offering.',
                      )}
                    </p>
                  </div>
                ) : (
                  <table className="table align-middle">
                    <thead>
                      <tr className="align-middle">
                        <th>{translate('Terms of Service')}</th>
                        <th>{translate('Status')}</th>
                        <th>{translate('Actions')}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {tosData.map((tos: any, index: number) => (
                        <tr key={index}>
                          <td>
                            <div>
                              <div className="fw-bold">
                                {tos.version || 'v1.0'}
                              </div>
                              <div className="text-muted small">
                                {tos.created
                                  ? new Date(tos.created).toLocaleDateString()
                                  : '-'}
                              </div>
                            </div>
                          </td>
                          <td>
                            <Badge
                              variant={
                                tos.has_user_consent ? 'success' : 'secondary'
                              }
                              outline
                              pill
                              size="sm"
                            >
                              {tos.has_user_consent
                                ? translate('Accepted')
                                : translate('Not Accepted')}
                            </Badge>
                          </td>
                          <td>
                            <ActionsDropdown {...({ drop: 'end' } as any)}>
                              <ViewTosAction tos={tos} />
                              {!tos.has_user_consent ? (
                                <AcceptTosAction
                                  tos={tos}
                                  offering={offering}
                                  refetch={handleRefetch}
                                />
                              ) : (
                                <RevokeTosAction
                                  tos={tos}
                                  offering={offering}
                                  refetch={handleRefetch}
                                  resources={resourcesData}
                                />
                              )}
                            </ActionsDropdown>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          </Tab>
          <Tab
            eventKey="resources"
            title={`${translate('Resources')} (${resourceCount})`}
          >
            <div className="card card-table card-bordered">
              <div className="card-body">
                {resourcesData.length === 0 ? (
                  <div className="text-center py-3">
                    <p className="text-muted">
                      {translate('No resources found for this offering.')}
                    </p>
                  </div>
                ) : (
                  <table className="table align-middle">
                    <thead>
                      <tr className="align-middle">
                        <th>{translate('Name')}</th>
                        <th>{translate('Project')}</th>
                        <th>{translate('Category')}</th>
                        <th>{translate('Created')}</th>
                        <th>{translate('State')}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {resourcesData.map((resource: any, index: number) => (
                        <tr key={index}>
                          <td>
                            <ResourceNameField row={resource} />
                          </td>
                          <td>{resource.project_name || '-'}</td>
                          <td>{resource.category_title}</td>
                          <td>{formatDateTime(resource.created)}</td>
                          <td>
                            <ResourceStateField
                              resource={resource}
                              outline
                              pill
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          </Tab>
        </Tabs>
      </div>
    </ExpandableContainer>
  );
};
