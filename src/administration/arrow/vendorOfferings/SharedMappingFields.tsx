import { useQuery } from '@tanstack/react-query';
import { useCallback } from 'react';
import {
  adminArrowVendorOfferingMappingsVendorChoicesList,
  marketplacePublicOfferingsPlansList,
} from 'waldur-js-client';

import { STALE_TIME } from '@/core/constants';
import { SelectGroup } from '@/form';
import { AsyncCreatableSelect } from '@/form/select';
import { translate } from '@/i18n';

interface VendorChoice {
  value: string;
  label: string;
}

interface PlanOption {
  uuid: string;
  name: string;
}

export interface MappingFormData {
  arrow_vendor_name: VendorChoice | string;
  offering: { uuid: string; name: string };
  plan: PlanOption | null;
}

export const VendorNameSelect = ({
  input,
  settingsUuid,
  defaultOption = undefined,
}: {
  input?;
  settingsUuid: string | null;
  defaultOption?: VendorChoice | string;
}) => {
  const loadVendorChoices = useCallback(
    async (query: string, _prevOptions, { page }) => {
      try {
        const response =
          await adminArrowVendorOfferingMappingsVendorChoicesList({
            query: { settings_uuid: settingsUuid },
          });
        const options = (response.data || []).filter(
          (opt) =>
            !query || opt.label.toLowerCase().includes(query.toLowerCase()),
        );
        return {
          options,
          hasMore: false,
          additional: { page: page + 1 },
        };
      } catch {
        return { options: [], hasMore: false, additional: { page } };
      }
    },
    [settingsUuid],
  );

  return (
    <AsyncCreatableSelect
      value={input.value}
      onChange={input.onChange}
      loadOptions={loadVendorChoices}
      getOptionLabel={(option: VendorChoice) => option.label}
      getOptionValue={(option: VendorChoice) => option.value}
      getNewOptionData={(inputValue: string) => ({
        value: inputValue,
        label: inputValue,
      })}
      formatCreateLabel={(inputValue: string) =>
        translate('Add "{value}"', { value: inputValue })
      }
      placeholder={translate('Select or type vendor name...')}
      defaultOptions={defaultOption ? [defaultOption] : true}
    />
  );
};

export const PlanSelectGroup = ({
  offeringUuid,
}: {
  offeringUuid: string | null;
}) => {
  const { data: plans, isLoading } = useQuery({
    queryKey: ['offeringPlans', offeringUuid],
    queryFn: () =>
      marketplacePublicOfferingsPlansList({
        path: { uuid: offeringUuid },
      }).then((response) => response.data),
    enabled: Boolean(offeringUuid),
    staleTime: STALE_TIME,
  });

  return (
    <SelectGroup
      name="plan"
      label={translate('Plan')}
      description={translate(
        'Billing plan to use for resources created from this vendor offering',
      )}
      placeholder={translate('Select plan...')}
      options={plans || []}
      isLoading={isLoading}
      getOptionLabel={(option: PlanOption) => option.name}
      getOptionValue={(option: PlanOption) => option.uuid}
      isDisabled={!offeringUuid}
      isClearable
      noOptionsMessage={() =>
        offeringUuid
          ? translate('No plans available')
          : translate('Select an offering first')
      }
    />
  );
};
