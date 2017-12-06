import { delay } from 'redux-saga';
import { call, take, put, cancel, fork, takeEvery } from 'redux-saga/effects';

import * as tableActions from '@waldur/table-react/actions';

import { FeedItem, Project, TABLE_ID_DASHBOARD_ALERTS, TABLE_ID_DASHBOARD_EVENTS } from './types';
import * as api from './api';
import * as actions from './actions';

function* fetchAlertsFeed(project) {
  try {
    yield put(tableActions.fetchListStart(TABLE_ID_DASHBOARD_ALERTS));
    const dataList = (yield call(api.fetchAlerts, project)) as FeedItem[];
    yield put(tableActions.fetchListDone(TABLE_ID_DASHBOARD_ALERTS, dataList, dataList.length));
  } catch (ex) {
    yield put(tableActions.fetchListError(TABLE_ID_DASHBOARD_ALERTS, ex));
  }
}

function* fetchEventsFeed(project) {
  try {
    yield put(tableActions.fetchListStart(TABLE_ID_DASHBOARD_EVENTS));
    const dataList = ((yield call(api.fetchEvents, project)) as FeedItem[]).filter(
      // filter out issue update events as there are too many of them.
      item => item.event_type && item.event_type !== 'issue_update_succeeded');
    yield put(tableActions.fetchListDone(TABLE_ID_DASHBOARD_EVENTS, dataList, dataList.length));
  } catch (ex) {
    yield put(tableActions.fetchListError(TABLE_ID_DASHBOARD_EVENTS, ex));
  }
}

function* rootSaga():any {
  yield takeEvery<any>(actions.FETCH_ALERTS_FEED, ({ project }) => fetchAlertsFeed(project));
  yield takeEvery<any>(actions.FETCH_EVENTS_FEED, ({ project }) => fetchEventsFeed(project));
}

export default rootSaga;
