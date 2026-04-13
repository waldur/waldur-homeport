import {
  InfoIcon,
  MagnifyingGlassIcon,
  WarningIcon,
} from '@phosphor-icons/react';
import { useQuery } from '@tanstack/react-query';
import { FunctionComponent, useState } from 'react';
import { Alert, Card } from 'react-bootstrap';

import { Badge } from '@waldur/core/Badge';
import { useDebouncedValue } from '@waldur/core/useDebouncedValue';
import { FilterBox } from '@waldur/form/FilterBox';
import { formatJsxTemplate, translate } from '@waldur/i18n';
import { useTitle } from '@waldur/navigation/title';
import { Field } from '@waldur/resource/summary/Field';

import { getAccessForEmail, Project, UserData } from './api';

// Type definitions
interface UserInfoCardProps {
  userData: UserData;
  index?: number | null;
}

interface ProjectsCardProps {
  projects: Record<string, Project>;
}

// Reusable component to display user information
const UserInfoCard: FunctionComponent<UserInfoCardProps> = ({
  userData,
  index = null,
}) => {
  return (
    <Card className="mb-3">
      <Card.Header>
        <Card.Title className="mb-0">
          {index !== null
            ? translate('User Information - User {index}', { index: index + 1 })
            : translate('User Information')}
        </Card.Title>
      </Card.Header>
      <Card.Body>
        <div className="fs-6">
          <Field
            label={translate('Email')}
            value={userData.email}
            space={2}
            labelCol={4}
            valueCol={8}
            valueClass="text-break"
          />
          <Field
            label={translate('Status')}
            value={
              <Badge
                variant={
                  userData.status === 'active'
                    ? 'success'
                    : userData.status === 'invited'
                      ? 'warning'
                      : 'secondary'
                }
              >
                {userData.status}
              </Badge>
            }
            space={2}
            labelCol={4}
            valueCol={8}
          />
          {userData.short_name && (
            <Field
              label={translate('Short name')}
              value={
                <code className="text-primary">{userData.short_name}</code>
              }
              space={2}
              labelCol={4}
              valueCol={8}
            />
          )}
          {userData.invited_by && (
            <Field
              label={translate('Invited by')}
              value={userData.invited_by}
              space={2}
              labelCol={4}
              valueCol={8}
              valueClass="text-break"
            />
          )}
          {userData.reason && (
            <Field
              label={translate('Reason')}
              value={<span className="text-danger">{userData.reason}</span>}
              space={2}
              labelCol={4}
              valueCol={8}
            />
          )}
        </div>
      </Card.Body>
    </Card>
  );
};

// Reusable component to display projects
const ProjectsCard: FunctionComponent<ProjectsCardProps> = ({ projects }) => {
  if (
    !projects ||
    typeof projects !== 'object' ||
    Object.keys(projects).length === 0
  ) {
    return (
      <Card>
        <Card.Body>
          <div className="text-center text-muted py-4">
            {translate('No projects found for this user')}
          </div>
        </Card.Body>
      </Card>
    );
  }

  return (
    <Card>
      <Card.Header>
        <Card.Title className="mb-0">
          {translate('Projects ({count})', {
            count: Object.keys(projects).length,
          })}
        </Card.Title>
      </Card.Header>
      <Card.Body>
        <div className="d-flex flex-column gap-4">
          {Object.entries(projects).map(([projectId, project]) => (
            <div key={projectId} className="border rounded p-3">
              <div className="mb-3">
                <h5 className="mb-1 fw-bold">{project.name}</h5>
                <div>
                  <Badge variant="primary" light>
                    {projectId}
                  </Badge>
                </div>
              </div>

              {project.resources &&
                Array.isArray(project.resources) &&
                project.resources.length > 0 && (
                  <div>
                    <h6 className="mb-2 text-muted fw-semibold">
                      {translate('Resources ({count})', {
                        count: project.resources.length,
                      })}
                    </h6>
                    <div className="d-flex flex-column gap-2">
                      {project.resources.map((resource, index) => (
                        <div key={index} className="bg-light rounded p-3">
                          <div className="d-flex justify-content-between align-items-start flex-wrap gap-2">
                            <div className="flex-grow-1">
                              <div className="fw-semibold text-dark">
                                {resource.name}
                              </div>
                            </div>
                            <div className="text-end">
                              <small className="text-muted d-block">
                                {translate('Username')}
                              </small>
                              <code className="bg-secondary bg-opacity-25 px-2 py-1 rounded">
                                {resource.username}
                              </code>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              {(!project.resources || project.resources.length === 0) && (
                <div className="text-muted fst-italic">
                  {translate('No resources in this project')}
                </div>
              )}
            </div>
          ))}
        </div>
      </Card.Body>
    </Card>
  );
};
export const AccessForEmail: FunctionComponent<{}> = () => {
  useTitle(translate('Check user access'), '', 'browser');

  const [searchValue, setSearchValue] = useState<string>('');
  const debouncedQuery = useDebouncedValue(searchValue.trim(), 500);

  // React Query implementation
  const { data, isFetching, error } = useQuery<UserData[], Error>({
    queryKey: ['accessForEmail', debouncedQuery],
    queryFn: () => getAccessForEmail(debouncedQuery),
    // Only execute the query if there is a query string
    enabled: Boolean(debouncedQuery),
  });

  const handleClear = () => {
    setSearchValue('');
  };

  return (
    <Card className="card-bordered">
      <Card.Header>
        <Card.Title className="mb-0">
          {translate('Check user access')}
        </Card.Title>
      </Card.Header>
      <Card.Body>
        <div className="mb-3">
          <p className="text-muted mb-3">
            {translate(
              'Search by email, short name, project name, or project ID',
            )}
          </p>
        </div>

        <div className="mb-3">
          <div className="d-flex gap-2">
            <FilterBox
              type="search"
              placeholder={translate(
                'Enter email, short name, project name, or project ID...',
              )}
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              // Prevent form submission on Enter (query will trigger automatically via debounce)
              onKeyDown={(e) => e.key === 'Enter' && e.preventDefault()}
              style={{ flex: 1 }}
            />
            {searchValue && (
              <button
                type="button"
                className="btn btn-secondary"
                onClick={handleClear}
              >
                {translate('Clear')}
              </button>
            )}
          </div>
        </div>

        {isFetching && (
          <div className="text-center py-4">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">{translate('Loading...')}</span>
            </div>
          </div>
        )}

        {error && (
          <Alert variant="danger" className="d-flex align-items-center">
            <WarningIcon weight="fill" className="me-2" size={20} />
            <div>{error instanceof Error ? error.message : String(error)}</div>
          </Alert>
        )}

        {debouncedQuery && data && data.length > 0 && (
          <>
            {data.length > 1 && (
              <div className="mb-3">
                <Alert
                  variant="info"
                  className="d-flex align-items-center mb-0"
                >
                  <InfoIcon weight="fill" className="me-2" size={20} />
                  <div>
                    {translate(
                      'Found {count} users',
                      {
                        count: <strong>{data.length}</strong>,
                      },
                      formatJsxTemplate,
                    )}
                  </div>
                </Alert>
              </div>
            )}

            <div className="d-flex flex-column gap-3">
              {data.map((userData, index) => (
                <div key={index}>
                  <UserInfoCard
                    userData={userData}
                    index={data.length > 1 ? index : null}
                  />
                  <ProjectsCard projects={userData.projects} />
                </div>
              ))}
            </div>
          </>
        )}

        {debouncedQuery && data && data.length === 0 && !isFetching && (
          <Alert variant="warning" className="text-center">
            <MagnifyingGlassIcon className="me-2" size={20} weight="bold" />
            {translate('No results found')}
          </Alert>
        )}
      </Card.Body>
    </Card>
  );
};
