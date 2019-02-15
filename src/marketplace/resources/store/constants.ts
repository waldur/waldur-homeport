import { createFormAction } from 'redux-form-saga';

export const submitUsage = createFormAction('waldur/marketplace/resources/SUBMIT_USAGE');
export const switchPlan = createFormAction('waldur/marketplace/resources/SWITCH_PLAN');
export const terminateResource = createFormAction('waldur/marketplace/resources/TERMINATE_RESOURCE');
