import { FunctionComponent } from 'react';
import { reduxForm } from 'redux-form';

import { ProjectRoleSelectField } from '@waldur/customer/team/ProjectRoleSelectField';
import { translate } from '@waldur/i18n';
import { TableFilterItem } from '@waldur/table/TableFilterItem';

import { PROJECT_USERS_LIST_FILTER_FORM_ID } from '../constants';

const PureProjectUsersListFilter: FunctionComponent = () => (
  <TableFilterItem
    title={translate('Role')}
    name="project_role"
    getValueLabel={(value) => value.description || value.name}
    instantApply={false}
  >
    <ProjectRoleSelectField />
  </TableFilterItem>
);

const enhance = reduxForm({
  form: PROJECT_USERS_LIST_FILTER_FORM_ID,
  destroyOnUnmount: false,
});

export const ProjectUsersListFilter = enhance(PureProjectUsersListFilter);
