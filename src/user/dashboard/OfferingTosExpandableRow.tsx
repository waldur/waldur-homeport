import { useQueries } from '@tanstack/react-query';
import { FC, useCallback } from 'react';
import { Nav, Tab } from 'react-bootstrap';
import { marketplaceOfferingTermsOfServiceList } from 'waldur-js-client';

import { count } from '@waldur/core/api';
import { Badge } from '@waldur/core/Badge';
import { formatDate } from '@waldur/core/dateUtils';
import {
  LoadingSpinner,
  LoadingSpinnerIcon,
} from '@waldur/core/LoadingSpinner';
import { TableTabsContainer } from '@waldur/customer/list/TableTabsContainer';
import { translate } from '@waldur/i18n';
import { ActionsDropdown } from '@waldur/table/ActionsDropdown';
import { ExpandableContainer } from '@waldur/table/ExpandableContainer';

import { AcceptTosAction } from './AcceptTosAction';
import { OfferingResourcesTable } from './OfferingResourcesTable';
import { RevokeTosAction } from './RevokeTosAction';
import { ViewTosAction } from './ViewTosAction';

interface OfferingTosExpandableRowProps {
  offering: {
    uuid: string;
    name: string;
  };
  onTosAction?: () => void;
}

const NavItem = ({ title, eventKey, count, countLoading }) => (
  <Nav.Item className="text-nowrap">
    <Nav.Link eventKey={eventKey}>
      {title}
      <Badge onlyIcon variant="default" outline pill className="ms-2">
        {countLoading ? <LoadingSpinnerIcon /> : count || 0}
      </Badge>
    </Nav.Link>
  </Nav.Item>
);

export const OfferingTosExpandableRow: FC<OfferingTosExpandableRowProps> = ({
  offering,
  onTosAction,
}) => {
  const [tosQuery, resourcesCountQuery] = useQueries({
    queries: [
      {
        queryKey: ['offering-tos', offering.uuid],
        queryFn: () =>
          marketplaceOfferingTermsOfServiceList({
            query: { offering_uuid: offering.uuid, is_active: true },
          }).then((response) => response.data || []),
        refetchOnWindowFocus: false,
      },
      {
        queryKey: ['offering-resources-count', offering.uuid],
        queryFn: () =>
          count('/api/marketplace-resources/', {
            offering_uuid: [offering.uuid],
          }),
        refetchOnWindowFocus: false,
      },
    ],
  });

  const handleRefetch = useCallback(async () => {
    await tosQuery.refetch();
    if (onTosAction) {
      onTosAction();
    }
  }, [tosQuery, onTosAction]);

  const loading = tosQuery.isLoading;
  const error = tosQuery.isError;

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
      <TableTabsContainer defaultActiveKey="tos" unmountOnExit={true}>
        <div className="overflow-auto">
          <Nav variant="tabs" className="nav-line-tabs flex-nowrap">
            <Nav.Item className="text-nowrap">
              <Nav.Link eventKey="tos">
                {translate('Terms of Service')}
              </Nav.Link>
            </Nav.Item>

            <NavItem
              title={translate('Resources')}
              eventKey="resources"
              count={resourcesCountQuery.data}
              countLoading={resourcesCountQuery.isLoading}
            />
          </Nav>
        </div>

        <Tab.Content className="overflow-auto">
          <Tab.Pane eventKey="tos" unmountOnExit={true}>
            <div className="card card-table card-bordered">
              <div className="card-body">
                {tosQuery.data?.length === 0 ? (
                  <div className="text-center py-3">
                    <p className="text-muted">
                      {translate(
                        'No Terms of Service found for this offering.',
                      )}
                    </p>
                  </div>
                ) : (
                  <table className="table align-middle mb-0">
                    <thead>
                      <tr className="align-middle">
                        <th>{translate('Terms of Service')}</th>
                        <th>{translate('Status')}</th>
                        <th>{translate('Actions')}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {tosQuery.data?.map((tos: any) => (
                        <tr key={tos.uuid}>
                          <td>
                            <div>
                              <div className="fw-bold">
                                {tos.version || 'v1.0'}
                              </div>
                              <div className="text-muted small">
                                {formatDate(tos.created)}
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
                                  offeringUuid={offering.uuid}
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
          </Tab.Pane>

          <Tab.Pane eventKey="resources" unmountOnExit={true}>
            <OfferingResourcesTable offeringUuid={offering.uuid} />
          </Tab.Pane>
        </Tab.Content>
      </TableTabsContainer>
    </ExpandableContainer>
  );
};
