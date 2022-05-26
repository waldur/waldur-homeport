import React from 'react';
import { Col, Row } from 'react-bootstrap';
import { connect, useSelector } from 'react-redux';
import { useAsync } from 'react-use';

import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { Panel } from '@waldur/core/Panel';
import { CustomerCreatePromptContainer } from '@waldur/customer/create/CustomerCreatePromptContainer';
import { renderCustomerCreatePrompt } from '@waldur/customer/create/selectors';
import { DashboardHeader } from '@waldur/dashboard/DashboardHeader';
import { translate } from '@waldur/i18n';
import { countChecklists } from '@waldur/marketplace-checklist/api';
import * as actions from '@waldur/marketplace/landing/store/actions';
import * as selectors from '@waldur/marketplace/landing/store/selectors';
import { useTitle } from '@waldur/navigation/title';
import { RootState } from '@waldur/store/reducers';
import { getUser } from '@waldur/workspace/selectors';

import { useUserTabs } from '../constants';

import { CategoriesList } from './CategoriesList';
import { CategoryUserList } from './CategoryUserList';
import { CurrentUserEvents } from './CurrentUserEvents';
import { CustomerPermissions } from './CustomerPermissions';
import { ProjectPermissions } from './ProjectPermissions';
import { UserDashboardChart } from './UserDashboardChart';

type StateProps = ReturnType<typeof mapStateToProps>;

type DispatchProps = typeof mapDispatchToProps;

const UserDashboardContainer: React.FC<StateProps & DispatchProps> = (
  props,
) => {
  useUserTabs();
  const user = useSelector(getUser);
  useTitle(translate('User dashboard'));
  const { getCategories } = props;
  React.useEffect(() => {
    getCategories();
  }, [getCategories]);

  const asyncState = useAsync(countChecklists);

  const renderPrompt = useSelector(renderCustomerCreatePrompt);
  return asyncState.loading ? (
    <LoadingSpinner />
  ) : asyncState.error ? (
    <>{translate('Unable to load data.')}</>
  ) : (
    <>
      <DashboardHeader
        title={translate('Welcome, {user}!', { user: user.full_name })}
      />
      <UserDashboardChart user={user} hasChecklists={asyncState.value > 0} />
      {asyncState.value > 0 && (
        <Panel title={translate('Checklists')}>
          <CategoryUserList />
        </Panel>
      )}
      <div className="mt-5">
        <Panel title={translate('Marketplace')}>
          <CategoriesList {...props.categories} />
        </Panel>
      </div>
      {renderPrompt && (
        <Row className="mt-5">
          <Col md={12}>
            <CustomerCreatePromptContainer />
          </Col>
        </Row>
      )}
      <Row className="mt-5">
        <Col md={6}>
          <CustomerPermissions title={translate('Owned organizations')} />
        </Col>
        <Col md={6}>
          <ProjectPermissions title={translate('Managed projects')} />
        </Col>
      </Row>
      <Row className="mt-5">
        <Col md={12}>
          <CurrentUserEvents title={translate('Audit logs')} />
        </Col>
      </Row>
    </>
  );
};

const mapDispatchToProps = {
  getCategories: actions.categoriesFetchStart,
};

const mapStateToProps = (state: RootState) => ({
  categories: selectors.getCategories(state),
});

const enhance = connect(mapStateToProps, mapDispatchToProps);

export const UserDashboard = enhance(UserDashboardContainer);
