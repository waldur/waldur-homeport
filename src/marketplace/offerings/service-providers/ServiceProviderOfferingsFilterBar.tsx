import { FunctionComponent, useState, useRef, useEffect } from 'react';

import { FilterDropdownContent } from '@waldur/marketplace/offerings/service-providers/FilterDropdownContent';
import { FilterDropdownHeader } from '@waldur/marketplace/offerings/service-providers/FilterDropdownHeader';
import './ServiceProviderOfferingsFilterBar.scss';

interface ServiceProviderOfferingsFilterBarProps {
  categoryUuid: string;
}

export const ServiceProviderOfferingsFilterBar: FunctionComponent<ServiceProviderOfferingsFilterBarProps> = ({
  categoryUuid,
}) => {
  const wrapperRef = useRef(null);
  const [toggle, setToggle] = useState<boolean>(false);

  // Refer to https://stackoverflow.com/a/42234988
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setToggle(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [wrapperRef]);

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
