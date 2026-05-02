import { PlusCircleIcon } from '@phosphor-icons/react';
import { connect } from 'react-redux';
import { FieldArray, reduxForm } from 'redux-form';
import {
  marketplaceProviderOfferingsUpdateIntegration,
  ProviderOfferingDetails,
} from 'waldur-js-client';

import { IconButton } from '@/core/buttons/IconButton';
import { SubmitButton } from '@/form';
import { translate } from '@/i18n';
import { CloseDialogButton } from '@/modal/CloseDialogButton';
import { ModalDialog } from '@/modal/ModalDialog';
import { useManagedMutation } from '@/modal/useManagedMutation';

import { ENVIRON_FORM_ID } from './constants';
import { EnvironmentVariablesList } from './EnvironmentVariablesList';

export interface EditVarsDialogOwnProps {
  resolve: { offering: ProviderOfferingDetails; type?; refetch?(): void };
}

export const EditVarsDialog = connect<{}, {}, EditVarsDialogOwnProps>(
  (_, ownProps) => ({
    initialValues: {
      environ: ownProps.resolve.offering.secret_options.environ,
    },
  }),
)(
  reduxForm<{}, EditVarsDialogOwnProps>({
    form: ENVIRON_FORM_ID,
  })((props) => {
    const updateMutation = useManagedMutation<any, any, any>({
      mutationFn: (formData) =>
        marketplaceProviderOfferingsUpdateIntegration({
          path: { uuid: props.resolve.offering.uuid },
          body: {
            // @ts-ignore
            secret_options: {
              ...props.resolve.offering.secret_options,
              environ: formData.environ,
            },
          },
        }),
      successMessage: translate(
        'Environment variables have been updated successfully.',
      ),
      errorMessage: translate('Unable to update environment variables.'),
      refetch: props.resolve.refetch,
    });
    return (
      <FieldArray
        name="environ"
        component={(nestedProps) => (
          <form
            onSubmit={props.handleSubmit((values) =>
              updateMutation.mutateAsync(values),
            )}
          >
            <ModalDialog
              title={translate('Edit environment variables')}
              actions={
                <IconButton
                  iconNode={<PlusCircleIcon weight="bold" />}
                  tooltip={translate('Add variable')}
                  onClick={() => nestedProps.fields.push({})}
                />
              }
              footer={
                <>
                  <CloseDialogButton />
                  <SubmitButton
                    disabled={props.invalid}
                    submitting={props.submitting}
                    label={translate('Save')}
                  />
                </>
              }
            >
              <EnvironmentVariablesList fields={nestedProps.fields} />
            </ModalDialog>
          </form>
        )}
      />
    );
  }),
);
