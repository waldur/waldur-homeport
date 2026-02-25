// This file is auto-generated. Do not edit manually.

import { FunctionComponent } from 'react';
import { Field, getFormValues, reduxForm } from 'redux-form';
import { createSelector } from 'reselect';
import {
  Customer,
  EventsListData,
  Project,
  User,
  customersList,
  projectsList,
  usersList,
} from 'waldur-js-client';

import {
  Select,
  AsyncPaginate,
  REACT_SELECT_TABLE_FILTER,
} from '@waldur/form/themed-select';
import { translate } from '@waldur/i18n';
import { RootState } from '@waldur/store/reducers';
import { createSelectFetcher } from '@waldur/table/api';
import { TableFilterItem } from '@waldur/table/TableFilterItem';

export const FeatureChoices: FeatureChoicesOption[] = [
  {
    label: translate('Project events'),
    value: 'projects',
  },
  {
    label: translate('Resource events'),
    value: 'resources',
  },
];
export interface FeatureChoicesOption {
  label: string;
  value: string;
}

const PureEventsFilter: FunctionComponent<{}> = () => (
  <>
    <TableFilterItem
      title={translate('Organization')}
      name="organization"
      getValueLabel={(value: Customer) => value?.name}
    >
      <Field
        name="organization"
        component={(fieldProps) => (
          <AsyncPaginate
            placeholder={translate('Organization')}
            loadOptions={createSelectFetcher(customersList, 'query')}
            defaultOptions
            getOptionValue={(option: Customer) => String(option.uuid || '')}
            getOptionLabel={(option: Customer) => String(option.name || '')}
            value={fieldProps.input.value}
            onChange={(value) => fieldProps.input.onChange(value)}
            isClearable={true}
            {...REACT_SELECT_TABLE_FILTER}
            className="metronic-select-container"
          />
        )}
      />
    </TableFilterItem>
    <TableFilterItem
      title={translate('Project')}
      name="project"
      getValueLabel={(value: Project) => value?.name}
    >
      <Field
        name="project"
        component={(fieldProps) => (
          <AsyncPaginate
            placeholder={translate('Project')}
            loadOptions={createSelectFetcher(projectsList, 'query')}
            defaultOptions
            getOptionValue={(option: Project) => String(option.uuid || '')}
            getOptionLabel={(option: Project) => String(option.name || '')}
            value={fieldProps.input.value}
            onChange={(value) => fieldProps.input.onChange(value)}
            isClearable={true}
            {...REACT_SELECT_TABLE_FILTER}
            className="metronic-select-container"
          />
        )}
      />
    </TableFilterItem>
    <TableFilterItem
      title={translate('User')}
      name="user"
      getValueLabel={(value: User) => value?.full_name}
    >
      <Field
        name="user"
        component={(fieldProps) => (
          <AsyncPaginate
            placeholder={translate('User')}
            loadOptions={createSelectFetcher(usersList, 'full_name', {
              o: ['full_name'],
            })}
            defaultOptions
            getOptionValue={(option: User) => String(option.uuid || '')}
            getOptionLabel={(option: User) => String(option.full_name || '')}
            value={fieldProps.input.value}
            onChange={(value) => fieldProps.input.onChange(value)}
            isClearable={true}
            {...REACT_SELECT_TABLE_FILTER}
            className="metronic-select-container"
          />
        )}
      />
    </TableFilterItem>
    <TableFilterItem
      title={translate('Type')}
      name="feature"
      getValueLabel={(value: FeatureChoicesOption[]) =>
        value?.map((v) => v?.label).join(', ')
      }
    >
      <Field
        name="feature"
        component={(fieldProps) => (
          <Select
            placeholder={translate('Type')}
            options={FeatureChoices}
            value={fieldProps.input.value}
            onChange={(value) => fieldProps.input.onChange(value)}
            getOptionValue={(option: FeatureChoicesOption) =>
              String(option.value)
            }
            getOptionLabel={(option: FeatureChoicesOption) => option.label}
            isClearable={true}
            isMulti={true}
            {...REACT_SELECT_TABLE_FILTER}
          />
        )}
      />
    </TableFilterItem>
  </>
);

export const EventsFilterFormId = 'EventsFilter';

interface EventsFilterFormData {
  organization: Customer;
  project: Project;
  user: User;
  feature: FeatureChoicesOption[];
}

export const EventsFilter = reduxForm<EventsFilterFormData, {}>({
  form: EventsFilterFormId,
  destroyOnUnmount: false,
})(PureEventsFilter);

type EventsFilterQuery = EventsListData['query'];

export const selectEventsFilter = createSelector<
  RootState,
  Partial<EventsFilterFormData>,
  EventsFilterQuery
>(getFormValues(EventsFilterFormId), (values) => {
  const filter: EventsFilterQuery = {} as any;
  if (values) {
    if (values.organization) {
      filter.customer_uuid = values.organization.uuid;
    }
    if (values.project) {
      filter.project_uuid = values.project.uuid;
    }
    if (values.user) {
      filter.user_uuid = values.user.uuid;
    }
    if (values.feature) {
      filter.feature = values.feature.map((v: any) => v.value);
    }
  }
  return filter;
});
