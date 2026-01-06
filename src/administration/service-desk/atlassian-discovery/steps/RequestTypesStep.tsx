import { useState, useEffect } from 'react';
import { Alert, Button, FormCheck, Spinner, Table } from 'react-bootstrap';
import { supportSettingsAtlassianDiscoverRequestTypes } from 'waldur-js-client';

import { translate } from '@waldur/i18n';

import type { AtlassianCredentials, DiscoveryState } from '../types';

interface RequestTypesStepProps {
  credentials: AtlassianCredentials;
  project: NonNullable<DiscoveryState['selectedProject']>;
  onSelected: (
    selectedTypes: DiscoveryState['selectedRequestTypes'],
    allTypes: DiscoveryState['requestTypes'],
  ) => void;
  onBack: () => void;
  onCancel: () => void;
}

export const RequestTypesStep = ({
  credentials,
  project,
  onSelected,
  onBack,
  onCancel,
}: RequestTypesStepProps) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [requestTypes, setRequestTypes] = useState<
    DiscoveryState['requestTypes']
  >([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    const loadRequestTypes = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await supportSettingsAtlassianDiscoverRequestTypes({
          body: {
            ...credentials,
            project_id: project.id,
          },
        });
        setRequestTypes(response.data || []);
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

    loadRequestTypes();
  }, [credentials, project]);

  const toggleSelection = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const toggleAll = () => {
    if (selectedIds.size === requestTypes.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(requestTypes.map((rt) => rt.id)));
    }
  };

  const handleContinue = () => {
    const selected = requestTypes.filter((rt) => selectedIds.has(rt.id));
    onSelected(selected, requestTypes);
  };

  if (loading) {
    return (
      <div className="text-center py-10">
        <Spinner animation="border" />
        <p className="mt-4">{translate('Loading request types...')}</p>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <Alert variant="danger">{error}</Alert>
        <div className="d-flex justify-content-end gap-2">
          <Button variant="secondary" onClick={onBack}>
            {translate('Back')}
          </Button>
        </div>
      </div>
    );
  }

  if (requestTypes.length === 0) {
    return (
      <div>
        <Alert variant="warning">
          {translate(
            'No request types found for this project. Please configure request types in Jira Service Desk.',
          )}
        </Alert>
        <div className="d-flex justify-content-end gap-2">
          <Button variant="secondary" onClick={onBack}>
            {translate('Back')}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div>
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
                checked={selectedIds.size === requestTypes.length}
                onChange={toggleAll}
              />
            </th>
            <th>{translate('Name')}</th>
            <th>{translate('Description')}</th>
            <th>{translate('Issue Type ID')}</th>
          </tr>
        </thead>
        <tbody>
          {requestTypes.map((rt) => (
            <tr
              key={rt.id}
              className="cursor-pointer"
              onClick={() => toggleSelection(rt.id)}
            >
              <td>
                <FormCheck
                  type="checkbox"
                  checked={selectedIds.has(rt.id)}
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
            count: selectedIds.size,
          })}
        </span>
        <div className="d-flex gap-2">
          <Button variant="secondary" onClick={onCancel}>
            {translate('Cancel')}
          </Button>
          <Button variant="tertiary" onClick={onBack}>
            {translate('Back')}
          </Button>
          <Button
            variant="primary"
            onClick={handleContinue}
            disabled={selectedIds.size === 0}
          >
            {translate('Continue')}
          </Button>
        </div>
      </div>
    </div>
  );
};
