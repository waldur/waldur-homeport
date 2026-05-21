import { useQuery } from '@tanstack/react-query';
import { pick } from 'lodash-es';
import { useCallback, useMemo } from 'react';
import { Form } from 'react-final-form';
import { useDispatch } from 'react-redux';
import { checklistsAdminList, customersPartialUpdate } from 'waldur-js-client';

import { getAllPages } from '@/core/api';
import { UI_STALE_TIME } from '@/core/constants';
import { LoadingErred } from '@/core/LoadingErred';
import { LoadingSpinner } from '@/core/LoadingSpinner';
import { SelectField, SubmitButton } from '@/form';
import { FormContainer as FormContainer } from '@/form/FormContainer';
import { translate } from '@/i18n';
import { CloseDialogButton } from '@/modal/CloseDialogButton';
import { ModalDialog } from '@/modal/ModalDialog';
import { useManagedMutation } from '@/modal/useManagedMutation';
import { setCurrentCustomer } from '@/workspace/actions';

import { EditCustomerProps } from './types';

type FormData = Record<string, any>;

export const EditCustomerChecklistDialog = ({
  resolve,
}: {
  resolve: EditCustomerProps;
}) => {
  const dispatch = useDispatch();

  const initialValues = useMemo(
    () => pick(resolve.customer, resolve.name),
    [resolve.customer, resolve.name],
  );

  const { mutateAsync } = useManagedMutation({
    mutationFn: (values: FormData) =>
      customersPartialUpdate({
        path: { uuid: resolve.customer.uuid },
        body: values,
      }),
    onSuccess: (response) => {
      if (response.data?.uuid === resolve.customer.uuid) {
        dispatch(setCurrentCustomer(response.data));
      }
    },
    successMessage: translate('Organization updated successfully'),
    invalidateQueries: [{ queryKey: ['checklistAdmin'] }],
  });

  const onSubmit = useCallback(
    (values: FormData) => {
      return mutateAsync(values).catch((e) => {
        if (e.response && e.response.status === 400) {
          return e.response.data;
        }
      });
    },
    [mutateAsync],
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
    <Form
      onSubmit={onSubmit}
      initialValues={initialValues}
      render={({ handleSubmit, submitting, invalid, dirty }) => (
        <form onSubmit={handleSubmit}>
          <ModalDialog
            headerLess
            footer={
              <>
                <CloseDialogButton className="flex-equal" />
                <SubmitButton
                  disabled={invalid || !dirty}
                  submitting={submitting}
                  label={translate('Confirm')}
                  className="btn btn-primary flex-equal"
                />
              </>
            }
          >
            <FormContainer submitting={submitting}>
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
      )}
    />
  );
};
