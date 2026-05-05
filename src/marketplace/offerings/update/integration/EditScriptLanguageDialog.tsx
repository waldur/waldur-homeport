import { connect } from 'react-redux';
import { Field, reduxForm } from 'redux-form';
import {
  marketplaceProviderOfferingsUpdateIntegration,
  MergedSecretOptionsRequest,
} from 'waldur-js-client';

import { SubmitButton, SelectField, FormGroup } from '@/form';
import { translate } from '@/i18n';
import { CloseDialogButton } from '@/modal/CloseDialogButton';
import { ModalDialog } from '@/modal/ModalDialog';
import { useManagedMutation } from '@/modal/useManagedMutation';

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
    const updateMutation = useManagedMutation<any, any, any>({
      mutationFn: (formData) =>
        marketplaceProviderOfferingsUpdateIntegration({
          path: { uuid: props.resolve.offering.uuid },
          body: {
            secret_options: {
              ...props.resolve.offering.secret_options,
              [props.resolve.type]: formData.language,
            } as MergedSecretOptionsRequest,
          },
        }),
      successMessage: translate(
        'Script language has been updated successfully.',
      ),
      errorMessage: translate('Unable to update script language.'),
      refetch: props.resolve.refetch,
    });

    return (
      <form
        onSubmit={props.handleSubmit((values) =>
          updateMutation.mutateAsync(values),
        )}
      >
        <ModalDialog
          title={props.resolve.label}
          subtitle={translate(
            "Select the language to be used for the offering {name}'s custom scripts",
            { name: props.resolve.offering.name },
          )}
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
