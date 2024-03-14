import React from 'react';
import { connect } from 'react-redux';
import { Field, reduxForm, SubmissionError } from 'redux-form';

import { required } from '@waldur/core/validators';
import { SubmitButton } from '@waldur/form';
import { FormContainer } from '@waldur/form/FormContainer';
import { StringField } from '@waldur/form/StringField';
import { AsyncPaginate } from '@waldur/form/themed-select';
import { translate } from '@waldur/i18n';
import { closeModalDialog } from '@waldur/modal/actions';
import { ModalDialog } from '@waldur/modal/ModalDialog';
import { showErrorResponse, showSuccess } from '@waldur/store/notify';

import {
  createOrganizationGroup,
  organizationGroupTypeAutocomplete,
  updateOrganizationGroup,
} from './api';

interface FormData {
  name: string;
  type?: any;
}

export const OrganizationGroupFromDialog = connect<
  {},
  {},
  { resolve: { organizationGroup?; refetch } }
>((_, ownProps) => ({
  initialValues: ownProps.resolve.organizationGroup
    ? {
        name: ownProps.resolve.organizationGroup.name,
        type: {
          name: ownProps.resolve.organizationGroup.type_name,
          uuid: ownProps.resolve.organizationGroup.type,
        },
      }
    : undefined,
}))(
  reduxForm<
    FormData,
    {
      resolve: {
        organizationGroup?;
        refetch;
      };
    }
  >({
    form: 'OrganizationGroupForm',
  })((props) => {
    const isEdit = Boolean(props.resolve.organizationGroup?.uuid);
    const processRequest = React.useCallback(
      (values: FormData, dispatch) => {
        values['type'] = values['type']?.uuid;
        let action;
        if (isEdit) {
          action = updateOrganizationGroup(
            props.resolve.organizationGroup.uuid,
            values,
          );
        } else {
          action = createOrganizationGroup(values);
        }

        return action
          .then(() => {
            props.resolve.refetch();
            dispatch(
              showSuccess(
                isEdit
                  ? translate('The organization group has been updated.')
                  : translate('The organization group has been created.'),
              ),
            );
            dispatch(closeModalDialog());
          })
          .catch((e) => {
            dispatch(
              showErrorResponse(
                e,
                isEdit
                  ? translate('Unable to update organization group.')
                  : translate('Unable to create organization group.'),
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
              ? translate('Edit {name}', {
                  title: props.resolve.organizationGroup.name,
                })
              : translate('Create organization group')
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
            />

            <Field
              name="type"
              label={translate('Organization group type')}
              component={(fieldProps) => (
                <AsyncPaginate
                  placeholder={translate('Select organization group type...')}
                  loadOptions={organizationGroupTypeAutocomplete}
                  defaultOptions
                  getOptionValue={(option) => option.uuid}
                  getOptionLabel={(option) => option.name}
                  value={fieldProps.input.value}
                  onChange={(value) => fieldProps.input.onChange(value)}
                  noOptionsMessage={() =>
                    translate('No organization group types')
                  }
                  isClearable={true}
                />
              )}
            />
          </FormContainer>
        </ModalDialog>
      </form>
    );
  }),
);
