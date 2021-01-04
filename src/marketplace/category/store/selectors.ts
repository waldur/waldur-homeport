import { getFormValues } from 'redux-form';
import { createSelector } from 'reselect';

import { RootState } from '@waldur/store/reducers';
import { getCustomer, getProject } from '@waldur/workspace/selectors';

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
    allowed_customer_uuid: customer.uuid,
    project_uuid: project && project.uuid,
    state: ['Active', 'Paused'],
  }),
);
