import { FC, useCallback, useMemo, useState } from 'react';
import { Alert, Form } from 'react-bootstrap';
import {
  EligibleProject,
  matrixRoomsCreate,
  matrixRoomsEligibleProjectsList,
} from 'waldur-js-client';

import { SubmitButton } from '@/form';
import { AsyncSelect } from '@/form/select';
import { translate } from '@/i18n';
import { organizationAutocomplete } from '@/marketplace/common/autocompletes';
import { CloseDialogButton } from '@/modal/CloseDialogButton';
import { ModalDialog } from '@/modal/ModalDialog';
import { useManagedMutation } from '@/modal/useManagedMutation';
import { useNotify } from '@/store/notify';

const loadEligibleProjects = async (customerUuid: string, query: string) => {
  const res = await matrixRoomsEligibleProjectsList({
    query: { customer_uuid: customerUuid },
  });
  const projects: EligibleProject[] = res.data ?? [];
  const filtered = query
    ? projects.filter((p) => p.name.toLowerCase().includes(query.toLowerCase()))
    : projects;
  return { options: filtered, hasMore: false };
};

interface AdminCreateMatrixRoomDialogProps {
  resolve: {
    refetch?(): void;
  };
}

const parseValidationError = (e: any): string => {
  if (!e || typeof e !== 'object') return null;
  // SDK with throwOnError throws the parsed JSON body directly
  if (e.project) {
    return Array.isArray(e.project) ? e.project[0] : e.project;
  }
  if (e.detail) return e.detail;
  if (e.non_field_errors) {
    return Array.isArray(e.non_field_errors)
      ? e.non_field_errors[0]
      : e.non_field_errors;
  }
  return null;
};

export const AdminCreateMatrixRoomDialog: FC<
  AdminCreateMatrixRoomDialogProps
> = ({ resolve }) => {
  const { showErrorResponse } = useNotify();
  const [customer, setCustomer] = useState<any>(null);
  const [project, setProject] = useState<any>(null);
  const [error, setError] = useState<string>(null);

  const loadOrganizations = useMemo(
    () =>
      organizationAutocomplete({
        field: ['name', 'uuid', 'url'],
        o: 'name',
      }),
    [],
  );

  const handleCustomerChange = useCallback((value) => {
    setCustomer(value);
    setProject(null);
    setError(null);
  }, []);

  const handleProjectChange = useCallback((value) => {
    setProject(value);
    setError(null);
  }, []);

  const { mutate: createRoom, isPending } = useManagedMutation<
    unknown,
    unknown,
    string
  >({
    mutationFn: (projectUuid) =>
      matrixRoomsCreate({ body: { project: projectUuid } }),
    successMessage: translate('Chat room creation has been initiated.'),
    refetch: resolve.refetch,
    onError: (e) => {
      const message = parseValidationError(e);
      if (message) {
        setError(message);
      } else {
        showErrorResponse(e, translate('Unable to create chat room.'));
      }
    },
  });

  const handleCreate = useCallback(() => {
    if (!project) return;
    setError(null);
    createRoom(project.uuid);
  }, [project, createRoom]);

  return (
    <ModalDialog
      title={translate('Create chat room')}
      footer={
        <>
          <CloseDialogButton />
          <SubmitButton
            submitting={isPending}
            disabled={!project}
            disabledReason={
              !project ? translate('Select a project first.') : undefined
            }
            label={translate('Create')}
            onClick={handleCreate}
          />
        </>
      }
    >
      <p className="mb-4">
        {translate(
          'Select a project to create a Matrix chat room for. All project members will be invited automatically.',
        )}
      </p>
      {error && <Alert variant="danger">{error}</Alert>}
      <Form.Group className="mb-4">
        <Form.Label>{translate('Organization')}</Form.Label>
        <AsyncSelect
          placeholder={translate('Select organization...')}
          noOptionsMessage={() => translate('No organizations found')}
          loadOptions={loadOrganizations}
          value={customer}
          onChange={handleCustomerChange}
          getOptionValue={(option) => option.uuid}
          getOptionLabel={(option) => option.name}
          isClearable
        />
      </Form.Group>
      <Form.Group>
        <Form.Label>{translate('Project')}</Form.Label>
        <AsyncSelect
          key={customer?.uuid}
          placeholder={
            customer
              ? translate('Select project...')
              : translate('Select organization first')
          }
          noOptionsMessage={() =>
            translate('No projects available for a new chat room')
          }
          loadOptions={(query) => loadEligibleProjects(customer.uuid, query)}
          value={project}
          onChange={handleProjectChange}
          getOptionValue={(option) => option.uuid}
          getOptionLabel={(option) => option.name}
          isDisabled={!customer}
          isClearable
        />
      </Form.Group>
    </ModalDialog>
  );
};
