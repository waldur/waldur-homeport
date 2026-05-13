import { useQuery } from '@tanstack/react-query';
import { FC, useMemo } from 'react';
import { Form } from 'react-final-form';
import { useSelector } from 'react-redux';
import {
  customerCreditsList,
  ProjectCreditRequest,
  projectCreditsCreate,
  projectCreditsUpdate,
} from 'waldur-js-client';

import { SHORT_STALE_TIME } from '@/core/constants';
import { LoadingErred } from '@/core/LoadingErred';
import { LoadingSpinner } from '@/core/LoadingSpinner';
import { SubmitButton } from '@/form';
import { translate } from '@/i18n';
import { CloseDialogButton } from '@/modal/CloseDialogButton';
import { ModalDialog } from '@/modal/ModalDialog';
import { useManagedMutation } from '@/modal/useManagedMutation';
import { getCustomer } from '@/workspace/selectors';

import { OrganizationProjectSelectField } from '../team/OrganizationProjectSelectField';

import { CreditFormError } from './CreditFormError';
import { MinimalConsumptionFields } from './MinimalConsumptionFields';
import { ProjectAllocateCreditField } from './ProjectAllocateCreditField';
import { ProjectCostChart } from './ProjectCostChart';
import { ProjectCreditFormData } from './types';
import { getCreditInitialValues } from './utils';

interface ProjectCreditDialogProps {
  resolve: {
    credit?: any;
    refetch?(): void;
  };
}

export const ProjectCreditDialog: FC<ProjectCreditDialogProps> = ({
  resolve,
}) => {
  const customer = useSelector(getCustomer);

  const {
    data: organizationCredit,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['organizationCredits', customer?.uuid],

    queryFn: () =>
      customerCreditsList({
        query: { customer_uuid: customer?.uuid },
      }).then((r) => r.data[0]),

    staleTime: SHORT_STALE_TIME,
  });

  const isEdit = Boolean(resolve.credit);

  const initialValues = useMemo(() => {
    if (isEdit) {
      return {
        project: {
          uuid: resolve.credit.project_uuid,
          name: resolve.credit.project_name,
          url: resolve.credit.project?.url || resolve.credit.project,
        },
        ...getCreditInitialValues(resolve.credit),
      };
    }
    return {};
  }, [resolve.credit, isEdit]);

  const submitMutation = useManagedMutation({
    mutationFn: (formData: ProjectCreditFormData) => {
      const body: ProjectCreditRequest = {
        ...formData,
        project: formData.project.url,
      };
      return isEdit
        ? projectCreditsUpdate({
            path: { uuid: resolve.credit.uuid },
            body,
          })
        : projectCreditsCreate({ body });
    },
    successMessage: isEdit
      ? translate('Project credit has been updated.')
      : translate('Project credit has been created.'),
    errorMessage: isEdit
      ? translate('Unable to update the project credit.')
      : translate('Unable to create a project credit.'),
    refetch: resolve.refetch,
  });

  return (
    <Form<ProjectCreditFormData>
      initialValues={initialValues}
      onSubmit={(values) => submitMutation.mutateAsync(values)}
      render={({ handleSubmit, submitting, invalid, dirty }) => (
        <form onSubmit={handleSubmit}>
          <ModalDialog
            title={
              isEdit
                ? translate('Edit project credit')
                : translate('Add project credit')
            }
            subtitle={translate(
              "Sum of all project credits must not exceed the organization's total available credit.",
            )}
            footer={
              <>
                <CloseDialogButton className="min-w-125px" />
                <SubmitButton
                  disabled={invalid || !dirty || !organizationCredit}
                  submitting={submitting}
                  label={isEdit ? translate('Edit') : translate('Confirm')}
                  className="btn btn-primary min-w-125px"
                  data-testid="submit-button"
                />
              </>
            }
          >
            <div className="size-lg">
              <OrganizationProjectSelectField disabled={isEdit} />
              {isLoading ? (
                <LoadingSpinner />
              ) : error ? (
                <LoadingErred loadData={refetch} />
              ) : (
                <ProjectAllocateCreditField
                  organizationCredit={organizationCredit?.value}
                  isEdit={isEdit}
                />
              )}
              <MinimalConsumptionFields initialValues={resolve.credit} />
              {isEdit && <ProjectCostChart />}
              <CreditFormError />
            </div>
          </ModalDialog>
        </form>
      )}
    />
  );
};
