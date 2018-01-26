import { createFormAction } from 'redux-form-saga';

import { openModalDialog } from '@waldur/modal/actions';

import { FETCH_REQUEST, FETCH_SUCCESS, FETCH_FAILURE } from './constants';

export const fetchMonitoring = scope => ({
  type: FETCH_REQUEST,
  payload: {
    scope,
  },
});

export const fetchSuccess = host => ({
  type: FETCH_SUCCESS,
  payload: {
    host,
  },
});

export const fetchFailure = () => ({
  type: FETCH_FAILURE,
});

export const openDetailsDialog = resource =>
  openModalDialog('monitoringDetailsDialog', {resolve: {resource}, size: 'lg'});

export const openCreateDialog = resource =>
  openModalDialog('monitoringCreateDialog', {resolve: {resource}});

export const loadProviders = createFormAction('waldur/monitoring/LOAD_PROVIDERS');

export const loadTemplates = createFormAction('waldur/monitoring/LOAD_TEMPLATES');

export const createHost = createFormAction('waldur/monitoring/CREATE_HOST');
