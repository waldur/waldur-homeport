import { PlusCircleIcon } from '@phosphor-icons/react';
import { Field, Form } from 'react-final-form';
import { useDispatch } from 'react-redux';
import {
  AffiliatedOrganizationRequest,
  affiliatedOrganizationsCreate,
  affiliatedOrganizationsPartialUpdate,
} from 'waldur-js-client';

import { required } from '@waldur/core/validators';
import { FormGroup, SubmitButton } from '@waldur/form';
import { CountrySelectField } from '@waldur/form/CountrySelectField';
import { StringField } from '@waldur/form/StringField';
import { TextField } from '@waldur/form/TextField';
import { translate } from '@waldur/i18n';
import { closeModalDialog } from '@waldur/modal/actions';
import { ModalDialog } from '@waldur/modal/ModalDialog';
import { showErrorResponse, showSuccess } from '@waldur/store/notify';

export const AffiliatedOrganizationForm = ({ resolve }) => {
  const isEdit = Boolean(resolve.affiliatedOrganization?.uuid);
  const dispatch = useDispatch();

  const onSubmit = async (values: AffiliatedOrganizationRequest) => {
    try {
      if (isEdit) {
        await affiliatedOrganizationsPartialUpdate({
          path: { uuid: resolve.affiliatedOrganization.uuid },
          body: values,
        });
      } else {
        await affiliatedOrganizationsCreate({ body: values });
      }
      resolve.refetch();
      dispatch(
        showSuccess(
          isEdit
            ? translate('The affiliated organization has been updated.')
            : translate('The affiliated organization has been created.'),
        ),
      );
      dispatch(closeModalDialog());
    } catch (e) {
      dispatch(
        showErrorResponse(
          e,
          isEdit
            ? translate('Unable to update affiliated organization.')
            : translate('Unable to create affiliated organization.'),
        ),
      );
    }
  };

  return (
    <Form
      onSubmit={onSubmit}
      initialValues={
        resolve.affiliatedOrganization
          ? {
              name: resolve.affiliatedOrganization.name,
              code: resolve.affiliatedOrganization.code,
              abbreviation: resolve.affiliatedOrganization.abbreviation,
              description: resolve.affiliatedOrganization.description,
              email: resolve.affiliatedOrganization.email,
              homepage: resolve.affiliatedOrganization.homepage,
              country: resolve.affiliatedOrganization.country,
              address: resolve.affiliatedOrganization.address,
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
                    name: resolve.affiliatedOrganization.name,
                  })
                : translate('Create affiliated organization')
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
              name="name"
              component={FormGroup as any}
              label={translate('Name')}
              required
              validate={required}
            >
              <StringField />
            </Field>
            <Field
              name="code"
              component={FormGroup as any}
              label={translate('Code')}
              required
              validate={required}
              description={translate(
                'Unique short identifier, e.g. CERN, EMBL',
              )}
            >
              <StringField />
            </Field>
            <Field
              name="abbreviation"
              component={FormGroup as any}
              label={translate('Abbreviation')}
            >
              <StringField />
            </Field>
            <Field
              name="description"
              component={FormGroup as any}
              label={translate('Description')}
            >
              <TextField />
            </Field>
            <Field
              name="email"
              component={FormGroup as any}
              label={translate('Email')}
            >
              <StringField />
            </Field>
            <Field
              name="homepage"
              component={FormGroup as any}
              label={translate('Homepage')}
            >
              <StringField />
            </Field>
            <Field
              name="country"
              component={FormGroup as any}
              label={translate('Country')}
            >
              <CountrySelectField />
            </Field>
            <Field
              name="address"
              component={FormGroup as any}
              label={translate('Address')}
            >
              <TextField />
            </Field>
          </ModalDialog>
        </form>
      )}
    />
  );
};
