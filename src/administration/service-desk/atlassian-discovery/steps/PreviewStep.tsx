import { CaretLeftIcon } from '@phosphor-icons/react';
import { FC } from 'react';
import { Alert, Card, Table } from 'react-bootstrap';
import { useFormState } from 'react-final-form';
import { supportSettingsAtlassianSaveSettings } from 'waldur-js-client';

import { SubmitButton } from '@/form/SubmitButton';
import { translate } from '@/i18n';
import { CloseDialogButton } from '@/modal/CloseDialogButton';
import { useManagedMutation } from '@/modal/useManagedMutation';
import { WizardModal, WizardStepProps } from '@/wizard';

import type { AtlassianFormValues } from '../types';

/**
 * Step 5: Preview and Save
 *
 * Shows a summary of all configured settings and saves to the backend.
 */
export const PreviewStep: FC<WizardStepProps> = (props) => {
  const { values } = useFormState<AtlassianFormValues>();

  const selectedProject = values.projects.find(
    (p) => p.id === values.selectedProjectId,
  );

  const selectedRequestTypes = values.requestTypes.filter((rt) =>
    (values.selectedRequestTypeIds || []).includes(rt.id),
  );

  const saveSettingsMutation = useManagedMutation<any, any, void>({
    mutationFn: () =>
      supportSettingsAtlassianSaveSettings({
        body: {
          api_url: values.api_url,
          auth_method: values.auth_method,
          email: values.email,
          token: values.token,
          personal_access_token: values.personal_access_token,
          username: values.username,
          password: values.password,
          verify_ssl: values.verify_ssl,
          project_id: values.selectedProjectId || '',
          issue_types: selectedRequestTypes.map((rt) => rt.name),
          reporter_field: values.fieldMappings?.reporter_field,
          impact_field: values.fieldMappings?.impact_field,
          organisation_field: values.fieldMappings?.organisation_field,
          project_field: values.fieldMappings?.project_field,
          affected_resource_field:
            values.fieldMappings?.affected_resource_field,
          caller_field: values.fieldMappings?.caller_field,
          template_field: values.fieldMappings?.template_field,
          waldur_backend_id_field:
            values.fieldMappings?.waldur_backend_id_field,
          default_offering_issue_type:
            values.fieldMappings?.default_offering_issue_type,
          confirm_save: true,
        },
      }),

    successMessage: translate('Atlassian settings saved successfully'),
    errorMessage: translate('Failed to save Atlassian settings'),

    invalidateQueries: [
      {
        queryKey: ['AdministrationServiceDesk'],
      },
    ],
  });

  // Custom footer for this step
  const renderFooter = () => (
    <>
      <SubmitButton
        submitting={false}
        variant="tertiary"
        className="min-w-125px me-auto"
        onClick={() => props.onPrev(values)}
        type="button"
        label={translate('Back')}
        iconNode={<CaretLeftIcon weight="bold" />}
        iconOnLeft
      />
      <CloseDialogButton className="min-w-125px" />
      <SubmitButton
        submitting={saveSettingsMutation.isPending}
        label={translate('Save Settings')}
        onClick={() => saveSettingsMutation.mutate()}
        type="button"
      />
    </>
  );

  return (
    <WizardModal {...props} renderFooter={renderFooter}>
      <h4 className="mb-4">{translate('Preview Settings')}</h4>
      <p className="text-muted mb-4">
        {translate(
          'Review the settings below before saving. These will be stored in the system configuration.',
        )}
      </p>

      <Card className="mb-4">
        <Card.Header>
          <h5 className="mb-0">{translate('Connection')}</h5>
        </Card.Header>
        <Card.Body>
          <Table borderless size="sm">
            <tbody>
              <tr>
                <td className="text-muted" style={{ width: '40%' }}>
                  {translate('API URL')}
                </td>
                <td>
                  <code>{values.api_url}</code>
                </td>
              </tr>
              <tr>
                <td className="text-muted">
                  {translate('Authentication Method')}
                </td>
                <td>{values.auth_method}</td>
              </tr>
            </tbody>
          </Table>
        </Card.Body>
      </Card>

      <Card className="mb-4">
        <Card.Header>
          <h5 className="mb-0">{translate('Project')}</h5>
        </Card.Header>
        <Card.Body>
          <Table borderless size="sm">
            <tbody>
              <tr>
                <td className="text-muted" style={{ width: '40%' }}>
                  {translate('Selected Project')}
                </td>
                <td>
                  <strong>{selectedProject?.name}</strong>{' '}
                  <span className="text-muted">({selectedProject?.key})</span>
                </td>
              </tr>
              <tr>
                <td className="text-muted">{translate('Project ID')}</td>
                <td>
                  <code>{selectedProject?.id}</code>
                </td>
              </tr>
            </tbody>
          </Table>
        </Card.Body>
      </Card>

      <Card className="mb-4">
        <Card.Header>
          <h5 className="mb-0">{translate('Request Types')}</h5>
        </Card.Header>
        <Card.Body>
          {selectedRequestTypes.length > 0 ? (
            <Table borderless size="sm">
              <thead>
                <tr>
                  <th>{translate('Name')}</th>
                  <th>{translate('Issue Type ID')}</th>
                </tr>
              </thead>
              <tbody>
                {selectedRequestTypes.map((rt) => (
                  <tr key={rt.id}>
                    <td>{rt.name}</td>
                    <td>
                      <code>{rt.issue_type_id}</code>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          ) : (
            <span className="text-muted">
              {translate('No request types selected')}
            </span>
          )}
        </Card.Body>
      </Card>

      <Card className="mb-4">
        <Card.Header>
          <h5 className="mb-0">{translate('Field Mappings')}</h5>
        </Card.Header>
        <Card.Body>
          <Table borderless size="sm">
            <tbody>
              <tr>
                <td className="text-muted" style={{ width: '40%' }}>
                  {translate('Reporter Field')}
                </td>
                <td>
                  {values.fieldMappings?.reporter_field ? (
                    <code>{values.fieldMappings.reporter_field}</code>
                  ) : (
                    <span className="text-muted">
                      {translate('Not mapped')}
                    </span>
                  )}
                </td>
              </tr>
              <tr>
                <td className="text-muted">{translate('Impact Field')}</td>
                <td>
                  {values.fieldMappings?.impact_field ? (
                    <code>{values.fieldMappings.impact_field}</code>
                  ) : (
                    <span className="text-muted">
                      {translate('Not mapped')}
                    </span>
                  )}
                </td>
              </tr>
              <tr>
                <td className="text-muted">
                  {translate('Organisation Field')}
                </td>
                <td>
                  {values.fieldMappings?.organisation_field ? (
                    <code>{values.fieldMappings.organisation_field}</code>
                  ) : (
                    <span className="text-muted">
                      {translate('Not mapped')}
                    </span>
                  )}
                </td>
              </tr>
              <tr>
                <td className="text-muted">{translate('Project Field')}</td>
                <td>
                  {values.fieldMappings?.project_field ? (
                    <code>{values.fieldMappings.project_field}</code>
                  ) : (
                    <span className="text-muted">
                      {translate('Not mapped')}
                    </span>
                  )}
                </td>
              </tr>
              <tr>
                <td className="text-muted">
                  {translate('Affected Resource Field')}
                </td>
                <td>
                  {values.fieldMappings?.affected_resource_field ? (
                    <code>{values.fieldMappings.affected_resource_field}</code>
                  ) : (
                    <span className="text-muted">
                      {translate('Not mapped')}
                    </span>
                  )}
                </td>
              </tr>
              <tr>
                <td className="text-muted">{translate('Caller Field')}</td>
                <td>
                  {values.fieldMappings?.caller_field ? (
                    <code>{values.fieldMappings.caller_field}</code>
                  ) : (
                    <span className="text-muted">
                      {translate('Not mapped')}
                    </span>
                  )}
                </td>
              </tr>
              <tr>
                <td className="text-muted">{translate('Template Field')}</td>
                <td>
                  {values.fieldMappings?.template_field ? (
                    <code>{values.fieldMappings.template_field}</code>
                  ) : (
                    <span className="text-muted">
                      {translate('Not mapped')}
                    </span>
                  )}
                </td>
              </tr>
              <tr>
                <td className="text-muted">
                  {translate('Waldur Backend ID Field')}
                </td>
                <td>
                  {values.fieldMappings?.waldur_backend_id_field ? (
                    <code>{values.fieldMappings.waldur_backend_id_field}</code>
                  ) : (
                    <span className="text-muted">
                      {translate('Not mapped')}
                    </span>
                  )}
                </td>
              </tr>
              <tr>
                <td className="text-muted">{translate('Default Priority')}</td>
                <td>
                  {values.fieldMappings?.default_priority ? (
                    <>
                      {(values.priorities || []).find(
                        (p) => p.id === values.fieldMappings?.default_priority,
                      )?.name || values.fieldMappings.default_priority}
                    </>
                  ) : (
                    <span className="text-muted">{translate('Not set')}</span>
                  )}
                </td>
              </tr>
              <tr>
                <td className="text-muted">
                  {translate('Default Offering Issue Type')}
                </td>
                <td>
                  {values.fieldMappings?.default_offering_issue_type ? (
                    <>{values.fieldMappings.default_offering_issue_type}</>
                  ) : (
                    <span className="text-muted">{translate('Not set')}</span>
                  )}
                </td>
              </tr>
            </tbody>
          </Table>
        </Card.Body>
      </Card>

      <Alert variant="info">
        {translate(
          'Note: Credentials (API token, password, etc.) will be securely stored and are not shown in this preview.',
        )}
      </Alert>
    </WizardModal>
  );
};
