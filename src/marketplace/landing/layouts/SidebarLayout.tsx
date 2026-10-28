import classNames from 'classnames';
import { FC, useMemo, useState } from 'react';
import { marketplacePublicOfferingsList } from 'waldur-js-client';

import { UI_STALE_TIME } from '@/core/constants';
import { useDebouncedValue } from '@/core/useDebouncedValue';
import { FilterBox } from '@/form/FilterBox';
import { translate } from '@/i18n';
import { OfferingCard } from '@/marketplace/common/OfferingCard';
import { useCardStyle } from '@/marketplace/landing/CardStyleContext';
import {
  OFFERING_CARD_MANDATORY_FIELDS,
  getOfferingGridClassName,
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
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
          <div className="mb-3 lg:mb-0 lg:col-span-4 xl:col-span-3">
            <CategorySidebar
              selectedCategory={selectedCategory}
              onCategorySelect={setSelectedCategory}
            />
          </div>
          <div className="lg:col-span-8 xl:col-span-9">
            <Table
              {...tableProps}
              gridItem={({ row }) => (
                <OfferingCard
                  offering={row}
                  variant={cardStyle}
                  onTagClick={onTagClick}
                />
              )}
              gridClassName={classNames(
                getOfferingGridClassName(cardStyle),
                'gap-3',
              )}
              hoverShadow={{ grid: false }}
              mode="grid"
              title={translate('Offerings')}
              verboseName={translate('Offerings')}
              initialSorting={{ field: 'created', mode: 'desc' }}
              hasQuery={false}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
