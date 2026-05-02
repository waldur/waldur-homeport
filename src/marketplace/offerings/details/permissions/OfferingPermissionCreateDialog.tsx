import { FC } from 'react';
import { Field, Form } from 'react-final-form';
import { useSelector } from 'react-redux';
import { marketplaceProviderOfferingsAddUser } from 'waldur-js-client';

import { required } from '@/core/validators';
import { usersAutocomplete } from '@/customer/team/utils';
import { SubmitButton } from '@/form';
import { AsyncSelectFieldFinal } from '@/form/AsyncSelectField';
import { DateTimeField } from '@/form/DateTimeField';
import { translate } from '@/i18n';
import { providerOfferingsAutocomplete } from '@/marketplace/common/autocompletes';
import { FormGroup } from '@/marketplace/offerings/FormGroup';
import { CloseDialogButton } from '@/modal/CloseDialogButton';
import { ModalDialog } from '@/modal/ModalDialog';
import { useManagedMutation } from '@/modal/useManagedMutation';
import { RoleEnum } from '@/permissions/enums';
import { getCustomer } from '@/workspace/selectors';

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
  const customer = useSelector(getCustomer);

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
            <FormGroup label={translate('User')} required>
              <AsyncSelectFieldFinal
                name="user"
                placeholder={translate('Select user...')}
                loadOptions={(query, prevOptions, page) =>
                  usersAutocomplete({ full_name: query }, prevOptions, page)
                }
                getOptionLabel={({ full_name, email }) => full_name || email}
                validate={required}
              />
            </FormGroup>

            {!offering && (
              <FormGroup label={translate('Offering')} required>
                <AsyncSelectFieldFinal
                  name="offering"
                  placeholder={translate('Select offering...')}
                  loadOptions={(query, prevOptions, page) =>
                    providerOfferingsAutocomplete(
                      { name: query, shared: true, customer: customer.url },
                      prevOptions,
                      page,
                    )
                  }
                  getOptionLabel={({ name }) => name}
                  validate={required}
                />
              </FormGroup>
            )}

            <FormGroup label={translate('Expiration time')}>
              <Field
                name="expiration_time"
                component={DateTimeField as any}
                placeholder={translate('Select a date')}
              />
            </FormGroup>
          </ModalDialog>
        </form>
      )}
    </Form>
  );
};
