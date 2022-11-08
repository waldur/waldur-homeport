import { Modal } from 'react-bootstrap';
import { connect, useDispatch } from 'react-redux';
import { reduxForm } from 'redux-form';

import { SubmitButton } from '@waldur/form';
import { translate } from '@waldur/i18n';
import { updateProviderOffering } from '@waldur/marketplace/common/api';
import { closeModalDialog } from '@waldur/modal/actions';
import { showError, showSuccess } from '@waldur/store/notify';
import { RootState } from '@waldur/store/reducers';

import { ManagementStepContainer } from '../create/ManagementStepContainer';
import { FORM_ID } from '../store/constants';
import { formatOfferingRequest } from '../store/utils';
import { getInitialValues } from '../update/utils';

export const PageManagement = connect((state: RootState) => ({
  initialValues: getInitialValues(state),
}))(
  reduxForm<{}, any>({
    form: FORM_ID,
  })(
    ({
      submitting,
      handleSubmit,
      invalid,
      onReturn,
      refreshOffering,
      offering,
    }) => {
      const dispatch = useDispatch();

      const updateOfferingHandler = async (formData) => {
        try {
          const offeringRequest = formatOfferingRequest(formData, []);
          await updateProviderOffering(offering.uuid, offeringRequest);
          await refreshOffering();
          dispatch(showSuccess(translate('Offering has been updated.')));
          dispatch(closeModalDialog());
        } catch (e) {
          dispatch(showError(translate('Unable to update offering.')));
        }
      };

      return (
        <form onSubmit={handleSubmit(updateOfferingHandler)}>
          <Modal.Header onClick={onReturn} style={{ cursor: 'pointer' }}>
            <Modal.Title>
              <i className="fa fa-arrow-left"></i> {translate('Management')}
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <ManagementStepContainer />
          </Modal.Body>
          <Modal.Footer>
            <SubmitButton
              disabled={invalid}
              submitting={submitting}
              label={translate('Update')}
            />
          </Modal.Footer>
        </form>
      );
    },
  ),
);
