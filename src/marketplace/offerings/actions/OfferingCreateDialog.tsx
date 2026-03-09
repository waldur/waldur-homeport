import { PlusCircleIcon } from '@phosphor-icons/react';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from '@uirouter/react';
import { Form } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
import { reduxForm } from 'redux-form';
import { Field } from 'redux-form';
import {
  BillingUnit,
  marketplaceProviderOfferingsCreate,
} from 'waldur-js-client';

import { LoadingErred } from '@waldur/core/LoadingErred';
import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { required } from '@waldur/core/validators';
import {
  FormContainer,
  SelectField,
  StringField,
  SubmitButton,
} from '@waldur/form';
import { AsyncPaginate } from '@waldur/form/themed-select';
import { translate } from '@waldur/i18n';
import { getCategories } from '@waldur/marketplace/common/api';
import { organizationAutocomplete } from '@waldur/marketplace/common/autocompletes';
import { getCreatableOfferings } from '@waldur/marketplace/common/registry';
import { closeModalDialog } from '@waldur/modal/actions';
import { CloseDialogButton } from '@waldur/modal/CloseDialogButton';
import { ModalDialog } from '@waldur/modal/ModalDialog';
import { showErrorResponse, showSuccess } from '@waldur/store/notify';
import { getCustomer } from '@waldur/workspace/selectors';

import { OFFERING_CREATE_FORM_ID } from './constants';
import { OfferingCreateFormData } from './types';

export const OfferingCreateDialog = reduxForm<
  OfferingCreateFormData,
  { resolve: { fetch; showProvider?: boolean } }
>({
  form: OFFERING_CREATE_FORM_ID,
})(({
  handleSubmit,
  submitting,
  invalid,
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

  const customer = useSelector(getCustomer);
  const dispatch = useDispatch();
  const router = useRouter();
  const saveOffering = async (formData: OfferingCreateFormData) => {
    // create a default plan while creating offering [WAL-7969]
    const plan_payload = {
      name: 'Default',
      unit: 'month' as BillingUnit,
    };

    try {
      const response = await marketplaceProviderOfferingsCreate({
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
      dispatch(showSuccess(translate('Offering has been created.')));
      if (fetch) {
        await fetch();
      }
      dispatch(closeModalDialog());
      router.stateService.go('marketplace-offering-update', {
        uuid: formData.organisation
          ? formData.organisation.uuid
          : customer.uuid,
        offering_uuid: response.data.uuid,
      });
    } catch (e) {
      dispatch(showErrorResponse(e, translate('Unable to create offering.')));
    }
  };
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
    <form
      onSubmit={handleSubmit(saveOffering)}
      data-testid="offering-create-dialog"
    >
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
        <FormContainer submitting={submitting}>
          {showProvider && (
            <div className="form-group mb-5">
              <Form.Label className="form-label">
                {translate('Service provider')}
              </Form.Label>
              <Field
                name="organisation"
                validate={required}
                component={(fieldProps) => (
                  <AsyncPaginate
                    placeholder={translate('Select service provider...')}
                    loadOptions={(query, prevOptions, { page }) =>
                      organizationAutocomplete(query, prevOptions, page, {
                        field: ['name', 'url', 'uuid'],
                        o: 'name',
                        is_service_provider: true,
                      })
                    }
                    defaultOptions
                    getOptionValue={(option) => option.url}
                    getOptionLabel={(option) => option.name}
                    value={fieldProps.input.value}
                    onChange={(value) => fieldProps.input.onChange(value)}
                    noOptionsMessage={() => translate('No service providers')}
                    isClearable={true}
                    className="metronic-select-container"
                    classNamePrefix="metronic-select"
                  />
                )}
              />
            </div>
          )}
          <StringField
            name="name"
            label={translate('Name')}
            required={true}
            validate={required}
            maxLength={150}
          />

          <SelectField
            name="category"
            label={translate('Category')}
            options={data.categories}
            required={true}
            getOptionValue={(option) => option.url}
            getOptionLabel={(option) => option.title}
            isClearable={false}
            validate={required}
            data-testid="offering-category"
          />

          <SelectField
            name="type"
            label={translate('Type')}
            required={true}
            options={data.offeringTypes}
            isClearable={false}
            validate={required}
            spaceless
            data-testid="offering-type"
          />
        </FormContainer>
      </ModalDialog>
    </form>
  );
});
