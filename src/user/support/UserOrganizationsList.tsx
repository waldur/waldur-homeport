import { connect } from 'react-redux';

import { RootState } from '@waldur/store/reducers';
import { getUserOrganizationsList } from '@waldur/user/affiliations/OrganizationsList';
import { getCustomer } from '@waldur/workspace/selectors';
import { User } from '@waldur/workspace/types';

interface UserOrganizationsListProps {
  user: User;
}

const PureUserOrganizations = getUserOrganizationsList();

const mapStateToProps = (
  state: RootState,
  ownProps: UserOrganizationsListProps,
) => ({
  currentOrganization: getCustomer(state),
  user: ownProps.user,
});

export const UserOrganizationsList = connect(mapStateToProps)(
  PureUserOrganizations,
);
