import { call, put, select, takeEvery } from 'redux-saga/effects';

import { format } from '@waldur/core/ErrorMessageFormatter';
import { Action } from '@waldur/core/reducerActions';
import { translate } from '@waldur/i18n';
import * as api from '@waldur/invoices/api';
import { closeModalDialog } from '@waldur/modal/actions';
import { showError, showSuccess } from '@waldur/store/notify';
import { FETCH_LIST_START } from '@waldur/table/actions';
import { fetchList } from '@waldur/table/effects';
import { getCustomer } from '@waldur/workspace/selectors';

import * as constants from '../constants';
import { INVOICES_TABLE } from '../constants';

function* markInvoiceAsPaid(action: Action<any>) {
  try {
    yield call(api.markAsPaid, action.payload);
    yield put(showSuccess(translate('The invoice has been marked as paid.')));
    yield put(closeModalDialog());
    const customer = yield select(getCustomer);
    yield fetchList({
      type: FETCH_LIST_START,
      payload: {
        table: INVOICES_TABLE,
        extraFilter: {
          customer: customer.url,
        },
      },
    });
  } catch (error) {
    const errorMessage = `${translate(
      'Unable to mark the invoice as paid.',
    )} ${format(error)}`;
    yield put(showError(errorMessage));
  }
}

export default function* () {
  yield takeEvery(constants.MARK_INVOICE_AS_PAID, markInvoiceAsPaid);
}
