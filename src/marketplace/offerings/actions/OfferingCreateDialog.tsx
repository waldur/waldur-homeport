import { useQuery } from '@tanstack/react-query';
import { useRouter } from '@uirouter/react';
import { useDispatch, useSelector } from 'react-redux';
import { reduxForm } from 'redux-form';

import { LoadingErred } from '@waldur/core/LoadingErred';
import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { required } from '@waldur/core/validators';
import {
  FormContainer,
  SelectField,
  StringField,
  SubmitButton,
} from '@waldur/form';
import { translate } from '@waldur/i18n';
import {
  createProviderOffering,
  getCategories,
} from '@waldur/marketplace/common/api';
import { getCreatableOfferings } from '@waldur/marketplace/common/registry';
import { Category } from '@waldur/marketplace/types';
import { closeModalDialog } from '@waldur/modal/actions';
import { ModalDialog } from '@waldur/modal/ModalDialog';
import { showErrorResponse, showSuccess } from '@waldur/store/notify';
import { getCustomer } from '@waldur/workspace/selectors';

import { OFFERING_CREATE_FORM_ID } from './constants';
import { OfferingCreateFormData } from './types';

export const OfferingCreateDialog = reduxForm<
  OfferingCreateFormData,
  { resolve: { fetch } }
>({
  form: OFFERING_CREATE_FORM_ID,
})(({ handleSubmit, submitting, invalid, resolve: { fetch } }) => {
  const { data, isLoading, error, refetch } = useQuery(
    ['OfferingCreateDialog'],
    async () => {
      const categories: Category[] = await getCategories();
      const offeringTypes = getCreatableOfferings();
      return { categories, offeringTypes };
    },
  );

  const customer = useSelector(getCustomer);
  const dispatch = useDispatch();
  const router = useRouter();
  const saveOffering = async (formData: OfferingCreateFormData) => {
    try {
      const response = await createProviderOffering({
        name: formData.name,
        customer: customer.url,
        category: formData.category.url,
        type: formData.type.value,
      });
      dispatch(showSuccess(translate('Offering has been created.')));
      if (fetch) {
        await fetch();
      }
      dispatch(closeModalDialog());
      router.stateService.go('marketplace-offering-update', {
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
    <form onSubmit={handleSubmit(saveOffering)}>
      <ModalDialog title={translate('New offering')}>
        <FormContainer submitting={submitting}>
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
          />
          <SelectField
            name="type"
            label={translate('Type')}
            required={true}
            options={data.offeringTypes}
            isClearable={false}
            validate={required}
          />
        </FormContainer>
        <SubmitButton
          className="btn btn-primary btn-sm me-2"
          submitting={submitting}
          disabled={invalid}
          label={translate('Create')}
        />
      </ModalDialog>
    </form>
  );
});
