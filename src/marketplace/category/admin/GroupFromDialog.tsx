import React from 'react';
import { connect } from 'react-redux';
import { SubmissionError, reduxForm } from 'redux-form';

import { required } from '@waldur/core/validators';
import { SubmitButton } from '@waldur/form';
import { FormContainer } from '@waldur/form/FormContainer';
import { ImageField } from '@waldur/form/ImageField';
import { StringField } from '@waldur/form/StringField';
import { TextField } from '@waldur/form/TextField';
import { translate } from '@waldur/i18n';
import { closeModalDialog } from '@waldur/modal/actions';
import { ModalDialog } from '@waldur/modal/ModalDialog';
import { showErrorResponse, showSuccess } from '@waldur/store/notify';

import { createCategoryGroup, updateCategoryGroup } from './api';

interface FormData {
  title: string;
  description: string;
  icon: any;
}

export const GroupFromDialog = connect<
  {},
  {},
  { resolve: { categoryGroup?; refetch } }
>((_, ownProps) => ({
  initialValues: ownProps.resolve?.categoryGroup
    ? { ...ownProps.resolve.categoryGroup }
    : undefined,
}))(
  reduxForm<FormData, { resolve: { categoryGroup?; refetch } }>({
    form: 'CategoryGroupForm',
  })((props) => {
    const isEdit = Boolean(props.resolve.categoryGroup?.uuid);

    const processRequest = React.useCallback(
      (values: FormData, dispatch) => {
        let action;
        if (isEdit) {
          action = updateCategoryGroup(
            values,
            props.resolve.categoryGroup.uuid,
          );
        } else {
          action = createCategoryGroup(values);
        }

        return action
          .then(() => {
            props.resolve.refetch();
            dispatch(
              showSuccess(
                isEdit
                  ? translate('The category group has been updated.')
                  : translate('The category group has been created.'),
              ),
            );
            dispatch(closeModalDialog());
          })
          .catch((e) => {
            dispatch(
              showErrorResponse(
                e,
                isEdit
                  ? translate('Unable to update category group.')
                  : translate('Unable to create category group.'),
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
                  title: props.resolve.categoryGroup.title,
                })
              : translate('Create category group')
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
            <TextField
              label={translate('Description')}
              name="description"
              required={false}
            />
          </FormContainer>
        </ModalDialog>
      </form>
    );
  }),
);
