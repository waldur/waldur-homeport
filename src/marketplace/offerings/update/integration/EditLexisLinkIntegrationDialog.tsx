import { useCallback } from 'react';
import { connect, useDispatch } from 'react-redux';
import { FormSection, reduxForm } from 'redux-form';
import {
  marketplaceProviderOfferingsUpdateIntegration,
  MergedPluginOptionsRequest,
  MergedSecretOptionsRequest,
} from 'waldur-js-client';

import { FormContainer, SubmitButton } from '@waldur/form';
import { translate } from '@waldur/i18n';
import { UserLexisLinkPluginOptionsForm } from '@waldur/marketplace/UserLexisLInkPluginOptionsForm';
import { UserLexisLinkSecretOptionsForm } from '@waldur/marketplace/UserLexisLInkSecretOptionsForm';
import { closeModalDialog } from '@waldur/modal/actions';
import { CloseDialogButton } from '@waldur/modal/CloseDialogButton';
import { ModalDialog } from '@waldur/modal/ModalDialog';
import { showErrorResponse, showSuccess } from '@waldur/store/notify';

import { EDIT_LEXIS_LINK_INTEGRATION_FORM_ID } from './constants';
interface EditLexisLinkIntegrationDialogProps {
  resolve: { offering; refetch };
}
type FormData = {
  secret_options?: MergedSecretOptionsRequest;
  plugin_options?: MergedPluginOptionsRequest;
};
export const EditLexisLinkIntegrationDialog = connect<
  {},
  {},
  EditLexisLinkIntegrationDialogProps
>((_, ownProps) => ({
  initialValues: {
    secret_options: ownProps.resolve.offering.secret_options,
    plugin_options: ownProps.resolve.offering.plugin_options,
  },
}))(
  reduxForm<FormData, EditLexisLinkIntegrationDialogProps>({
    form: EDIT_LEXIS_LINK_INTEGRATION_FORM_ID,
  })((props) => {
    const dispatch = useDispatch();
    const update = useCallback(
      async (formData: FormData) => {
        try {
          await marketplaceProviderOfferingsUpdateIntegration({
            path: { uuid: props.resolve.offering.uuid },
            body: formData,
          });
          dispatch(
            showSuccess(
              translate(
                'Offering LEXIS link options have been updated successfully.',
              ),
            ),
          );
          await props.resolve.refetch();
          dispatch(closeModalDialog());
        } catch (error) {
          dispatch(
            showErrorResponse(
              error,
              translate('Unable to update offering LEXIS link options.'),
            ),
          );
        }
      },
      [dispatch],
    );

    return (
      <form onSubmit={props.handleSubmit(update)}>
        <ModalDialog
          title={translate('Update LEXIS link options')}
          footer={
            <>
              <CloseDialogButton />
              <SubmitButton
                submitting={props.submitting}
                label={translate('Save')}
              />
            </>
          }
        >
          <FormContainer {...props}>
            <FormSection name="secret_options">
              <UserLexisLinkSecretOptionsForm />
            </FormSection>
            <FormSection name="plugin_options">
              <UserLexisLinkPluginOptionsForm />
            </FormSection>
          </FormContainer>
        </ModalDialog>
      </form>
    );
  }),
);
