import { useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { Alert, Button, Card, Table } from 'react-bootstrap';
import { useDispatch } from 'react-redux';
import { supportSettingsAtlassianSaveSettings } from 'waldur-js-client';

import { translate } from '@waldur/i18n';
import { closeModalDialog } from '@waldur/modal/actions';
import { showErrorResponse, showSuccess } from '@waldur/store/notify';

import type { DiscoveryState } from '../types';

interface PreviewStepProps {
  state: DiscoveryState;
  onBack: () => void;
  onClose: () => void;
}

export const PreviewStep = ({ state, onBack, onClose }: PreviewStepProps) => {
  const dispatch = useDispatch();
  const queryClient = useQueryClient();
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      await supportSettingsAtlassianSaveSettings({
        body: {
          ...state.credentials!,
          project_id: state.selectedProject?.id || '',
          // Selected request types are activated in the database by the backend
          issue_types: state.selectedRequestTypes.map((rt) => rt.name),
          reporter_field: state.fieldMappings.reporter_field,
          impact_field: state.fieldMappings.impact_field,
          organisation_field: state.fieldMappings.organisation_field,
          project_field: state.fieldMappings.project_field,
          affected_resource_field: state.fieldMappings.affected_resource_field,
          caller_field: state.fieldMappings.caller_field,
          template_field: state.fieldMappings.template_field,
          waldur_backend_id_field: state.fieldMappings.waldur_backend_id_field,
          default_offering_issue_type:
            state.fieldMappings.default_offering_issue_type,
          confirm_save: true,
        },
      });

      queryClient.invalidateQueries({
        queryKey: ['AdministrationServiceDesk'],
      });

      dispatch(showSuccess(translate('Atlassian settings saved successfully')));
      dispatch(closeModalDialog());
    } catch (e: any) {
      dispatch(
        showErrorResponse(e, translate('Failed to save Atlassian settings')),
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
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
                  <code>{state.credentials?.api_url}</code>
                </td>
              </tr>
              <tr>
                <td className="text-muted">
                  {translate('Authentication Method')}
                </td>
                <td>{state.credentials?.auth_method}</td>
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
                  <strong>{state.selectedProject?.name}</strong>{' '}
                  <span className="text-muted">
                    ({state.selectedProject?.key})
                  </span>
                </td>
              </tr>
              <tr>
                <td className="text-muted">{translate('Project ID')}</td>
                <td>
                  <code>{state.selectedProject?.id}</code>
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
          {state.selectedRequestTypes.length > 0 ? (
            <Table borderless size="sm">
              <thead>
                <tr>
                  <th>{translate('Name')}</th>
                  <th>{translate('Issue Type ID')}</th>
                </tr>
              </thead>
              <tbody>
                {state.selectedRequestTypes.map((rt) => (
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
                  {state.fieldMappings.reporter_field ? (
                    <code>{state.fieldMappings.reporter_field}</code>
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
                  {state.fieldMappings.impact_field ? (
                    <code>{state.fieldMappings.impact_field}</code>
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
                  {state.fieldMappings.organisation_field ? (
                    <code>{state.fieldMappings.organisation_field}</code>
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
                  {state.fieldMappings.project_field ? (
                    <code>{state.fieldMappings.project_field}</code>
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
                  {state.fieldMappings.affected_resource_field ? (
                    <code>{state.fieldMappings.affected_resource_field}</code>
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
                  {state.fieldMappings.caller_field ? (
                    <code>{state.fieldMappings.caller_field}</code>
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
                  {state.fieldMappings.template_field ? (
                    <code>{state.fieldMappings.template_field}</code>
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
                  {state.fieldMappings.waldur_backend_id_field ? (
                    <code>{state.fieldMappings.waldur_backend_id_field}</code>
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
                  {state.fieldMappings.default_priority ? (
                    <>
                      {state.priorities.find(
                        (p) => p.id === state.fieldMappings.default_priority,
                      )?.name || state.fieldMappings.default_priority}
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
                  {state.fieldMappings.default_offering_issue_type ? (
                    <>{state.fieldMappings.default_offering_issue_type}</>
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

      <div className="d-flex justify-content-end gap-2 mt-6">
        <Button variant="secondary" onClick={onClose}>
          {translate('Cancel')}
        </Button>
        <Button variant="tertiary" onClick={onBack}>
          {translate('Back')}
        </Button>
        <Button variant="primary" onClick={handleSave} disabled={saving}>
          {saving ? translate('Saving...') : translate('Save Settings')}
        </Button>
      </div>
    </div>
  );
};
