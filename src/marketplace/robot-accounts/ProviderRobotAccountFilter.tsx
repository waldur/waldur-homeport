import { FunctionComponent } from 'react';
import { reduxForm } from 'redux-form';

import { translate } from '@waldur/i18n';
import { TableFilterItem } from '@waldur/table/TableFilterItem';

import { ProjectFilter } from '../resources/list/ProjectFilter';

const PureProviderRobotAccountFilter: FunctionComponent = () => {
  return (
    <>
      <TableFilterItem
        title={translate('Project')}
        name="project"
        badgeValue={(value) => value?.name}
      >
        <ProjectFilter />
      </TableFilterItem>
    </>
  );
};

const enhance = reduxForm({
  form: 'ProviderRobotAccountFilter',
});

export const ProviderRobotAccountFilter = enhance(
  PureProviderRobotAccountFilter,
);
