import { useQuery } from '@tanstack/react-query';
import { useMemo, useState } from 'react';
import { useDebounce } from 'react-use';

import { queryClient } from '@waldur/Application';
import { LoadingErred } from '@waldur/core/LoadingErred';
import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { translate } from '@waldur/i18n';
import { getCategoryGroups } from '@waldur/marketplace/common/api';
import { Category } from '@waldur/marketplace/types';

import { CategoriesPanel } from './CategoriesPanel';
import { RECENTLY_ADDED_OFFERINGS_UUID } from './MarketplacePopup';
import { OfferingsPanel } from './OfferingsPanel';
import { fetchCategories, fetchLastNOfferings, fetchOfferings } from './utils';
import { WelcomeView } from './WelcomeView';

export const DataLoader = ({ filter, currentCustomer, currentProject }) => {
  const [selectedCategory, selectCategory] = useState<Category>();

  const { data: lastOfferings } = useQuery(
    ['MarketplacePopupNOfferings', currentCustomer.uuid, currentProject.uuid],
    () => fetchLastNOfferings(currentCustomer, currentProject),
    { staleTime: 1 * 60 * 1000 },
  );

  const {
    data: categoryGroups,
    isLoading: loadingGroups,
    error: errorGroups,
  } = useQuery(['MarketplacePopupCategoryGroups'], () => getCategoryGroups(), {
    staleTime: 1 * 60 * 1000,
  });

  const {
    data: mainCategories,
    isLoading: loadingCategories,
    error: errorCategories,
    refetch: loadCategories,
  } = useQuery(['MarketplacePopupCategories'], () => {
    const data = queryClient.fetchQuery({
      queryKey: [
        'MarketplacePopupCategories-' + filter,
        currentCustomer.uuid,
        currentProject.uuid,
      ],
      queryFn: () => fetchCategories(currentCustomer, currentProject, filter),
      staleTime: 1 * 60 * 1000,
    });
    return data;
  });

  const {
    data: offerings,
    isLoading: loadingOfferings,
    error: errorOfferings,
    refetch: loadOfferings,
  } = useQuery(['MarketplacePopupOfferings', selectedCategory?.uuid], () => {
    if (
      selectedCategory &&
      selectedCategory.uuid === RECENTLY_ADDED_OFFERINGS_UUID
    ) {
      return Promise.resolve(lastOfferings);
    } else if (!selectedCategory) {
      return Promise.resolve([]);
    }

    const data = queryClient.fetchQuery({
      queryKey: [
        'MarketplacePopupOfferings-' + filter,
        currentCustomer.uuid,
        currentProject.uuid,
        selectedCategory?.uuid,
      ],
      queryFn: () =>
        fetchOfferings(
          currentCustomer,
          currentProject,
          selectedCategory,
          filter,
        ),
      staleTime: 1 * 60 * 1000,
    });
    return data;
  });

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
    return nonZeroCategories.reduce((acc, category) => {
      const categoryGroup = categoryGroups.find(
        (group) => category.group === group.url,
      );
      if (categoryGroup) {
        const existGroup = acc.find((item) => item.uuid === categoryGroup.uuid);
        if (existGroup) {
          existGroup.categories.push(category);
          existGroup.offering_count += category.offering_count;
        } else {
          Object.assign(categoryGroup, { categories: [category] });
          Object.assign(categoryGroup, {
            offering_count: category.offering_count,
          });
          acc.push(categoryGroup);
        }
      } else {
        acc.push(category);
      }
      return acc;
    }, []);
  }, [mainCategories, lastOfferings]);

  // search with delay
  useDebounce(
    () => {
      loadCategories();
      if (selectedCategory) {
        loadOfferings();
      }
    },
    500,
    [filter],
  );

  const selectCategoryAndLoadData = (category: Category) => {
    if (!category) return;
    selectCategory(category);
    loadOfferings();
  };

  return (
    <>
      {loadingCategories || loadingGroups ? (
        <div className="message-wrapper p-4">
          <LoadingSpinner />
        </div>
      ) : errorCategories || errorGroups ? (
        <div className="message-wrapper">
          <p className="text-center text-danger my-10 mx-4">
            {translate('Unable to load categories')}
          </p>
        </div>
      ) : (
        <CategoriesPanel
          categories={categories}
          selectedCategory={selectedCategory}
          selectCategory={selectCategoryAndLoadData}
          filter={filter}
        />
      )}

      {!selectedCategory ? (
        <WelcomeView customer={currentCustomer} />
      ) : loadingOfferings ? (
        <div className="message-wrapper p-4">
          <LoadingSpinner />
        </div>
      ) : errorOfferings ? (
        <div className="message-wrapper">
          <p className="text-center my-10 mx-4">
            <LoadingErred
              loadData={() => selectCategoryAndLoadData(selectedCategory)}
            />
          </p>
        </div>
      ) : (
        <OfferingsPanel offerings={offerings} category={selectedCategory} />
      )}
    </>
  );
};
