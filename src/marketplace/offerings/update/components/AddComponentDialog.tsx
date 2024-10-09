import { useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';
import { Modal } from 'react-bootstrap';
import { useDispatch } from 'react-redux';
import { reduxForm } from 'redux-form';

import { SubmitButton } from '@waldur/form';
import { translate } from '@waldur/i18n';
import { createProviderOfferingComponent } from '@waldur/marketplace/common/api';
import { PROVIDER_OFFERING_DATA_QUERY_KEY } from '@waldur/marketplace/offerings/constants';
import { OfferingData } from '@waldur/marketplace/offerings/OfferingEditUIView';
import { closeModalDialog } from '@waldur/modal/actions';
import { showErrorResponse, showSuccess } from '@waldur/store/notify';

import { formatComponent } from '../../store/utils';

import { ComponentForm } from './ComponentForm';
import { ADD_COMPONENT_FORM_ID } from './constants';

export const AddComponentDialog = reduxForm<
  {},
  { resolve: { offering; refetch } }
>({
  form: ADD_COMPONENT_FORM_ID,
})((props) => {
  const dispatch = useDispatch();
  const queryClient = useQueryClient();
  const update = useCallback(
    async (formData) => {
      const newComponents = [
        ...props.resolve.offering.components,
        formatComponent(formData),
      ];
      try {
        await createProviderOfferingComponent(
          props.resolve.offering.uuid,
          formatComponent(formData),
        );
        dispatch(
          showSuccess(
            translate('Billing component has been created successfully.'),
          ),
        );
        queryClient.setQueryData<OfferingData>(
          [PROVIDER_OFFERING_DATA_QUERY_KEY, props.resolve.offering.uuid],
          (oldData) => ({
            ...oldData,
            offering: { ...oldData.offering, components: newComponents },
          }),
        );
        dispatch(closeModalDialog());
      } catch (error) {
        dispatch(
          showErrorResponse(
            error,
            translate('Unable to create billing component.'),
          ),
        );
      }
    },
    [dispatch],
  );
  return (
    <form onSubmit={props.handleSubmit(update)}>
      <Modal.Header>
        <Modal.Title>{translate('Add component')}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <ComponentForm />
      </Modal.Body>
      <Modal.Footer>
        <SubmitButton
          disabled={props.invalid}
          submitting={props.submitting}
          label={translate('Create')}
        />
      </Modal.Footer>
    </form>
  );
});
