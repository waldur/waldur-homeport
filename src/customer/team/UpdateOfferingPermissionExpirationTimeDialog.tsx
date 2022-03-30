import { useCallback } from 'react';
import { Modal } from 'react-bootstrap';
import { connect, useDispatch, useSelector } from 'react-redux';
import { compose } from 'redux';
import { Field, reduxForm } from 'redux-form';

import { SubmitButton } from '@waldur/auth/SubmitButton';
import { FormContainer } from '@waldur/form';
import { DateField } from '@waldur/form/DateField';
import { datePickerOverlayContainerInDialogs } from '@waldur/form/utils';
import { translate } from '@waldur/i18n';
import { closeModalDialog } from '@waldur/modal/actions';
import { CloseDialogButton } from '@waldur/modal/CloseDialogButton';
import { showErrorResponse, showSuccess } from '@waldur/store/notify';
import { fetchListStart } from '@waldur/table/actions';
import { getCustomer } from '@waldur/workspace/selectors';

import { updatePermission } from './api';
import {
  OFFERING_PERMISSIONS_LIST_ID,
  UPDATE_OFFERING_PERMISSION_EXPIRATION_TIME_FORM_ID,
} from './constants';

const PureUpdateOfferingPermissionExpirationTimeDialog = (props) => {
  const dispatch = useDispatch();
  const customer = useSelector(getCustomer);
  const update = useCallback(
    async (formData) => {
      try {
        await updatePermission(
          props.resolve.permission.pk,
          formData.expiration_time,
        );
        dispatch(
          showSuccess(translate('Permission has been updated successfully.')),
        );
        dispatch(closeModalDialog());
        dispatch(
          fetchListStart(OFFERING_PERMISSIONS_LIST_ID, {
            customer_uuid: customer.uuid,
          }),
        );
      } catch (error) {
        dispatch(
          showErrorResponse(error, translate('Unable to update permission.')),
        );
      }
    },
    [dispatch, customer],
  );
  return (
    <form onSubmit={props.handleSubmit(update)}>
      <Modal.Header>
        <Modal.Title>
          {translate('Update permission of {name}', {
            name: props.resolve.permission.offering_name,
          })}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <FormContainer submitting={props.submitting}>
          <Field
            name="expiration_time"
            label={translate('Expiration time')}
            component={DateField}
            {...datePickerOverlayContainerInDialogs()}
          />
        </FormContainer>
      </Modal.Body>
      <Modal.Footer>
        <SubmitButton block={false} submitting={props.submitting}>
          {translate('Update')}
        </SubmitButton>
        <CloseDialogButton />
      </Modal.Footer>
    </form>
  );
};

const mapStateToProps = (_state, ownProps) => ({
  initialValues: {
    expiration_time: ownProps.resolve.permission.expiration_time,
  },
});

const enhance = compose(
  connect(mapStateToProps),
  reduxForm({
    form: UPDATE_OFFERING_PERMISSION_EXPIRATION_TIME_FORM_ID,
  }),
);

export const UpdateOfferingPermissionExpirationTimeDialog = enhance(
  PureUpdateOfferingPermissionExpirationTimeDialog,
);
