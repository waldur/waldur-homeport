import * as React from 'react';
import { connect, useSelector } from 'react-redux';

import { Panel } from '@waldur/core/Panel';
import { CustomerCreatePromptContainer } from '@waldur/customer/create/CustomerCreatePromptContainer';
import { renderCustomerCreatePrompt } from '@waldur/customer/create/selectors';
import { translate } from '@waldur/i18n';
import { CategoriesList } from '@waldur/marketplace/landing/CategoriesList';
import * as actions from '@waldur/marketplace/landing/store/actions';
import * as selectors from '@waldur/marketplace/landing/store/selectors';
import { useTitle } from '@waldur/navigation/title';

import { CurrentUserEvents } from './CurrentUserEvents';
import { CustomerPermissions } from './CustomerPermissions';
import { ProjectPermissions } from './ProjectPermissions';

const UserDashboardContainer: React.FC = (props: any) => {
  useTitle(translate('User dashboard'));
  const { getCategories } = props;
  React.useEffect(() => {
    getCategories();
  }, [getCategories]);

  const renderPrompt = useSelector(renderCustomerCreatePrompt);
  return (
    <div className="wrapper wrapper-content">
      <Panel title={translate('Marketplace')}>
        <CategoriesList
          {...props.categories}
          hideCounter={true}
          hideCategoryWithNoOfferings={true}
          userDashboardView={true}
        />
      </Panel>
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
  );
};

const mapDispatchToProps = {
  getCategories: actions.categoriesFetchStart,
};

const mapStateToProps = (state) => ({
  categories: selectors.getCategories(state),
});

const enhance = connect(mapStateToProps, mapDispatchToProps);

export const UserDashboard = enhance(UserDashboardContainer);
