import { PlusCircleIcon } from '@phosphor-icons/react';
import { useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { reduxForm } from 'redux-form';
import { marketplaceProviderOfferingsCreateOfferingComponent } from 'waldur-js-client';

import { SubmitButton } from '@waldur/form';
import { translate } from '@waldur/i18n';
import { closeModalDialog } from '@waldur/modal/actions';
import { CloseDialogButton } from '@waldur/modal/CloseDialogButton';
import { ModalDialog } from '@waldur/modal/ModalDialog';
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
  const update = useCallback(
    async (formData) => {
      try {
        await marketplaceProviderOfferingsCreateOfferingComponent({
          path: { uuid: props.resolve.offering.uuid },
          body: formatComponent(formData),
        });
        dispatch(
          showSuccess(
            translate('Billing component has been created successfully.'),
          ),
        );
        props.resolve.refetch();
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
      <ModalDialog
        title={translate('Add component')}
        iconNode={<PlusCircleIcon weight="bold" />}
        iconColor="success"
        closeButton
        footer={
          <>
            <CloseDialogButton className="min-w-125px" />
            <SubmitButton
              label={translate('Confirm')}
              submitting={props.submitting}
              disabled={props.invalid}
              className="btn btn-primary min-w-125px"
            />
          </>
        }
      >
        <ComponentForm offering={props.resolve.offering} />
      </ModalDialog>
    </form>
  );
});
