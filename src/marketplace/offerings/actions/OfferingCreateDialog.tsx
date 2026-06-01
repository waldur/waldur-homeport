import { PlusCircleIcon } from '@phosphor-icons/react';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from '@uirouter/react';
import { FC, useMemo } from 'react';
import { Form } from 'react-final-form';
import {
  BillingUnit,
  marketplaceProviderOfferingsCreate,
} from 'waldur-js-client';

import { LoadingErred } from '@/core/LoadingErred';
import { LoadingSpinner } from '@/core/LoadingSpinner';
import { required } from '@/core/validators';
import {
  SubmitButton,
  AsyncSelectGroup,
  StringGroup,
  SelectGroup,
} from '@/form';
import { translate } from '@/i18n';
import { getCategories } from '@/marketplace/common/api';
import { organizationAutocomplete } from '@/marketplace/common/autocompletes';
import { getCreatableOfferings } from '@/marketplace/common/registry';
import { CloseDialogButton } from '@/modal/CloseDialogButton';
import { ModalDialog } from '@/modal/ModalDialog';
import { useManagedMutation } from '@/modal/useManagedMutation';
import { useCustomer } from '@/workspace/hooks';

import { OfferingCreateFormData } from './types';

interface OfferingCreateDialogProps {
  resolve: {
    fetch;
    showProvider?: boolean;
  };
}

export const OfferingCreateDialog: FC<OfferingCreateDialogProps> = ({
  resolve: { fetch, showProvider = false },
}) => {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['OfferingCreateDialog'],

    queryFn: async () => {
      const categories = await getCategories();
      const offeringTypes = getCreatableOfferings();
      return { categories, offeringTypes };
    },
  });

  const customer = useCustomer();
  const router = useRouter();

  const loadOrganizations = useMemo(
    () =>
      organizationAutocomplete({
        field: ['name', 'url', 'uuid'],
        o: 'name',
        is_service_provider: true,
      }),
    [],
  );

  const saveOfferingMutation = useManagedMutation<
    any,
    any,
    OfferingCreateFormData
  >({
    mutationFn: (formData) => {
      const plan_payload = {
        name: 'Default',
        unit: 'month' as BillingUnit,
      };
      return marketplaceProviderOfferingsCreate({
        body: {
          name: formData.name,
          customer: formData.organisation
            ? formData.organisation.url
            : customer.url,
          category: formData.category.url,
          type: formData.type.value,
          plans: [plan_payload],
        },
      });
    },
    successMessage: translate('Offering has been created.'),
    errorMessage: translate('Unable to create offering.'),
    refetch: fetch,
    onSuccess: (response, formData) => {
      router.stateService.go('marketplace-offering-update', {
        uuid: formData.organisation
          ? formData.organisation.uuid
          : customer.uuid,
        offering_uuid: response.data.uuid,
      });
    },
  });

  if (isLoading) {
    return <LoadingSpinner />;
  }
  if (error) {
    return (
      <LoadingErred
        message={translate('Unable to load data')}
        loadData={refetch}
        className="mb-4"
      />
    );
  }

  return (
    <Form<OfferingCreateFormData>
      onSubmit={(values) => saveOfferingMutation.mutateAsync(values)}
      render={({ handleSubmit, submitting, invalid }) => (
        <form onSubmit={handleSubmit} data-testid="offering-create-dialog">
          <ModalDialog
            title={translate('New offering')}
            footer={
              <>
                <CloseDialogButton />
                <SubmitButton
                  submitting={submitting}
                  disabled={invalid}
                  label={translate('Create')}
                  data-testid="offering-create-submit"
                />
              </>
            }
            iconNode={<PlusCircleIcon weight="bold" />}
            iconColor="success"
          >
            <div className="size-sm">
              {showProvider && (
                <AsyncSelectGroup
                  name="organisation"
                  label={translate('Service provider')}
                  validate={required}
                  required
                  placeholder={translate('Select service provider...')}
                  loadOptions={loadOrganizations}
                  getOptionValue={(option) => option.url}
                  noOptionsMessage={() => translate('No service providers')}
                  isClearable={true}
                  disabled={submitting}
                />
              )}
              <StringGroup
                name="name"
                label={translate('Name')}
                required={true}
                validate={required}
                maxLength={150}
                disabled={submitting}
              />

              <SelectGroup
                name="category"
                label={translate('Category')}
                options={data.categories}
                required={true}
                getOptionValue={(option) => option.url}
                getOptionLabel={(option) => option.title}
                isClearable={false}
                validate={required}
                data-testid="offering-category"
                disabled={submitting}
              />

              <SelectGroup
                name="type"
                label={translate('Type')}
                required={true}
                options={data.offeringTypes}
                isClearable={false}
                validate={required}
                spaceless
                data-testid="offering-type"
                disabled={submitting}
              />
            </div>
          </ModalDialog>
        </form>
      )}
    />
  );
};
