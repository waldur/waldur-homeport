import { FC, useMemo } from 'react';
import { marketplacePublicOfferingsList, NestedTag } from 'waldur-js-client';

import { useCardStyle } from '@waldur/marketplace/landing/CardStyleContext';
import {
  OFFERING_CARD_MANDATORY_FIELDS,
  useOfferingListFilter,
} from '@waldur/marketplace/landing/utils';
import { Category, CategoryGroup } from '@waldur/marketplace/types';
import { createFetcher } from '@waldur/table/api';
import { useTable } from '@waldur/table/useTable';

import { CarouselOfferingGrid } from './CarouselOfferingGrid';
import { CarouselSection } from './CarouselSection';

// Type guard to check if item is a CategoryGroup
const isCategoryGroup = (
  item: Category | CategoryGroup,
): item is CategoryGroup => {
  return 'categories' in item && Array.isArray(item.categories);
};

interface CategoryCarouselSectionProps {
  item: Category | CategoryGroup;
  onTagClick?(tag: NestedTag): void;
}

export const CategoryCarouselSection: FC<CategoryCarouselSectionProps> = ({
  item,
  onTagClick,
}) => {
  const cardStyle = useCardStyle();

  const tableId = useMemo(() => {
    if (isCategoryGroup(item)) {
      return `marketplace-carousel-group-${item.uuid}`;
    }
    return `marketplace-carousel-category-${item.uuid}`;
  }, [item]);

  const isGroup = isCategoryGroup(item);

  const additionalFilters = useMemo(
    () =>
      isGroup
        ? { category_group_uuid: item.uuid }
        : { category_uuid: item.uuid },
    [item.uuid, isGroup],
  );

  const filter = useOfferingListFilter(8, additionalFilters);

  const tableProps = useTable({
    table: tableId,
    filter,
    fetchData: createFetcher(marketplacePublicOfferingsList),
    staleTime: 3 * 60 * 1000,
    mandatoryFields: OFFERING_CARD_MANDATORY_FIELDS,
  });

  // Don't render if no offerings
  if (
    !tableProps.loading &&
    (!tableProps.rows || tableProps.rows.length === 0)
  ) {
    return null;
  }

  // Determine the link
  const linkProps = isGroup
    ? {
        state: 'marketplace-category-group' as const,
        params: { group_uuid: item.uuid },
      }
    : {
        state: 'marketplace-category' as const,
        params: { category_uuid: item.uuid },
      };

  return (
    <CarouselSection title={item.title} linkProps={linkProps}>
      <CarouselOfferingGrid
        tableProps={tableProps}
        cardStyle={cardStyle}
        onTagClick={onTagClick}
        centeredSpinner
        showError={false}
        showEmpty={false}
      />
    </CarouselSection>
  );
};
