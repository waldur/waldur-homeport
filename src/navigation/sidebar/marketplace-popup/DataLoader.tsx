import { useEffect, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { useAsync, useAsyncFn, useDebounce } from 'react-use';

import { LoadingErred } from '@waldur/core/LoadingErred';
import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { translate } from '@waldur/i18n';
import { Category } from '@waldur/marketplace/types';
import { getCustomer, getProject } from '@waldur/workspace/selectors';

import { CategoriesPanel } from './CategoriesPanel';
import { RECENTLY_ADDED_OFFERINGS_UUID } from './MarketplacePopup';
import { OfferingsPanel } from './OfferingsPanel';
import { fetchCategories, fetchLastNOfferings, fetchOfferings } from './utils';
import { WelcomeView } from './WelcomeView';

export const DataLoader = ({ filter }) => {
  const currentCustomer = useSelector(getCustomer);
  const currentProject = useSelector(getProject);
  const [selectedCategory, selectCategory] = useState<Category>();

  const { value: lastOfferings } = useAsync(
    () => fetchLastNOfferings(currentCustomer, currentProject),
    [currentCustomer, currentProject],
  );

  const [
    {
      loading: loadingCategories,
      error: errorCategories,
      value: mainCategories,
    },
    loadCategories,
  ] = useAsyncFn<Category[]>(
    (search?: string) =>
      fetchCategories(currentCustomer, currentProject, search),
    [currentCustomer, currentProject],
  );

  useEffect(() => {
    loadCategories();
  }, [currentCustomer, currentProject]);

  const [
    { loading: loadingOfferings, value: offerings, error: errorOfferings },
    loadOfferings,
  ] = useAsyncFn(
    (category: Category, search: string) => {
      if (category && category.uuid === RECENTLY_ADDED_OFFERINGS_UUID) {
        return Promise.resolve(lastOfferings);
      }
      return fetchOfferings(currentCustomer, currentProject, category, search);
    },
    [currentCustomer, currentProject, lastOfferings],
  );

  const categories = useMemo(() => {
    if (lastOfferings && lastOfferings.length > 0) {
      const recentlyAddedOfferingsCategory: Category = {
        icon: undefined,
        offering_count: lastOfferings.length,
        title: translate('Recently added offerings'),
        uuid: RECENTLY_ADDED_OFFERINGS_UUID,
        url: undefined,
      };
      return [recentlyAddedOfferingsCategory].concat(mainCategories);
    }
    return mainCategories;
  }, [mainCategories, lastOfferings]);

  // search with delay
  useDebounce(
    () => {
      loadCategories(filter);
      loadOfferings(selectedCategory, filter);
    },
    500,
    [filter],
  );

  const selectCategoryAndLoadData = (category: Category) => {
    if (!category) return;
    selectCategory(category);
    loadOfferings(category, filter);
  };

  return (
    <>
      {loadingCategories ? (
        <div className="message-wrapper p-4">
          <LoadingSpinner />
        </div>
      ) : errorCategories ? (
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
