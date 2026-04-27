import { keepPreviousData, useQuery } from '@tanstack/react-query';
import classNames from 'classnames';
import { useEffect, useMemo, useState } from 'react';
import { CategoryGroup } from 'waldur-js-client';

import { SHORT_STALE_TIME } from '@/core/constants';
import { LoadingErred } from '@/core/LoadingErred';
import { LoadingSpinner } from '@/core/LoadingSpinner';
import { translate } from '@/i18n';
import { getGroupedCategories } from '@/marketplace/category/utils';
import { getCategoryGroups } from '@/marketplace/common/api';
import { Category } from '@/marketplace/types';

import { CategoriesPanel } from './CategoriesPanel';
import { RECENTLY_ADDED_OFFERINGS_UUID } from './constants';
import { OfferingsPanel } from './OfferingsPanel';
import { fetchCategories, fetchLastNOfferings } from './utils';

export const DataLoader = ({
  filter,
  customer,
  project,
  categoryUuid = null,
  showRecentlyAddedOfferings = true,
  onSelectOffering = undefined,
  importableOfferings = false,
}) => {
  const [selectedCategory, selectCategory] = useState<
    Category | CategoryGroup
  >();

  const { data: lastOfferings } = useQuery({
    queryKey: [
      'MarketplacePopupNOfferings',
      customer?.uuid,
      project?.uuid,
      categoryUuid,
    ],

    queryFn: () =>
      categoryUuid || !showRecentlyAddedOfferings
        ? null
        : fetchLastNOfferings(customer, project),

    staleTime: SHORT_STALE_TIME,
  });

  const {
    data: categoryGroups,
    isLoading: loadingGroups,
    error: errorGroups,
    refetch: loadCategoryGroups,
  } = useQuery({
    queryKey: ['MarketplaceCategoryGroups'],
    queryFn: () => getCategoryGroups(),
    staleTime: SHORT_STALE_TIME,
  });

  const {
    data: mainCategories,
    isLoading: loadingCategories,
    error: errorCategories,
    refetch: loadCategories,
    isFetching: fetchingCategories,
  } = useQuery({
    queryKey: [
      'MarketplacePopupCategories',
      filter,
      customer?.uuid,
      project?.uuid,
    ],
    queryFn: () => fetchCategories(customer, project, filter),
    staleTime: SHORT_STALE_TIME,
    placeholderData: keepPreviousData,
  });

  const categories = useMemo(() => {
    if (!Array.isArray(mainCategories)) return [];
    const nonZeroCategories = mainCategories.filter(
      (category) => category.offering_count > 0,
    );

    if (lastOfferings && lastOfferings.length > 0) {
      const recentlyAddedOfferingsCategory: Category | CategoryGroup = {
        icon: undefined,
        offering_count: lastOfferings.length,
        title: translate('Recently added offerings'),
        uuid: RECENTLY_ADDED_OFFERINGS_UUID,
        url: undefined,
      };
      nonZeroCategories.unshift(recentlyAddedOfferingsCategory as Category);
    }
    // Group categories
    const groupedCategories = getGroupedCategories(
      nonZeroCategories,
      categoryGroups,
    );
    if (categoryUuid) {
      const cat = groupedCategories.find((g) => {
        if (g.categories?.length) {
          // find in sub-categories
          return g.categories.some((c) => c.uuid === categoryUuid);
        }
        return g.uuid === categoryUuid;
      });

      return cat ? [cat] : [];
    }
    return groupedCategories;
  }, [mainCategories, categoryGroups, lastOfferings]);

  const selectCategoryAndLoadData = (category: Category) => {
    if (!category) return;
    selectCategory(category);
  };

  useEffect(() => {
    // Open category if there is only one item
    if (categoryUuid && categories.length === 1) {
      selectCategory(categories[0]);
    }
  }, [categoryUuid, categories, selectCategory]);

  return (
    <div
      className={classNames(
        'd-flex flex-column flex-lg-row h-100',
        selectedCategory && 'category-selected',
      )}
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

      {selectedCategory && (
        <OfferingsPanel
          lastOfferings={lastOfferings}
          customer={customer}
          project={project}
          category={selectedCategory}
          filter={filter}
          goBack={() => selectCategory(null)}
          selectable={Boolean(onSelectOffering)}
          onSelect={onSelectOffering}
          importable={importableOfferings}
        />
      )}
    </div>
  );
};
