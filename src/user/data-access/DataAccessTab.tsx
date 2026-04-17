import { useQuery } from '@tanstack/react-query';
import { FC, useState } from 'react';
import { Alert, Card, Nav, Tab } from 'react-bootstrap';
import { User } from 'waldur-js-client';

import { UI_STALE_TIME } from '@waldur/core/constants';
import { LoadingErred } from '@waldur/core/LoadingErred';
import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { translate } from '@waldur/i18n';
import { useUser } from '@waldur/workspace/hooks';

import { fetchDataAccessVisibility } from './api';
import { DataAccessSummaryCards } from './components/DataAccessSummaryCards';
import { DataAccessHistory } from './DataAccessHistory';
import { DataAccessVisibility } from './DataAccessVisibility';
import { EndUserDataAccessView } from './EndUserDataAccessView';

type SubTabKey = 'visibility' | 'history';

interface DataAccessTabProps {
  user: User;
}

export const DataAccessTab: FC<DataAccessTabProps> = ({ user }) => {
  const currentUser = useUser();
  const [activeKey, setActiveKey] = useState<SubTabKey>('visibility');

  const isSelf = currentUser?.uuid === user.uuid;
  const isViewerStaffOrSupport =
    currentUser?.is_staff || currentUser?.is_support;

  // Profile dashboard (viewing own profile) = always simple view
  // Staff/support should use /support/users/ for full details
  const useSimpleView = isSelf;

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['data-access-visibility', user.uuid],
    queryFn: () => fetchDataAccessVisibility(user.uuid),
    staleTime: UI_STALE_TIME,
  });

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (error) {
    // Handle 403 permission denied
    const errorResponse = (error as any)?.response;
    if (errorResponse?.status === 403) {
      return (
        <Alert variant="warning">
          {translate(
            "You do not have permission to view this user's data access information.",
          )}
        </Alert>
      );
    }
    return <LoadingErred loadData={refetch} />;
  }

  // End users viewing their own profile see a simplified view
  if (useSimpleView) {
    return <EndUserDataAccessView data={data} />;
  }

  // Full view with tabs (for staff viewing OTHER users via support routes)
  return (
    <>
      <DataAccessSummaryCards summary={data.summary} />

      <Card className="card-bordered">
        <Card.Header className="border-bottom">
          <Card.Title>
            <h3>{translate('Data access')}</h3>
          </Card.Title>
        </Card.Header>
        <Card.Body>
          <Tab.Container
            activeKey={activeKey}
            onSelect={(k) => setActiveKey(k as SubTabKey)}
          >
            <Nav variant="tabs" className="nav-line-tabs mb-4">
              <Nav.Item>
                <Nav.Link as="button" eventKey="visibility">
                  {translate('Who can access')}
                </Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link as="button" eventKey="history">
                  {translate('Access history')}
                </Nav.Link>
              </Nav.Item>
            </Nav>

            <Tab.Content>
              <Tab.Pane eventKey="visibility">
                {activeKey === 'visibility' && (
                  <DataAccessVisibility
                    data={data}
                    isViewerStaffOrSupport={isViewerStaffOrSupport}
                  />
                )}
              </Tab.Pane>
              <Tab.Pane eventKey="history">
                {activeKey === 'history' && (
                  <DataAccessHistory
                    userUuid={user.uuid}
                    isViewerStaffOrSupport={isViewerStaffOrSupport}
                  />
                )}
              </Tab.Pane>
            </Tab.Content>
          </Tab.Container>
        </Card.Body>
      </Card>
    </>
  );
};
