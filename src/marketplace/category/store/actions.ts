import type { Section, Offering } from '@waldur/marketplace/types';

import * as constants from './constants';

export const setFilterQuery = (filterQuery: string) => ({
  type: constants.SET_FILTER_QUERY,
  payload: {
    filterQuery,
  },
});

export const loadDataStart = () => ({
  type: constants.LOAD_DATA_START,
});

export const loadDataSuccess = (sections: Section[]) => ({
  type: constants.LOAD_DATA_SUCCESS,
  payload: {
    sections,
  },
});

export const loadDataError = () => ({
  type: constants.LOAD_DATA_ERROR,
});

export const loadOfferingsStart = () => ({
  type: constants.LOAD_OFFERINGS_START,
});

export const loadOfferingsSuccess = (items: Offering[]) => ({
  type: constants.LOAD_OFFERINGS_SUCCESS,
  payload: {
    items,
  },
});

export const loadOfferingsError = () => ({
  type: constants.LOAD_OFFERINGS_ERROR,
});

export const loadOrganizationGroupsStart = () => ({
  type: constants.LOAD_ORGANIZATION_GROUPS_START,
});

export const loadOrganizationGroupsSuccess = (items: Offering[]) => ({
  type: constants.LOAD_ORGANIZATION_GROUPS_SUCCESS,
  payload: {
    items,
  },
});

export const loadOrganizationGroupsError = () => ({
  type: constants.LOAD_ORGANIZATION_GROUPS_ERROR,
});
