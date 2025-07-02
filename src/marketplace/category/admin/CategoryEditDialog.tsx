import { useQuery, useQueryClient } from '@tanstack/react-query';
import { FC } from 'react';
import { Field, Form } from 'react-final-form';
import { useDispatch } from 'react-redux';
import {
  marketplaceCategoriesCreate,
  marketplaceCategoriesRetrieve,
  marketplaceCategoriesUpdate,
  MarketplaceCategoryRequest,
} from 'waldur-js-client';

import { formDataOptions, fileSerializer } from '@waldur/core/api';
import { LoadingErred } from '@waldur/core/LoadingErred';
import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { required } from '@waldur/core/validators';
import {
  SelectField,
  StringField,
  SubmitButton,
  TextField,
} from '@waldur/form';
import { AwesomeCheckboxField } from '@waldur/form/AwesomeCheckboxField';
import { ImageField } from '@waldur/form/ImageField';
import { translate } from '@waldur/i18n';
import { getCategoryGroups } from '@waldur/marketplace/common/api';
import { FormGroup } from '@waldur/marketplace/offerings/FormGroup';
import { closeModalDialog } from '@waldur/modal/actions';
import { ModalDialog } from '@waldur/modal/ModalDialog';
import { showErrorResponse, showSuccess } from '@waldur/store/notify';

interface CategoryEditDialogProps {
  resolve: {
    category?: any;
    refetch: () => void;
  };
}

export const CategoryEditDialog: FC<CategoryEditDialogProps> = ({
  resolve: { category, refetch },
}) => {
  const dispatch = useDispatch();
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

    staleTime: 30 * 1000,
  });

  const {
    data: categoryGroups,
    isLoading: loadingGroups,
    error: errorGroups,
    refetch: refetchGroups,
  } = useQuery({
    queryKey: ['MarketplaceCategoryGroups'],
    queryFn: () => getCategoryGroups(),
    staleTime: 30 * 1000,
  });

  const onSubmit = async (formData: MarketplaceCategoryRequest) => {
    try {
      let result;
      if (isEdit) {
        result = await marketplaceCategoriesUpdate({
          path: { uuid: category.uuid },
          body: {
            ...formData,
            icon: fileSerializer(formData.icon),
          },
          ...formDataOptions,
        }).then((response) => response.data);
      } else {
        result = await marketplaceCategoriesCreate({
          body: {
            ...formData,
            icon: fileSerializer(formData.icon),
          },
          ...formDataOptions,
        }).then((response) => response.data);
      }

      // Update the cached data
      queryClient.setQueryData(['CategoryData', category?.uuid], result);

      refetch();
      dispatch(
        showSuccess(
          isEdit
            ? translate('The category has been updated.')
            : translate('The category has been created.'),
        ),
      );
      dispatch(closeModalDialog());
    } catch (e) {
      dispatch(
        showErrorResponse(
          e,
          isEdit
            ? translate('Unable to update category.')
            : translate('Unable to create category.'),
        ),
      );
    }
  };

  if (isLoading) {
    return <LoadingSpinner />;
  } else if (error) {
    return <LoadingErred loadData={refetchData} />;
  }

  return (
    <Form
      onSubmit={onSubmit}
      initialValues={categoryData}
      render={({ handleSubmit, submitting, pristine, invalid }) => (
        <form onSubmit={handleSubmit}>
          <ModalDialog
            title={
              isEdit
                ? translate('Edit {title}', { title: categoryData.title })
                : translate('Create category')
            }
            closeButton
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
              component={ImageField as any}
              initialValue={categoryData?.icon}
            />

            <FormGroup label={translate('Title')} required>
              <Field
                name="title"
                validate={required}
                component={StringField as any}
              />
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
                  component={SelectField as any}
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
              <Field name="description" component={TextField as any} />
            </FormGroup>

            <Field
              component={AwesomeCheckboxField as any}
              name="default_volume_category"
              label={translate('Default volume category')}
              description={translate(
                'Set to true if this category is for OpenStack Volume. Only one category can have "true" value.',
              )}
              className="mb-5"
            />

            <Field
              component={AwesomeCheckboxField as any}
              name="default_vm_category"
              label={translate('Default vm category')}
              description={translate(
                'Set to true if this category is for OpenStack VM. Only one category can have "true" value.',
              )}
              className="mb-5"
            />

            <Field
              component={AwesomeCheckboxField as any}
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
