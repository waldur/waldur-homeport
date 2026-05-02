import { useQuery } from '@tanstack/react-query';
import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { change, Field, reduxForm } from 'redux-form';
import { marketplaceProviderOfferingsUpdateDescription } from 'waldur-js-client';

import { LoadingErred } from '@/core/LoadingErred';
import { LoadingSpinner } from '@/core/LoadingSpinner';
import { required } from '@/core/validators';
import { FormFooter, SelectField } from '@/form';
import { translate } from '@/i18n';
import { getCategories } from '@/marketplace/common/api';
import { ModalDialog } from '@/modal/ModalDialog';
import { useManagedMutation } from '@/modal/useManagedMutation';

import { CATEGORY_FORM_ID } from './constants';

type OwnProps = {
  resolve: { offering; refetch };
};

interface FormData {
  category: any;
}

export const EditCategoryDialog = reduxForm<FormData, OwnProps>({
  form: CATEGORY_FORM_ID,
})(({ resolve, handleSubmit, invalid, submitting }) => {
  const dispatch = useDispatch();

  const submitRequestMutation = useManagedMutation<any, any, FormData>({
    mutationFn: (formData) =>
      marketplaceProviderOfferingsUpdateDescription({
        path: { uuid: resolve.offering.uuid },
        body: {
          category: formData.category.url,
        },
      }),
    successMessage: translate('Category has been updated.'),
    errorMessage: translate('Unable to update category'),
    refetch: resolve.refetch,
  });

  const queryData = useQuery({
    queryKey: ['EditCategoryDialog'],
    queryFn: getCategories,
  });

  useEffect(() => {
    if (queryData.data) {
      dispatch(
        change(
          CATEGORY_FORM_ID,
          'category',
          queryData.data.find((item) => item.url === resolve.offering.category),
        ),
      );
    }
  }, [queryData.data, resolve.offering.category]);

  return (
    <form
      onSubmit={handleSubmit((values) =>
        submitRequestMutation.mutateAsync(values),
      )}
    >
      <ModalDialog
        title={translate('Edit category')}
        footer={
          <FormFooter
            submitting={submitting}
            invalid={invalid}
            submitLabel={translate('Save')}
          />
        }
      >
        {queryData.isLoading ? (
          <LoadingSpinner />
        ) : queryData.isError ? (
          <LoadingErred loadData={queryData.refetch} />
        ) : (
          <Field
            name="category"
            options={queryData.data}
            required={true}
            isClearable={false}
            component={SelectField}
            getOptionValue={(option) => option.url}
            getOptionLabel={(option) => option.title}
            validate={required}
          />
        )}
      </ModalDialog>
    </form>
  );
});
