import React from 'react';
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
import { CategoriesList } from '@waldur/user/list/CategoriesList';
import { CategoryUserList } from '@waldur/user/list/CategoryUserList';
import { UserDashboardChart } from '@waldur/user/list/UserDashboardChart';
import { getUser } from '@waldur/workspace/selectors';

import { CurrentUserEvents } from './CurrentUserEvents';
import { CustomerPermissions } from './CustomerPermissions';
import { ProjectPermissions } from './ProjectPermissions';

type StateProps = ReturnType<typeof mapStateToProps>;

type DispatchProps = typeof mapDispatchToProps;

const UserDashboardContainer: React.FC<StateProps & DispatchProps> = (
  props,
) => {
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
      <UserDashboardChart user={user} />
      <div className="wrapper wrapper-content">
        {asyncState.value > 0 && (
          <>
            <Panel title={translate('Checklists')}>
              <CategoryUserList />
            </Panel>
            <Panel title={translate('Marketplace')}>
              <CategoriesList {...props.categories} />
            </Panel>
          </>
        )}
        {renderPrompt && (
          <div className="row">
            <div className="col-md-12">
              <CustomerCreatePromptContainer />
            </div>
          </div>
        )}
        <div className="row">
          <div className="col-md-6">
            <Panel title={translate('Owned organizations')}>
              <CustomerPermissions />
            </Panel>
          </div>
          <div className="col-md-6">
            <Panel title={translate('Managed projects')}>
              <ProjectPermissions />
            </Panel>
          </div>
        </div>
        <div className="row">
          <div className="col-md-12">
            <Panel title={translate('Audit logs')}>
              <CurrentUserEvents />
            </Panel>
          </div>
        </div>
      </div>
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
