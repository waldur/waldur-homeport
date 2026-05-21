import { useQuery, useQueryClient } from '@tanstack/react-query';
import { FC } from 'react';
import { Field, Form } from 'react-final-form';
import {
  marketplaceCategoriesCreate,
  marketplaceCategoriesRetrieve,
  marketplaceCategoriesUpdate,
  MarketplaceCategoryRequest,
} from 'waldur-js-client';

import { formDataOptions, fileSerializer } from '@/core/api';
import { FAST_STALE_TIME } from '@/core/constants';
import { LoadingErred } from '@/core/LoadingErred';
import { LoadingSpinner } from '@/core/LoadingSpinner';
import { required } from '@/core/validators';
import { SelectField, StringField, SubmitButton, TextField } from '@/form';
import { AwesomeCheckboxField } from '@/form/AwesomeCheckboxField';
import { ImageField } from '@/form/ImageField';
import { translate } from '@/i18n';
import { getCategoryGroups } from '@/marketplace/common/api';
import { FormGroup } from '@/marketplace/offerings/FormGroup';
import { ModalDialog } from '@/modal/ModalDialog';
import { useManagedMutation } from '@/modal/useManagedMutation';

interface CategoryEditDialogProps {
  resolve: {
    category?: any;
    refetch: () => void;
  };
}

export const CategoryEditDialog: FC<CategoryEditDialogProps> = ({
  resolve: { category, refetch },
}) => {
  const queryClient = useQueryClient();
  const isEdit = Boolean(category?.uuid);

  const {
    data: categoryData,
    isLoading,
    error,
    refetch: refetchData,
  } = useQuery({
    queryKey: ['CategoryData', category?.uuid],

    queryFn: () =>
      isEdit
        ? marketplaceCategoriesRetrieve({ path: { uuid: category.uuid } }).then(
            (response) => response.data,
          )
        : null,

    staleTime: FAST_STALE_TIME,
  });

  const {
    data: categoryGroups,
    isLoading: loadingGroups,
    error: errorGroups,
    refetch: refetchGroups,
  } = useQuery({
    queryKey: ['MarketplaceCategoryGroups'],
    queryFn: () => getCategoryGroups(),
    staleTime: FAST_STALE_TIME,
  });

  const saveCategoryMutation = useManagedMutation<
    any,
    any,
    MarketplaceCategoryRequest
  >({
    mutationFn: (formData) => {
      if (isEdit) {
        return marketplaceCategoriesUpdate({
          path: { uuid: category.uuid },
          body: {
            ...formData,
            icon: fileSerializer(formData.icon),
          },
          ...formDataOptions,
        }).then((response) => response.data);
      } else {
        return marketplaceCategoriesCreate({
          body: {
            ...formData,
            icon: fileSerializer(formData.icon),
          },
          ...formDataOptions,
        }).then((response) => response.data);
      }
    },
    successMessage: isEdit
      ? translate('The category has been updated.')
      : translate('The category has been created.'),
    errorMessage: isEdit
      ? translate('Unable to update category.')
      : translate('Unable to create category.'),
    refetch,
    onSuccess: (result) => {
      if (category?.uuid) {
        queryClient.setQueryData(['CategoryData', category.uuid], result);
      }
    },
  });

  if (isLoading) {
    return <LoadingSpinner />;
  } else if (error) {
    return <LoadingErred loadData={refetchData} />;
  }

  return (
    <Form
      onSubmit={(values: MarketplaceCategoryRequest) =>
        saveCategoryMutation.mutateAsync(values)
      }
      initialValues={categoryData}
      render={({ handleSubmit, submitting, pristine, invalid }) => (
        <form onSubmit={handleSubmit}>
          <ModalDialog
            title={
              isEdit
                ? translate('Edit {title}', { title: categoryData.title })
                : translate('Create category')
            }
            footer={
              <SubmitButton
                disabled={invalid || pristine}
                submitting={submitting}
                label={isEdit ? translate('Edit') : translate('Create')}
              />
            }
          >
            <Field
              name="icon"
              component={ImageField}
              initialValue={categoryData?.icon}
            />

            <FormGroup label={translate('Title')} required>
              <Field name="title" validate={required} component={StringField} />
            </FormGroup>

            {errorGroups ? (
              <LoadingErred
                message={translate('Unable to load category groups.')}
                loadData={refetchGroups}
              />
            ) : (
              <FormGroup label={translate('Group')}>
                <Field
                  name="group"
                  component={SelectField}
                  getOptionLabel={(option) => option.title}
                  getOptionValue={(option) => option.url}
                  options={categoryGroups}
                  isLoading={loadingGroups}
                  isClearable
                  simpleValue
                />
              </FormGroup>
            )}
            <FormGroup label={translate('Description')}>
              <Field name="description" component={TextField} />
            </FormGroup>

            <Field
              component={AwesomeCheckboxField}
              name="default_volume_category"
              label={translate('Default volume category')}
              description={translate(
                'Set to true if this category is for OpenStack Volume. Only one category can have "true" value.',
              )}
              className="mb-5"
            />

            <Field
              component={AwesomeCheckboxField}
              name="default_vm_category"
              label={translate('Default vm category')}
              description={translate(
                'Set to true if this category is for OpenStack VM. Only one category can have "true" value.',
              )}
              className="mb-5"
            />

            <Field
              component={AwesomeCheckboxField}
              name="default_tenant_category"
              label={translate('Default tenant category')}
              description={translate(
                'Set to true if this category is for OpenStack Tenant. Only one category can have "true" value.',
              )}
              className="mb-5"
            />
          </ModalDialog>
        </form>
      )}
    />
  );
};
