import { useCurrentStateAndParams } from '@uirouter/react';
import { useCallback, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { change } from 'redux-form';

import { translate } from '@waldur/i18n';
import { MARKETPLACE_LANDING_FILTER_FORM } from '@waldur/marketplace/constants';
import {
  ALL_RESOURCES_TABLE_ID,
  CATEGORY_RESOURCES_ALL_FILTER_FORM_ID,
  CATEGORY_RESOURCES_TABLE_ID,
  PROJECT_RESOURCES_ALL_FILTER_FORM_ID,
} from '@waldur/marketplace/resources/list/constants';
import { applyFilters, setFilter } from '@waldur/table/actions';
import { selectFiltersStorage } from '@waldur/table/selectors';
import { TableSidebarFilterValues } from '@waldur/table/TableFilterItem';

import { useOfferingCategories } from '../utils';

const key = 'waldur/filter/resources';

const restoreFilter = () => {
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) : data;
};
const storeFilter = (values) =>
  localStorage.setItem(key, JSON.stringify(values));

const _setFilter = ({ table, form, label, name, value, dispatch }) => {
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
) => {
  const dispatch = useDispatch();
  const categories = useOfferingCategories();

  const { state, params } = useCurrentStateAndParams();

  const syncResourceFilters = useCallback(
    (formData) => {
      // Update all resources table filter
      if (!from || from === 'category-resources') {
        dispatch(
          change(
            PROJECT_RESOURCES_ALL_FILTER_FORM_ID,
            'project',
            formData?.project,
            true,
          ),
        );
        dispatch(
          change(
            PROJECT_RESOURCES_ALL_FILTER_FORM_ID,
            'organization',
            formData?.organization,
            true,
          ),
        );
      }

      // Update resources by category table filter
      if (!from || from === 'all-resources') {
        dispatch(
          change(
            CATEGORY_RESOURCES_ALL_FILTER_FORM_ID,
            'project',
            formData?.project,
            true,
          ),
        );
        dispatch(
          change(
            CATEGORY_RESOURCES_ALL_FILTER_FORM_ID,
            'organization',
            formData?.organization,
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
      dispatch(
        change(
          MARKETPLACE_LANDING_FILTER_FORM,
          'project',
          formData?.project
            ? {
                uuid: formData.project.uuid,
                url: formData.project.url,
                name: formData.project.name,
                customer_uuid: formData.project.customer_uuid,
                is_industry: formData.project.is_industry,
              }
            : formData?.project,
          true,
        ),
      );
      dispatch(
        change(
          MARKETPLACE_LANDING_FILTER_FORM,
          'organization',
          formData?.organization
            ? {
                uuid: formData.organization.uuid,
                name: formData.organization.name,
                abbreviation: formData.organization.abbreviation,
              }
            : formData?.organization,
          true,
        ),
      );

      // Save in local storage
      storeFilter(formData);
    },
    [dispatch, categories, state, params],
  );

  useEffect(() => {
    const filter = restoreFilter();
    syncResourceFilters(filter);
  }, []);

  return { syncResourceFilters };
};

export const sidebarResourcesFilterSelector = (state: any) => {
  const filters = selectFiltersStorage(state, ALL_RESOURCES_TABLE_ID);
  if (!filters?.length) return null;
  const project = filters.find((item) => item.name === 'project');
  const organization = filters.find((item) => item.name === 'organization');
  return { project: project?.value, organization: organization?.value };
};
