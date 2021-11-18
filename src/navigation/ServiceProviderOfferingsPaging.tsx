import { FunctionComponent } from 'react';

import { NextPage } from '@waldur/marketplace/offerings/service-providers/shared/grid/NextPage';
import { PrevPage } from '@waldur/marketplace/offerings/service-providers/shared/grid/PrevPage';
import { OfferingsByServiceProvider } from '@waldur/marketplace/types';
import { PAGE_SIZE } from '@waldur/navigation/constants';
import './ServiceProviderOfferingsPaging.scss';

interface ServiceProviderOfferingsPagingProps {
  pageIndex: number;
  onPageChange: (index: number) => void;
  offeringsByProvider: OfferingsByServiceProvider[];
  totalItems: number;
}

const isNextDisabled = (pageIndex: number, totalItems: number) =>
  pageIndex * PAGE_SIZE >= totalItems;

export const ServiceProviderOfferingsPaging: FunctionComponent<ServiceProviderOfferingsPagingProps> =
  ({ pageIndex, onPageChange, totalItems }) => {
    const previous = () => {
      if (pageIndex === 1) {
        return;
      }
      onPageChange(pageIndex - 1);
    };

    const next = () => {
      if (isNextDisabled(pageIndex, totalItems)) {
        return;
      }
      onPageChange(pageIndex + 1);
    };

    return (
      <div className="spOfferingsPaging">
        <PrevPage disabled={pageIndex === 1} onClick={previous} />
        <NextPage
          disabled={isNextDisabled(pageIndex, totalItems)}
          onClick={next}
        />
      </div>
    );
  };
