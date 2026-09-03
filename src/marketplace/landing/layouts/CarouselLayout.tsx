import { CaretRightIcon } from '@phosphor-icons/react';
import { FC } from 'react';
import { marketplacePublicOfferingsList } from 'waldur-js-client';

import { UI_STALE_TIME } from '@/core/constants';
import { Link } from '@/core/Link';
import { LoadingSpinner } from '@/core/LoadingSpinner';
import { Tip } from '@/core/Tooltip';
import { translate } from '@/i18n';
import { useCategories } from '@/marketplace/category/useCategories';
import { useCardStyle } from '@/marketplace/landing/CardStyleContext';
import {
  OFFERING_CARD_MANDATORY_FIELDS,
  useOfferingListFilter,
} from '@/marketplace/landing/utils';
import { CategoryLink } from '@/marketplace/links/CategoryLink';
import { getMarketplaceTitle } from '@/marketplace/title';
import { Category } from '@/marketplace/types';
import { createFetcher } from '@/table/api';
import { useTable } from '@/table/useTable';

import './CarouselLayout.scss';
import { CarouselOfferingGrid } from './CarouselOfferingGrid';
import { CarouselSection } from './CarouselSection';
import { CategoryCarouselSection } from './CategoryCarouselSection';
import { CategoryThumbnail } from './CategoryThumbnail';
import { MarketplaceLayoutProps } from './types';

export const CarouselLayout: FC<MarketplaceLayoutProps> = ({ onTagClick }) => {
  const title = getMarketplaceTitle();
  const cardStyle = useCardStyle();
  const categories = useCategories();

  const filter = useOfferingListFilter(8);

  const latestTableProps = useTable({
    table: 'marketplace-carousel-latest',
    filter,
    fetchData: createFetcher(marketplacePublicOfferingsList),
    staleTime: UI_STALE_TIME,
    mandatoryFields: OFFERING_CARD_MANDATORY_FIELDS,
  });

  // Flatten categories for the category chips carousel
  const flatCategories =
    categories.data?.flatMap<Category>((item: any) => {
      if ('categories' in item && item.categories) {
        return item.categories;
      }
      return [item];
    }) || [];

  return (
    <div className="carousel-layout">
      <div className="container-fluid py-6">
        {/* Page title */}
        <div className="d-flex justify-content-between align-items-center mb-6">
          <h1 className="mb-0 fs-1x">{title}</h1>
          <Link state="public.offerings" className="btn btn-sm btn-tertiary">
            {translate('View all')}
            <CaretRightIcon size={16} className="ms-1" weight="bold" />
          </Link>
        </div>

        {/* Categories Carousel */}
        <CarouselSection title={translate('Categories')}>
          {categories.isLoading ? (
            <LoadingSpinner />
          ) : (
            <div className="carousel-items">
              {flatCategories.map((category) => (
                <Tip
                  key={category.uuid}
                  id={`category-${category.uuid}`}
                  label={category.title}
                  placement="bottom"
                >
                  <CategoryLink
                    item={category}
                    className="category-carousel-item border-hover-brand"
                  >
                    <div className="category-icon-wrapper">
                      <CategoryThumbnail
                        title={category.title}
                        icon={category.icon}
                        size={32}
                        fallbackSize={20}
                        fallbackClassName=""
                      />
                    </div>
                    <span className="category-title">{category.title}</span>
                  </CategoryLink>
                </Tip>
              ))}
            </div>
          )}
        </CarouselSection>

        {/* Recently Added */}
        <CarouselSection
          title={translate('Recently Added')}
          linkProps={{ state: 'public.offerings' }}
        >
          <CarouselOfferingGrid
            tableProps={latestTableProps}
            cardStyle={cardStyle}
            onTagClick={onTagClick}
          />
        </CarouselSection>

        {/* Category/Group Carousels - one for each category or group */}
        {categories.data?.map((item) => (
          <CategoryCarouselSection
            key={item.uuid}
            item={item}
            onTagClick={onTagClick}
          />
        ))}
      </div>
    </div>
  );
};
