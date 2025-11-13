import { useQuery } from '@tanstack/react-query';
import { FC, useCallback } from 'react';
import { Field, Form } from 'react-final-form';
import { useDispatch } from 'react-redux';
import {
  checklistsAdminList,
  marketplaceProviderOfferingsUpdateComplianceChecklist,
} from 'waldur-js-client';

import { getAllPages } from '@waldur/core/api';
import { LoadingErred } from '@waldur/core/LoadingErred';
import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { SelectField, SubmitButton } from '@waldur/form';
import { translate } from '@waldur/i18n';
import { closeModalDialog } from '@waldur/modal/actions';
import { CloseDialogButton } from '@waldur/modal/CloseDialogButton';
import { ModalDialog } from '@waldur/modal/ModalDialog';
import { showErrorResponse, showSuccess } from '@waldur/store/notify';

import { EditOfferingChecklistProps } from './types';

export const EditOfferingChecklistDialog: FC<{
  resolve: EditOfferingChecklistProps;
}> = (props) => {
  const dispatch = useDispatch();
  const update = useCallback(
    async (formData) => {
      try {
        await marketplaceProviderOfferingsUpdateComplianceChecklist({
          path: { uuid: props.resolve.offering.uuid },
          body: { compliance_checklist: formData.compliance_checklist },
        });
        dispatch(
          showSuccess(translate('Offering has been updated successfully.')),
        );
        await props.resolve.refetch();
        dispatch(closeModalDialog());
      } catch (error) {
        dispatch(
          showErrorResponse(error, translate('Unable to update offering.')),
        );
      }
    },
    [dispatch],
  );

  const { isLoading, error, data, refetch } = useQuery({
    queryKey: ['checklistsAdminOffering'],
    queryFn: () =>
      getAllPages((page) =>
        checklistsAdminList({
          query: { page, checklist_type: 'offering_compliance' },
        }),
      ),
    staleTime: 3 * 60 * 1000,
  });

  return (
    <Form
      onSubmit={update}
      initialValues={
        props.resolve.checklist?.uuid
          ? { compliance_checklist: props.resolve.checklist.uuid }
          : undefined
      }
      render={({ handleSubmit, submitting, invalid, pristine }) => (
        <form onSubmit={handleSubmit}>
          <ModalDialog
            title={translate('Assigned compliance checklist')}
            closeButton
            footer={
              <>
                <CloseDialogButton className="w-125px" />
                <SubmitButton
                  disabled={invalid || pristine}
                  submitting={submitting}
                  label={translate('Save')}
                  className="btn btn-primary w-125px"
                />
              </>
            }
          >
            {isLoading ? (
              <LoadingSpinner />
            ) : error ? (
              <LoadingErred
                loadData={refetch}
                message={translate('Unable to load checklists.')}
              />
            ) : (
              <Field
                component={SelectField}
                name="compliance_checklist"
                label={translate('Assigned compliance checklist')}
                options={data}
                getOptionLabel={(option) =>
                  option.name +
                  ` (${translate('{count} questions', { count: option.questions_count })})`
                }
                getOptionValue={(option) => option.uuid}
                simpleValue
                isClearable
              />
            )}
          </ModalDialog>
        </form>
      )}
    />
  );
};
