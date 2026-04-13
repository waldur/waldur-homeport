import { FC, useMemo, useState } from 'react';
import { Col, Row } from 'react-bootstrap';
import { marketplacePublicOfferingsList } from 'waldur-js-client';

import { useDebouncedValue } from '@waldur/core/useDebouncedValue';
import { FilterBox } from '@waldur/form/FilterBox';
import { translate } from '@waldur/i18n';
import { OfferingCard } from '@waldur/marketplace/common/OfferingCard';
import { useCardStyle } from '@waldur/marketplace/landing/CardStyleContext';
import {
  OFFERING_CARD_MANDATORY_FIELDS,
  getOfferingGridSize,
  useOfferingListFilter,
} from '@waldur/marketplace/landing/utils';
import { createFetcher } from '@waldur/table/api';
import Table from '@waldur/table/Table';
import { useTable } from '@waldur/table/useTable';

import { CategorySelection, CategorySidebar } from './CategorySidebar';
import './SidebarLayout.scss';
import { MarketplaceLayoutProps } from './types';
import { useMarketplaceTitle } from './useMarketplaceTitle';

export const SidebarLayout: FC<MarketplaceLayoutProps> = ({ onTagClick }) => {
  const title = useMarketplaceTitle();
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
    staleTime: 3 * 60 * 1000,
    mandatoryFields: OFFERING_CARD_MANDATORY_FIELDS,
  });

  return (
    <div className="sidebar-layout">
      <div className="container-fluid py-6">
        <div className="d-flex justify-content-between align-items-center mb-6">
          <h1 className="mb-0 fs-1x">{title}</h1>
          <FilterBox
            type="search"
            placeholder={translate('Search offerings...')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Row className="g-6">
          <Col xs={12} lg={4} xl={3} className="mb-4 mb-lg-0">
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
