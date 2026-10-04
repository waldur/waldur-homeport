import { Form } from 'react-final-form';
import { marketplaceOfferingUsersCreate } from 'waldur-js-client';

import { required } from '@/core/validators';
import { AsyncSelectGroup, FormFooter, StringGroup } from '@/form';
import { translate } from '@/i18n';
import { userAutocomplete } from '@/marketplace/common/autocompletes';
import { sharesProviderAccounts } from '@/marketplace/service-providers/accounts/ProviderAccountLink';
import { ModalDialog } from '@/modal/ModalDialog';
import { ScopeSubtitle } from '@/modal/ScopeSubtitle';
import { useManagedMutation } from '@/modal/useManagedMutation';

export const CreateOfferingUserDialog = ({
  resolve: { offering, onSuccess },
}) => {
  const providerAccounts = sharesProviderAccounts(offering);
  const mutation = useManagedMutation<
    any,
    any,
    { user: { url: string }; username?: string }
  >({
    mutationFn: (formData) =>
      marketplaceOfferingUsersCreate({
        body: {
          offering: offering.url,
          user: formData.user.url,
          ...(providerAccounts ? {} : { username: formData.username }),
        },
      }),

    successMessage: translate('Offering user has been created.'),
    errorMessage: translate('Unable to create offering user.'),
    refetch: onSuccess,
  });

  return (
    <Form
      onSubmit={mutation.mutateAsync}
      render={({ handleSubmit }) => (
        <form onSubmit={handleSubmit}>
          <ModalDialog
            title={translate('Create offering user')}
            subtitle={
              <ScopeSubtitle
                label={translate('Offering name')}
                name={offering.name}
              />
            }
            footer={<FormFooter />}
          >
            <AsyncSelectGroup
              name="user"
              label={translate('User')}
              required={true}
              defaultOptions={true}
              loadOptions={userAutocomplete}
              getOptionValue={(option) => option.url}
              getOptionLabel={({ full_name, email, username }) =>
                full_name || email || username
              }
              validate={required}
            />
            {providerAccounts ? (
              <p
                className="text-muted mb-0"
                data-testid="provider-account-note"
              >
                {translate(
                  'This offering shares accounts across the provider’s offerings: the username comes from the person’s provider account.',
                )}
              </p>
            ) : (
              <StringGroup name="username" label={translate('Username')} />
            )}
          </ModalDialog>
        </form>
      )}
    />
  );
};
