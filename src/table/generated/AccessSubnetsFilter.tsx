// This file is auto-generated. Do not edit manually.

import { FunctionComponent } from 'react';
import {
  AccessSubnetsListData,
  ProviderOfferingDetails,
  marketplaceProviderOfferingsList,
} from 'waldur-js-client';

import { createLoadOptions } from '@/form/select/createLoadOptions';
import { translate } from '@/i18n';
import { AsyncSelectFilter, BooleanFilter } from '@/table';

export const AccessSubnetsFilter: FunctionComponent<{}> = () => (
  <>
    <BooleanFilter
      title={translate('Applies to sign-in')}
      name="applies_to_portal"
      badgeValue={(value) =>
        value ? translate('Applies to sign-in') : translate('All')
      }
      ellipsis={false}
      parse={(v) => v || undefined}
    />
    <BooleanFilter
      title={translate('Managed by staff')}
      name="is_staff_managed"
      badgeValue={(value) =>
        value ? translate('Managed by staff') : translate('All')
      }
      ellipsis={false}
      parse={(v) => v || undefined}
    />
    <AsyncSelectFilter
      title={translate('Applies to offering')}
      name="offering"
      getValueLabel={(value: ProviderOfferingDetails) => value?.name}
      loadOptions={createLoadOptions(marketplaceProviderOfferingsList, 'query')}
      defaultOptions
      getOptionValue={(option: ProviderOfferingDetails) =>
        String(option.uuid || '')
      }
      getOptionLabel={(option: ProviderOfferingDetails) =>
        String(option.name || '')
      }
      isClearable={true}
      placeholder={translate('Applies to offering')}
    />
  </>
);

export const AccessSubnetsFilterFormId = 'AccessSubnetsFilter';

export interface AccessSubnetsFilterFormData {
  applies_to_portal: boolean;
  is_staff_managed: boolean;
  offering: ProviderOfferingDetails;
}

type AccessSubnetsFilterQuery = AccessSubnetsListData['query'];

export const selectAccessSubnetsFilter = (
  values?: Partial<AccessSubnetsFilterFormData>,
): AccessSubnetsFilterQuery => {
  const filter: AccessSubnetsFilterQuery = {} as any;
  if (values) {
    if (values.applies_to_portal) {
      filter.applies_to_portal = values.applies_to_portal;
    }
    if (values.is_staff_managed) {
      filter.is_staff_managed = values.is_staff_managed;
    }
    if (values.offering) {
      filter.offering_uuid = values.offering.uuid;
    }
  }
  return filter;
};
