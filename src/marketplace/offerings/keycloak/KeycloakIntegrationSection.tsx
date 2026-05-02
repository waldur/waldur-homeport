import {
  DownloadSimpleIcon,
  PlugsConnectedIcon,
  UploadSimpleIcon,
  CheckIcon,
  XIcon,
} from '@phosphor-icons/react';
import { useMutation } from '@tanstack/react-query';
import { get } from 'lodash-es';
import { FC, useCallback } from 'react';
import { Dropdown } from 'react-bootstrap';
import { offeringKeycloakGroupsTestConnection } from 'waldur-js-client';

import { Badge } from '@/core/Badge';
import FormTable from '@/form/FormTable';
import { translate } from '@/i18n';
import { SecretField as PlainSecretField } from '@/marketplace/common/SecretField';
import { useModal } from '@/modal/actions';
import { CloseDialogButton } from '@/modal/CloseDialogButton';
import { ModalDialog } from '@/modal/ModalDialog';
import { useNotify } from '@/store/notify';
import { ActionsDropdownComponent } from '@/table/ActionsDropdown';
import { DASH_ESCAPE_CODE } from '@/table/constants';

import { FieldEditButton } from '../update/integration/FieldEditButton';
import { OfferingEditPanelProps } from '../update/integration/types';
import { useUpdateOfferingIntegration } from '../update/integration/utils';

import { KEYCLOAK_FIELDS } from './constants';
import { ImportKeycloakSettingsDialog } from './ImportKeycloakSettingsDialog';

const REQUIRED_SECRET_KEYS = [
  'keycloak_url',
  'keycloak_realm',
  'keycloak_username',
  'keycloak_password',
];

const hasKeycloakCredentials = (offering: any): boolean =>
  REQUIRED_SECRET_KEYS.every((key) =>
    Boolean(get(offering, `secret_options.${key}`)),
  );

const TestConnectionResultDialog: FC<{
  resolve: { groups: string[]; groups_count: number };
}> = ({ resolve: { groups, groups_count } }) => (
  <ModalDialog
    title={translate('Connection test result')}
    footer={<CloseDialogButton />}
  >
    <p>
      {translate('Connection successful. Found {count} groups.', {
        count: groups_count,
      })}
    </p>
    {groups.length > 0 && (
      <div className="d-flex flex-wrap gap-2">
        {groups.map((name) => (
          <Badge key={name} variant="success" pill outline>
            {name}
          </Badge>
        ))}
      </div>
    )}
  </ModalDialog>
);

export const KeycloakIntegrationSection: FC<OfferingEditPanelProps> = (
  props,
) => {
  const { openDialog } = useModal();
  const { update } = useUpdateOfferingIntegration(
    props.offering,
    props.refetch,
  );
  const { showErrorResponse } = useNotify();

  const credentialsConfigured = hasKeycloakCredentials(props.offering);

  const handleExport = useCallback(() => {
    const secretOptions: Record<string, unknown> = {};
    const pluginOptions: Record<string, unknown> = {};

    for (const field of KEYCLOAK_FIELDS) {
      const value = get(props.offering, field.key);
      if (value !== undefined && value !== null && value !== '') {
        const [section, key] = field.key.split('.');
        if (section === 'secret_options') {
          secretOptions[key] = value;
        } else if (section === 'plugin_options') {
          pluginOptions[key] = value;
        }
      }
    }

    const exportData = {
      type: 'waldur-keycloak-integration',
      version: 1,
      exported_at: new Date().toISOString(),
      offering_name: props.offering.name || '',
      secret_options: secretOptions,
      plugin_options: pluginOptions,
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: 'application/json',
    });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${props.offering.name || 'keycloak'}-integration.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  }, [props.offering]);

  const handleImport = useCallback(() => {
    openDialog(ImportKeycloakSettingsDialog, {
      resolve: { update },
    });
  }, [update]);

  const { mutate: testConnection, isPending: isTesting } = useMutation({
    mutationFn: () =>
      offeringKeycloakGroupsTestConnection({
        body: { offering_uuid: props.offering.uuid },
      }),
    onSuccess: (response) => {
      const { groups_count, groups } = response.data;
      openDialog(TestConnectionResultDialog, {
        resolve: { groups: groups || [], groups_count },
      });
    },
    onError: (error) => {
      showErrorResponse(error, translate('Connection test failed.'));
    },
  });

  return (
    <FormTable.Card
      title={translate('Keycloak integration')}
      className="card-bordered"
      actions={
        <ActionsDropdownComponent labeled>
          <Dropdown.Item onClick={handleExport}>
            <DownloadSimpleIcon size={18} weight="bold" className="me-2" />
            {translate('Export settings')}
          </Dropdown.Item>
          <Dropdown.Item onClick={handleImport}>
            <UploadSimpleIcon size={18} weight="bold" className="me-2" />
            {translate('Import settings')}
          </Dropdown.Item>
          <Dropdown.Divider />
          <Dropdown.Item
            onClick={() => testConnection()}
            disabled={!credentialsConfigured || isTesting}
          >
            <PlugsConnectedIcon size={18} weight="bold" className="me-2" />
            {isTesting ? translate('Testing...') : translate('Test connection')}
          </Dropdown.Item>
        </ActionsDropdownComponent>
      }
    >
      <FormTable>
        {KEYCLOAK_FIELDS.map((field) => {
          const value = get(props.offering, field.key);
          return (
            <FormTable.Item
              key={field.key}
              label={field.label}
              description={field.description}
              value={
                field.isSecret ? (
                  <PlainSecretField value={value} />
                ) : field.isCheckbox ? (
                  value ? (
                    <CheckIcon className="text-success" weight="bold" />
                  ) : (
                    <XIcon className="text-danger" weight="bold" />
                  )
                ) : (
                  value || DASH_ESCAPE_CODE
                )
              }
              actions={
                <FieldEditButton
                  title={field.label}
                  scope={props.offering}
                  name={field.key}
                  callback={update}
                  fieldComponent={field.component}
                />
              }
            />
          );
        })}
      </FormTable>
    </FormTable.Card>
  );
};
