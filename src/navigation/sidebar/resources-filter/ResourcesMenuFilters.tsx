import { useMemo } from 'react';
import { Stack } from 'react-bootstrap';
import { useSelector } from 'react-redux';

import { Tip } from '@waldur/core/Tooltip';
import { translate } from '@waldur/i18n';
import { ALL_RESOURCES_TABLE_ID } from '@waldur/marketplace/resources/list/constants';
import { selectFiltersStorage } from '@waldur/table/selectors';
import { RemoveFilterBadgeButton } from '@waldur/table/TableFilterItem';

import { useOrganizationAndProjectFiltersForResources } from './utils';

export const ResourcesMenuFilters = () => {
  const filters = useSelector((state: any) =>
    selectFiltersStorage(state, ALL_RESOURCES_TABLE_ID),
  );

  const filterItem = useMemo(() => {
    if (!filters) return null;
    const project = filters.find((item) => item.name === 'project');
    if (!project) {
      return filters.find((item) => item.name === 'organization');
    }
    return project;
  }, [filters]);

  const { syncResourceFilters } =
    useOrganizationAndProjectFiltersForResources();
  const clearFilters = () => {
    syncResourceFilters({ organization: null, project: null });
  };

  return (
    <>
      <div className="resources-filter">
        {filterItem ? (
          <Tip
            id="tip-sidebar-resource-filter"
            label={filterItem.value?.name}
            className="w-100"
          >
            <Stack
              direction="horizontal"
              gap={2}
              className="filter-item justify-content-between"
            >
              <label className="fw-bold">{filterItem.label}</label>
              <span className="badge ellipsis">
                <span className="ellipsis overflow-hidden">
                  {filterItem.value?.abbreviation || filterItem.value?.name}
                </span>
                <RemoveFilterBadgeButton size={12} onClick={clearFilters} />
              </span>
            </Stack>
          </Tip>
        ) : (
          <div className="menu-text fw-bold text-center w-100">
            {translate('Resources in all visible projects')}
          </div>
        )}
      </div>
      <div className="menu-separator mb-2" />
    </>
  );
};
