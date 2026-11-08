import { FC, useMemo } from 'react';
import { Form } from 'react-final-form';
import {
  // CreateChecklistRequest,
  checklistsAdminCreate,
  checklistsAdminPartialUpdate,
  PatchedChecklistRequest,
  ChecklistRequest,
  // PatchedCreateChecklistRequest,
} from 'waldur-js-client';

import { required } from '@/core/validators';
import {
  AsyncSelectGroup,
  SubmitButton,
  StringGroup,
  SelectGroup,
  TextGroup,
} from '@/form';
import { translate } from '@/i18n';
import { organizationAutocomplete } from '@/marketplace/common/autocompletes';
import { isExperimentalUiComponentsVisible } from '@/marketplace/utils';
import { CloseDialogButton } from '@/modal/CloseDialogButton';
import { ModalDialog } from '@/modal/ModalDialog';
import { useManagedMutation } from '@/modal/useManagedMutation';

import { checklistTypeOptions, isCallFormChecklistType } from '../utils';

const loadOrganizations = organizationAutocomplete({
  field: ['name', 'uuid'],
  o: 'name',
});

interface ChecklistFormDialogProps {
  resolve: {
    checklistUuid?: string;
    refetch: () => void;
  };
  initialValues?: Omit<PatchedChecklistRequest, 'customer'> & {
    customer?: { uuid: string; name: string } | null;
  };
}

export const ChecklistFormDialog: FC<ChecklistFormDialogProps> = ({
  resolve: { checklistUuid, refetch },
  initialValues,
}) => {
  const isEdit = Boolean(checklistUuid);

  const onSubmitMutation = useManagedMutation<any, any, any>({
    mutationFn: (formData) => {
      const body: ChecklistRequest = {
        name: formData.name,
        description: formData.description,
        checklist_type: formData.checklist_type,
        // Empty: a checklist the whole portal shares. Only call forms belong
        // to an organization; nothing else reads it.
        customer: isCallFormChecklistType(formData.checklist_type)
          ? (formData.customer?.uuid ?? null)
          : null,
      };
      if (isEdit) {
        return checklistsAdminPartialUpdate({
          path: { uuid: checklistUuid },
          body,
        }).then((response) => response.data);
      } else {
        return checklistsAdminCreate({ body }).then(
          (response) => response.data,
        );
      }
    },
    successMessage: isEdit
      ? translate('Checklist has been updated.')
      : translate('Checklist has been added.'),
    errorMessage: isEdit
      ? translate('Unable to update checklist.')
      : translate('Unable to add checklist.'),
    refetch,
  });

  const showExperimentalUiComponents = isExperimentalUiComponentsVisible();
  const allowedChecklistTypeOptions = useMemo(
    () =>
      showExperimentalUiComponents
        ? checklistTypeOptions
        : checklistTypeOptions.filter((opt) =>
            ['project_metadata', 'feedback'].includes(opt.value),
          ),
    [],
  );

  return (
    <Form
      onSubmit={(values) => onSubmitMutation.mutateAsync(values)}
      initialValues={initialValues}
      render={({ handleSubmit, submitting, pristine, invalid, values }) => (
        <form onSubmit={handleSubmit}>
          <ModalDialog
            title={
              isEdit
                ? translate('Edit checklist')
                : translate('Create new checklist')
            }
            footer={
              <>
                <CloseDialogButton />
                <SubmitButton
                  disabled={invalid || pristine}
                  submitting={submitting}
                  label={
                    isEdit ? translate('Save changes') : translate('Confirm')
                  }
                  variant="primary"
                />
              </>
            }
          >
            <StringGroup
              name="name"
              validate={required}
              placeholder={translate('e.g. GDPR Compliance')}
              label={translate('Checklist name')}
              required
              space={4}
            />

            <SelectGroup
              name="checklist_type"
              options={allowedChecklistTypeOptions}
              validate={required}
              simpleValue
              label={translate('Checklist type')}
              required
              space={4}
            />

            {isCallFormChecklistType(values.checklist_type) && (
              <AsyncSelectGroup
                name="customer"
                label={translate('Organization')}
                description={translate(
                  'Only the calls of this organization use the checklist, and only its people see it. Leave empty for a checklist the whole portal shares.',
                )}
                placeholder={translate('Shared by the whole portal')}
                loadOptions={loadOrganizations}
                debounceTimeout={500}
                defaultOptions
                getOptionValue={(option) => option.uuid}
                getOptionLabel={(option) => option.name}
                noOptionsMessage={() => translate('No organizations found')}
                isClearable={true}
                space={4}
              />
            )}

            <TextGroup
              name="description"
              placeholder={translate('Brief description of this checklist...')}
              label={translate('Description')}
              space={4}
            />
          </ModalDialog>
        </form>
      )}
    />
  );
};
