import { useQuery } from '@tanstack/react-query';
import { useCurrentStateAndParams } from '@uirouter/react';
import { FunctionComponent, useEffect, useMemo, useState } from 'react';
import { Col, Row } from 'react-bootstrap';
import { useSelector } from 'react-redux';

import { translate } from '@waldur/i18n';
import {
  getCategories,
  getCategoryGroups,
} from '@waldur/marketplace/common/api';
import { CategoryGroup } from '@waldur/marketplace/types';
import { useFullPage } from '@waldur/navigation/context';
import { useTitle } from '@waldur/navigation/title';
import { getCustomer, getProject } from '@waldur/workspace/selectors';

import { fetchLastNOfferings } from '../api';
import { getGroupedCategories } from '../utils';

import { CategoriesBar } from './CategoriesBar';
import { CategoryGroupCard, CategoryGroupsList } from './CategoryGroupsList';
import { HeroSection } from './HeroSection';
import { RecentlyAddedOfferings } from './RecentlyAddedOfferings';

import './AllCategoriesPage.scss';

const options = {
  params: {
    field: ['uuid', 'icon', 'title', 'offering_count', 'group'],
  },
};

export const AllCategoriesPage: FunctionComponent = () => {
  useFullPage();
  useTitle(translate('All categories'));
  const customer = useSelector(getCustomer);
  const project = useSelector(getProject);

  const {
    data: categoryGroups,
    isLoading: loadingGroups,
    error: errorGroups,
  } = useQuery(['MarketplaceCategoryGroups'], () => getCategoryGroups(), {
    staleTime: 1 * 60 * 1000,
  });

  const {
    data: categories,
    isLoading: loadingCategories,
    error: errorCategories,
  } = useQuery(['MarketplaceCategories'], () => getCategories(options), {
    staleTime: 1 * 60 * 1000,
  });

  const {
    data: offerings,
    isLoading: loadingOfferings,
    error: errorOfferings,
  } = useQuery(
    ['MarketplaceNOfferings', customer?.uuid, project?.uuid],
    () => fetchLastNOfferings({ customer, project }),
    {
      staleTime: 1 * 60 * 1000,
    },
  );

  const groupedCategories = useMemo(() => {
    if (!Array.isArray(categories)) return [];
    const all = getGroupedCategories(categories, categoryGroups);
    const grouped = all.filter((item) => item?.categories);
    const nonGrouped = all.filter((item) => !item?.categories);
    return grouped.concat({
      url: 'other',
      uuid: 'other',
      title: translate('Other categories'),
      description: '',
      icon: '',
      categories: nonGrouped,
      offering_count: nonGrouped.length,
    });
  }, [categoryGroups, categories]);

  const { params } = useCurrentStateAndParams();
  const [activeGroup, setActiveGroup] = useState<CategoryGroup>(null);

  useEffect(() => {
    const groupUuid = params.group;
    if (!groupedCategories?.length || !groupUuid) return;
    if (groupUuid === 'all') {
      setActiveGroup({
        url: 'all',
        uuid: 'all',
        title: translate('All categories'),
        description: '',
        icon: '',
        categories: categories,
        offering_count: categories.length,
      });
      return;
    }

    const group = groupedCategories.find((g) => g.uuid === groupUuid);
    if (group) {
      setActiveGroup(group);
    }
  }, [params, groupedCategories, setActiveGroup, categories]);

  return (
    <div className="marketplace-all-categories-page">
      <HeroSection title={activeGroup?.title || translate('All categories')} />
      <div className="container-xxl mt-4">
        <Row>
          {!activeGroup && (
            <Col xs={12}>
              <CategoriesBar
                items={categories}
                loading={loadingCategories}
                loaded={!errorCategories}
              />
            </Col>
          )}
          <Col xs={12} md={8}>
            {activeGroup ? (
              <CategoryGroupCard
                categoryGroup={activeGroup}
                maxShow={Infinity}
                title={translate('Categories')}
              />
            ) : (
              <CategoryGroupsList
                items={groupedCategories}
                loading={loadingCategories || loadingGroups}
                loaded={!errorCategories && !errorGroups}
                maxShow={6}
              />
            )}
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
