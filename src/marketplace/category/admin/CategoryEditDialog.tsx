import { useQuery } from '@tanstack/react-query';
import React from 'react';
import { connect } from 'react-redux';
import { SubmissionError, reduxForm } from 'redux-form';

import { LoadingErred } from '@waldur/core/LoadingErred';
import { required } from '@waldur/core/validators';
import { SelectField, SubmitButton } from '@waldur/form';
import { AwesomeCheckboxField } from '@waldur/form/AwesomeCheckboxField';
import { FormContainer } from '@waldur/form/FormContainer';
import { ImageField } from '@waldur/form/ImageField';
import { StringField } from '@waldur/form/StringField';
import { TextField } from '@waldur/form/TextField';
import { translate } from '@waldur/i18n';
import { getCategoryGroups } from '@waldur/marketplace/common/api';
import { closeModalDialog } from '@waldur/modal/actions';
import { ModalDialog } from '@waldur/modal/ModalDialog';
import { showErrorResponse, showSuccess } from '@waldur/store/notify';

import { createCategory, updateCategory } from './api';

interface FormData {
  title: string;
  description: string;
  icon: any;
  default_volume_category: boolean;
  default_vm_category: boolean;
  default_tenant_category: boolean;
}

export const CategoryEditDialog = connect<
  {},
  {},
  { resolve: { category?; refetch } }
>((_, ownProps) => ({
  initialValues: ownProps.resolve?.category
    ? { ...ownProps.resolve.category }
    : undefined,
}))(
  reduxForm<FormData, { resolve: { category?; refetch } }>({
    form: 'CategoryForm',
  })((props) => {
    const {
      data: categoryGroups,
      isLoading: loadingGroups,
      error: errorGroups,
      refetch,
    } = useQuery(['MarketplaceCategoryGroups'], () => getCategoryGroups(), {
      staleTime: 30 * 1000,
    });
    const isEdit = Boolean(props.resolve.category?.uuid);

    const processRequest = React.useCallback(
      (values: FormData, dispatch) => {
        let action;
        if (isEdit) {
          action = updateCategory(values, props.resolve.category.uuid);
        } else {
          action = createCategory(values);
        }

        return action
          .then(() => {
            props.resolve.refetch();
            dispatch(
              showSuccess(
                isEdit
                  ? translate('The category has been updated.')
                  : translate('The category has been created.'),
              ),
            );
            dispatch(closeModalDialog());
          })
          .catch((e) => {
            dispatch(
              showErrorResponse(
                e,
                isEdit
                  ? translate('Unable to update category.')
                  : translate('Unable to create category.'),
              ),
            );
            if (e.response && e.response.status === 400) {
              throw new SubmissionError(e.response.data);
            }
          });
      },
      [props.resolve],
    );

    return (
      <form onSubmit={props.handleSubmit(processRequest)}>
        <ModalDialog
          title={
            isEdit
              ? translate('Edit {title}', {
                  title: props.resolve.category.title,
                })
              : translate('Create category')
          }
          closeButton
          footer={
            <SubmitButton
              disabled={props.invalid}
              submitting={props.submitting}
              label={isEdit ? translate('Edit') : translate('Create')}
            />
          }
        >
          <FormContainer submitting={props.submitting}>
            <ImageField
              label={translate('Icon')}
              name="icon"
              initialValue={props.initialValues?.icon}
            />
            <StringField
              label={translate('Title')}
              name="title"
              required
              validate={required}
            />
            {errorGroups ? (
              <LoadingErred
                message={translate('Unable to load category groups.')}
                loadData={refetch}
              />
            ) : (
              <SelectField
                name="group"
                label={translate('Group')}
                getOptionLabel={(option) => option.title}
                getOptionValue={(option) => option.url}
                simpleValue={true}
                options={categoryGroups}
                isLoading={loadingGroups}
                required={false}
                isClearable={true}
              />
            )}
            <TextField
              label={translate('Description')}
              name="description"
              required={false}
            />
            <AwesomeCheckboxField
              name="default_volume_category"
              label={translate('Default volume category')}
              required={false}
              tooltip={translate(
                'Set to true if this category is for OpenStack Volume. Only one category can have "true" value.',
              )}
              hideLabel
            />
            <AwesomeCheckboxField
              name="default_vm_category"
              label={translate('Default vm category')}
              required={false}
              tooltip={translate(
                'Set to "true" if this category is for OpenStack VM. Only one category can have "true" value.',
              )}
              hideLabel
            />
            <AwesomeCheckboxField
              name="default_tenant_category"
              label={translate('Default tenant category')}
              required={false}
              tooltip={translate(
                'Set to true if this category is for OpenStack Tenant. Only one category can have "true" value.',
              )}
              hideLabel
            />
          </FormContainer>
        </ModalDialog>
      </form>
    );
  }),
);
