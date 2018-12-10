import { Section, Offering } from '@waldur/marketplace/types';
import { openModalDialog } from '@waldur/modal/actions';

import * as constants from './constants';

export const showAttributeFilter = () =>
  openModalDialog('marketplaceAttributeFilterListDialog', {size: 'sm'});

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
