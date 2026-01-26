import { CaretLeftIcon, CaretRightIcon } from '@phosphor-icons/react';
import { FC, useState, useEffect } from 'react';
import { Alert, FormCheck, Spinner, Table } from 'react-bootstrap';
import { useForm, useFormState } from 'react-final-form';
import { supportSettingsAtlassianDiscoverRequestTypes } from 'waldur-js-client';

import { SubmitButton } from '@waldur/form/SubmitButton';
import { translate } from '@waldur/i18n';
import { CloseDialogButton } from '@waldur/modal/CloseDialogButton';
import { WizardModal, WizardStepProps } from '@waldur/wizard';

import type { AtlassianFormValues } from '../types';

/**
 * Step 3: Request Types Selection
 *
 * Fetches available request types for the selected project and allows
 * user to select which ones should be available for support tickets.
 */
export const RequestTypesStep: FC<WizardStepProps> = (props) => {
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

  // Load request types when step mounts
  useEffect(() => {
    const loadRequestTypes = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await supportSettingsAtlassianDiscoverRequestTypes({
          body: {
            ...credentials,
            project_id: values.selectedProjectId!,
          },
        });
        form.change('requestTypes', response.data || []);
      } catch (e: any) {
        setError(
          e.response?.data?.detail ||
            e.message ||
            translate('Failed to load request types'),
        );
      } finally {
        setLoading(false);
      }
    };

    if (values.selectedProjectId) {
      loadRequestTypes();
    }
  }, [values.selectedProjectId]);

  const toggleSelection = (id: string) => {
    const currentIds = values.selectedRequestTypeIds || [];
    const newIds = currentIds.includes(id)
      ? currentIds.filter((i) => i !== id)
      : [...currentIds, id];
    form.change('selectedRequestTypeIds', newIds);
  };

  const toggleAll = () => {
    const currentIds = values.selectedRequestTypeIds || [];
    if (currentIds.length === values.requestTypes.length) {
      form.change('selectedRequestTypeIds', []);
    } else {
      form.change(
        'selectedRequestTypeIds',
        values.requestTypes.map((rt) => rt.id),
      );
    }
  };

  const handleContinue = () => {
    props.handleSubmit();
  };

  const selectedCount = (values.selectedRequestTypeIds || []).length;

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
        disabled={selectedCount === 0 || loading}
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
          <p className="mt-4">{translate('Loading request types...')}</p>
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

  if (values.requestTypes.length === 0) {
    return (
      <WizardModal {...props} renderFooter={renderFooter}>
        <Alert variant="warning">
          {translate(
            'No request types found for this project. Please configure request types in Jira Service Desk.',
          )}
        </Alert>
      </WizardModal>
    );
  }

  return (
    <WizardModal {...props} renderFooter={renderFooter}>
      <h4 className="mb-4">{translate('Select Request Types')}</h4>
      <p className="text-muted mb-4">
        {translate(
          'Select which request types should be available for creating support tickets.',
        )}
      </p>

      <Table hover className="mb-6">
        <thead>
          <tr>
            <th style={{ width: 40 }}>
              <FormCheck
                type="checkbox"
                checked={selectedCount === values.requestTypes.length}
                onChange={toggleAll}
              />
            </th>
            <th>{translate('Name')}</th>
            <th>{translate('Description')}</th>
            <th>{translate('Issue Type ID')}</th>
          </tr>
        </thead>
        <tbody>
          {values.requestTypes.map((rt) => (
            <tr
              key={rt.id}
              className="cursor-pointer"
              onClick={() => toggleSelection(rt.id)}
            >
              <td>
                <FormCheck
                  type="checkbox"
                  checked={(values.selectedRequestTypeIds || []).includes(
                    rt.id,
                  )}
                  onChange={() => toggleSelection(rt.id)}
                />
              </td>
              <td className="fw-bold">{rt.name}</td>
              <td className="text-muted">{rt.description || '-'}</td>
              <td>
                <code>{rt.issue_type_id}</code>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      <div className="d-flex justify-content-between">
        <span className="text-muted">
          {translate('{count} request type(s) selected', {
            count: selectedCount,
          })}
        </span>
      </div>
    </WizardModal>
  );
};
