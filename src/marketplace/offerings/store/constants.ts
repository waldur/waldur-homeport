import { createFormAction } from 'redux-form-saga';

export const createOffering = createFormAction(
  'waldur/marketplace/offering/CREATE_OFFERING',
);
export const updateOffering = createFormAction(
  'waldur/marketplace/offering/UPDATE_OFFERING',
);
export const REMOVE_OFFERING_COMPONENT =
  'waldur/marketplace/offering/REMOVE_OFFERING_COMPONENT';
export const REMOVE_OFFERING_QUOTAS =
  'waldur/marketplace/offering/REMOVE_OFFERING_QUOTAS';
export const SET_STEP = 'waldur/marketplace/offering/SET_STATE';
export const UPDATE_OFFERING_STATE =
  'waldur/marketplace/offering/UPDATE_OFFERING_STATE';
export const CATEGORY_CHANGED = 'waldur/marketplace/offering/CATEGORY_CHANGED';
export const ADD_OFFERING_IMAGE =
  'waldur/marketplace/offering/ADD_OFFERING_IMAGE';
export const REMOVE_OFFERING_IMAGE =
  'waldur/marketplace/offering/REMOVE_OFFERING_IMAGE';
export const IS_ADDING_OFFERING_IMAGE =
  'waldur/marketplace/offering/IS_ADDING_OFFERING_IMAGE';
export const IS_UPDATING_OFFERING =
  'waldur/marketplace/offering/IS_UPDATING_OFFERING';
export const ADD_OFFERING_LOCATION =
  'waldur/marketplace/offering/ADD_OFFERING_LOCATION';

export const LOAD_DATA_START = 'waldur/marketplace/offering/LOAD_DATA_START';
export const LOAD_DATA_SUCCESS =
  'waldur/marketplace/offering/LOAD_DATA_SUCCESS';
export const LOAD_DATA_ERROR = 'waldur/marketplace/offering/LOAD_DATA_ERROR';

export const LOAD_OFFERING_START =
  'waldur/marketplace/offering/LOAD_OFFERING_START';

export const DRAFT = 'Draft';

export const ACTIVE = 'Active';

export const PAUSED = 'Paused';

export const ARCHIVED = 'Archived';

export const OFFERING_TABLE_NAME = 'marketplace-offerings';
export const PUBLIC_OFFERINGS_FILTER_FORM_ID = 'OfferingsFilter';

export const SERVICE_PROVIDERS_TABLE_NAME =
  'marketplace-service-providers-list';

export const IMAGES_TABLE_NAME = 'marketplace-offering-images';

export const FORM_ID = 'marketplaceOfferingCreate';

export const OFFERING_IMAGES_FORM_ID = 'marketplaceOfferingImages';

export const GOOGLE_CALENDAR_SYNC = 'GoogleCalendarSync';
export const GOOGLE_CALENDAR_PUBLISH = 'GoogleCalendarPublish';
export const GOOGLE_CALENDAR_UNPUBLISH = 'GoogleCalendarUnpublish';

export const updateConfirmationMessage = createFormAction(
  'waldur/marketplace/offering/UPDATE_CONFIRMATION_MESSAGE',
);

export const setAccessPolicy = createFormAction(
  'waldur/marketplace/offering/SET_ACCESS_POLICY',
);

export const updateOfferingLogo = createFormAction(
  'waldur/marketplace/offering/UPDATE_OFFERING_LOGO',
);
