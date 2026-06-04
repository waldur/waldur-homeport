import { FC, useCallback, useEffect } from 'react';
import { Form, useForm, useFormState } from 'react-final-form';
import { Project } from 'waldur-js-client';

import { SubmitButton } from '@/form';
import { translate } from '@/i18n';
import { OrganizationAutocomplete } from '@/marketplace/orders/OrganizationAutocomplete';
import { ProjectAutocomplete } from '@/marketplace/resources/list/ProjectAutocomplete';
import { useModal } from '@/modal/actions';
import { CloseDialogButton } from '@/modal/CloseDialogButton';
import { ModalDialog } from '@/modal/ModalDialog';
import { Customer } from '@/workspace/types';

import { useOrganizationAndProjectAutocompletesForResources } from './utils';

interface FormData {
  organization?: Customer;
  project?: Project;
}

interface FilterByOrgAndProjectDialogProps {
  resolve?: {
    initialValues?: FormData;
  };
  initialValues?: FormData;
}

const DialogFields: FC = () => {
  const form = useForm();
  const { values } = useFormState<FormData>();

  const organization = values?.organization;
  const project = values?.project;
  const organizationUuid = organization?.uuid;
  const projectCustomerUuid = project?.customer_uuid;

  // Clear project filter if organization is cleared or changed
  useEffect(() => {
    if (!project) return;
    if (!organization || organizationUuid !== projectCustomerUuid) {
      form.change('project', undefined);
    }
  }, [project, organization, organizationUuid, projectCustomerUuid, form]);

  return (
    <div className="d-flex flex-column gap-7">
      <OrganizationAutocomplete />
      <ProjectAutocomplete
        customer_uuid={organizationUuid}
        isDisabled={!organizationUuid}
      />
    </div>
  );
};

export const FilterByOrgAndProjectDialog: FC<
  FilterByOrgAndProjectDialogProps
> = (props) => {
  const { closeDialog } = useModal();
  const { syncResourceFilters } =
    useOrganizationAndProjectAutocompletesForResources();

  const initialValues = props.resolve?.initialValues || props.initialValues;

  const apply = useCallback(
    (formData: FormData) => {
      if (formData) {
        syncResourceFilters(formData);
        closeDialog();
      }
    },
    [syncResourceFilters, closeDialog],
  );

  return (
    <Form<FormData>
      onSubmit={apply}
      initialValues={initialValues}
      render={({ handleSubmit, submitting }) => (
        <form onSubmit={handleSubmit}>
          <ModalDialog
            title={translate('Filter by organization/project')}
            subtitle={translate(
              'Filter results by chosen organization and project',
            )}
            footer={
              <>
                <CloseDialogButton className="flex-equal" />
                <SubmitButton
                  submitting={submitting}
                  className="flex-equal"
                  label={translate('Apply')}
                />
              </>
            }
          >
            <DialogFields />
          </ModalDialog>
        </form>
      )}
    />
  );
};
