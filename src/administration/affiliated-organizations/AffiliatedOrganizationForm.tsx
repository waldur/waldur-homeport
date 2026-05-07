import { PlusCircleIcon } from '@phosphor-icons/react';
import { Field, Form } from 'react-final-form';
import {
  AffiliatedOrganizationRequest,
  affiliatedOrganizationsCreate,
  affiliatedOrganizationsPartialUpdate,
} from 'waldur-js-client';

import { required } from '@/core/validators';
import { FormGroup, SubmitButton } from '@/form';
import { CountrySelectField } from '@/form/CountrySelectField';
import { StringField } from '@/form/StringField';
import { TextField } from '@/form/TextField';
import { translate } from '@/i18n';
import { ModalDialog } from '@/modal/ModalDialog';
import { useManagedMutation } from '@/modal/useManagedMutation';

export const AffiliatedOrganizationForm = ({ resolve }) => {
  const isEdit = Boolean(resolve.affiliatedOrganization?.uuid);
  const onSubmitMutation = useManagedMutation<
    any,
    any,
    AffiliatedOrganizationRequest
  >({
    mutationFn: (values) =>
      isEdit
        ? affiliatedOrganizationsPartialUpdate({
            path: { uuid: resolve.affiliatedOrganization.uuid },
            body: values,
          })
        : affiliatedOrganizationsCreate({ body: values }),
    successMessage: isEdit
      ? translate('The affiliation has been updated.')
      : translate('The affiliation has been created.'),
    errorMessage: isEdit
      ? translate('Unable to update affiliation.')
      : translate('Unable to create affiliation.'),
    refetch: resolve.refetch,
  });

  return (
    <Form<AffiliatedOrganizationRequest>
      onSubmit={(values) => onSubmitMutation.mutateAsync(values)}
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
                : translate('Create affiliation')
            }
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
