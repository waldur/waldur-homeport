import classNames from 'classnames';
import { FC, useMemo, useState } from 'react';
import { Col, Row } from 'react-bootstrap';
import { marketplacePublicOfferingsList } from 'waldur-js-client';

import { UI_STALE_TIME } from '@/core/constants';
import { useDebouncedValue } from '@/core/useDebouncedValue';
import { FilterBox } from '@/form/FilterBox';
import { translate } from '@/i18n';
import { OfferingCard } from '@/marketplace/common/OfferingCard';
import { useCardStyle } from '@/marketplace/landing/CardStyleContext';
import {
  OFFERING_CARD_MANDATORY_FIELDS,
  getOfferingGridSize,
  useOfferingListFilter,
} from '@/marketplace/landing/utils';
import { getMarketplaceTitle } from '@/marketplace/title';
import { PAGE_CONTAINER_CLASSNAME } from '@/navigation/pageContainer';
import { createFetcher } from '@/table/api';
import Table from '@/table/Table';
import { useTable } from '@/table/useTable';

import { CategorySelection, CategorySidebar } from './CategorySidebar';
import './SidebarLayout.scss';
import { MarketplaceLayoutProps } from './types';

export const SidebarLayout: FC<MarketplaceLayoutProps> = ({ onTagClick }) => {
  const title = getMarketplaceTitle();
  const cardStyle = useCardStyle();
  const [selectedCategory, setSelectedCategory] =
    useState<CategorySelection | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedQuery = useDebouncedValue(searchQuery, 300);

  const additionalFilters = useMemo(
    () => ({
      ...(selectedCategory &&
        (selectedCategory.isGroup
          ? { category_group_uuid: selectedCategory.uuid }
          : { category_uuid: selectedCategory.uuid })),
      ...(debouncedQuery && { keyword: debouncedQuery }),
    }),
    [selectedCategory, debouncedQuery],
  );

  const filter = useOfferingListFilter(12, additionalFilters);

  const tableProps = useTable({
    table: 'marketplace-sidebar-offerings',
    filter,
    fetchData: createFetcher(marketplacePublicOfferingsList),
    staleTime: UI_STALE_TIME,
    mandatoryFields: OFFERING_CARD_MANDATORY_FIELDS,
  });

  return (
    <div className="sidebar-layout">
      <div className={classNames(PAGE_CONTAINER_CLASSNAME, 'py-5')}>
        <div className="flex justify-between items-center mb-5">
          <h1 className="mb-0 text-2xl">{title}</h1>
          <FilterBox
            type="search"
            placeholder={translate('Search offerings...')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Row className="g-6">
          <Col xs={12} lg={4} xl={3} className="mb-3 lg:mb-0">
            <CategorySidebar
              selectedCategory={selectedCategory}
              onCategorySelect={setSelectedCategory}
            />
          </Col>
          <Col xs={12} lg={8} xl={9}>
            <Table
              {...tableProps}
              gridItem={({ row }) => (
                <OfferingCard
                  offering={row}
                  variant={cardStyle}
                  onTagClick={onTagClick}
                />
              )}
              gridSize={getOfferingGridSize(cardStyle)}
              gridSpace={4}
              hoverShadow={{ grid: false }}
              mode="grid"
              title={translate('Offerings')}
              verboseName={translate('Offerings')}
              initialSorting={{ field: 'created', mode: 'desc' }}
              hasQuery={false}
            />
          </Col>
        </Row>
      </div>
    </div>
  );
};
