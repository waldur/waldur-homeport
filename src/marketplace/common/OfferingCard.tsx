import { FunctionComponent, Suspense } from 'react';
import { NestedTag } from 'waldur-js-client';

import { LoadingSpinnerIcon } from '@waldur/core/LoadingSpinner';

import { Offering } from '../types';

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
          <LoadingSpinnerIcon />
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
