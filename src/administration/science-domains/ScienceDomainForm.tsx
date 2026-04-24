import { PlusCircleIcon } from '@phosphor-icons/react';
import { Field, Form } from 'react-final-form';
import { useDispatch } from 'react-redux';
import {
  ScienceDomainRequest,
  scienceDomainsCreate,
  scienceDomainsPartialUpdate,
} from 'waldur-js-client';

import { required } from '@waldur/core/validators';
import { FormGroup, SubmitButton } from '@waldur/form';
import { StringField } from '@waldur/form/StringField';
import { translate } from '@waldur/i18n';
import { closeModalDialog } from '@waldur/modal/actions';
import { ModalDialog } from '@waldur/modal/ModalDialog';
import { showErrorResponse, showSuccess } from '@waldur/store/notify';

export const ScienceDomainForm = ({ resolve }) => {
  const isEdit = Boolean(resolve.scienceDomain?.uuid);
  const dispatch = useDispatch();

  const onSubmit = async (values: ScienceDomainRequest) => {
    try {
      if (isEdit) {
        await scienceDomainsPartialUpdate({
          path: { uuid: resolve.scienceDomain.uuid },
          body: values,
        });
      } else {
        await scienceDomainsCreate({ body: values });
      }
      resolve.refetch();
      dispatch(
        showSuccess(
          isEdit
            ? translate('The science domain has been updated.')
            : translate('The science domain has been created.'),
        ),
      );
      dispatch(closeModalDialog());
    } catch (e) {
      dispatch(
        showErrorResponse(
          e,
          isEdit
            ? translate('Unable to update science domain.')
            : translate('Unable to create science domain.'),
        ),
      );
    }
  };

  return (
    <Form
      onSubmit={onSubmit}
      initialValues={
        resolve.scienceDomain
          ? {
              name: resolve.scienceDomain.name,
              code: resolve.scienceDomain.code,
            }
          : undefined
      }
      render={({ handleSubmit, submitting, invalid }) => (
        <form onSubmit={handleSubmit}>
          <ModalDialog
            iconNode={isEdit ? null : <PlusCircleIcon weight="bold" />}
            iconColor="success"
            title={
              isEdit
                ? translate('Edit {name}', {
                    name: resolve.scienceDomain.name,
                  })
                : translate('Create science domain')
            }
            closeButton
            footer={
              <SubmitButton
                disabled={invalid || submitting}
                submitting={submitting}
                label={isEdit ? translate('Edit') : translate('Create')}
              />
            }
          >
            <Field
              name="code"
              component={FormGroup as any}
              label={translate('Code')}
              description={translate('Auto-generated if left blank.')}
            >
              <StringField />
            </Field>
            <Field
              name="name"
              component={FormGroup as any}
              label={translate('Name')}
              required
              validate={required}
            >
              <StringField />
            </Field>
          </ModalDialog>
        </form>
      )}
    />
  );
};
