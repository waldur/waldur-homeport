import { useQuery } from '@tanstack/react-query';
import React, { useEffect } from 'react';
import { connect, useSelector } from 'react-redux';
import { SubmissionError, reduxForm } from 'redux-form';

import { LoadingErred } from '@waldur/core/LoadingErred';
import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { required } from '@waldur/core/validators';
import { SubmitButton } from '@waldur/form';
import { FormContainer } from '@waldur/form/FormContainer';
import { MarkdownField } from '@waldur/form/MarkdownField';
import { StringField } from '@waldur/form/StringField';
import { translate } from '@waldur/i18n';
import { closeModalDialog } from '@waldur/modal/actions';
import { ModalDialog } from '@waldur/modal/ModalDialog';
import { showErrorResponse, showSuccess } from '@waldur/store/notify';
import { getCustomer } from '@waldur/workspace/selectors';

import { createCall, getCallManagingOrganization, updateCall } from '../api';

interface FormData {
  name: string;
  description: string;
}

export const CallFormDialog = connect<{}, {}, { resolve: { call?; refetch } }>(
  (_, ownProps) => ({
    initialValues: ownProps.resolve?.call,
  }),
)(
  reduxForm<FormData, { resolve: { call?; refetch } }>({
    form: 'ProposalCallForm',
  })((props) => {
    const customer = useSelector(getCustomer);
    const {
      data: manager,
      isLoading: loadingManager,
      error: errorManager,
      refetch,
    } = useQuery(
      ['CallManagingOrganizations', customer.uuid],
      () => getCallManagingOrganization(customer.uuid),
      {
        staleTime: 60 * 1000,
      },
    );
    const isEdit = Boolean(props.resolve.call?.uuid);

    useEffect(() => {
      if (manager && !isEdit) {
        props.change('manager', manager.url);
      }
    }, [manager, isEdit]);

    const processRequest = React.useCallback(
      (values: FormData, dispatch) => {
        let action;
        if (isEdit) {
          action = updateCall(values, props.resolve.call.uuid);
        } else {
          action = createCall(values);
        }

        return action
          .then(() => {
            props.resolve.refetch();
            dispatch(
              showSuccess(
                isEdit
                  ? translate('The call has been updated.')
                  : translate('The call has been created.'),
              ),
            );
            dispatch(closeModalDialog());
          })
          .catch((e) => {
            dispatch(
              showErrorResponse(
                e,
                isEdit
                  ? translate('Unable to update call.')
                  : translate('Unable to create call.'),
              ),
            );
            if (e.response && e.response.status === 400) {
              throw new SubmissionError(e.response.data);
            }
          });
      },
      [props.resolve],
    );

    if (loadingManager) {
      return <LoadingSpinner />;
    } else if (errorManager) {
      return (
        <LoadingErred
          message={translate('Unable to prepare the form.')}
          loadData={refetch}
        />
      );
    }
    return (
      <form onSubmit={props.handleSubmit(processRequest)}>
        <ModalDialog
          title={
            isEdit
              ? translate('Edit {title}', {
                  title: props.resolve.call.name,
                })
              : translate('Create call')
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
            {isEdit && (
              <MarkdownField
                label={translate('Description')}
                name="description"
                required={false}
                verticalLayout
              />
            )}
          </FormContainer>
        </ModalDialog>
      </form>
    );
  }),
);
