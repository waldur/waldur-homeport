import { getFormValues } from 'redux-form';
import { createSelector } from 'reselect';

import { translate } from '@waldur/i18n';
import { WORKSPACE_CATEGORY } from '@waldur/marketplace/constants';
import { RootState } from '@waldur/store/reducers';
import {
  getCustomer,
  getProject,
  getUser,
  getWorkspace,
} from '@waldur/workspace/selectors';

import { prepareAttributeSections } from '../utils';

import { MARKETPLACE_FILTER_FORM } from './constants';

const getCategory = (state: RootState) => state.marketplace.category;
export const getFilterName = (state: RootState) =>
  getCategory(state).filterQuery;
export const isLoading = (state: RootState) => getCategory(state).loading;
export const isLoaded = (state: RootState) => getCategory(state).loaded;
export const isErred = (state: RootState) => getCategory(state).erred;
export const getSections = (state: RootState) => getCategory(state).sections;

const getCategoryOfferings = (state: RootState) =>
  state.marketplace.categoryOfferings;
export const getOfferings = (state: RootState) =>
  getCategoryOfferings(state).items;
export const isOfferingsLoading = (state: RootState) =>
  getCategoryOfferings(state).loading;
export const isOfferingsLoaded = (state: RootState) =>
  getCategoryOfferings(state).loaded;

export const getDivisions = (state: RootState) => state.marketplace.divisions;
export const isDivisionsLoading = (state: RootState) =>
  getDivisions(state).loading;
export const isDivisionsLoaded = (state: RootState) =>
  getDivisions(state).loaded;
export const isDivisionsErred = (state: RootState) => getDivisions(state).erred;

export const categoryRouteState = (state: RootState) => {
  const workspace = getWorkspace(state);
  const user = getUser(state);
  if (!user) {
    return 'public.marketplace-category';
  }
  return WORKSPACE_CATEGORY[workspace] || 'public.marketplace-category';
};

export const formatAttributesFilter = (query) => {
  if (query) {
    const formattedQuery = {};
    Object.keys(query).forEach((key) => {
      const attributeType = key.split('-')[0];
      const attributeKey = key.split('-')[1];
      const queryKey = query[key];
      if (attributeType === 'list') {
        if (Object.keys(formattedQuery).indexOf(attributeKey) === -1) {
          formattedQuery[attributeKey] = [queryKey];
        } else {
          formattedQuery[attributeKey].push(queryKey);
        }
      } else if (attributeType === 'boolean') {
        formattedQuery[attributeKey] = JSON.parse(queryKey);
      } else {
        formattedQuery[attributeKey] = queryKey;
      }
    });
    return formattedQuery;
  }
};

export const getFilterAttributes = getFormValues(MARKETPLACE_FILTER_FORM);

export const getFilterQuery = createSelector(
  getFilterName,
  getFilterAttributes,
  getCustomer,
  getProject,
  (name, attributes, customer, project) => ({
    name,
    attributes: JSON.stringify(formatAttributesFilter(attributes)),
    allowed_customer_uuid: customer?.uuid,
    project_uuid: project?.uuid,
    state: ['Active', 'Paused'],
  }),
);

export const getFiltersUserFrindly = createSelector(
  getFilterAttributes,
  getSections,
  (attributes, sections) => {
    const filters = formatAttributesFilter(attributes);
    if (!filters) return [];

    const _sections = prepareAttributeSections(sections);

    const formattedFilters = [];
    // Divisions
    const selectedDivisions = [];
    for (const key of Object.keys(filters)) {
      if (key.startsWith('division')) {
        selectedDivisions.push({
          key,
          title: filters[key],
        });
      }
    }
    if (selectedDivisions.length > 0) {
      formattedFilters.push({
        key: 'divisions',
        title: translate('Divisions'),
        type: 'list',
        value: selectedDivisions,
      });
    }
    // Sections
    for (const section of _sections) {
      for (const attr of section.attributes) {
        if (filters[attr.key]) {
          let value;
          if (attr.type === 'list') {
            value = attr.options.filter((option) =>
              filters[attr.key].includes(option.key),
            );
          } else {
            value = filters[attr.key];
          }
          formattedFilters.push({
            key: attr.key,
            title: attr.title,
            type: attr.type,
            value,
          });
        }
      }
    }
    return formattedFilters;
  },
);
