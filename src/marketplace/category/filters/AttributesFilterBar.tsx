import { FunctionComponent, useCallback } from 'react';

import { useOutsideClickHandler } from '@waldur/core/useOutsideClickHandler';

import { FilterDropdownContent } from './FilterDropdownContent';
import { FilterDropdownHeader } from './FilterDropdownHeader';
import './AttributesFilterBar.scss';

export const AttributesFilterBar: FunctionComponent = () => {
  const { wrapperRef, toggle, setToggle } = useOutsideClickHandler();
  const handleToggle = useCallback(
    (value) => {
      setToggle(value);
      if (value) {
        const el = document.getElementById('category-page-bar');
        window.scroll({
          behavior: 'smooth',
          left: 0,
          top: el.offsetTop - 120,
        });
      }
    },
    [setToggle],
  );
  return (
    <div className="filterBar">
      <FilterDropdownHeader onDropdownToggle={() => handleToggle(!toggle)} />
      <div ref={wrapperRef}>
        <FilterDropdownContent
          toggle={toggle}
          closeDropdown={() => setToggle(!toggle)}
        />
      </div>
    </div>
  );
};
