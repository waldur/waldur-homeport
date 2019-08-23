import { createFormAction } from 'redux-form-saga';

export const createOffering = createFormAction('waldur/marketplace/offering/CREATE_OFFERING');
export const updateOffering = createFormAction('waldur/marketplace/offering/UPDATE_OFFERING');
export const REMOVE_OFFERING_COMPONENT = 'waldur/marketplace/offering/REMOVE_OFFERING_COMPONENT';
export const REMOVE_OFFERING_QUOTAS = 'waldur/marketplace/offering/REMOVE_OFFERING_QUOTAS';
export const SET_STEP = 'waldur/marketplace/offering/SET_STATE';
export const UPDATE_OFFERING_STATE = 'waldur/marketplace/offering/UPDATE_OFFERING_STATE';
export const CATEGORY_CHANGED = 'waldur/marketplace/offering/CATEGORY_CHANGED';

export const LOAD_DATA_START = 'waldur/marketplace/offering/LOAD_DATA_START';
export const LOAD_DATA_SUCCESS = 'waldur/marketplace/offering/LOAD_DATA_SUCCESS';
export const LOAD_DATA_ERROR = 'waldur/marketplace/offering/LOAD_DATA_ERROR';

export const LOAD_OFFERING_START = 'waldur/marketplace/offering/LOAD_OFFERING_START';

export const DRAFT = 'Draft';

export const ACTIVE = 'Active';

export const PAUSED = 'Paused';

export const ARCHIVED = 'Archived';

export const TABLE_NAME = 'marketplace-offerings';

export const FORM_ID = 'marketplaceOfferingCreate';

export const BOOKINGS_SET = 'waldur/marketplace/offering/BOOKINGS_SET';
export const BOOKINGS_FETCH = 'waldur/marketplace/offering/BOOKINGS_FETCH';
