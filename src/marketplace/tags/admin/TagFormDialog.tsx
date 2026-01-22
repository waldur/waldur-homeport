import React from 'react';
import { connect } from 'react-redux';
import { SubmissionError, reduxForm } from 'redux-form';
import {
  marketplaceTagsCreate,
  marketplaceTagsPartialUpdate,
  Tag,
  TagRequest,
} from 'waldur-js-client';

import { required } from '@waldur/core/validators';
import { SubmitButton } from '@waldur/form';
import { FormContainer } from '@waldur/form/FormContainer';
import { StringField } from '@waldur/form/StringField';
import { TextField } from '@waldur/form/TextField';
import { translate } from '@waldur/i18n';
import { closeModalDialog } from '@waldur/modal/actions';
import { ModalDialog } from '@waldur/modal/ModalDialog';
import { showErrorResponse, showSuccess } from '@waldur/store/notify';

interface OwnProps {
  resolve: { tag?: Tag; refetch: () => void };
}

export const TagFormDialog = connect<{}, {}, OwnProps>((_, ownProps) => ({
  initialValues: ownProps.resolve?.tag
    ? { ...ownProps.resolve.tag }
    : undefined,
}))(
  reduxForm<TagRequest, OwnProps>({
    form: 'TagForm',
  })((props) => {
    const isEdit = Boolean(props.resolve.tag?.uuid);

    const processRequest = React.useCallback(
      async (values: TagRequest, dispatch) => {
        try {
          if (isEdit) {
            await marketplaceTagsPartialUpdate({
              path: { uuid: props.resolve.tag.uuid },
              body: {
                name: values.name,
                description: values.description,
              },
            });
          } else {
            await marketplaceTagsCreate({
              body: {
                name: values.name,
                description: values.description,
              },
            });
          }
          props.resolve.refetch();
          dispatch(
            showSuccess(
              isEdit
                ? translate('The tag has been updated.')
                : translate('The tag has been created.'),
            ),
          );
          dispatch(closeModalDialog());
        } catch (e) {
          dispatch(
            showErrorResponse(
              e,
              isEdit
                ? translate('Unable to update tag.')
                : translate('Unable to create tag.'),
            ),
          );
          if (e.response && e.response.status === 400) {
            throw new SubmissionError(e.response.data);
          }
        }
      },
      [props.resolve, isEdit],
    );

    return (
      <form onSubmit={props.handleSubmit(processRequest)}>
        <ModalDialog
          title={
            isEdit
              ? translate('Edit {title}', {
                  title: props.resolve.tag.name,
                })
              : translate('Create tag')
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
            <StringField
              label={translate('Name')}
              name="name"
              required
              validate={required}
              maxLength={150}
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
