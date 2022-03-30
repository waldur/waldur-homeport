import { Modal, Col, Row } from 'react-bootstrap';
import { connect, useDispatch } from 'react-redux';
import { reduxForm } from 'redux-form';

import { SubmitButton } from '@waldur/form';
import { translate } from '@waldur/i18n';
import { updateOfferingConfirmationMessage } from '@waldur/marketplace/common/api';
import { EditConfirmationMessageFormContainer } from '@waldur/marketplace/offerings/actions/EditConfirmationMessageFormContainer';
import { closeModalDialog } from '@waldur/modal/actions';
import { showError, showSuccess } from '@waldur/store/notify';

export const PageConfirmationMessage = connect<{}, {}, { offering }>(
  (_, props) => ({
    initialValues: {
      template_confirmation_comment:
        props.offering.secret_options?.template_confirmation_comment,
    },
  }),
)(
  reduxForm<{}, any>({
    form: 'PublicOfferingConfirmationMessageEditor',
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
      const updateOfferingHandler = async ({ ...formData }) => {
        try {
          await updateOfferingConfirmationMessage(
            offering.uuid,
            formData.template_confirmation_comment,
            offering.secret_options,
          );
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
              <i className="fa fa-arrow-left"></i>{' '}
              {translate('Confirmation message')}
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Row>
              <Col lg={12}>
                <EditConfirmationMessageFormContainer
                  submitting={submitting}
                  layout="vertical"
                />
              </Col>
            </Row>
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
