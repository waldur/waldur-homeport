import { useCallback } from 'react';
import { connect } from 'react-redux';
import { Field, reduxForm } from 'redux-form';
import {
  marketplaceProviderOfferingsUpdateIntegration,
  MergedSecretOptionsRequest,
} from 'waldur-js-client';

import { SubmitButton, SelectField, FormGroup } from '@waldur/form';
import { translate } from '@waldur/i18n';
import { CloseDialogButton } from '@waldur/modal/CloseDialogButton';
import { useModal } from '@waldur/modal/hooks';
import { ModalDialog } from '@waldur/modal/ModalDialog';
import { useNotify } from '@waldur/store/hooks';

import { EDIT_SCRIPT_FORM_ID } from './constants';
import { ScriptEditorProps } from './types';

type OwnProps = { resolve: ScriptEditorProps };

const PROGRAMMING_LANGUAGE_CHOICES = [
  {
    label: 'Python',
    value: 'python',
  },
  {
    label: 'Bash',
    value: 'shell',
  },
  {
    label: 'Ansible Playbook',
    value: 'ansible',
  },
];

export const EditScriptLanguageDialog = connect<{}, {}, OwnProps>(
  (_, ownProps) => ({
    initialValues: {
      language: ownProps.resolve.offering.secret_options[ownProps.resolve.type],
    },
  }),
)(
  reduxForm<{}, OwnProps>({
    form: EDIT_SCRIPT_FORM_ID,
  })((props) => {
    const { closeDialog } = useModal();
    const { showSuccess, showErrorResponse } = useNotify();

    const update = useCallback(
      async (formData) => {
        try {
          await marketplaceProviderOfferingsUpdateIntegration({
            path: { uuid: props.resolve.offering.uuid },
            body: {
              secret_options: {
                ...props.resolve.offering.secret_options,
                [props.resolve.type]: formData.language,
              } as MergedSecretOptionsRequest,
            },
          });
          showSuccess(
            translate('Script language has been updated successfully.'),
          );
          if (props.resolve.refetch) {
            await props.resolve.refetch();
          }
          closeDialog();
        } catch (error) {
          showErrorResponse(
            error,
            translate('Unable to update script language.'),
          );
        }
      },
      [props.resolve],
    );

    return (
      <form onSubmit={props.handleSubmit(update)}>
        <ModalDialog
          title={props.resolve.label}
          subtitle={translate(
            "Select the language to be used for the offering {name}'s custom scripts",
            { name: props.resolve.offering.name },
          )}
          closeButton
          footer={
            <>
              <CloseDialogButton className="flex-equal" />
              <SubmitButton
                disabled={props.invalid}
                submitting={props.submitting}
                label={translate('Confirm')}
                className="btn btn-primary flex-equal"
              />
            </>
          }
        >
          <Field
            name="language"
            component={FormGroup}
            label={props.resolve.label}
            options={PROGRAMMING_LANGUAGE_CHOICES}
            simpleValue={true}
            required={true}
            isClearable={false}
            spaceless
          >
            <SelectField />
          </Field>
        </ModalDialog>
      </form>
    );
  }),
);
