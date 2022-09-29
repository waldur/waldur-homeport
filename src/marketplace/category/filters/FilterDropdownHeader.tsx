import { FunctionComponent } from 'react';

import { translate } from '@waldur/i18n';

import { FilteredBy } from './FilteredBy';

interface FilterDropdownHeaderProps {
  onDropdownToggle: () => void;
}

export const FilterDropdownHeader: FunctionComponent<FilterDropdownHeaderProps> =
  ({ onDropdownToggle }) => {
    return (
      <div className="container-fluid">
        <div className="d-flex">
          <button
            type="button"
            className="btn dropdown fs-4 fw-bold bg-hover-light"
            onClick={onDropdownToggle}
          >
            {translate('Filter')}
            <i className="fa fa-chevron-down lh-base ms-2 fs-6" />
          </button>
          <FilteredBy onClick={onDropdownToggle} />
        </div>
      </div>
    );
  };
