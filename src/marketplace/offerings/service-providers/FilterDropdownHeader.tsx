import classNames from 'classnames';
import { FunctionComponent } from 'react';

import { FilterDropdownToggleButton } from '@waldur/marketplace/offerings/service-providers/FilterDropdownToggleButton';
import { FilteredBy } from '@waldur/marketplace/offerings/service-providers/FilteredBy';
import './FilterDropdownHeader.scss';

interface FilterDropdownHeaderProps {
  toggle: boolean;
  onDropdownToggle: () => void;
}

export const FilterDropdownHeader: FunctionComponent<FilterDropdownHeaderProps> = ({
  onDropdownToggle,
  toggle,
}) => (
  <div
    className={classNames('dropdownHeader', {
      'p-md': toggle,
      'p-sm': !toggle,
    })}
  >
    <FilterDropdownToggleButton onClick={onDropdownToggle} />
    <FilteredBy />
  </div>
);
