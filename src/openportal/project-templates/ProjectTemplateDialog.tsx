import { useMemo, useEffect, useState } from 'react';
import { Form } from 'react-final-form';
import {
  openportalProjectTemplateCreate,
  openportalProjectTemplatePartialUpdate,
  openportalProjectTemplateRetrieve,
} from 'waldur-js-client';

import { LoadingSpinner } from '@/core/LoadingSpinner';
import { SubmitButton } from '@/form';
import { translate } from '@/i18n';
import { ModalDialog } from '@/modal/ModalDialog';
import { useManagedMutation } from '@/modal/useManagedMutation';
import { PermissionEnum } from '@/permissions/enums';
import { hasPermission } from '@/permissions/hasPermission';
import { useUser, useCustomer } from '@/workspace/hooks';

import { getCustomerURL } from '../utils';

import { ProjectTemplateFormFields } from './ProjectTemplateFormFields';

const INITIAL_VALUES_CREATE: Partial<ProjectTemplateFormValues> = {
  role_mapping: {},
  allocation_units_mapping: {},
  offerings: [],
};

interface ProjectTemplateFormValues {
  uuid?: string;
  name: string;
  portal: string;
  offering: string;
  customer: any;
  shortname?: string;
  key?: string;
  offerings?: any[];
  approval_limit?: number;
  max_credit_limit?: number;
  role_mapping?: Record<string, any>;
  allocation_units_mapping?: Record<string, number>;
}

interface ProjectTemplateDialogProps {
  resolve: {
    refetch: () => Promise<void>;
    uuid?: string; // Present in edit mode
  };
}

const prepareSubmitData = (formValues, currentCustomer) => ({
  provider: getCustomerURL(currentCustomer),
  name: formValues.name,
  portal: formValues.portal,
  offering: formValues.offering,
  customer: getCustomerURL(formValues.customer),
  key: formValues.key,
  shortname: formValues.shortname,
  offerings: formValues.offerings?.map((offering) => offering.url) || [],
  approval_limit: formValues.approval_limit?.toString(),
  max_credit_limit: formValues.max_credit_limit?.toString(),
  role_mapping: formValues.role_mapping || {},
  allocation_units_mapping: formValues.allocation_units_mapping || {},
});

export const ProjectTemplateDialog: React.FC<ProjectTemplateDialogProps> = ({
  resolve,
}) => {
  const isEdit = !!resolve.uuid;

  const currentCustomer = useCustomer();
  const user = useUser();

  const [initialData, setInitialData] =
    useState<Partial<ProjectTemplateFormValues> | null>(
      isEdit ? null : INITIAL_VALUES_CREATE,
    );
  const [loading, setLoading] = useState(isEdit);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!isEdit) return;

    const fetchProjectTemplate = async () => {
      try {
        const data = (
          await openportalProjectTemplateRetrieve({
            path: { uuid: resolve.uuid },
          })
        ).data;
        if (!data) throw new Error('Project template not found.');

        setInitialData({
          ...data,
          customer: data.customer_data,
          offerings: data.offerings_data || [],
        } as any);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchProjectTemplate();
  }, [isEdit, resolve.uuid]);

  const canEditCustomer = useMemo(
    () =>
      hasPermission(user, {
        permission: PermissionEnum.UPDATE_CUSTOMER,
        customerId: currentCustomer?.uuid,
      }),
    [user, currentCustomer?.uuid],
  );

  const saveTemplateMutation = useManagedMutation<
    any,
    any,
    ProjectTemplateFormValues
  >({
    mutationFn: (formValues) => {
      const payload = prepareSubmitData(formValues, currentCustomer);
      if (isEdit) {
        return openportalProjectTemplatePartialUpdate({
          path: { uuid: formValues.uuid },
          body: payload,
        });
      } else {
        return openportalProjectTemplateCreate({ body: payload });
      }
    },
    successMessage: isEdit
      ? translate('Project template has been updated.')
      : translate('Project template has been created.'),
    errorMessage: isEdit
      ? translate('Unable to update the project template.')
      : translate('Unable to create the project template.'),
    refetch: resolve.refetch,
  });

  const dialogTitle = isEdit
    ? translate('Edit project template')
    : translate('Create a project template');

  if (!canEditCustomer) {
    return (
      <ModalDialog title={dialogTitle}>
        <div className="alert alert-danger" role="alert">
          {translate('You do not have permission to perform this action.')}
        </div>
      </ModalDialog>
    );
  }

  if (loading) {
    return (
      <ModalDialog title={dialogTitle}>
        <LoadingSpinner />
      </ModalDialog>
    );
  }

  if (error) {
    return (
      <ModalDialog title={dialogTitle}>
        <div className="alert alert-danger" role="alert">
          {translate('Error loading project template details.')}
        </div>
      </ModalDialog>
    );
  }

  return (
    <Form<ProjectTemplateFormValues>
      onSubmit={(values) => saveTemplateMutation.mutateAsync(values)}
      initialValues={initialData}
      subscription={{ submitting: true, invalid: true, pristine: true }}
      render={({ handleSubmit, submitting, invalid, pristine }) => (
        <form onSubmit={handleSubmit} noValidate>
          <ModalDialog
            title={dialogTitle}
            footer={
              <div className="mb-5 text-end">
                <SubmitButton
                  submitting={submitting}
                  invalid={invalid || (isEdit && pristine)}
                  label={translate('Save')}
                />
              </div>
            }
          >
            <ProjectTemplateFormFields />
          </ModalDialog>
        </form>
      )}
    />
  );
};
