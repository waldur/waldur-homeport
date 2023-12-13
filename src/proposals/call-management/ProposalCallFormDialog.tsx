import { useQuery } from '@tanstack/react-query';
import React, { useEffect } from 'react';
import { connect, useSelector } from 'react-redux';
import { SubmissionError, reduxForm } from 'redux-form';

import { LoadingErred } from '@waldur/core/LoadingErred';
import { required } from '@waldur/core/validators';
import { SelectField, SubmitButton } from '@waldur/form';
import { DateTimeField } from '@waldur/form/DateTimeField';
import { FormContainer } from '@waldur/form/FormContainer';
import { StringField } from '@waldur/form/StringField';
import { TextField } from '@waldur/form/TextField';
import { translate } from '@waldur/i18n';
import { closeModalDialog } from '@waldur/modal/actions';
import { ModalDialog } from '@waldur/modal/ModalDialog';
import {
  getCallAllocationStrategyOptions,
  getCallReviewStrategyOptions,
  getCallRoundStrategyOptions,
  getProposalCallInitialValues,
} from '@waldur/proposals/utils';
import { showErrorResponse, showSuccess } from '@waldur/store/notify';
import { getCustomer } from '@waldur/workspace/selectors';

import { createCall, getCallManagingOrganization, updateCall } from '../api';

interface FormData {
  title: string;
  description: string;
  icon: any;
}

export const ProposalCallFormDialog = connect<
  {},
  {},
  { resolve: { call?; refetch } }
>((_, ownProps) => ({
  initialValues: ownProps.resolve?.call
    ? getProposalCallInitialValues(ownProps.resolve.call)
    : undefined,
}))(
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
              <TextField
                label={translate('Description')}
                name="description"
                required={false}
              />
            )}
            {isEdit && (
              <DateTimeField
                name="start_time"
                label={translate('Start time')}
              />
            )}
            {isEdit && (
              <DateTimeField name="end_time" label={translate('End time')} />
            )}
            <SelectField
              name="round_strategy"
              label={translate('Round strategy')}
              simpleValue={true}
              options={getCallRoundStrategyOptions()}
              required={true}
              isClearable={false}
            />
            <SelectField
              name="review_strategy"
              label={translate('Review strategy')}
              simpleValue={true}
              options={getCallReviewStrategyOptions()}
              required={true}
              isClearable={false}
            />
            <SelectField
              name="allocation_strategy"
              label={translate('Allocation strategy')}
              simpleValue={true}
              options={getCallAllocationStrategyOptions()}
              required={true}
              isClearable={false}
            />
            {errorManager ? (
              <LoadingErred
                message={translate('Unable to load manager.')}
                loadData={refetch}
              />
            ) : (
              <SelectField
                name="manager"
                label={translate('Manager')}
                getOptionLabel={(option) => option.customer_name}
                getOptionValue={(option) => option.url}
                simpleValue={true}
                options={manager ? [manager] : []}
                isLoading={loadingManager}
                required={true}
                isClearable={false}
              />
            )}
          </FormContainer>
        </ModalDialog>
      </form>
    );
  }),
);
