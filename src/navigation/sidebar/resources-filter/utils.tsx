import { useCurrentStateAndParams } from '@uirouter/react';
import { useCallback, useEffect } from 'react';
import { useDispatch, useSelector, batch } from 'react-redux';
import { Dispatch } from 'redux';
import { createSelector } from 'reselect';

import { getQueryParams, syncFiltersToURL } from '@/core/filters';
import { ResourcesFilterStorage } from '@/core/StorageManager';
import { translate } from '@/i18n';
import { setMarketplaceFilter } from '@/marketplace/landing/filter/store/actions';
import { getMarketplaceFilters } from '@/marketplace/landing/filter/store/selectors';
import {
  ALL_RESOURCES_TABLE_ID,
  CATEGORY_RESOURCES_ALL_FILTER_FORM_ID,
  CATEGORY_RESOURCES_TABLE_ID,
  PROJECT_RESOURCES_ALL_FILTER_FORM_ID,
} from '@/marketplace/resources/list/constants';
import { RootState } from '@/store/reducers';
import { applyFilters, setFilter } from '@/table/actions';
import { selectFiltersStorage } from '@/table/selectors';
import { TableSidebarFilterValues } from '@/table/TableFilterItem';
import { Customer, Project } from '@/workspace/types';

import { useOfferingCategories } from '../utils';

import { pruneMissingScope } from './pruneMissingScope';

interface ResourceFilterValues {
  organization?: Pick<Customer, 'name' | 'uuid' | 'abbreviation'>;
  project?: Pick<
    Project,
    'name' | 'uuid' | 'url' | 'customer_uuid' | 'is_industry'
  >;
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

            _setFilter({ table, form, label, name, value: null, dispatch });
            dispatch(applyFilters(table, true));
          }}
        />
      ),
    }),
  );
};

export const useOrganizationAndProjectAutocompletesForResources = (
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
      dispatch(setMarketplaceFilter({ name: item.name, value: null }));
      emptyFilters[item.name] = null;
    });
    syncFiltersToURL(emptyFilters);
    syncResourceFilters({ organization: null, project: null });
  }, [dispatch, filters, syncResourceFilters]);

  const removeFilter = useCallback(
    (name: string) => {
      dispatch(setMarketplaceFilter({ name, value: null }));
      if (name === 'organization') {
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
    // Pull only organization/project out of whatever shape the input is in
    // (URL query bag or stored object). Spreading the entire bag here would
    // sweep unrelated filters (`state`, `type`, `tag`, ...) of whatever page
    // happens to host the sidebar into ResourcesFilterStorage and, worse,
    // re-emit them onto the next page's URL — silently dropping its real
    // defaults.
    const normalizeFilter = (filter: any): ResourceFilterValues => {
      if (!filter) return { organization: null, project: null };
      return {
        organization: Array.isArray(filter.organization)
          ? filter.organization[0]
          : (filter.organization ?? null),
        project: Array.isArray(filter.project)
          ? filter.project[0]
          : (filter.project ?? null),
      };
    };

    // URL params take precedence over localStorage
    const urlParams = getQueryParams();
    const hasOrgOrProjectInUrl = Boolean(
      urlParams.organization || urlParams.project,
    );

    let restored: ResourceFilterValues;
    if (hasOrgOrProjectInUrl) {
      // Use URL params - they were set intentionally (e.g., shared link)
      restored = normalizeFilter(urlParams);
      syncResourceFilters(restored);
      // Also save to localStorage for persistence
      ResourcesFilterStorage.set(restored);
    } else {
      // Fall back to localStorage
      const filter = ResourcesFilterStorage.get();
      restored = normalizeFilter(filter);
      syncResourceFilters(restored);
      // Sync restored filters to URL so they are visible and shareable.
      // Only emit organization/project — never republish unrelated keys here.
      if (restored.organization || restored.project) {
        syncFiltersToURL(restored);
      }
    }

    // The scope above is a snapshot that outlives what it names, and a stale
    // one is invisible: the list endpoints answer an unknown uuid with an
    // empty page rather than an error, so the user gets an empty catalog and
    // no filter chip to remove. Confirm it still resolves and drop what does
    // not. Deliberately after the restore rather than before it, so the
    // ordinary case — a scope that is still good — pays no latency and the
    // sidebar does not flicker through an unfiltered state on every load.
    let cancelled = false;
    pruneMissingScope(restored).then((pruned) => {
      // Same reference means nothing was pruned.
      if (cancelled || pruned === restored) return;
      // Writes the storage and rewrites the URL on its own — syncFiltersToURL
      // deletes the key for a null value, which is what clears the stale param
      // out of the address bar so the next load does not restore it again.
      syncResourceFilters({
        organization: pruned.organization ?? null,
        project: pruned.project ?? null,
      });
    });
    return () => {
      cancelled = true;
    };
  }, []);

  return { syncResourceFilters, clearAllFilters, removeFilter };
};

// Memoised so that consumers (notably MarketplacePopup) don't re-render every
// time anything else in the redux store changes. Without reselect this returns
// a fresh `{ project, organization }` object on every store update, even when
// the underlying filters haven't changed -- defeating react-redux's
// reference-equality bail-out and feeding the render-storm path that surfaced
// the May 2 Add Resource modal flake (waldur-integration-testing!73).
export const sidebarResourcesFilterSelector = createSelector(
  (state: RootState) => selectFiltersStorage(state, ALL_RESOURCES_TABLE_ID),
  (filters): ResourceFilterValues => {
    if (!filters?.length) return null;
    const project = filters.find((item) => item.name === 'project');
    const organization = filters.find((item) => item.name === 'organization');
    return { project: project?.value, organization: organization?.value };
  },
);
