import { FC, useMemo } from 'react';
import { reduxForm } from 'redux-form';
import { Project } from 'waldur-js-client';

import { REACT_SELECT_TABLE_FILTER } from '@waldur/form/themed-select';
import { translate } from '@waldur/i18n';
import { OfferingAutocomplete } from '@waldur/marketplace/offerings/details/OfferingAutocomplete';
import { TableFilterItem } from '@waldur/table/TableFilterItem';

import { PROJECT_RESOURCES_LIST_FILTER } from '../constants';

interface ProjectResourcesFilterProps {
  project?: Project;
}

const PureProjectResourcesFilter: FC<ProjectResourcesFilterProps> = (props) => {
  const offeringFilter = useMemo(
    () => ({ project_uuid: props.project?.uuid }),
    [props.project],
  );

  return (
    <TableFilterItem
      title={translate('Offering')}
      name="offering"
      badgeValue={(value) => `${value?.category_title} / ${value?.name}`}
    >
      <OfferingAutocomplete
        providerOfferings={false}
        reactSelectProps={REACT_SELECT_TABLE_FILTER}
        offeringFilter={offeringFilter}
      />
    </TableFilterItem>
  );
};

const enhance = reduxForm<{}, ProjectResourcesFilterProps>({
  form: PROJECT_RESOURCES_LIST_FILTER,
  destroyOnUnmount: false,
});

export const ProjectResourcesFilter = enhance(PureProjectResourcesFilter);
