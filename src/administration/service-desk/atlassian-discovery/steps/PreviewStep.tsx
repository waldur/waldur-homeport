import { CaretLeftIcon } from '@phosphor-icons/react';
import { FC } from 'react';
import { useFormState } from 'react-final-form';
import { supportSettingsAtlassianSaveSettings } from 'waldur-js-client';

import {
  AlertItem,
  BaseButton,
  Code,
  PropertyCard,
  PropertyItem,
  PropertyList,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from 'waldur-ui';

import { translate } from '@/i18n';
import { CloseDialogButton } from '@/modal/CloseDialogButton';
import { useManagedMutation } from '@/modal/useManagedMutation';
import { propVal } from '@/property/propertyFields';
import { WizardModal, WizardStepProps } from '@/wizard';

import { getAtlassianAuthMethodChoices } from '../../atlassianAuth';
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
        className="min-w-dialog-action me-auto"
        onClick={() => props.onPrev(values)}
        label={translate('Back')}
        iconNode={<CaretLeftIcon weight="bold" />}
        size="lg"
      />
      <CloseDialogButton />
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

      <PropertyCard bordered title={translate('Connection')} className="mb-3">
        <PropertyList variant="summary" termWidth="md">
          <PropertyItem
            label={translate('API URL')}
            value={propVal.code(values.resolvedApiUrl || values.api_url)}
          />
          <PropertyItem
            label={translate('Authentication Method')}
            value={propVal.enum(values.auth_method, {
              options: getAtlassianAuthMethodChoices(),
            })}
            placeholder={translate('Not configured')}
            hideIfEmpty={false}
          />
          {values.auth_method === 'oauth2_client_credentials' && (
            <PropertyItem
              label={translate('Client ID')}
              value={propVal.code(values.client_id)}
            />
          )}
        </PropertyList>
      </PropertyCard>

      <PropertyCard bordered title={translate('Project')} className="mb-3">
        <PropertyList variant="summary" termWidth="md">
          <PropertyItem
            label={translate('Selected Project')}
            value={propVal.annotated(selectedProject?.name, {
              hint: selectedProject?.key,
            })}
          />
          <PropertyItem
            label={translate('Project ID')}
            value={propVal.code(selectedProject?.id)}
          />
        </PropertyList>
      </PropertyCard>

      <PropertyCard
        bordered
        title={translate('Request Types')}
        className="mb-3"
      >
        {selectedRequestTypes.length > 0 ? (
          <Table density="compact" scrollable={false}>
            <TableHeader>
              <TableRow divided={false}>
                <TableHead>{translate('Name')}</TableHead>
                <TableHead>{translate('Issue Type ID')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {selectedRequestTypes.map((rt) => (
                <TableRow key={rt.id} divided={false}>
                  <TableCell>{rt.name}</TableCell>
                  <TableCell>
                    <Code>{rt.issue_type_id}</Code>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <span className="text-quaternary">
            {translate('No request types selected')}
          </span>
        )}
      </PropertyCard>

      <PropertyCard
        bordered
        title={translate('Field Mappings')}
        className="mb-3"
      >
        <PropertyList
          variant="summary"
          termWidth="md"
          emptyPlaceholder={translate('Not mapped')}
        >
          <PropertyItem
            label={translate('Reporter Field')}
            value={propVal.code(values.fieldMappings?.reporter_field)}
          />
          <PropertyItem
            label={translate('Impact Field')}
            value={propVal.code(values.fieldMappings?.impact_field)}
          />
          <PropertyItem
            label={translate('Organization Field')}
            value={propVal.code(values.fieldMappings?.organisation_field)}
          />
          <PropertyItem
            label={translate('Project Field')}
            value={propVal.code(values.fieldMappings?.project_field)}
          />
          <PropertyItem
            label={translate('Affected Resource Field')}
            value={propVal.code(values.fieldMappings?.affected_resource_field)}
          />
          <PropertyItem
            label={translate('Caller Field')}
            value={propVal.code(values.fieldMappings?.caller_field)}
          />
          <PropertyItem
            label={translate('Template Field')}
            value={propVal.code(values.fieldMappings?.template_field)}
          />
          <PropertyItem
            label={translate('Waldur Backend ID Field')}
            value={propVal.code(values.fieldMappings?.waldur_backend_id_field)}
          />
          <PropertyItem
            label={translate('Default Priority')}
            value={
              values.fieldMappings?.default_priority ? (
                <>
                  {(values.priorities || []).find(
                    (p) => p.id === values.fieldMappings?.default_priority,
                  )?.name || values.fieldMappings.default_priority}
                </>
              ) : null
            }
            placeholder="not-set"
          />
          <PropertyItem
            label={translate('Default Offering Issue Type')}
            value={values.fieldMappings?.default_offering_issue_type}
            placeholder="not-set"
          />
        </PropertyList>
      </PropertyCard>

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
