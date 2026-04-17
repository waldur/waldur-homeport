import { useQuery } from '@tanstack/react-query';
import { pick } from 'lodash-es';
import { useCallback } from 'react';
import { connect } from 'react-redux';
import { SubmissionError, reduxForm } from 'redux-form';
import { checklistsAdminList } from 'waldur-js-client';

import { getAllPages } from '@waldur/core/api';
import { UI_STALE_TIME } from '@waldur/core/constants';
import { LoadingErred } from '@waldur/core/LoadingErred';
import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { SelectField, SubmitButton } from '@waldur/form';
import { FormContainer } from '@waldur/form/FormContainer';
import { translate } from '@waldur/i18n';
import { closeModalDialog } from '@waldur/modal/actions';
import { CloseDialogButton } from '@waldur/modal/CloseDialogButton';
import { ModalDialog } from '@waldur/modal/ModalDialog';

import { EDIT_CUSTOMER_FORM_ID } from './constants';
import { EditCustomerProps } from './types';

type FormData = Record<string, any>;

export const EditCustomerChecklistDialog = connect<
  {},
  {},
  { resolve: EditCustomerProps }
>((_, ownProps) => ({
  initialValues: {
    ...pick(ownProps.resolve.customer, ownProps.resolve.name),
  },
}))(
  reduxForm<FormData, { resolve: EditCustomerProps }>({
    form: EDIT_CUSTOMER_FORM_ID,
  })((props) => {
    const processRequest = useCallback(
      (values: FormData, dispatch) => {
        return props.resolve
          .callback(values, dispatch)
          .then(() => {
            dispatch(closeModalDialog());
          })
          .catch((e) => {
            if (e.response && e.response.status === 400) {
              throw new SubmissionError(e.response.data);
            }
          });
      },
      [props.resolve.callback],
    );

    const { isLoading, error, data, refetch } = useQuery({
      queryKey: ['checklistsAdminMetadata'],
      queryFn: () =>
        getAllPages((page) =>
          checklistsAdminList({
            query: { page, checklist_type: 'project_metadata' },
          }),
        ),
      staleTime: UI_STALE_TIME,
    });

    return (
      <form onSubmit={props.handleSubmit(processRequest)}>
        <ModalDialog
          headerLess
          footer={
            <>
              <CloseDialogButton className="flex-equal" />
              <SubmitButton
                disabled={props.invalid || !props.dirty}
                submitting={props.submitting}
                label={translate('Confirm')}
                className="btn btn-primary flex-equal"
              />
            </>
          }
        >
          <FormContainer submitting={props.submitting}>
            {isLoading ? (
              <LoadingSpinner />
            ) : error ? (
              <LoadingErred
                loadData={refetch}
                message={translate('Unable to load organization groups.')}
              />
            ) : (
              <SelectField
                name="project_metadata_checklist"
                label={translate('Assigned checklist')}
                options={data}
                getOptionLabel={(option) =>
                  option.name +
                  ` (${translate('{count} questions', { count: option.questions_count })})`
                }
                getOptionValue={(option) => option.uuid}
                simpleValue
                spaceless
              />
            )}
          </FormContainer>
        </ModalDialog>
      </form>
    );
  }),
);
