import { useCurrentStateAndParams } from '@uirouter/react';
import { useCallback, useEffect } from 'react';
import { useDispatch, useSelector, batch } from 'react-redux';
import { Dispatch } from 'redux';
import { change } from 'redux-form';

import { getQueryParams, syncFiltersToURL } from '@waldur/core/filters';
import { ResourcesFilterStorage } from '@waldur/core/StorageManager';
import { translate } from '@waldur/i18n';
import { MARKETPLACE_LANDING_FILTER_FORM } from '@waldur/marketplace/constants';
import { setMarketplaceFilter } from '@waldur/marketplace/landing/filter/store/actions';
import { getMarketplaceFilters } from '@waldur/marketplace/landing/filter/store/selectors';
import {
  ALL_RESOURCES_TABLE_ID,
  CATEGORY_RESOURCES_ALL_FILTER_FORM_ID,
  CATEGORY_RESOURCES_TABLE_ID,
  PROJECT_RESOURCES_ALL_FILTER_FORM_ID,
} from '@waldur/marketplace/resources/list/constants';
import { RootState } from '@waldur/store/reducers';
import { applyFilters, setFilter } from '@waldur/table/actions';
import { selectFiltersStorage } from '@waldur/table/selectors';
import { TableSidebarFilterValues } from '@waldur/table/TableFilterItem';
import { Customer, Project } from '@waldur/workspace/types';

import { useOfferingCategories } from '../utils';

interface ResourceFilterValues {
  organization?: Customer;
  project?: Project;
}

const _setFilter = ({
  table,
  form,
  label,
  name,
  value,
  dispatch,
}: {
  table: string;
  form: string;
  label: string;
  name: string;
  value: any;
  dispatch: Dispatch;
}) => {
  dispatch(
    setFilter(table, {
      label,
      name,
      value,
      component: () => (
        <TableSidebarFilterValues
          value={value}
          getValueLabel={(value) => value?.name}
          remove={() => {
            dispatch(applyFilters(table, false));
            dispatch(change(form, name, null, true));
            _setFilter({ table, form, label, name, value: null, dispatch });
            dispatch(applyFilters(table, true));
          }}
        />
      ),
    }),
  );
};

export const useOrganizationAndProjectFiltersForResources = (
  from: 'all-resources' | 'category-resources' = null,
): {
  syncResourceFilters: (formData: ResourceFilterValues) => void;
  clearAllFilters: () => void;
  removeFilter: (name: string) => void;
} => {
  const dispatch = useDispatch();
  const categories = useOfferingCategories();

  const { state, params } = useCurrentStateAndParams();

  const syncResourceFilters = useCallback(
    (formData: ResourceFilterValues) => {
      batch(() => {
        // Update all resources table filter
        if (!from || from === 'category-resources') {
          dispatch(
            change(
              PROJECT_RESOURCES_ALL_FILTER_FORM_ID,
              'organization',
              formData?.organization,
              true,
            ),
          );
          dispatch(
            change(
              PROJECT_RESOURCES_ALL_FILTER_FORM_ID,
              'project',
              formData?.project,
              true,
            ),
          );
        }

        // Update resources by category table filter
        if (!from || from === 'all-resources') {
          dispatch(
            change(
              CATEGORY_RESOURCES_ALL_FILTER_FORM_ID,
              'organization',
              formData?.organization,
              true,
            ),
          );
          dispatch(
            change(
              CATEGORY_RESOURCES_ALL_FILTER_FORM_ID,
              'project',
              formData?.project,
              true,
            ),
          );
        }

        // Update table filter storages
        if (!from || from === 'category-resources') {
          _setFilter({
            table: ALL_RESOURCES_TABLE_ID,
            form: PROJECT_RESOURCES_ALL_FILTER_FORM_ID,
            label: translate('Organization'),
            name: 'organization',
            value: formData?.organization,
            dispatch,
          });
          _setFilter({
            table: ALL_RESOURCES_TABLE_ID,
            form: PROJECT_RESOURCES_ALL_FILTER_FORM_ID,
            label: translate('Project'),
            name: 'project',
            value: formData?.project,
            dispatch,
          });
        }
        if (!from || from === 'all-resources') {
          categories?.forEach((category) => {
            const tableId = `${CATEGORY_RESOURCES_TABLE_ID}-${category.uuid}`;
            _setFilter({
              table: tableId,
              form: CATEGORY_RESOURCES_ALL_FILTER_FORM_ID,
              label: translate('Organization'),
              name: 'organization',
              value: formData?.organization,
              dispatch,
            });
            _setFilter({
              table: tableId,
              form: CATEGORY_RESOURCES_ALL_FILTER_FORM_ID,
              label: translate('Project'),
              name: 'project',
              value: formData?.project,
              dispatch,
            });
          });
        }

        // When removing filters (from sidebar), apply filters on the corresponding page table
        if (!from && !formData?.project && !formData?.organization) {
          if (state.name === 'all-resources') {
            dispatch(applyFilters(ALL_RESOURCES_TABLE_ID, true));
          } else if (
            state.name === 'category-resources' &&
            params.category_uuid
          ) {
            dispatch(
              applyFilters(
                `${CATEGORY_RESOURCES_TABLE_ID}-${params.category_uuid}`,
                true,
              ),
            );
          }
        }

        // Update filters of marketplace landing page
        const organizationValue = formData?.organization
          ? {
              uuid: formData.organization.uuid,
              name: formData.organization.name,
              abbreviation: formData.organization.abbreviation,
            }
          : formData?.organization;
        const projectValue = formData?.project
          ? {
              uuid: formData.project.uuid,
              url: formData.project.url,
              name: formData.project.name,
              customer_uuid: formData.project.customer_uuid,
              is_industry: formData.project.is_industry,
            }
          : formData?.project;

        dispatch(
          change(
            MARKETPLACE_LANDING_FILTER_FORM,
            'organization',
            organizationValue,
            true,
          ),
        );
        dispatch(
          change(
            MARKETPLACE_LANDING_FILTER_FORM,
            'project',
            projectValue,
            true,
          ),
        );

        dispatch(
          setMarketplaceFilter({
            name: 'organization',
            value: organizationValue,
            label: translate('Organization'),
            getValueLabel: (val) => val?.abbreviation || val?.name,
          }),
        );
        dispatch(
          setMarketplaceFilter({
            name: 'project',
            value: projectValue,
            label: translate('Project'),
            getValueLabel: (val) => val?.name,
          }),
        );

        // Save in local storage
        ResourcesFilterStorage.set(formData);

        // Sync to URL so filters are visible and shareable
        syncFiltersToURL(formData);
      });
    },
    [dispatch, categories, state, params],
  );

  const filters = useSelector(getMarketplaceFilters);

  const clearAllFilters = useCallback(() => {
    const emptyFilters: Record<string, null> = {};
    filters?.forEach((item) => {
      dispatch(change(MARKETPLACE_LANDING_FILTER_FORM, item.name, null, true));
      dispatch(setMarketplaceFilter({ name: item.name, value: null }));
      emptyFilters[item.name] = null;
    });
    syncFiltersToURL(emptyFilters);
    syncResourceFilters({ organization: null, project: null });
  }, [dispatch, filters, syncResourceFilters]);

  const removeFilter = useCallback(
    (name: string) => {
      dispatch(change(MARKETPLACE_LANDING_FILTER_FORM, name, null, true));
      dispatch(setMarketplaceFilter({ name, value: null }));
      if (name === 'organization') {
        dispatch(
          change(MARKETPLACE_LANDING_FILTER_FORM, 'project', null, true),
        );
        dispatch(setMarketplaceFilter({ name: 'project', value: null }));
        syncResourceFilters({ organization: null, project: null });
      } else if (name === 'project') {
        syncResourceFilters({
          organization: filters?.find((f) => f.name === 'organization')?.value,
          project: null,
        });
      }
    },
    [dispatch, filters, syncResourceFilters],
  );

  useEffect(() => {
    // Normalize filter values - handle arrays from old data or different code paths
    const normalizeFilter = (filter: any): ResourceFilterValues => {
      if (!filter) return { organization: null, project: null };
      return {
        ...filter,
        organization: Array.isArray(filter.organization)
          ? filter.organization[0]
          : filter.organization,
        project: Array.isArray(filter.project)
          ? filter.project[0]
          : filter.project,
      };
    };

    // URL params take precedence over localStorage
    const urlParams = getQueryParams();
    const hasUrlFilters = Object.keys(urlParams).length > 0;

    if (hasUrlFilters) {
      // Use URL params - they were set intentionally (e.g., shared link)
      const normalized = normalizeFilter(urlParams);
      syncResourceFilters(normalized);
      // Also save to localStorage for persistence
      ResourcesFilterStorage.set(normalized);
    } else {
      // Fall back to localStorage
      const filter = ResourcesFilterStorage.get();
      const normalized = normalizeFilter(filter);
      syncResourceFilters(normalized);
      // Sync restored filters to URL so they are visible and shareable
      if (normalized) {
        syncFiltersToURL(normalized);
      }
    }
  }, []);

  return { syncResourceFilters, clearAllFilters, removeFilter };
};

export const sidebarResourcesFilterSelector = (
  state: RootState,
): ResourceFilterValues => {
  const filters = selectFiltersStorage(state, ALL_RESOURCES_TABLE_ID);
  if (!filters?.length) return null;
  const project = filters.find((item) => item.name === 'project');
  const organization = filters.find((item) => item.name === 'organization');
  return { project: project?.value, organization: organization?.value };
};
