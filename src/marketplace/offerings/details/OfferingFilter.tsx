import { FC, useMemo } from 'react';

import { translate } from '@/i18n';
import {
  providerOfferingsAutocomplete,
  publicOfferingsAutocomplete,
} from '@/marketplace/common/autocompletes';
import { Option, SingleValue } from '@/marketplace/landing/AutocompleteField';
import { AsyncSelectFilter } from '@/table';

interface OfferingFilterProps {
  offeringFilter?: object;
  providerOfferings?: boolean;
  [key: string]: any;
}

export const OfferingFilter: FC<OfferingFilterProps> = ({
  providerOfferings = true,
  offeringFilter,
  ...props
}) => {
  const loadOptions = useMemo(
    () =>
      (providerOfferings
        ? providerOfferingsAutocomplete
        : publicOfferingsAutocomplete)(offeringFilter),
    [providerOfferings, offeringFilter],
  );

  return (
    <AsyncSelectFilter
      title={translate('Offering')}
      name="offering"
      badgeValue={(value) => `${value?.category_title} / ${value?.name}`}
      placeholder={translate('Select offering...')}
      loadOptions={loadOptions}
      getOptionValue={(option) => option.uuid}
      getOptionLabel={(option) => `${option.category_title} / ${option.name}`}
      components={{ Option, SingleValue }}
      {...props}
    />
  );
};
