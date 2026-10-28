import { CaretLeftIcon } from '@phosphor-icons/react';
import { FC } from 'react';
import { useFormState } from 'react-final-form';
import { supportSettingsAtlassianSaveSettings } from 'waldur-js-client';

import { AlertItem, BaseButton } from 'waldur-ui';

import { translate } from '@/i18n';
import { CloseDialogButton } from '@/modal/CloseDialogButton';
import { useManagedMutation } from '@/modal/useManagedMutation';
import { WizardModal, WizardStepProps } from '@/wizard';

import { getAtlassianAuthMethodLabel } from '../../atlassianAuth';
import { AtlassianFormValues, extractCredentials } from '../types';

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
          ...extractCredentials(values),
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
      <BaseButton
        variant="tertiary"
        className="min-w-[125px] me-auto"
        onClick={() => props.onPrev(values)}
        label={translate('Back')}
        iconNode={<CaretLeftIcon weight="bold" />}
        size="lg"
      />
      <CloseDialogButton className="min-w-[125px]" />
      <BaseButton
        pending={saveSettingsMutation.isPending}
        label={translate('Save Settings')}
        onClick={() => saveSettingsMutation.mutate()}
        variant="primary"
        size="lg"
      />
    </>
  );

  return (
    <WizardModal {...props} renderFooter={renderFooter}>
      <h4 className="mb-3">{translate('Preview Settings')}</h4>
      <p className="text-quaternary mb-3">
        {translate(
          'Review the settings below before saving. These will be stored in the system configuration.',
        )}
      </p>

      <div className="card mb-3">
        <div className="card-header">
          <h5 className="mb-0">{translate('Connection')}</h5>
        </div>
        <div className="card-body">
          <table className="table table-sm table-borderless">
            <tbody>
              <tr>
                <td className="text-quaternary" style={{ width: '40%' }}>
                  {translate('API URL')}
                </td>
                <td>
                  <code>{values.resolvedApiUrl || values.api_url}</code>
                </td>
              </tr>
              <tr>
                <td className="text-quaternary">
                  {translate('Authentication Method')}
                </td>
                <td>{getAtlassianAuthMethodLabel(values.auth_method)}</td>
              </tr>
              {values.auth_method === 'oauth2_client_credentials' && (
                <tr>
                  <td className="text-quaternary">{translate('Client ID')}</td>
                  <td>
                    <code>{values.client_id}</code>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="card mb-3">
        <div className="card-header">
          <h5 className="mb-0">{translate('Project')}</h5>
        </div>
        <div className="card-body">
          <table className="table table-sm table-borderless">
            <tbody>
              <tr>
                <td className="text-quaternary" style={{ width: '40%' }}>
                  {translate('Selected Project')}
                </td>
                <td>
                  <strong>{selectedProject?.name}</strong>{' '}
                  <span className="text-quaternary">
                    ({selectedProject?.key})
                  </span>
                </td>
              </tr>
              <tr>
                <td className="text-quaternary">{translate('Project ID')}</td>
                <td>
                  <code>{selectedProject?.id}</code>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div className="card mb-3">
        <div className="card-header">
          <h5 className="mb-0">{translate('Request Types')}</h5>
        </div>
        <div className="card-body">
          {selectedRequestTypes.length > 0 ? (
            <table className="table table-sm table-borderless">
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
            </table>
          ) : (
            <span className="text-quaternary">
              {translate('No request types selected')}
            </span>
          )}
        </div>
      </div>

      <div className="card mb-3">
        <div className="card-header">
          <h5 className="mb-0">{translate('Field Mappings')}</h5>
        </div>
        <div className="card-body">
          <table className="table table-sm table-borderless">
            <tbody>
              <tr>
                <td className="text-quaternary" style={{ width: '40%' }}>
                  {translate('Reporter Field')}
                </td>
                <td>
                  {values.fieldMappings?.reporter_field ? (
                    <code>{values.fieldMappings.reporter_field}</code>
                  ) : (
                    <span className="text-quaternary">
                      {translate('Not mapped')}
                    </span>
                  )}
                </td>
              </tr>
              <tr>
                <td className="text-quaternary">{translate('Impact Field')}</td>
                <td>
                  {values.fieldMappings?.impact_field ? (
                    <code>{values.fieldMappings.impact_field}</code>
                  ) : (
                    <span className="text-quaternary">
                      {translate('Not mapped')}
                    </span>
                  )}
                </td>
              </tr>
              <tr>
                <td className="text-quaternary">
                  {translate('Organization Field')}
                </td>
                <td>
                  {values.fieldMappings?.organisation_field ? (
                    <code>{values.fieldMappings.organisation_field}</code>
                  ) : (
                    <span className="text-quaternary">
                      {translate('Not mapped')}
                    </span>
                  )}
                </td>
              </tr>
              <tr>
                <td className="text-quaternary">
                  {translate('Project Field')}
                </td>
                <td>
                  {values.fieldMappings?.project_field ? (
                    <code>{values.fieldMappings.project_field}</code>
                  ) : (
                    <span className="text-quaternary">
                      {translate('Not mapped')}
                    </span>
                  )}
                </td>
              </tr>
              <tr>
                <td className="text-quaternary">
                  {translate('Affected Resource Field')}
                </td>
                <td>
                  {values.fieldMappings?.affected_resource_field ? (
                    <code>{values.fieldMappings.affected_resource_field}</code>
                  ) : (
                    <span className="text-quaternary">
                      {translate('Not mapped')}
                    </span>
                  )}
                </td>
              </tr>
              <tr>
                <td className="text-quaternary">{translate('Caller Field')}</td>
                <td>
                  {values.fieldMappings?.caller_field ? (
                    <code>{values.fieldMappings.caller_field}</code>
                  ) : (
                    <span className="text-quaternary">
                      {translate('Not mapped')}
                    </span>
                  )}
                </td>
              </tr>
              <tr>
                <td className="text-quaternary">
                  {translate('Template Field')}
                </td>
                <td>
                  {values.fieldMappings?.template_field ? (
                    <code>{values.fieldMappings.template_field}</code>
                  ) : (
                    <span className="text-quaternary">
                      {translate('Not mapped')}
                    </span>
                  )}
                </td>
              </tr>
              <tr>
                <td className="text-quaternary">
                  {translate('Waldur Backend ID Field')}
                </td>
                <td>
                  {values.fieldMappings?.waldur_backend_id_field ? (
                    <code>{values.fieldMappings.waldur_backend_id_field}</code>
                  ) : (
                    <span className="text-quaternary">
                      {translate('Not mapped')}
                    </span>
                  )}
                </td>
              </tr>
              <tr>
                <td className="text-quaternary">
                  {translate('Default Priority')}
                </td>
                <td>
                  {values.fieldMappings?.default_priority ? (
                    <>
                      {(values.priorities || []).find(
                        (p) => p.id === values.fieldMappings?.default_priority,
                      )?.name || values.fieldMappings.default_priority}
                    </>
                  ) : (
                    <span className="text-quaternary">
                      {translate('Not set')}
                    </span>
                  )}
                </td>
              </tr>
              <tr>
                <td className="text-quaternary">
                  {translate('Default Offering Issue Type')}
                </td>
                <td>
                  {values.fieldMappings?.default_offering_issue_type ? (
                    <>{values.fieldMappings.default_offering_issue_type}</>
                  ) : (
                    <span className="text-quaternary">
                      {translate('Not set')}
                    </span>
                  )}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <AlertItem
        type="floating"
        variant="info"
        title={translate(
          'Note: Credentials (API token, password, etc.) will be securely stored and are not shown in this preview.',
        )}
      />
    </WizardModal>
  );
};
