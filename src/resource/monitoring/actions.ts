import { createFormAction } from 'redux-form-saga';

import { lazyComponent } from '@waldur/core/lazyComponent';
import { openModalDialog } from '@waldur/modal/actions';

import {
  FETCH_REQUEST,
  FETCH_SUCCESS,
  FETCH_FAILURE,
  DELETE_REQUEST,
  DELETE_FAILURE,
} from './constants';

const ZabbixHostCreateDialog = lazyComponent(
  () =>
    import(
      /* webpackChunkName: "ZabbixHostCreateDialog" */ './ZabbixHostCreateDialog'
    ),
  'ZabbixHostCreateDialog',
);
const ZabbixHostDetailsDialog = lazyComponent(
  () =>
    import(
      /* webpackChunkName: "ZabbixHostDetailsDialog" */ './ZabbixHostDetailsDialog'
    ),
  'ZabbixHostDetailsDialog',
);

export const fetchZabbixHost = (uuid) => ({
  type: FETCH_REQUEST,
  payload: {
    uuid,
  },
});

export const fetchSuccess = (host) => ({
  type: FETCH_SUCCESS,
  payload: {
    host,
  },
});

export const fetchFailure = () => ({
  type: FETCH_FAILURE,
});

export const deleteRequest = (uuid) => ({
  type: DELETE_REQUEST,
  payload: {
    uuid,
  },
});

export const deleteFailure = () => ({
  type: DELETE_FAILURE,
});

export const openDetailsDialog = (resource) =>
  openModalDialog(ZabbixHostDetailsDialog, {
    resolve: { resource },
    size: 'lg',
  });

export const openCreateDialog = (resource) =>
  openModalDialog(ZabbixHostCreateDialog, { resolve: { resource } });

export const loadLinks = createFormAction('waldur/monitoring/LOAD_LINKS');

export const loadTemplates = createFormAction(
  'waldur/monitoring/LOAD_TEMPLATES',
);

export const createHost = createFormAction('waldur/monitoring/CREATE_HOST');
