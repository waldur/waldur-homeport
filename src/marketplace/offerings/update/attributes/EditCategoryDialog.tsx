import { useQuery } from '@tanstack/react-query';
import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { change, Field, reduxForm } from 'redux-form';
import { marketplaceProviderOfferingsUpdateDescription } from 'waldur-js-client';

import { LoadingErred } from '@waldur/core/LoadingErred';
import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { required } from '@waldur/core/validators';
import { SelectField, SubmitButton } from '@waldur/form';
import { translate } from '@waldur/i18n';
import { getCategories } from '@waldur/marketplace/common/api';
import { closeModalDialog } from '@waldur/modal/actions';
import { CloseDialogButton } from '@waldur/modal/CloseDialogButton';
import { ModalDialog } from '@waldur/modal/ModalDialog';
import { showErrorResponse, showSuccess } from '@waldur/store/notify';

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

  const submitRequest = async (formData: FormData) => {
    try {
      await marketplaceProviderOfferingsUpdateDescription({
        path: { uuid: resolve.offering.uuid },
        body: {
          category: formData.category.url,
        },
      });
      dispatch(showSuccess(translate('Category has been updated.')));
      dispatch(closeModalDialog());
      if (resolve.refetch) {
        await resolve.refetch();
      }
    } catch (error) {
      dispatch(
        showErrorResponse(error, translate('Unable to update category')),
      );
    }
  };

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
  }, [queryData.data, dispatch, resolve.offering.category]);

  return (
    <form onSubmit={handleSubmit(submitRequest)}>
      <ModalDialog
        title={translate('Edit category')}
        footer={
          <>
            <CloseDialogButton />
            <SubmitButton
              disabled={invalid}
              submitting={submitting}
              label={translate('Save')}
            />
          </>
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
