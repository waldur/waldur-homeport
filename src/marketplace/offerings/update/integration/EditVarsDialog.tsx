import { PlusCircleIcon } from '@phosphor-icons/react';
import { useCallback } from 'react';
import { Button } from 'react-bootstrap';
import { connect, useDispatch } from 'react-redux';
import { FieldArray, reduxForm } from 'redux-form';
import {
  marketplaceProviderOfferingsUpdateIntegration,
  ProviderOfferingDetails,
} from 'waldur-js-client';

import { SubmitButton } from '@waldur/form';
import { translate } from '@waldur/i18n';
import { closeModalDialog } from '@waldur/modal/actions';
import { CloseDialogButton } from '@waldur/modal/CloseDialogButton';
import { ModalDialog } from '@waldur/modal/ModalDialog';
import { showErrorResponse, showSuccess } from '@waldur/store/notify';

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
    const dispatch = useDispatch();
    const update = useCallback(
      async (formData) => {
        try {
          await marketplaceProviderOfferingsUpdateIntegration({
            path: { uuid: props.resolve.offering.uuid },
            body: {
              // @ts-ignore
              secret_options: {
                ...props.resolve.offering.secret_options,
                environ: formData.environ,
              },
            },
          });
          dispatch(
            showSuccess(
              translate(
                'Environment variables have been updated successfully.',
              ),
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
              translate('Unable to update environment variables.'),
            ),
          );
        }
      },
      [dispatch],
    );
    return (
      <FieldArray
        name="environ"
        component={(nestedProps) => (
          <form onSubmit={props.handleSubmit(update)}>
            <ModalDialog
              title={translate('Edit environment variables')}
              actions={
                <Button
                  variant="outline btn-outline-default"
                  className="btn-icon"
                  onClick={() => nestedProps.fields.push({})}
                >
                  <span className="svg-icon svg-icon-2">
                    <PlusCircleIcon weight="bold" />
                  </span>
                </Button>
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
