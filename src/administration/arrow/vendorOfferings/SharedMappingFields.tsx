import { useCallback, useEffect, useState } from 'react';
import {
  adminArrowVendorOfferingMappingsVendorChoicesList,
  marketplacePublicOfferingsPlansList,
} from 'waldur-js-client';

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
      additional={{ page: 1 }}
    />
  );
};

export const PlanSelect = ({
  input,
  offeringUuid,
}: {
  input?;
  offeringUuid: string | null;
}) => {
  const [plans, setPlans] = useState<PlanOption[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!offeringUuid) {
      setPlans([]);
      return;
    }
    setLoading(true);
    marketplacePublicOfferingsPlansList({ path: { uuid: offeringUuid } })
      .then((response) => {
        setPlans(
          (response.data || []).map((p) => ({
            uuid: p.uuid,
            name: p.name,
          })),
        );
      })
      .catch(() => setPlans([]))
      .finally(() => setLoading(false));
  }, [offeringUuid]);

  return (
    <AsyncCreatableSelect
      value={input.value}
      onChange={input.onChange}
      loadOptions={() =>
        Promise.resolve({
          options: plans,
          hasMore: false,
          additional: { page: 1 },
        })
      }
      defaultOptions={plans}
      isLoading={loading}
      getOptionLabel={(option: PlanOption) => option.name}
      getOptionValue={(option: PlanOption) => option.uuid}
      isValidNewOption={() => false}
      placeholder={translate('Select plan...')}
      isClearable
      noOptionsMessage={() =>
        offeringUuid
          ? translate('No plans available')
          : translate('Select an offering first')
      }
    />
  );
};
