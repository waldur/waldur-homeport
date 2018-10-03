import { createFormAction } from 'redux-form-saga';

export const createOffering = createFormAction('waldur/marketplace/offering/CREATE_OFFERING');
export const SET_STEP = 'waldur/marketplace/offering/SET_STATE';
export const UPDATE_OFFERING_STATE = 'waldur/marketplace/offering/UPDATE_OFFERING_STATE';

export const LOAD_DATA_START = 'waldur/marketplace/offering/LOAD_DATA_START';
export const LOAD_DATA_SUCCESS = 'waldur/marketplace/offering/LOAD_DATA_SUCCESS';
export const LOAD_DATA_ERROR = 'waldur/marketplace/offering/LOAD_DATA_ERROR';

export const STATES = {
  1: 'Draft',
  2: 'Active',
  3: 'Paused',
  4: 'Archived',
};

export const TABLE_NAME = 'marketplace-offerings';

export const FORM_ID = 'marketplaceOfferingCreate';
