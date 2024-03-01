import { useCurrentStateAndParams } from '@uirouter/react';
import { FunctionComponent, useCallback, useContext, useEffect } from 'react';
import { Col, Row } from 'react-bootstrap';
import { useDispatch } from 'react-redux';

import { lazyComponent } from '@waldur/core/lazyComponent';
import { translate } from '@waldur/i18n';
import { PageBarTab } from '@waldur/marketplace/common/PageBarTab';
import { PageBarContext } from '@waldur/marketplace/context';
import { openModalDialog } from '@waldur/modal/actions';
import { ProjectUsersBadge } from '@waldur/project/ProjectUsersBadge';

import './ResourcePageBar.scss';

const ProjectUsersList = lazyComponent(
  () => import('@waldur/project/team/ProjectUsersList'),
  'ProjectUsersList',
);

export const ResourceDetailsBar: FunctionComponent = () => {
  const { state } = useCurrentStateAndParams();
  const { tabs, addTabs, visibleSectionId } = useContext(PageBarContext);

  const dispatch = useDispatch();
  const openTeamModal = useCallback(() => {
    dispatch(openModalDialog(ProjectUsersList, { size: 'xl' }));
  }, [dispatch]);

  useEffect(() => {
    addTabs([
      {
        key: 'getting-started',
        title: translate('Getting started'),
      },
      {
        key: 'lexis-links',
        title: translate('LEXIS links'),
      },
      {
        key: 'robot-accounts',
        title: translate('Robot accounts'),
      },
      {
        key: 'usage-history',
        title: translate('Usage'),
      },
      {
        key: 'activity',
        title: translate('Activity'),
      },
      {
        key: 'tickets',
        title: translate('Tickets'),
      },
      {
        key: 'resource-options',
        title: translate('Options'),
      },
      {
        key: 'users',
        title: translate('Roles'),
      },
    ]);
  }, []);

  return (
    <div className="resource-page-bar bg-body shadow-sm">
      <div className="container-xxl">
        <Row className="d-flex align-items-stretch">
          <Col className="scroll-x pt-2 pb-1">
            <div className="d-flex align-items-center w-100">
              {tabs.map((tab) => (
                <PageBarTab
                  key={tab.key}
                  title={tab.title}
                  name={tab.key}
                  state={state.name}
                  params={{ '#': tab.key }}
                  active={visibleSectionId === tab.key}
                />
              ))}
            </div>
          </Col>
          <Col xs="auto" className="row">
            <ProjectUsersBadge
              compact
              max={3}
              className="col-auto align-items-center me-10"
              onClick={openTeamModal}
            />
          </Col>
        </Row>
      </div>
    </div>
  );
};
