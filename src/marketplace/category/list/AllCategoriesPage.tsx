import { FunctionComponent, useEffect } from 'react';
import { Col, Row } from 'react-bootstrap';
import { useAsyncFn } from 'react-use';

import { translate } from '@waldur/i18n';
import { getCategories } from '@waldur/marketplace/common/api';
import { Category, Offering } from '@waldur/marketplace/types';
import { useFullPage } from '@waldur/navigation/context';
import { useTitle } from '@waldur/navigation/title';

import { fetchLastNOfferings } from '../api';

import { CategoriesList } from './CategoriesList';
import { HeroSection } from './HeroSection';
import { RecentlyAddedOfferings } from './RecentlyAddedOfferings';
import './AllCategoriesPage.scss';

export const AllCategoriesPage: FunctionComponent = () => {
  useFullPage();
  useTitle(translate('All categories'));

  const [
    { loading: loadingCategories, error: errorCategories, value: categories },
    loadCategories,
  ] = useAsyncFn<Category[]>(() => getCategories(), []);
  const [
    { loading: loadingOfferings, error: errorOfferings, value: offerings },
    loadOfferings,
  ] = useAsyncFn<Offering[]>(() => fetchLastNOfferings(), []);

  useEffect(() => {
    loadCategories();
    loadOfferings();
  }, [loadCategories, loadOfferings]);

  return (
    <div className="marketplace-all-categories-page">
      <HeroSection title={translate('All categories')} />
      <div className="container-xxl">
        <Row>
          <Col xs={12} md={8}>
            <CategoriesList
              items={categories}
              loading={loadingCategories}
              loaded={!errorCategories}
            />
          </Col>
          <Col xs={12} md={4}>
            <RecentlyAddedOfferings
              items={offerings}
              loading={loadingOfferings}
              loaded={!errorOfferings}
            />
            {/* <CategoryHelpArticles /> */}
          </Col>
        </Row>
      </div>
    </div>
  );
};
