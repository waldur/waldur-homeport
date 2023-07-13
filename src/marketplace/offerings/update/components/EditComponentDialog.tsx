import { useCallback } from 'react';
import { Modal } from 'react-bootstrap';
import { connect, useDispatch } from 'react-redux';
import { reduxForm } from 'redux-form';

import { SubmitButton } from '@waldur/form';
import { translate } from '@waldur/i18n';
import { updateProviderOfferingComponents } from '@waldur/marketplace/common/api';
import { closeModalDialog } from '@waldur/modal/actions';
import { showErrorResponse, showSuccess } from '@waldur/store/notify';

import { formatComponent } from '../../store/utils';
import { parseComponent } from '../utils';

import { ComponentForm } from './ComponentForm';
import { EDIT_COMPONENT_FORM_ID } from './constants';

type OwnProps = { resolve: { offering; component; refetch } };

export const EditComponentDialog = connect<{}, {}, OwnProps>((_, ownProps) => ({
  initialValues: parseComponent(ownProps.resolve.component),
}))(
  reduxForm<{}, OwnProps>({
    form: EDIT_COMPONENT_FORM_ID,
  })((props) => {
    const dispatch = useDispatch();
    const update = useCallback(
      async (formData) => {
        const newComponents = [
          ...props.resolve.offering.components.filter(
            (item) => item.uuid !== props.resolve.component.uuid,
          ),
          formatComponent(formData),
        ];
        try {
          await updateProviderOfferingComponents(
            props.resolve.offering.uuid,
            newComponents,
          );
          dispatch(
            showSuccess(
              translate('Billing component has been updated successfully.'),
            ),
          );
          if (props.resolve.refetch) {
            await props.resolve.refetch();
          }
          dispatch(closeModalDialog());
        } catch (error) {
          dispatch(
            showErrorResponse(
              error,
              translate('Unable to update billing component.'),
            ),
          );
        }
      },
      [dispatch],
    );
    return (
      <form onSubmit={props.handleSubmit(update)}>
        <Modal.Header>
          <Modal.Title>{translate('Edit component')}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <ComponentForm />
        </Modal.Body>
        <Modal.Footer>
          <SubmitButton
            disabled={props.invalid}
            submitting={props.submitting}
            label={translate('Save')}
          />
        </Modal.Footer>
      </form>
    );
  }),
);
