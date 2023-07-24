import { call, put, takeEvery } from 'redux-saga/effects';

import { Action } from '@waldur/core/reducerActions';
import { translate } from '@waldur/i18n';
import * as api from '@waldur/marketplace/common/api';
import { closeModalDialog } from '@waldur/modal/actions';
import { showErrorResponse, showSuccess } from '@waldur/store/notify';

import * as constants from './constants';

function* googleCalendarSync(action: Action<any>) {
  const { uuid } = action.payload;
  try {
    yield call(api.syncGoogleCalendar, uuid);
    yield put(
      showSuccess(translate('Google Calendar has been synced successfully.')),
    );
    yield put(closeModalDialog());
  } catch (error) {
    yield put(
      showErrorResponse(error, translate('Unable to sync Google Calendar.')),
    );
  }
}

function* googleCalendarPublish(action: Action<any>) {
  const { uuid } = action.payload;
  try {
    yield call(api.publishGoogleCalendar, uuid);
    yield put(
      showSuccess(
        translate('Google Calendar has been published successfully.'),
      ),
    );
    yield put(closeModalDialog());
  } catch (error) {
    yield put(
      showErrorResponse(error, translate('Unable to publish Google Calendar.')),
    );
  }
}

function* googleCalendarUnpublish(action: Action<any>) {
  const { uuid } = action.payload;
  try {
    yield call(api.unpublishGoogleCalendar, uuid);
    yield put(
      showSuccess(
        translate('Google Calendar has been unpublished successfully.'),
      ),
    );
    yield put(closeModalDialog());
  } catch (error) {
    yield put(
      showErrorResponse(
        error,
        translate('Unable to unpublish Google Calendar.'),
      ),
    );
  }
}

function* pullRemoteOfferingDetails(action: Action<any>) {
  const { uuid } = action.payload;
  try {
    yield call(api.pullRemoteOfferingDetails, uuid);
    yield put(
      showSuccess(
        translate('Offering details synchronization has been scheduled.'),
      ),
    );
  } catch (error) {
    yield put(
      showErrorResponse(
        error,
        translate('Unable to synchronize offering details.'),
      ),
    );
  }
}

function* pullRemoteOfferingUsers(action: Action<any>) {
  const { uuid } = action.payload;
  try {
    yield call(api.pullRemoteOfferingUsers, uuid);
    yield put(
      showSuccess(
        translate('Offering users synchronization has been scheduled.'),
      ),
    );
  } catch (error) {
    yield put(
      showErrorResponse(
        error,
        translate('Unable to synchronize offering users.'),
      ),
    );
  }
}

function* pushRemoteOfferingProjectData(action: Action<any>) {
  const { uuid } = action.payload;
  try {
    yield call(api.pushRemoteOfferingProjectData, uuid);
    yield put(
      showSuccess(
        translate('Offering project data synchronization has been scheduled.'),
      ),
    );
  } catch (error) {
    yield put(
      showErrorResponse(
        error,
        translate('Unable to synchronize offering project data.'),
      ),
    );
  }
}

function* pullRemoteOfferingUsage(action: Action<any>) {
  const { uuid } = action.payload;
  try {
    yield call(api.pullRemoteOfferingUsage, uuid);
    yield put(
      showSuccess(
        translate('Offering usage synchronization has been scheduled.'),
      ),
    );
  } catch (error) {
    yield put(
      showErrorResponse(
        error,
        translate('Unable to synchronize offering usage.'),
      ),
    );
  }
}

function* pullRemoteOfferingResources(action: Action<any>) {
  const { uuid } = action.payload;
  try {
    yield call(api.pullRemoteOfferingResources, uuid);
    yield put(
      showSuccess(
        translate('Offering resources synchronization has been scheduled.'),
      ),
    );
  } catch (error) {
    yield put(
      showErrorResponse(
        error,
        translate('Unable to synchronize offering resources.'),
      ),
    );
  }
}

function* pullRemoteOfferingOrderItems(action: Action<any>) {
  const { uuid } = action.payload;
  try {
    yield call(api.pullRemoteOfferingOrderItems, uuid);
    yield put(
      showSuccess(
        translate('Offering order items synchronization has been scheduled.'),
      ),
    );
  } catch (error) {
    yield put(
      showErrorResponse(
        error,
        translate('Unable to synchronize offering order items.'),
      ),
    );
  }
}

function* pullRemoteOfferingInvoices(action: Action<any>) {
  const { uuid } = action.payload;
  try {
    yield call(api.pullRemoteOfferingInvoices, uuid);
    yield put(
      showSuccess(
        translate('Offering invoices synchronization has been scheduled.'),
      ),
    );
  } catch (error) {
    yield put(
      showErrorResponse(
        error,
        translate('Unable to synchronize offering invoices.'),
      ),
    );
  }
}

function* pullRemoteOfferingRobotAccounts(action: Action<any>) {
  const { uuid } = action.payload;
  try {
    yield call(api.pullRemoteOfferingRobotAccounts, uuid);
    yield put(
      showSuccess(
        translate('Robot accounts synchronization has been scheduled.'),
      ),
    );
  } catch (error) {
    yield put(
      showErrorResponse(
        error,
        translate('Unable to synchronize robot accounts.'),
      ),
    );
  }
}
export default function* () {
  yield takeEvery(constants.GOOGLE_CALENDAR_SYNC, googleCalendarSync);
  yield takeEvery(constants.GOOGLE_CALENDAR_PUBLISH, googleCalendarPublish);
  yield takeEvery(constants.GOOGLE_CALENDAR_UNPUBLISH, googleCalendarUnpublish);
  yield takeEvery(constants.GOOGLE_CALENDAR_UNPUBLISH, googleCalendarUnpublish);
  yield takeEvery(
    constants.PULL_REMOTE_OFFERING_DETAILS,
    pullRemoteOfferingDetails,
  );
  yield takeEvery(
    constants.PULL_REMOTE_OFFERING_USERS,
    pullRemoteOfferingUsers,
  );
  yield takeEvery(
    constants.PUSH_REMOTE_OFFERING_PROJECT_DATA,
    pushRemoteOfferingProjectData,
  );
  yield takeEvery(
    constants.PULL_REMOTE_OFFERING_USAGE,
    pullRemoteOfferingUsage,
  );
  yield takeEvery(
    constants.PULL_REMOTE_OFFERING_RESOURCES,
    pullRemoteOfferingResources,
  );
  yield takeEvery(
    constants.PULL_REMOTE_OFFERING_ORDER_ITEMS,
    pullRemoteOfferingOrderItems,
  );
  yield takeEvery(
    constants.PULL_REMOTE_OFFERING_INVOICES,
    pullRemoteOfferingInvoices,
  );
  yield takeEvery(
    constants.PULL_REMOTE_OFFERING_ROBOT_ACCOUNTS,
    pullRemoteOfferingRobotAccounts,
  );
}
