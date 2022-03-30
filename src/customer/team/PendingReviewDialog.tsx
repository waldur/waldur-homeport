import { triggerTransition } from '@uirouter/redux';
import { useState, FunctionComponent } from 'react';
import { Button, Modal } from 'react-bootstrap';
import { useDispatch } from 'react-redux';

import { translate } from '@waldur/i18n';
import { closeModalDialog } from '@waldur/modal/actions';
import { showErrorResponse, showSuccess } from '@waldur/store/notify';

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
      dispatch(showErrorResponse(e, translate('Unable to close review.')));
    }
    setSubmitting(false);
  };
  return (
    <>
      <Modal.Header>
        <Modal.Title>
          {translate('Please review organization permissions')}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <CustomerUsersList />
      </Modal.Body>
      <Modal.Footer>
        <button
          type="button"
          className="btn btn-secondary"
          onClick={closeReviewCallback}
        >
          {submitting && (
            <>
              <i className="fa fa-spinner fa-spin m-r-xs" />{' '}
            </>
          )}
          {translate('Confirming that data is correct')}
        </button>
        <Button onClick={gotoTeam}>{translate('Edit permissions')}</Button>
      </Modal.Footer>
    </>
  );
};
