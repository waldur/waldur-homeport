import { FunctionComponent, useMemo } from 'react';
import { useSelector } from 'react-redux';

import { translate } from '@waldur/i18n';
import { getCategories } from '@waldur/marketplace/landing/store/selectors';
import { useExtraTabs, useFullPage } from '@waldur/navigation/context';
import { useTitle } from '@waldur/navigation/title';

import { CategoryPageBar } from './CategoryPageBar';
import { FilterBarContainer } from './filters/FilterBarContainer';
import { HeroSection } from './HeroSection';
import { OfferingGridContainer } from './OfferingGridContainer';
import { categoryRouteState } from './store/selectors';
import { getCategoryItems } from './utils';

import './CategoryPage.scss';

export const CategoryPage: FunctionComponent = () => {
  useFullPage();
  useTitle(translate('Marketplace offerings'));

  const categories = useSelector(getCategories).items;
  const categoryState = useSelector(categoryRouteState);
  const categoryTabs = useMemo(
    () => getCategoryItems(categories, categoryState),
    [categories, categoryState],
  );
  useExtraTabs(categoryTabs);

  return (
    <div className="marketplace-category-page">
      <HeroSection />
      <CategoryPageBar />
      <div className="container-xxl py-20">
        <div className="mb-8">
          <FilterBarContainer />
        </div>
        <OfferingGridContainer />
      </div>
    </div>
  );
};
