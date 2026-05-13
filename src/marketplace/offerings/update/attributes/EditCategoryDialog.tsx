import { useQuery } from '@tanstack/react-query';
import { FC, useMemo } from 'react';
import { Field, Form } from 'react-final-form';
import { marketplaceProviderOfferingsUpdateDescription } from 'waldur-js-client';

import { LoadingErred } from '@/core/LoadingErred';
import { LoadingSpinner } from '@/core/LoadingSpinner';
import { required } from '@/core/validators';
import { FormFooter, FormGroupFinal, SelectField } from '@/form';
import { translate } from '@/i18n';
import { getCategories } from '@/marketplace/common/api';
import { ModalDialog } from '@/modal/ModalDialog';
import { useManagedMutation } from '@/modal/useManagedMutation';

interface EditCategoryDialogProps {
  resolve: { offering; refetch };
}

export const EditCategoryDialog: FC<EditCategoryDialogProps> = ({
  resolve,
}) => {
  const submitRequestMutation = useManagedMutation<any, any, any>({
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

  const initialValues = useMemo(() => {
    if (queryData.data) {
      return {
        category: queryData.data.find(
          (item) => item.url === resolve.offering.category,
        ),
      };
    }
    return {};
  }, [queryData.data, resolve.offering.category]);

  return (
    <Form
      onSubmit={(values) => submitRequestMutation.mutateAsync(values)}
      initialValues={initialValues}
      render={({ handleSubmit, submitting, invalid }) => (
        <form onSubmit={handleSubmit}>
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
                label={translate('Category')}
                component={FormGroupFinal}
                required={true}
                validate={required}
              >
                <SelectField
                  options={queryData.data}
                  isClearable={false}
                  getOptionValue={(option) => option.url}
                  getOptionLabel={(option) => option.title}
                />
              </Field>
            )}
          </ModalDialog>
        </form>
      )}
    />
  );
};
