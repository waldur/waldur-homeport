import { FC, useMemo } from 'react';
import { Form } from 'react-final-form';
import { marketplaceProviderOfferingsAddUser } from 'waldur-js-client';

import { required } from '@/core/validators';
import { usersAutocomplete } from '@/customer/team/utils';
import { AsyncSelectGroup, DateTimeGroup, SubmitButton } from '@/form';
import { translate } from '@/i18n';
import { providerOfferingsAutocomplete } from '@/marketplace/common/autocompletes';
import { CloseDialogButton } from '@/modal/CloseDialogButton';
import { ModalDialog } from '@/modal/ModalDialog';
import { useManagedMutation } from '@/modal/useManagedMutation';
import { RoleEnum } from '@/permissions/enums';
import { useCustomer } from '@/workspace/hooks';

interface OwnProps {
  resolve: {
    /** If no offering is given, will show a selector field for it. */
    offering?;
    refetch;
  };
}

export const OfferingPermissionCreateDialog: FC<OwnProps> = ({
  resolve: { refetch, offering },
}) => {
  const customer = useCustomer();

  const loadOfferings = useMemo(
    () =>
      providerOfferingsAutocomplete({ shared: true, customer: customer.url }),
    [customer.url],
  );

  const saveUserMutation = useManagedMutation<any, any, any>({
    mutationFn: (formData) => {
      const _offering = offering || formData.offering;
      return marketplaceProviderOfferingsAddUser({
        path: { uuid: _offering.uuid },
        body: {
          role: RoleEnum.OFFERING_MANAGER,
          user: formData.user.uuid,
          expiration_time: formData.expiration_time,
        },
      });
    },
    errorMessage: translate('Unable to grant permission.'),
    refetch,
  });

  return (
    <Form onSubmit={(values) => saveUserMutation.mutateAsync(values)}>
      {({ handleSubmit, submitting, invalid }) => (
        <form onSubmit={handleSubmit}>
          <ModalDialog
            title={translate('Grant permission')}
            footer={
              <>
                <CloseDialogButton className="min-w-125px" />
                <SubmitButton
                  label={translate('Submit')}
                  submitting={submitting}
                  disabled={invalid}
                  className="btn btn-primary min-w-125px"
                />
              </>
            }
          >
            <AsyncSelectGroup
              label={translate('User')}
              required
              name="user"
              placeholder={translate('Select user...')}
              loadOptions={usersAutocomplete}
              getOptionLabel={({ full_name, email }) => full_name || email}
              validate={required}
            />

            {!offering && (
              <AsyncSelectGroup
                label={translate('Offering')}
                required
                name="offering"
                placeholder={translate('Select offering...')}
                loadOptions={loadOfferings}
                getOptionLabel={({ name }) => name}
                validate={required}
              />
            )}

            <DateTimeGroup
              label={translate('Expiration time')}
              name="expiration_time"
              placeholder={translate('Select a date')}
            />
          </ModalDialog>
        </form>
      )}
    </Form>
  );
};
