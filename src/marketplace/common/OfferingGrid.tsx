import { FC } from 'react';
import { Offering } from 'waldur-js-client';

import { LoadingSpinner } from '@/core/LoadingSpinner';
import { translate } from '@/i18n';

import { OfferingCard } from './OfferingCard';

// Literal class names so Tailwind generates them: `width` is the old Bootstrap
// column span (out of 12) from `xl` up.
const XL_COLUMNS: Record<number, string> = {
  2: 'xl:grid-cols-6',
  3: 'xl:grid-cols-4',
  4: 'xl:grid-cols-3',
  6: 'xl:grid-cols-2',
  12: 'xl:grid-cols-1',
};

interface OfferingGridProps {
  width?: number;
  items: Offering[];
  loaded: boolean;
  loading: boolean;
}

export const OfferingGrid: FC<OfferingGridProps> = ({
  width = 3,
  ...props
}) => {
  if (props.loading) {
    return <LoadingSpinner />;
  }

  if (!props.loaded) {
    return (
      <h3 className="text-center">{translate('Unable to load offerings.')}</h3>
    );
  }

  if (!props.items.length) {
    return (
      <h3 className="text-center">
        {translate('There are no offerings in marketplace yet.')}
      </h3>
    );
  }

  return (
    <div
      className={`grid grid-cols-1 lg:grid-cols-2 ${XL_COLUMNS[width] ?? ''} gap-x-5`}
    >
      {props.items.map((offering) => (
        <div key={offering.uuid} className="mb-2.5">
          <OfferingCard offering={offering} />
        </div>
      ))}
    </div>
  );
};
