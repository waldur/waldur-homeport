import { FunctionComponent } from 'react';

import { translate } from '@/i18n';
import { OfferingTypeFilter } from '@/marketplace/offerings/details/OfferingTypeFilter';
import { OfferingStateFilter } from '@/marketplace/offerings/list/OfferingStateFilter';
import { ProviderFilter } from '@/marketplace/orders/ProviderFilter';
import { CategoryFilter } from '@/marketplace/resources/list/CategoryFilter';
import { TagFilter } from '@/marketplace/tags/TagFilter';
import { SelectFilter } from '@/table';

interface OfferingsListFilterOwnProps {
  showCategory?;
  showOrganization?;
}

const sharedOptions = [
  {
    label: translate('No'),
    value: false,
  },
  {
    label: translate('Yes'),
    value: true,
  },
];

export const OfferingsListFilter: FunctionComponent<
  OfferingsListFilterOwnProps
> = ({ showCategory, showOrganization = true }) => {
  return (
    <>
      <OfferingStateFilter instantApply={false} />
      {showOrganization ? (
        <ProviderFilter
          badgeValue={(value) => value?.name}
          name="organization"
        />
      ) : null}
      <OfferingTypeFilter />
      {showCategory ? <CategoryFilter /> : null}
      <TagFilter />
      <SelectFilter
        name="shared"
        title={translate('Shared')}
        badgeValue={(value) => value?.label}
        placeholder={translate('Select status')}
        options={sharedOptions}
      />
    </>
  );
};
