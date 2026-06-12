import { FunctionComponent, Suspense } from 'react';
import { NestedTag, Offering } from 'waldur-js-client';

import { LoadingSpinnerSimple } from '@/core/LoadingSpinner';

import { CARD_STYLES, DEFAULT_CARD_STYLE } from './cards/index';
import { CardStyleType } from './cards/types';

import './OfferingCard.scss';

interface OfferingCardProps {
  offering: Offering;
  variant?: CardStyleType;
  className?: string;
  onTagClick?(tag: NestedTag): void;
}

export const OfferingCard: FunctionComponent<OfferingCardProps> = ({
  offering,
  variant = DEFAULT_CARD_STYLE,
  className,
  onTagClick,
}) => {
  const CardComponent = CARD_STYLES[variant] || CARD_STYLES.detailed;

  return (
    <Suspense
      fallback={
        <div className="d-flex justify-content-center align-items-center h-100">
          <LoadingSpinnerSimple />
        </div>
      }
    >
      <CardComponent
        offering={offering}
        className={className}
        onTagClick={onTagClick}
      />
    </Suspense>
  );
};
