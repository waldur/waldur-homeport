import { FC } from 'react';
import { NestedTag } from 'waldur-js-client';

import { LoadingErred } from '@waldur/core/LoadingErred';
import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { translate } from '@waldur/i18n';
import { CardStyleType } from '@waldur/marketplace/common/cards';
import { OfferingCard } from '@waldur/marketplace/common/OfferingCard';
import { NoResult } from '@waldur/navigation/header/search/NoResult';
import { useTable } from '@waldur/table/useTable';

interface CarouselOfferingGridProps {
  tableProps: ReturnType<typeof useTable>;
  cardStyle: CardStyleType;
  onTagClick?(tag: NestedTag): void;
  centeredSpinner?: boolean;
  showError?: boolean;
  showEmpty?: boolean;
}

export const CarouselOfferingGrid: FC<CarouselOfferingGridProps> = ({
  tableProps,
  cardStyle,
  onTagClick,
  centeredSpinner = false,
  showError = true,
  showEmpty = true,
}) => {
  if (tableProps.loading) {
    return centeredSpinner ? (
      <div className="d-flex justify-content-center py-4 w-100">
        <LoadingSpinner />
      </div>
    ) : (
      <LoadingSpinner />
    );
  }
  if (showError && tableProps.error) {
    return <LoadingErred loadData={tableProps.fetch} />;
  }
  if (!tableProps.rows || tableProps.rows.length === 0) {
    return showEmpty ? (
      <NoResult
        title={translate('No offerings')}
        message={translate('There are no offerings available in this section.')}
      />
    ) : null;
  }
  return (
    <div className="carousel-items offering-items">
      {(tableProps.rows as any[]).map((offering) => (
        <div
          key={offering.uuid}
          className={`offering-carousel-item offering-carousel-item--${cardStyle}`}
        >
          <OfferingCard
            offering={offering}
            variant={cardStyle}
            onTagClick={onTagClick}
          />
        </div>
      ))}
    </div>
  );
};
