import { ReactNode, useState } from 'react';
import { Form } from 'react-bootstrap';

import { CompactSubmitButton } from '@/form/CompactSubmitButton';
import { translate } from '@/i18n';
import { ModalDialog } from '@/modal/ModalDialog';
import { useManagedMutation } from '@/modal/useManagedMutation';
import { useUser } from '@/workspace/hooks';

export interface AccessSubnetRow {
  uuid: string;
  inet: string;
  description: string;
  /** Absent on the offering-default variant, which has no provenance concept. */
  is_staff_managed?: boolean;
  applies_to_portal?: boolean;
  offerings?: string[];
}

/**
 * Validate a CIDR the way the backend does, so the user is not told the value is
 * fine only to have the API reject it.
 *
 * `singleHostOnly` mirrors the non-staff rule. The check is a real parse rather
 * than a `.endsWith('/32')` test, which silently rejected every valid IPv6 host.
 */
const validateAccessSubnetCidr = (
  value: string,
  singleHostOnly: boolean,
): string => {
  const trimmed = String(value).trim();
  if (!trimmed) {
    return translate('Enter a CIDR address.');
  }
  const [address, prefixPart] = trimmed.split('/');
  const isIpv6 = address.includes(':');
  const maxPrefix = isIpv6 ? 128 : 32;

  // A bare address is a single host, which the backend widens to /32 or /128.
  const prefix = prefixPart === undefined ? maxPrefix : Number(prefixPart);
  if (!Number.isInteger(prefix) || prefix < 0 || prefix > maxPrefix) {
    return translate('Enter a valid CIDR address.');
  }
  if (prefix === 0) {
    return translate('A /0 mask is not allowed: it matches every address.');
  }
  if (singleHostOnly && prefix !== maxPrefix) {
    return translate('Only a single IP address (/{prefix}) is allowed.', {
      prefix: maxPrefix,
    });
  }
  return '';
};

interface AccessSubnetFormConfig {
  /** Name of the scope field in the request body (customer / resource / offering). */
  scopeField: string;
  /** URL of the scope object the subnet belongs to. */
  scopeUrl?: string;
  create: (body: Record<string, any>) => Promise<any>;
  update: (uuid: string, body: Record<string, any>) => Promise<any>;
  /**
   * When true, non-staff users are held to a single host. Staff may enter any
   * width except /0. The offering-default variant leaves this unset, since a
   * provider may publish any width for its own offering.
   */
  enforceSingleHost?: boolean;
  placeholder: string;
  /**
   * Extra fields rendered above CIDR, in create and edit alike. The
   * organization variant uses it for scope, which stays editable after
   * creation — the grid changes many rows at once, this finishes one.
   */
  renderExtraFields?: (args: {
    values: Record<string, any>;
    onChange: (name: string, value: any) => void;
  }) => ReactNode;
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
  const user = useUser();
  const isEditMode = !!row;
  const [formData, setFormData] = useState<Record<string, any>>({
    inet: row?.inet || '',
    description: row?.description || '',
    // Scope only exists for the variant that renders it; the offering-default
    // variant has no such concept and must not get the keys in its payload.
    ...(config.renderExtraFields
      ? {
          applies_to_portal: row?.applies_to_portal ?? false,
          offerings: row?.offerings ?? [],
        }
      : {}),
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

  // Staff may enter wider ranges; everyone else is held to a single host. The
  // /0 rejection applies to all three scopes and is enforced inside the helper.
  const singleHostOnly = !!config.enforceSingleHost && !user.is_staff;
  const cidrError = validateAccessSubnetCidr(formData.inet, singleHostOnly);

  const handleInputChange = (e) => {
    const next = { ...formData, [e.target.name]: e.target.value };
    setFormData(next);
    if (e.target.name === 'inet') {
      setError(validateAccessSubnetCidr(e.target.value, singleHostOnly));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (cidrError) {
      setError(cidrError);
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
        {config.renderExtraFields?.({
          values: formData,
          onChange: (name, value) =>
            setFormData((current) => ({ ...current, [name]: value })),
        })}
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
