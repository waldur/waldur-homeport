import { XIcon } from '@phosphor-icons/react';
import { useCallback } from 'react';
import { Stack } from 'react-bootstrap';
import { useSelector, useDispatch } from 'react-redux';
import { change } from 'redux-form';

import { Badge } from '@waldur/core/Badge';
import { syncFiltersToURL } from '@waldur/core/filters';
import { translate } from '@waldur/i18n';
import { MARKETPLACE_LANDING_FILTER_FORM } from '@waldur/marketplace/constants';
import { useOrganizationAndProjectFiltersForResources } from '@waldur/navigation/sidebar/resources-filter/utils';
import { CompactActionButton } from '@waldur/table/CompactActionButton';
import { RemoveFilterBadgeButton } from '@waldur/table/TableFilterItem';

import { setMarketplaceFilter } from './store/actions';
import { getMarketplaceFilters } from './store/selectors';

export const PageBarFilters = () => {
  const filters = useSelector(getMarketplaceFilters);
  const dispatch = useDispatch();

  const { syncResourceFilters, clearAllFilters } =
    useOrganizationAndProjectFiltersForResources();

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

      // Sync with sidebar resource filters
      if (name === 'organization') {
        syncResourceFilters({ organization: null, project: null });
      } else if (name === 'project') {
        syncResourceFilters({
          organization: filters.find((f) => f.name === 'organization')?.value,
          project: null,
        });
      }
    },
    [dispatch, filters, syncResourceFilters],
  );

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
              <Badge
                variant="default"
                rightIcon={
                  <RemoveFilterBadgeButton
                    onClick={() => removeFilter(item.name)}
                  />
                }
                pill
                outline
              >
                {item.getValueLabel
                  ? item.getValueLabel(item.value)
                  : typeof item.value === 'string'
                    ? item.value
                    : 'N/A'}
              </Badge>
            </Stack>
          ))}
          <CompactActionButton
            variant="text-secondary"
            className="btn-no-focus"
            action={clearAllFilters}
            iconNode={<XIcon weight="bold" />}
            title={translate('Clear filters')}
          />
        </div>
      </div>
    </div>
  );
};
