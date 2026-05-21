import { FC } from 'react';
import { Field } from 'react-final-form';

import { AwesomeCheckbox } from '@/core/AwesomeCheckbox';
import { SelectField } from '@/form';
import {
  REACT_MULTI_SELECT_TABLE_FILTER,
  REACT_SELECT_TABLE_FILTER,
} from '@/form/themed-select';
import { translate } from '@/i18n';
import { OrganizationAutocomplete } from '@/marketplace/orders/OrganizationAutocomplete';
import { TableFilterItem } from '@/table/TableFilterItem';

const getIsRemovedFilterOptions = () => [
  {
    label: translate('All projects'),
    value: '',
  },
  {
    label: translate('Not removed'),
    value: false,
  },
  {
    label: translate('Removed'),
    value: true,
  },
];

export const ProjectsListFilter: FC = () => (
  <>
    <TableFilterItem
      title={translate('Organization')}
      name="organization"
      getValueLabel={(option) => option.name}
      instantApply={false}
    >
      <OrganizationAutocomplete
        reactSelectProps={{ ...REACT_MULTI_SELECT_TABLE_FILTER }}
      />
    </TableFilterItem>
    <TableFilterItem
      title={translate('Conceal finished projects')}
      name="conceal_finished_projects"
      badgeValue={(value) => (value ? translate('Yes') : translate('No'))}
      ellipsis={false}
    >
      <Field
        name="conceal_finished_projects"
        component={(fieldProps) => (
          <AwesomeCheckbox
            label={translate('Conceal finished projects')}
            value={fieldProps.input.value}
            onChange={(value) => fieldProps.input.onChange(value)}
          />
        )}
      />
    </TableFilterItem>
    <TableFilterItem
      title={translate('Include removed')}
      name="include_terminated"
      badgeValue={(value) => (value ? translate('Yes') : translate('No'))}
      ellipsis={false}
    >
      <Field
        name="include_terminated"
        component={(fieldProps) => (
          <AwesomeCheckbox
            label={translate('Include removed')}
            value={fieldProps.input.value}
            onChange={(value) => fieldProps.input.onChange(value)}
          />
        )}
      />
    </TableFilterItem>
    <TableFilterItem
      title={translate('Removal status')}
      name="is_removed"
      badgeValue={(value) =>
        getIsRemovedFilterOptions().find((op) => op.value === value)?.label
      }
      ellipsis={false}
    >
      <Field
        name="is_removed"
        component={(fieldProps) => (
          <SelectField
            {...fieldProps}
            className="Select"
            placeholder={translate('Select removal status')}
            options={getIsRemovedFilterOptions()}
            noUpdateOnBlur={true}
            simpleValue={true}
            isClearable={true}
            {...REACT_SELECT_TABLE_FILTER}
          />
        )}
      />
    </TableFilterItem>
  </>
);
