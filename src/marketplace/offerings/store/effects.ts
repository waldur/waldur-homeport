import { getFormValues } from 'redux-form';
import { call, put, select, takeEvery } from 'redux-saga/effects';

import { Action } from '@waldur/core/reducerActions';
import { translate } from '@waldur/i18n';
import * as api from '@waldur/marketplace/common/api';
import { UPDATE_OFFERING_LOGO_FORM_ID } from '@waldur/marketplace/offerings/actions/constants';
import { closeModalDialog } from '@waldur/modal/actions';
import { showErrorResponse, showSuccess } from '@waldur/store/notify';
import {
  getCustomer,
  getUser,
  isOwnerOrStaff as isOwnerOrStaffSelector,
  isServiceManagerSelector,
} from '@waldur/workspace/selectors';

import * as constants from './constants';
import { PUBLIC_OFFERINGS_FILTER_FORM_ID } from './constants';
import { updatePublicOfferingsList } from './utils';

function* updateOfferingState(action) {
  const { offering, stateAction, reason, refreshOffering } = action.payload;
  try {
    yield call(
      api.updateProviderOfferingState,
      offering.uuid,
      stateAction,
      reason,
    );
    if (refreshOffering) {
      refreshOffering();
    }
    yield put(showSuccess(translate('Offering state has been updated.')));
    if (stateAction === 'pause') {
      yield put(closeModalDialog());
    }
  } catch (error) {
    yield put(
      showErrorResponse(error, translate('Unable to update offering state.')),
    );
  }
}

function* addOfferingLocation(action: Action<any>) {
  try {
    const { offering } = action.payload;
    yield call(api.updateProviderOffering, offering.uuid, offering);
    const customer = yield select(getCustomer);
    const isServiceManager = yield select(isServiceManagerSelector);
    const isOwnerOrStaff = yield select(isOwnerOrStaffSelector);
    const user = yield select(getUser);
    const formData = yield select(
      getFormValues(PUBLIC_OFFERINGS_FILTER_FORM_ID),
    );
    if (formData) {
      yield put(
        updatePublicOfferingsList(
          customer,
          isServiceManager && !isOwnerOrStaff,
          user,
          formData.state,
        ),
      );
    }
    yield put(showSuccess(translate('Location has been saved successfully.')));
    yield put(closeModalDialog());
  } catch (error) {
    yield put(showErrorResponse(error, translate('Unable to save location.')));
  }
}

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

function* updateConfirmationMessage(action: Action<any>) {
  const { offeringUuid, templateConfirmationMessage, secretOptions } =
    action.payload;
  try {
    yield call(
      api.updateProviderOfferingConfirmationMessage,
      offeringUuid,
      templateConfirmationMessage,
      secretOptions,
    );
    yield put(
      showSuccess(
        translate('Confirmation message has been updated successfully.'),
      ),
    );
    yield put(constants.updateConfirmationMessage.success());
    yield put(closeModalDialog());
  } catch (error) {
    yield put(
      showErrorResponse(
        error,
        translate('Unable to update confirmation message.'),
      ),
    );
    yield put(constants.updateConfirmationMessage.failure());
  }
}

function* updateAccessPolicy(action: Action<any>) {
  const { offeringUuid, organizationGroups } = action.payload;
  try {
    yield call(
      api.updateProviderOfferingAccessPolicy,
      offeringUuid,
      organizationGroups,
    );
    const customer = yield select(getCustomer);
    const isServiceManager = yield select(isServiceManagerSelector);
    const isOwnerOrStaff = yield select(isOwnerOrStaffSelector);
    const user = yield select(getUser);
    const formData = yield select(
      getFormValues(PUBLIC_OFFERINGS_FILTER_FORM_ID),
    );
    if (formData) {
      yield put(
        updatePublicOfferingsList(
          customer,
          isServiceManager && !isOwnerOrStaff,
          user,
          formData.state,
        ),
      );
    }
    yield put(
      showSuccess(translate('Access policy has been updated successfully.')),
    );
    yield put(constants.setAccessPolicy.success());
    yield put(closeModalDialog());
  } catch (error) {
    yield put(
      showErrorResponse(error, translate('Unable to update access policy.')),
    );
    yield put(constants.setAccessPolicy.failure());
  }
}

function* updateOfferingLogo(action: Action<any>) {
  const { offeringUuid, formData } = action.payload;
  try {
    yield call(api.updateProviderOfferingLogo, offeringUuid, formData);
    const customer = yield select(getCustomer);
    const isServiceManager = yield select(isServiceManagerSelector);
    const isOwnerOrStaff = yield select(isOwnerOrStaffSelector);
    const user = yield select(getUser);
    const filterFormData = yield select(
      getFormValues(UPDATE_OFFERING_LOGO_FORM_ID),
    );
    yield put(
      updatePublicOfferingsList(
        customer,
        isServiceManager && !isOwnerOrStaff,
        user,
        filterFormData?.state || [],
      ),
    );
    yield put(showSuccess(translate('Logo has been updated successfully.')));
    yield put(constants.updateOfferingLogo.success());
    yield put(closeModalDialog());
  } catch (error) {
    yield put(showErrorResponse(error, translate('Unable to update logo.')));
    yield put(constants.updateOfferingLogo.failure());
  }
}

export default function* () {
  yield takeEvery(constants.UPDATE_OFFERING_STATE, updateOfferingState);
  yield takeEvery(constants.ADD_OFFERING_LOCATION, addOfferingLocation);
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

  yield takeEvery(
    constants.updateConfirmationMessage.REQUEST,
    updateConfirmationMessage,
  );
  yield takeEvery(constants.setAccessPolicy.REQUEST, updateAccessPolicy);
  yield takeEvery(constants.updateOfferingLogo.REQUEST, updateOfferingLogo);
}
