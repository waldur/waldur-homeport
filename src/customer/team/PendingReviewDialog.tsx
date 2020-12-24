import { triggerTransition } from '@uirouter/redux';
import { useState, FunctionComponent } from 'react';
import {
  ModalBody,
  ModalFooter,
  ModalHeader,
  ModalTitle,
} from 'react-bootstrap';
import { useDispatch } from 'react-redux';

import { translate } from '@waldur/i18n';
import { closeModalDialog } from '@waldur/modal/actions';
import { showError, showSuccess } from '@waldur/store/notify';

import { closeReview } from './api';
import { CustomerUsersList } from './CustomerUsersList';

export const PendingReviewDialog: FunctionComponent<{
  resolve: { reviewId };
}> = ({ resolve: { reviewId } }) => {
  const dispatch = useDispatch();
  const gotoTeam = () => {
    dispatch(triggerTransition('organization.team', {}));
    dispatch(closeModalDialog());
  };
  const [submitting, setSubmitting] = useState(false);
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
