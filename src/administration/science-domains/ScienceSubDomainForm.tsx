import { PlusCircleIcon } from '@phosphor-icons/react';
import { Field, Form } from 'react-final-form';
import { useDispatch } from 'react-redux';
import {
  scienceSubDomainsCreate,
  scienceSubDomainsPartialUpdate,
} from 'waldur-js-client';

import { required } from '@waldur/core/validators';
import { FormGroup, SubmitButton } from '@waldur/form';
import { StringField } from '@waldur/form/StringField';
import { translate } from '@waldur/i18n';
import { closeModalDialog } from '@waldur/modal/actions';
import { ModalDialog } from '@waldur/modal/ModalDialog';
import { showErrorResponse, showSuccess } from '@waldur/store/notify';

export const ScienceSubDomainForm = ({ resolve }) => {
  const isEdit = Boolean(resolve.scienceSubDomain?.uuid);
  const dispatch = useDispatch();

  const onSubmit = async (values: { name: string; code?: string }) => {
    try {
      if (isEdit) {
        await scienceSubDomainsPartialUpdate({
          path: { uuid: resolve.scienceSubDomain.uuid },
          body: {
            name: values.name,
            code: values.code,
            domain: resolve.scienceSubDomain.domain,
          },
        });
      } else {
        await scienceSubDomainsCreate({
          body: {
            name: values.name,
            code: values.code,
            domain: resolve.domainUrl,
          },
        });
      }
      resolve.refetch();
      dispatch(
        showSuccess(
          isEdit
            ? translate('The science sub-domain has been updated.')
            : translate('The science sub-domain has been created.'),
        ),
      );
      dispatch(closeModalDialog());
    } catch (e) {
      dispatch(
        showErrorResponse(
          e,
          isEdit
            ? translate('Unable to update science sub-domain.')
            : translate('Unable to create science sub-domain.'),
        ),
      );
    }
  };

  return (
    <Form
      onSubmit={onSubmit}
      initialValues={
        resolve.scienceSubDomain
          ? {
              name: resolve.scienceSubDomain.name,
              code: resolve.scienceSubDomain.code,
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
                    name: resolve.scienceSubDomain.name,
                  })
                : translate('Create science sub-domain')
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
