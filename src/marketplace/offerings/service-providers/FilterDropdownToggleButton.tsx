import { FunctionComponent } from 'react';

import { Button } from '@waldur/marketplace/offerings/service-providers/shared/Button';
import './FilterDropdownToggleButton.scss';

const ChevronArrowDown = require('./chevron-arrow-down.svg');

interface FilterDropdownToggleButtonProps {
  onClick: () => void;
}

export const FilterDropdownToggleButton: FunctionComponent<FilterDropdownToggleButtonProps> =
  ({ onClick }) => (
    <div className="filterDropdownToggleButton">
      <Button label="Filter" onClick={onClick} iconPrefix={ChevronArrowDown} />
    </div>
  );
