// This file is auto-generated. Do not edit manually.

import { FunctionComponent } from 'react';
import {
  DeliveryEnum,
  EventConsumersListData,
  User,
  usersList,
} from 'waldur-js-client';

import { createLoadOptions } from '@/form/select/createLoadOptions';
import { translate } from '@/i18n';
import { AsyncSelectFilter, SelectFilter } from '@/table';

export const DeliveryOptions: DeliveryOption[] = [
  {
    label: translate('RabbitMQ queue'),
    value: 'rmq',
  },
  {
    label: translate('HTTP webhook'),
    value: 'webhook',
  },
];
export interface DeliveryOption {
  label: string;
  value: DeliveryEnum;
}

export const IsGlobalOptions: IsGlobalOption[] = [
  {
    label: translate('Scoped'),
    value: false,
  },
  {
    label: translate('Global (unscoped)'),
    value: true,
  },
  {
    label: translate('All consumers'),
    value: 'undefined',
  },
];
export interface IsGlobalOption {
  label: string;
  value: any;
}

export const EventConsumersFilter: FunctionComponent<{}> = () => (
  <>
    <SelectFilter
      title={translate('Scope')}
      name="is_global"
      getValueLabel={(value: IsGlobalOption) => value?.label}
      options={IsGlobalOptions}
      getOptionValue={(option: IsGlobalOption) => String(option.value)}
      getOptionLabel={(option: IsGlobalOption) => option.label}
      isClearable={true}
      placeholder={translate('Any scope')}
    />
    <SelectFilter
      title={translate('Delivery')}
      name="delivery"
      getValueLabel={(value: DeliveryOption) => value?.label}
      options={DeliveryOptions}
      getOptionValue={(option: DeliveryOption) => String(option.value)}
      getOptionLabel={(option: DeliveryOption) => option.label}
      isClearable={true}
      placeholder={translate('Any delivery')}
    />
    <AsyncSelectFilter
      title={translate('Owner')}
      name="user"
      getValueLabel={(value: User) =>
        value?.full_name || value?.username || value?.email
      }
      loadOptions={createLoadOptions(usersList, 'query')}
      defaultOptions
      getOptionValue={(option: User) => String(option.uuid || '')}
      getOptionLabel={(option: User) =>
        String(option.full_name || option.username || option.email || '')
      }
      isClearable={true}
      placeholder={translate('Owner')}
    />
  </>
);

export const EventConsumersFilterFormId = 'EventConsumersFilter';

export interface EventConsumersFilterFormData {
  is_global: IsGlobalOption;
  delivery: DeliveryOption;
  user: User;
}

type EventConsumersFilterQuery = EventConsumersListData['query'];

export const selectEventConsumersFilter = (
  values?: Partial<EventConsumersFilterFormData>,
): EventConsumersFilterQuery => {
  const filter: EventConsumersFilterQuery = {} as any;
  if (values) {
    if (values.is_global) {
      filter.is_global = values.is_global.value;
    }
    if (values.delivery) {
      filter.delivery = values.delivery.value;
    }
    if (values.user) {
      filter.user_uuid = values.user.uuid;
    }
  }
  return filter;
};
