import * as React from 'react';
import ModalBody from 'react-bootstrap/lib/ModalBody';
import ModalFooter from 'react-bootstrap/lib/ModalFooter';
import ModalHeader from 'react-bootstrap/lib/ModalHeader';
import ModalTitle from 'react-bootstrap/lib/ModalTitle';
import { useDispatch } from 'react-redux';

import { translate } from '@waldur/i18n';
import { closeModalDialog } from '@waldur/modal/actions';
import { showError, showSuccess, stateGo } from '@waldur/store/coreSaga';

import { closeReview } from './api';
import { CustomerUsersList } from './CustomerUsersList';

export const PendingReviewDialog = ({ resolve: { reviewId } }) => {
  const dispatch = useDispatch();
  const gotoTeam = () => {
    dispatch(stateGo('organization.team'));
    dispatch(closeModalDialog());
  };
  const [submitting, setSubmitting] = React.useState(false);
  const closeReviewCallback = async () => {
    setSubmitting(true);
    try {
      await closeReview(reviewId);
      dispatch(showSuccess(translate('Review has been closed.')));
      dispatch(closeModalDialog());
    } catch (e) {
      dispatch(showError(translate('Unable to close review.')));
    }
    setSubmitting(false);
  };
  return (
    <>
      <ModalHeader>
        <ModalTitle>
          {translate('Please review organization permissions')}
        </ModalTitle>
      </ModalHeader>
      <ModalBody>
        <CustomerUsersList />
      </ModalBody>
      <ModalFooter>
        <button
          type="button"
          className="btn btn-default"
          onClick={closeReviewCallback}
        >
          {submitting && (
            <>
              <i className="fa fa-spinner fa-spin m-r-xs" />{' '}
            </>
          )}
          {translate('Confirming that data is correct')}
        </button>
        <button type="button" className="btn btn-default" onClick={gotoTeam}>
          {translate('Edit permissions')}
        </button>
      </ModalFooter>
    </>
  );
};
