import { useState, useEffect } from 'react';
import { Alert, Button, Card, FormCheck, Spinner } from 'react-bootstrap';
import { supportSettingsAtlassianDiscoverProjects } from 'waldur-js-client';

import { translate } from '@waldur/i18n';

import type { AtlassianCredentials, DiscoveryState } from '../types';

interface ProjectStepProps {
  credentials: AtlassianCredentials;
  onSelected: (
    project: DiscoveryState['selectedProject'],
    projects: DiscoveryState['projects'],
  ) => void;
  onBack: () => void;
  onCancel: () => void;
}

export const ProjectStep = ({
  credentials,
  onSelected,
  onBack,
  onCancel,
}: ProjectStepProps) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [projects, setProjects] = useState<DiscoveryState['projects']>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    const loadProjects = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await supportSettingsAtlassianDiscoverProjects({
          body: credentials,
        });
        setProjects(response.data || []);
      } catch (e: any) {
        setError(
          e.response?.data?.detail ||
            e.message ||
            translate('Failed to load projects'),
        );
      } finally {
        setLoading(false);
      }
    };

    loadProjects();
  }, [credentials]);

  const handleContinue = () => {
    const selected = projects.find((p) => p.id === selectedId);
    if (selected) {
      onSelected(selected, projects);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-10">
        <Spinner animation="border" />
        <p className="mt-4">
          {translate('Discovering Service Desk projects...')}
        </p>
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

  if (projects.length === 0) {
    return (
      <div>
        <Alert variant="warning">
          {translate(
            'No Service Desk projects found. Please ensure you have access to at least one Service Desk project.',
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
      <h4 className="mb-4">{translate('Select Service Desk Project')}</h4>
      <p className="text-muted mb-4">
        {translate(
          'Select the Service Desk project that will be used for support tickets.',
        )}
      </p>

      <div className="row g-3 mb-6">
        {projects.map((project) => (
          <div key={project.id} className="col-md-6">
            <Card
              className={`cursor-pointer h-100 ${
                selectedId === project.id
                  ? 'border-primary border-2'
                  : 'border-secondary'
              }`}
              onClick={() => setSelectedId(project.id)}
            >
              <Card.Body>
                <div className="d-flex align-items-start">
                  <FormCheck
                    type="radio"
                    className="me-3"
                    checked={selectedId === project.id}
                    onChange={() => setSelectedId(project.id)}
                  />
                  <div>
                    <h5 className="mb-1">
                      {project.name}{' '}
                      <span className="text-muted">({project.key})</span>
                    </h5>
                    {project.description && (
                      <p className="text-muted mb-0 small">
                        {project.description}
                      </p>
                    )}
                  </div>
                </div>
              </Card.Body>
            </Card>
          </div>
        ))}
      </div>

      <div className="d-flex justify-content-end gap-2">
        <Button variant="secondary" onClick={onCancel}>
          {translate('Cancel')}
        </Button>
        <Button variant="tertiary" onClick={onBack}>
          {translate('Back')}
        </Button>
        <Button
          variant="primary"
          onClick={handleContinue}
          disabled={!selectedId}
        >
          {translate('Continue')}
        </Button>
      </div>
    </div>
  );
};
