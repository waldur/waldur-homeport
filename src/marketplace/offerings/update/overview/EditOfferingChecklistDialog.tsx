import { useQuery } from '@tanstack/react-query';
import { FC } from 'react';
import { Field, Form } from 'react-final-form';
import {
  checklistsAdminList,
  marketplaceProviderOfferingsUpdateComplianceChecklist,
} from 'waldur-js-client';

import { getAllPages, MAX_PAGE_SIZE } from '@/core/api';
import { UI_STALE_TIME } from '@/core/constants';
import { LoadingErred } from '@/core/LoadingErred';
import { LoadingSpinner } from '@/core/LoadingSpinner';
import { SelectField, SubmitButton } from '@/form';
import { translate } from '@/i18n';
import { CloseDialogButton } from '@/modal/CloseDialogButton';
import { ModalDialog } from '@/modal/ModalDialog';
import { useManagedMutation } from '@/modal/useManagedMutation';

import { EditOfferingChecklistProps } from './types';

export const EditOfferingChecklistDialog: FC<{
  resolve: EditOfferingChecklistProps;
}> = (props) => {
  const updateChecklistMutation = useManagedMutation<any, any, any>({
    mutationFn: (formData) =>
      marketplaceProviderOfferingsUpdateComplianceChecklist({
        path: { uuid: props.resolve.offering.uuid },
        body: { compliance_checklist: formData.compliance_checklist },
      }),
    successMessage: translate('Offering has been updated successfully.'),
    errorMessage: translate('Unable to update offering.'),
    refetch: props.resolve.refetch,
  });

  const { isLoading, error, data, refetch } = useQuery({
    queryKey: ['checklistsAdminOffering'],
    queryFn: () =>
      getAllPages((page) =>
        checklistsAdminList({
          query: {
            page,
            page_size: MAX_PAGE_SIZE,
            checklist_type: 'offering_compliance',
          },
        }),
      ),
    staleTime: UI_STALE_TIME,
  });

  return (
    <Form
      onSubmit={(values) => updateChecklistMutation.mutateAsync(values)}
      initialValues={
        props.resolve.checklist?.uuid
          ? { compliance_checklist: props.resolve.checklist.uuid }
          : undefined
      }
      render={({ handleSubmit, submitting, invalid, pristine }) => (
        <form onSubmit={handleSubmit}>
          <ModalDialog
            title={translate('Assigned compliance checklist')}
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
