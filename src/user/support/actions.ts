import { createFormAction } from 'redux-form-saga';

export const updateUser = createFormAction('waldur/user/UPDATE');
export const activateUser = createFormAction('waldur/user/ACTIVATE');
export const deactivateUser = createFormAction('waldur/user/DEACTIVATE');
export const deleteUser = createFormAction('waldur/user/DELETE');
