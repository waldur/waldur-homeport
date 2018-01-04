import { createFormAction } from 'redux-form-saga';

export const createProject = createFormAction('waldur/project/CREATE');
export const gotoProjectList = createFormAction('waldur/project/GOTO_LIST');
