import { FunctionComponent } from 'react';

import { translate } from '@waldur/i18n';
import { useFullPage } from '@waldur/navigation/context';
import { useTitle } from '@waldur/navigation/title';

import { useMarketplacePublicTabs } from '../utils';

import { CategoryPageBar } from './CategoryPageBar';
import { FilterBarContainer } from './filters/FilterBarContainer';
import { HeroSection } from './HeroSection';
import { OfferingGridContainer } from './OfferingGridContainer';

import './CategoryPage.scss';

export const CategoryPage: FunctionComponent = () => {
  useFullPage();
  useTitle(translate('Marketplace offerings'));

  useMarketplacePublicTabs();

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
