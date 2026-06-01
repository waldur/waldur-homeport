import { CaretLeftIcon, CaretRightIcon } from '@phosphor-icons/react';
import { FC, useState, useEffect } from 'react';
import { Alert, Spinner } from 'react-bootstrap';
import { useForm, useFormState } from 'react-final-form';
import {
  supportSettingsAtlassianDiscoverCustomFields,
  supportSettingsAtlassianDiscoverPriorities,
} from 'waldur-js-client';

import { SelectGroup } from '@/form';
import { SubmitButton } from '@/form/SubmitButton';
import { translate } from '@/i18n';
import { CloseDialogButton } from '@/modal/CloseDialogButton';
import { WizardModal, WizardStepProps } from '@/wizard';

import type { AtlassianFormValues } from '../types';

/**
 * Step 4: Field Mapping
 *
 * Maps Waldur fields to Atlassian custom fields. Fetches available
 * custom fields and priorities from the selected project.
 */
export const FieldMappingStep: FC<WizardStepProps> = (props) => {
  const form = useForm<AtlassianFormValues>();
  const { values } = useFormState<AtlassianFormValues>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Extract credentials from form values
  const credentials = {
    api_url: values.api_url,
    auth_method: values.auth_method,
    email: values.email,
    token: values.token,
    personal_access_token: values.personal_access_token,
    username: values.username,
    password: values.password,
    verify_ssl: values.verify_ssl,
  };

  const selectedRequestTypes = values.requestTypes.filter((rt) =>
    (values.selectedRequestTypeIds || []).includes(rt.id),
  );

  // Load custom fields and priorities when step mounts
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError(null);
      try {
        const requestTypeId = selectedRequestTypes[0]?.id;
        const [fieldsResponse, prioritiesResponse] = await Promise.all([
          supportSettingsAtlassianDiscoverCustomFields({
            body: {
              ...credentials,
              project_id: values.selectedProjectId!,
              request_type_id: requestTypeId,
            },
          }),
          supportSettingsAtlassianDiscoverPriorities({
            body: credentials,
          }),
        ]);
        form.change('customFields', fieldsResponse.data || []);
        form.change('priorities', prioritiesResponse.data || []);
      } catch (e: any) {
        setError(
          e.response?.data?.detail ||
            e.message ||
            translate('Failed to load field configuration'),
        );
      } finally {
        setLoading(false);
      }
    };

    if (values.selectedProjectId) {
      loadData();
    }
  }, [values.selectedProjectId]);

  const handleContinue = () => {
    props.handleSubmit();
  };

  // Build select options
  const fieldOptions = [
    { value: '', label: translate('-- Not mapped --') },
    ...(values.customFields || []).map((f) => ({
      value: f.id,
      label: `${f.name} (${f.id})`,
    })),
  ];

  const priorityOptions = [
    { value: '', label: translate('-- Not set --') },
    ...(values.priorities || []).map((p) => ({
      value: p.id,
      label: p.name,
    })),
  ];

  const requestTypeOptions = [
    { value: '', label: translate('-- Not set --') },
    ...selectedRequestTypes.map((rt) => ({
      value: rt.name,
      label: rt.name,
    })),
  ];

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
        submitting={false}
        disabled={loading}
        label={translate('Continue')}
        onClick={handleContinue}
        type="button"
        className="btn-icon-right min-w-125px"
      >
        <span className="svg-icon svg-icon-2">
          <CaretRightIcon weight="bold" />
        </span>
      </SubmitButton>
    </>
  );

  if (loading) {
    return (
      <WizardModal {...props} renderFooter={renderFooter}>
        <div className="text-center py-10">
          <Spinner animation="border" />
          <p className="mt-4">
            {translate('Loading custom fields and priorities...')}
          </p>
        </div>
      </WizardModal>
    );
  }

  if (error) {
    return (
      <WizardModal {...props} renderFooter={renderFooter}>
        <Alert variant="danger">{error}</Alert>
      </WizardModal>
    );
  }

  return (
    <WizardModal {...props} renderFooter={renderFooter}>
      <h4 className="mb-4">{translate('Field Mapping')}</h4>
      <p className="text-muted mb-4">
        {translate(
          'Map Waldur fields to Atlassian custom fields. These mappings allow Waldur to automatically populate issue fields.',
        )}
      </p>
      <div className="row">
        <div className="col-md-6">
          <SelectGroup
            name="fieldMappings.reporter_field"
            options={fieldOptions}
            simpleValue
            label={translate('Reporter Field')}
            description={translate(
              'Custom field for storing the reporter email',
            )}
          />
        </div>

        <div className="col-md-6">
          <SelectGroup
            name="fieldMappings.impact_field"
            options={fieldOptions}
            simpleValue
            label={translate('Impact Field')}
            description={translate('Custom field for storing the impact level')}
          />
        </div>

        <div className="col-md-6">
          <SelectGroup
            name="fieldMappings.organisation_field"
            options={fieldOptions}
            simpleValue
            label={translate('Organisation Field')}
            description={translate(
              'Custom field for storing the organisation name',
            )}
          />
        </div>

        <div className="col-md-6">
          <SelectGroup
            name="fieldMappings.project_field"
            options={fieldOptions}
            simpleValue
            label={translate('Project Field')}
            description={translate('Custom field for storing the project name')}
          />
        </div>

        <div className="col-md-6">
          <SelectGroup
            name="fieldMappings.affected_resource_field"
            options={fieldOptions}
            simpleValue
            label={translate('Affected Resource Field')}
            description={translate(
              'Custom field for storing the affected resource',
            )}
          />
        </div>

        <div className="col-md-6">
          <SelectGroup
            name="fieldMappings.caller_field"
            options={fieldOptions}
            simpleValue
            label={translate('Caller Field')}
            description={translate('Custom field for storing the caller')}
          />
        </div>

        <div className="col-md-6">
          <SelectGroup
            name="fieldMappings.template_field"
            options={fieldOptions}
            simpleValue
            label={translate('Template Field')}
            description={translate(
              'Custom field for storing the template name',
            )}
          />
        </div>

        <div className="col-md-6">
          <SelectGroup
            name="fieldMappings.waldur_backend_id_field"
            options={fieldOptions}
            simpleValue
            label={translate('Waldur Backend ID Field')}
            description={translate(
              'Custom field for storing the Waldur backend ID',
            )}
          />
        </div>

        <div className="col-md-6">
          <SelectGroup
            name="fieldMappings.default_priority"
            options={priorityOptions}
            simpleValue
            label={translate('Default Priority')}
            description={translate(
              'Default priority for new issues when not specified',
            )}
          />
        </div>

        <div className="col-md-6">
          <SelectGroup
            name="fieldMappings.default_offering_issue_type"
            options={requestTypeOptions}
            simpleValue
            label={translate('Default Offering Issue Type')}
            description={translate(
              'Issue type used when creating tickets for marketplace request-based orders',
            )}
          />
        </div>
      </div>
      {(values.customFields || []).length === 0 && (
        <Alert variant="info" className="mt-4">
          {translate(
            'No custom fields found. You can skip this step and configure field mappings later.',
          )}
        </Alert>
      )}
    </WizardModal>
  );
};
