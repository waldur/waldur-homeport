import { SubmissionError, change } from 'redux-form';
import { call, put, takeEvery } from 'redux-saga/effects';

import { format } from '@waldur/core/ErrorMessageFormatter';
import { translate } from '@waldur/i18n';
import * as api from '@waldur/marketplace/common/api';
import { closeModalDialog } from '@waldur/modal/actions';
import { showError, showSuccess } from '@waldur/store/notify';

import * as constants from './constants';

function* handleSubmitUsage(action) {
  const { period, components } = action.payload;
  const payload = {
    plan_period: period.value?.uuid,
    usages: Object.keys(components).map((key) => ({
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
  const { resource, plan_url, refetch } = action.payload;
  try {
    yield call(api.switchPlan, resource.uuid, plan_url);
    yield put(
      showSuccess(
        translate('Resource plan change request has been submitted.'),
      ),
    );
    yield put(constants.switchPlan.success());
    yield put(closeModalDialog());
    if (refetch) {
      yield call(refetch);
    }
  } catch (error) {
    const errorMessage = `${translate(
      'Unable to submit plan change request.',
    )} ${format(error)}`;
    yield put(showError(errorMessage));
    yield put(constants.switchPlan.success());
  }
}

function* handleChangeLimits(action) {
  const { resource, limits, refetch } = action.payload;
  try {
    yield call(api.changeLimits, resource.uuid, limits);
    yield put(
      showSuccess(
        translate('Resource limits change request has been submitted.'),
      ),
    );
    yield put(constants.changeLimits.success());
    yield put(closeModalDialog());
    if (refetch) {
      yield call(refetch);
    }
  } catch (error) {
    const errorMessage = `${translate(
      'Unable to submit limits change request.',
    )} ${format(error)}`;
    yield put(showError(errorMessage));
    yield put(constants.changeLimits.success());
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

export default function* () {
  yield takeEvery(constants.submitUsage.REQUEST, handleSubmitUsage);
  yield takeEvery(constants.switchPlan.REQUEST, handleSwitchPlan);
  yield takeEvery(constants.changeLimits.REQUEST, handleChangeLimits);
  yield takeEvery(constants.PERIOD_CHANGED, handlePeriodChange);
}
