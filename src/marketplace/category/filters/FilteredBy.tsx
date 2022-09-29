import { FunctionComponent } from 'react';
import { Badge, Button } from 'react-bootstrap';
import { useSelector } from 'react-redux';

import { translate } from '@waldur/i18n';

import { getFiltersUserFrindly } from '../store/selectors';

interface OwnProps {
  onClick?: () => void;
}

const getFilterValue = (filter) => {
  if (filter.type === 'list') {
    return filter.value.length;
  } else if (filter.type === 'boolean') {
    return filter.value ? translate('Yes') : translate('No');
  } else {
    return filter.value?.title || '+';
  }
};

export const FilteredBy: FunctionComponent<OwnProps> = ({ onClick }) => {
  const filters = useSelector(getFiltersUserFrindly);

  return (
    <div className="filteredBy d-flex align-items-center py-2">
      <div className="d-flex flex-wrap ps-4">
        <h3 className="text-gray-600 fw-bold fs-5 m-0 text-nowrap me-4 my-2">
          {filters.length > 0
            ? translate('Filtered by')
            : translate('Showing all')}
        </h3>
        {filters.length > 0 &&
          filters.map((filter) => (
            <Button
              variant="flush"
              key={filter.key}
              className="border-1 border-gray-700 border-bottom-dashed text-gray-700 text-hover-dark text-nowrap me-4 my-2"
              onClick={onClick}
            >
              {filter.title}
              <Badge pill bg="" className="badge-secondary ms-1">
                {getFilterValue(filter)}
              </Badge>
            </Button>
          ))}
      </div>
    </div>
  );
};
