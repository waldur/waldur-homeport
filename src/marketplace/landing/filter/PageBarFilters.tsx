import { X } from '@phosphor-icons/react';
import { useCallback } from 'react';
import { Button, Stack } from 'react-bootstrap';
import { useSelector, useDispatch } from 'react-redux';
import { change } from 'redux-form';

import { Badge } from '@waldur/core/Badge';
import { syncFiltersToURL } from '@waldur/core/filters';
import { translate } from '@waldur/i18n';
import { MARKETPLACE_LANDING_FILTER_FORM } from '@waldur/marketplace/constants';
import { RemoveFilterBadgeButton } from '@waldur/table/TableFilterItem';

import { setMarketplaceFilter } from './store/actions';
import { getMarketplaceFilters } from './store/selectors';

export const PageBarFilters = () => {
  const filters = useSelector(getMarketplaceFilters);
  const dispatch = useDispatch();

  const removeFilter = useCallback(
    (name) => {
      const removedFilterNames = [name];
      dispatch(change(MARKETPLACE_LANDING_FILTER_FORM, name, null, true));
      dispatch(setMarketplaceFilter({ name, value: null }));
      if (name === 'organization') {
        removedFilterNames.push('project');
        dispatch(
          change(MARKETPLACE_LANDING_FILTER_FORM, 'project', null, true),
        );
        dispatch(setMarketplaceFilter({ name: 'project', value: null }));
      }
      // Update filters in URL
      const newFilters = filters.reduce((acc, filter) => {
        Object.assign(acc, {
          [filter.name]: removedFilterNames.includes(filter.name)
            ? null
            : filter.value,
        });
        return acc;
      }, {});
      syncFiltersToURL(newFilters);
    },
    [dispatch, filters],
  );

  const clearFilters = useCallback(() => {
    filters.forEach((item) => removeFilter(item.name));
    const emptyFilters = filters.reduce(
      (acc, filter) => ({ ...acc, [filter.name]: null }),
      {},
    );
    syncFiltersToURL(emptyFilters);
  }, [filters, removeFilter]);

  if (!filters?.length) return null;

  return (
    <div className="container-fluid bg-body">
      <div className="d-flex overflow-auto py-2">
        <div className="d-flex align-items-center gap-4 text-nowrap w-100">
          <span className="fw-bold">{translate('Filtered by')}:</span>
          {filters.map((item) => (
            <Stack
              key={item.name}
              direction="horizontal"
              gap={2}
              className="fw-bold"
            >
              {item.label}
              <Badge variant="default" outline pill>
                {item.getValueLabel
                  ? item.getValueLabel(item.value)
                  : typeof item.value === 'string'
                    ? item.value
                    : 'N/A'}
                <RemoveFilterBadgeButton
                  onClick={() => removeFilter(item.name)}
                />
              </Badge>
            </Stack>
          ))}
          <Button
            variant="flush"
            className="btn-active-text-primary"
            onClick={clearFilters}
          >
            <X weight="bold" className="svg-icon" />
            {translate('Clear filters')}
          </Button>
        </div>
      </div>
    </div>
  );
};
