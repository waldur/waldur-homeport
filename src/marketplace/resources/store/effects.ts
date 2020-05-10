import { SubmissionError, change } from 'redux-form';
import { call, put, takeEvery } from 'redux-saga/effects';

import { format } from '@waldur/core/ErrorMessageFormatter';
import { $state } from '@waldur/core/services';
import { translate } from '@waldur/i18n';
import { closeModalDialog } from '@waldur/modal/actions';
import { showError, showSuccess, stateGo } from '@waldur/store/coreSaga';

import * as api from '../../common/api';

import * as constants from './constants';

function* redirectToDetailView(resource_type, resource_uuid) {
  const state =
    resource_type === 'Support.Offering'
      ? 'offeringDetails'
      : 'resources.details';
  if ($state.current.name !== state) {
    return;
  }
  yield put(
    stateGo(state, {
      uuid: resource_uuid,
      resource_type,
      tab: 'orderItems',
    }),
  );
}

function* handleSubmitUsage(action) {
  const { period, components } = action.payload;
  const payload = {
    plan_period: period.value.uuid,
    usages: Object.keys(components).map(key => ({
      type: key,
      ...components[key],
    })),
  };

  try {
    yield call(api.submitUsageReport, payload);
    yield put(showSuccess(translate('Usage report has been submitted.')));
    yield put(constants.submitUsage.success());
    yield put(closeModalDialog());
  } catch (error) {
    const errorMessage = `${translate(
      'Unable to submit usage report.',
    )} ${format(error)}`;
    yield put(showError(errorMessage));
    const formError = new SubmissionError({
      _error: errorMessage,
    });
    yield put(constants.submitUsage.failure(formError));
  }
}

function* handleSwitchPlan(action) {
  const {
    marketplace_resource_uuid,
    resource_uuid,
    resource_type,
    plan_url,
  } = action.payload;
  try {
    yield call(api.switchPlan, marketplace_resource_uuid, plan_url);
    yield put(
      showSuccess(
        translate('Resource plan change request has been submitted.'),
      ),
    );
    yield put(constants.switchPlan.success());
    yield put(closeModalDialog());
    yield redirectToDetailView(resource_type, resource_uuid);
  } catch (error) {
    const errorMessage = `${translate(
      'Unable to submit plan change request.',
    )} ${format(error)}`;
    yield put(showError(errorMessage));
    yield put(constants.switchPlan.success());
  }
}

function* handleChangeLimits(action) {
  const {
    marketplace_resource_uuid,
    resource_uuid,
    resource_type,
    limits,
  } = action.payload;
  try {
    yield call(api.changeLimits, marketplace_resource_uuid, limits);
    yield put(
      showSuccess(
        translate('Resource limits change request has been submitted.'),
      ),
    );
    yield put(constants.changeLimits.success());
    yield put(closeModalDialog());
    yield redirectToDetailView(resource_type, resource_uuid);
  } catch (error) {
    const errorMessage = `${translate(
      'Unable to submit limits change request.',
    )} ${format(error)}`;
    yield put(showError(errorMessage));
    yield put(constants.changeLimits.success());
  }
}

function* handleTerminateResource(action) {
  const {
    marketplace_resource_uuid,
    resource_uuid,
    resource_type,
  } = action.payload;
  try {
    yield call(api.terminateResource, marketplace_resource_uuid);
    yield put(
      showSuccess(
        translate('Resource termination request has been submitted.'),
      ),
    );
    yield put(constants.terminateResource.success());
    yield put(closeModalDialog());
    yield redirectToDetailView(resource_type, resource_uuid);
  } catch (error) {
    const errorMessage = `${translate(
      'Unable to submit resource termination request.',
    )} ${format(error)}`;
    yield put(showError(errorMessage));
    yield put(constants.terminateResource.success());
  }
}

function* handlePeriodChange(action) {
  const { period } = action.payload;
  for (const component of period.components) {
    yield put(
      change(
        constants.FORM_ID,
        `components.${component.type}.amount`,
        component.usage,
      ),
    );
    yield put(
      change(
        constants.FORM_ID,
        `components.${component.type}.description`,
        component.description,
      ),
    );
  }
}

export default function*() {
  yield takeEvery(constants.submitUsage.REQUEST, handleSubmitUsage);
  yield takeEvery(constants.switchPlan.REQUEST, handleSwitchPlan);
  yield takeEvery(constants.changeLimits.REQUEST, handleChangeLimits);
  yield takeEvery(constants.terminateResource.REQUEST, handleTerminateResource);
  yield takeEvery(constants.PERIOD_CHANGED, handlePeriodChange);
}
