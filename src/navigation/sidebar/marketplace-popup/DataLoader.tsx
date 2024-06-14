import { useQuery } from '@tanstack/react-query';
import { useMemo, useState } from 'react';

import { LoadingErred } from '@waldur/core/LoadingErred';
import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { translate } from '@waldur/i18n';
import { getGroupedCategories } from '@waldur/marketplace/category/utils';
import { getCategoryGroups } from '@waldur/marketplace/common/api';
import { Category } from '@waldur/marketplace/types';

import { CategoriesPanel } from './CategoriesPanel';
import { RECENTLY_ADDED_OFFERINGS_UUID } from './MarketplacePopup';
import { OfferingsPanel } from './OfferingsPanel';
import { fetchCategories, fetchLastNOfferings } from './utils';

export const DataLoader = ({ filter, customer, project }) => {
  const [selectedCategory, selectCategory] = useState<Category>();

  const { data: lastOfferings } = useQuery(
    ['MarketplacePopupNOfferings', customer?.uuid, project?.uuid],
    () => fetchLastNOfferings(customer, project),
    { staleTime: 1 * 60 * 1000 },
  );

  const {
    data: categoryGroups,
    isLoading: loadingGroups,
    error: errorGroups,
    refetch: loadCategoryGroups,
  } = useQuery(['MarketplaceCategoryGroups'], () => getCategoryGroups(), {
    staleTime: 1 * 60 * 1000,
  });

  const {
    data: mainCategories,
    isLoading: loadingCategories,
    error: errorCategories,
    refetch: loadCategories,
    isFetching: fetchingCategories,
  } = useQuery(
    ['MarketplacePopupCategories', filter, customer?.uuid, project?.uuid],
    () => fetchCategories(customer, project, filter),
    { staleTime: 1 * 60 * 1000, keepPreviousData: true },
  );

  const categories = useMemo(() => {
    if (!Array.isArray(mainCategories)) return [];
    const nonZeroCategories = mainCategories.filter(
      (category) => category.offering_count > 0,
    );

    if (lastOfferings && lastOfferings.length > 0) {
      const recentlyAddedOfferingsCategory: Category = {
        icon: undefined,
        offering_count: lastOfferings.length,
        title: translate('Recently added offerings'),
        uuid: RECENTLY_ADDED_OFFERINGS_UUID,
        url: undefined,
      };
      nonZeroCategories.unshift(recentlyAddedOfferingsCategory);
    }
    // Group categories
    return getGroupedCategories(nonZeroCategories, categoryGroups);
  }, [mainCategories, categoryGroups, lastOfferings]);

  const selectCategoryAndLoadData = (category: Category) => {
    if (!category) return;
    selectCategory(category);
  };

  return (
    <div
      className={
        'd-flex flex-column flex-lg-row h-100' +
        (selectedCategory ? ' category-selected' : '')
      }
    >
      {loadingCategories || loadingGroups ? (
        <div className="message-wrapper p-4">
          <LoadingSpinner />
        </div>
      ) : errorCategories || errorGroups ? (
        <div className="message-wrapper">
          <LoadingErred
            message={translate('Unable to load categories')}
            loadData={() => loadCategoryGroups() && loadCategories()}
            className="text-danger my-10 mx-4"
          />
        </div>
      ) : (
        <CategoriesPanel
          categories={categories}
          selectedCategory={selectedCategory}
          selectCategory={selectCategoryAndLoadData}
          filter={filter}
          loading={fetchingCategories}
        />
      )}

      {selectedCategory && project && (
        <OfferingsPanel
          lastOfferings={lastOfferings}
          customer={customer}
          project={project}
          category={selectedCategory}
          filter={filter}
          goBack={() => selectCategory(null)}
        />
      )}
    </div>
  );
};
