import { FunctionComponent } from 'react';

import { useOutsideClickHandler } from '@waldur/core/useOutsideClickHandler';
import { FilterDropdownContent } from '@waldur/marketplace/offerings/service-providers/FilterDropdownContent';
import { FilterDropdownHeader } from '@waldur/marketplace/offerings/service-providers/FilterDropdownHeader';
import './ServiceProviderOfferingsFilterBar.scss';

interface ServiceProviderOfferingsFilterBarProps {
  categoryUuid: string;
}

export const ServiceProviderOfferingsFilterBar: FunctionComponent<ServiceProviderOfferingsFilterBarProps> =
  ({ categoryUuid }) => {
    const { wrapperRef, toggle, setToggle } = useOutsideClickHandler();
    return (
      <div
        ref={wrapperRef}
        className={`filterBar${toggle ? ' filterBar--shadow' : ''}`}
      >
        <FilterDropdownHeader
          toggle={toggle}
          onDropdownToggle={() => setToggle(!toggle)}
        />
        <FilterDropdownContent
          toggle={toggle}
          categoryUuid={categoryUuid}
          closeDropdown={() => setToggle(!toggle)}
        />
      </div>
    );
  };
