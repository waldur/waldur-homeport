import { useState } from 'react';
import { Form } from 'react-bootstrap';

import { CompactSubmitButton } from '@/form/CompactSubmitButton';
import { translate } from '@/i18n';
import { ModalDialog } from '@/modal/ModalDialog';
import { useManagedMutation } from '@/modal/useManagedMutation';

export interface AccessSubnetRow {
  uuid: string;
  inet: string;
  description: string;
}

interface AccessSubnetFormConfig {
  /** Name of the scope field in the request body (customer / resource / offering). */
  scopeField: string;
  /** URL of the scope object the subnet belongs to. */
  scopeUrl?: string;
  create: (body: Record<string, any>) => Promise<any>;
  update: (uuid: string, body: Record<string, any>) => Promise<any>;
  /** When true, only single-host /32 CIDRs are accepted. */
  enforceSingleHost?: boolean;
  placeholder: string;
  titleCreate: string;
  titleEdit: string;
  successCreate: string;
  successUpdate: string;
  errorCreate: string;
  errorUpdate: string;
}

interface AccessSubnetFormDialogProps {
  refetch?(): void;
  row?: AccessSubnetRow;
  config: AccessSubnetFormConfig;
}

/**
 * Shared create/edit dialog for access subnets. Reused by the organization,
 * per-resource and offering-default variants, which differ only in scope, the
 * SDK endpoints, and whether wider CIDRs than /32 are allowed.
 */
export const AccessSubnetFormDialog = ({
  refetch,
  row,
  config,
}: AccessSubnetFormDialogProps) => {
  const isEditMode = !!row;
  const [formData, setFormData] = useState<Record<string, any>>({
    inet: row?.inet || '',
    description: row?.description || '',
    [config.scopeField]: config.scopeUrl || undefined,
  });
  const [error, setError] = useState('');

  const { mutate, isPending } = useManagedMutation<any, any, void>({
    mutationFn: () =>
      isEditMode
        ? config.update(row.uuid, formData)
        : config.create({ ...formData, [config.scopeField]: config.scopeUrl }),
    successMessage: isEditMode ? config.successUpdate : config.successCreate,
    errorMessage: isEditMode ? config.errorUpdate : config.errorCreate,
    refetch,
  });

  const singleHostError =
    config.enforceSingleHost && !String(formData.inet).endsWith('/32')
      ? translate('Only /32 mask is allowed.')
      : '';

  const handleInputChange = (e) => {
    const next = { ...formData, [e.target.name]: e.target.value };
    setFormData(next);
    if (config.enforceSingleHost && e.target.name === 'inet') {
      setError(
        e.target.value.endsWith('/32')
          ? ''
          : translate('Only /32 mask is allowed.'),
      );
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (singleHostError) {
      setError(singleHostError);
      return;
    }
    mutate();
  };

  return (
    <Form onSubmit={handleSubmit}>
      <ModalDialog
        title={isEditMode ? config.titleEdit : config.titleCreate}
        footer={
          <CompactSubmitButton
            submitting={isPending}
            label={isEditMode ? translate('Update') : translate('Create')}
          />
        }
      >
        <Form.Group>
          <Form.Label>{translate('CIDR')}</Form.Label>
          <Form.Control
            type="text"
            name="inet"
            value={formData.inet}
            onChange={handleInputChange}
            placeholder={config.placeholder}
            isInvalid={!!error}
          />
          {error && (
            <Form.Control.Feedback type="invalid">
              {error}
            </Form.Control.Feedback>
          )}
        </Form.Group>
        <Form.Group>
          <Form.Label>{translate('Description')}</Form.Label>
          <Form.Control
            type="text"
            name="description"
            value={formData.description}
            onChange={handleInputChange}
          />
        </Form.Group>
      </ModalDialog>
    </Form>
  );
};
