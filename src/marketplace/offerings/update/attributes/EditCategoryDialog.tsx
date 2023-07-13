import { useQuery } from '@tanstack/react-query';
import { Modal } from 'react-bootstrap';
import { useDispatch } from 'react-redux';
import { change, Field, reduxForm } from 'redux-form';

import { LoadingErred } from '@waldur/core/LoadingErred';
import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { required } from '@waldur/core/validators';
import { SelectField, SubmitButton } from '@waldur/form';
import { translate } from '@waldur/i18n';
import {
  getCategories,
  updateProviderOffering,
} from '@waldur/marketplace/common/api';
import { closeModalDialog } from '@waldur/modal/actions';
import { CloseDialogButton } from '@waldur/modal/CloseDialogButton';
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
      await updateProviderOffering(resolve.offering.uuid, {
        category: formData.category.url,
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

  const queryData = useQuery(['EditCategoryDialog'], getCategories, {
    onSuccess: (data) => {
      dispatch(
        change(
          CATEGORY_FORM_ID,
          'category',
          data.find((item) => item.url === resolve.offering.category),
        ),
      );
    },
  });

  return (
    <form onSubmit={handleSubmit(submitRequest)}>
      <Modal.Header>
        <Modal.Title>{translate('Edit category')}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
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
      </Modal.Body>
      <Modal.Footer>
        <CloseDialogButton />
        <SubmitButton
          disabled={invalid}
          submitting={submitting}
          label={translate('Save')}
        />
      </Modal.Footer>
    </form>
  );
});
