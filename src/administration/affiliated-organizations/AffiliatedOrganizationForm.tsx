import { PlusCircleIcon } from '@phosphor-icons/react';
import { Form } from 'react-final-form';
import {
  AffiliatedOrganizationRequest,
  affiliatedOrganizationsCreate,
  affiliatedOrganizationsPartialUpdate,
} from 'waldur-js-client';

import { required } from '@/core/validators';
import {
  CountrySelectGroup,
  StringGroup,
  SubmitButton,
  TextGroup,
} from '@/form';
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
      onSubmit={(values) =>
        onSubmitMutation.mutateAsync(values).catch(() => {
          // Error is handled by useManagedMutation
        })
      }
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
            <StringGroup
              name="name"
              label={translate('Name')}
              required
              validate={required}
            />
            <StringGroup
              name="code"
              label={translate('Code')}
              required
              validate={required}
              description={translate(
                'Unique short identifier, e.g. CERN, EMBL',
              )}
            />
            <StringGroup
              name="abbreviation"
              label={translate('Abbreviation')}
            />
            <TextGroup name="description" label={translate('Description')} />
            <StringGroup name="email" label={translate('Email')} />
            <StringGroup name="homepage" label={translate('Homepage')} />
            <CountrySelectGroup name="country" label={translate('Country')} />
            <TextGroup name="address" label={translate('Address')} />
          </ModalDialog>
        </form>
      )}
    />
  );
};
