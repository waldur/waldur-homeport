import { PlusCircleIcon } from '@phosphor-icons/react';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from '@uirouter/react';
import { useMemo, useState } from 'react';
import { Form } from 'react-final-form';
import {
  KindEnum,
  projectCreditsCreate,
  projectsCreate,
} from 'waldur-js-client';

import { formDataOptions, fileSerializer } from '@waldur/core/api';
import { formatISODate } from '@waldur/core/dateUtils';
import { fetchCustomerProjects } from '@waldur/customer/workspace/fetchCustomer';
import { SubmitButton } from '@waldur/form';
import { translate } from '@waldur/i18n';
import { CloseDialogButton } from '@waldur/modal/CloseDialogButton';
import { useModal } from '@waldur/modal/hooks';
import { ModalDialog } from '@waldur/modal/ModalDialog';
import { useNotify } from '@waldur/store/hooks';
import { Customer } from '@waldur/workspace/types';

import { CreditGroup } from './CreditGroup';
import { DescriptionGroup } from './DescriptionGroup';
import { EndDateGroup } from './EndDateGroup';
import { ImageGroup } from './ImageGroup';
import { IndustryGroup } from './IndustryGroup';
import { KindGroup } from './KindGroup';
import { NameGroup } from './NameGroup';
import { OecdCodeGroup } from './OecdCodeGroup';
import { OrganizationGroup } from './OrganizationGroup';
import { StartDateGroup } from './StartDateGroup';
import { TypeGroup } from './TypeGroup';

interface ProjectCreateDialogProps {
  customer?: Customer;
  refetch?: () => void;
}

interface ProjectFormData {
  name: string;
  description: string;
  end_date?: Date;
  start_date?: Date;
  customer: { url: string };
  type?: { url: string };
  oecd_fos_2007_code?: { value: string };
  is_industry: boolean;
  image?: File | Blob;
  project_credit?: string;
  kind?: KindEnum;
}

export const ProjectCreateDialog = ({
  customer: _customer,
  refetch,
}: ProjectCreateDialogProps) => {
  const { showSuccess, showErrorResponse } = useNotify();
  const { closeDialog } = useModal();
  const router = useRouter();

  const [selectedCustomer, setSelectedCustomer] = useState<Customer>(_customer);

  // Fetch customer projects
  const {
    data: projects,
    isLoading,
    error,
    refetch: refetchProjects,
  } = useQuery({
    queryKey: ['CustomerProjects', selectedCustomer?.uuid],
    queryFn: () =>
      !selectedCustomer
        ? null
        : selectedCustomer?.projects
          ? Promise.resolve(selectedCustomer.projects)
          : fetchCustomerProjects(selectedCustomer.uuid),
    staleTime: 5 * 60 * 1000,
  });

  const customer = useMemo(
    () => (selectedCustomer ? { ...selectedCustomer, projects } : undefined),
    [selectedCustomer, projects],
  );

  const onSubmit = async (formData: ProjectFormData) => {
    try {
      const response = await projectsCreate({
        body: {
          name: formData.name,
          description: formData.description,
          end_date: formData.end_date
            ? formatISODate(formData.end_date)
            : undefined,
          start_date: formData.start_date
            ? formatISODate(formData.start_date)
            : undefined,
          customer: formData.customer.url,
          type: formData.type?.url,
          oecd_fos_2007_code: formData.oecd_fos_2007_code?.value,
          is_industry: formData.is_industry,
          kind: formData.kind,
          image: fileSerializer(formData.image),
        },
        ...formDataOptions,
      });
      if (!response.error && formData.project_credit) {
        try {
          await projectCreditsCreate({
            body: {
              project: response.data.url,
              value: formData.project_credit,
            },
          });
        } catch (e) {
          showErrorResponse(
            e,
            translate('Error while assigning credit to the project.'),
          );
        }
      }
      if (refetch) {
        await refetch();
      }
      showSuccess(translate('Project has been created.'));
      closeDialog();
      router.stateService.go('project.dashboard', {
        uuid: response.data.uuid,
      });
    } catch (e) {
      showErrorResponse(e, translate('Unable to create project.'));
    }
  };

  return (
    <Form
      onSubmit={onSubmit}
      initialValues={{ customer }}
      render={({ handleSubmit, submitting, invalid, dirty, values }) => (
        <form onSubmit={handleSubmit}>
          <ModalDialog
            title={translate('Create project')}
            subtitle={translate(
              'Provide the required information to set up a new project.',
            )}
            iconNode={<PlusCircleIcon weight="bold" />}
            iconColor="success"
            footer={
              <>
                <CloseDialogButton className="flex-equal" />
                <SubmitButton
                  disabled={invalid || !dirty || isLoading || Boolean(error)}
                  submitting={submitting}
                  label={translate('Create')}
                  className="btn btn-primary flex-equal"
                />
              </>
            }
          >
            <div className="size-lg">
              <OrganizationGroup
                onChange={setSelectedCustomer}
                isDisabled={!!_customer}
              />
              <NameGroup
                customer={values?.customer}
                loading={isLoading}
                error={error}
                refetch={refetchProjects}
              />
              <DescriptionGroup create />
              <IndustryGroup />
              <OecdCodeGroup />
              <KindGroup create />

              <TypeGroup create />
              <StartDateGroup create />
              <EndDateGroup create />
              <CreditGroup customer={values?.customer || customer} />
              <ImageGroup create />
            </div>
          </ModalDialog>
        </form>
      )}
    />
  );
};
