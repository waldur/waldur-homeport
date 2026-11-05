import { useQuery } from '@tanstack/react-query';
import { FunctionComponent, useState } from 'react';
import {
  AccessResponse,
  AccessProject,
  openportalAccessForEmailList,
} from 'waldur-js-client';

import {
  AlertItem,
  Badge,
  BaseButton,
  LoadingSpinner,
  PropertyItem,
  PropertyList,
  Code,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from 'waldur-ui';

import { useDebouncedValue } from '@/core/useDebouncedValue';
import { FilterBox } from '@/form/FilterBox';
import { formatJsxTemplate, translate } from '@/i18n';
import { useTitle } from '@/navigation/title';
import { propVal } from '@/property/propertyFields';

// Type definitions
interface UserInfoCardProps {
  userData: AccessResponse;
  index?: number | null;
}

interface ProjectsCardProps {
  projects: Record<string, AccessProject>;
}

// Reusable component to display user information
const UserInfoCard: FunctionComponent<UserInfoCardProps> = ({
  userData,
  index = null,
}) => {
  return (
    <Card className="mb-2.5">
      <CardHeader>
        <CardTitle as="div" className="mb-0">
          {index !== null
            ? translate('User Information - User {index}', { index: index + 1 })
            : translate('User Information')}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-sm">
          <PropertyList variant="summary" termWidth="md" space={1.5}>
            <PropertyItem
              label={translate('Email')}
              value={userData.email}
              valueClass="wrap-anywhere"
            />
            <PropertyItem
              label={translate('Status')}
              value={propVal.state(userData.status, {
                states: {
                  active: { label: translate('Active'), variant: 'success' },
                  invited: { label: translate('Invited'), variant: 'warning' },
                },
              })}
            />
            {userData.short_name && (
              <PropertyItem
                label={translate('Short name')}
                value={
                  <Code className="text-brand">{userData.short_name}</Code>
                }
              />
            )}
            <PropertyItem
              label={translate('Invited by')}
              value={userData.invited_by}
              valueClass="wrap-anywhere"
            />
            {userData.reason && (
              <PropertyItem
                label={translate('Reason')}
                value={userData.reason}
                valueClass="text-danger"
              />
            )}
          </PropertyList>
        </div>
      </CardContent>
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
        <CardContent>
          <div className="text-center text-quaternary py-3">
            {translate('No projects found for this user')}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle as="div" className="mb-0">
          {translate('Projects ({count})', {
            count: Object.keys(projects).length,
          })}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-3">
          {Object.entries(projects).map(([projectId, project]) => (
            <div
              key={projectId}
              className="border border-secondary rounded-lg p-2.5"
            >
              <div className="mb-2.5">
                <h5 className="mb-1 font-medium">{project.name}</h5>
                <div>
                  <Badge variant="primary" tone="outline">
                    {projectId}
                  </Badge>
                </div>
              </div>

              {project.resources &&
                Array.isArray(project.resources) &&
                project.resources.length > 0 && (
                  <div>
                    <h6 className="mb-1.5 text-quaternary font-semibold">
                      {translate('Resources ({count})', {
                        count: project.resources.length,
                      })}
                    </h6>
                    <div className="flex flex-col gap-1.5">
                      {project.resources.map((resource, index) => (
                        <div
                          key={index}
                          className="bg-tertiary dark:bg-quaternary rounded-lg p-2.5"
                        >
                          <div className="flex justify-between items-start flex-wrap gap-1.5">
                            <div className="grow">
                              <div className="text-primary">
                                {resource.name}
                              </div>
                            </div>
                            <div className="text-end">
                              <small className="text-quaternary block">
                                {translate('Username')}
                              </small>
                              <Code className="bg-tertiary dark:bg-gray-800 px-1.5 py-1 rounded-lg">
                                {resource.username}
                              </Code>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              {(!project.resources || project.resources.length === 0) && (
                <div className="text-quaternary italic">
                  {translate('No resources in this project')}
                </div>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
export const AccessForEmail: FunctionComponent<{}> = () => {
  useTitle(translate('Check user access'), '', 'browser');

  const [searchValue, setSearchValue] = useState<string>('');
  const debouncedQuery = useDebouncedValue(searchValue.trim(), 500);

  // React Query implementation
  const { data, isFetching, error } = useQuery<AccessResponse[], Error>({
    queryKey: ['accessForEmail', debouncedQuery],
    queryFn: async () => {
      const response = await openportalAccessForEmailList({
        query: { q: debouncedQuery },
      });
      return response.data;
    },
    // Only execute the query if there is a query string
    enabled: Boolean(debouncedQuery),
  });

  const handleClear = () => {
    setSearchValue('');
  };

  return (
    <Card bordered>
      <CardHeader>
        <CardTitle as="div" className="mb-0">
          {translate('Check user access')}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-2.5">
          <p className="text-quaternary mb-2.5">
            {translate(
              'Search by email, short name, project name, or project ID',
            )}
          </p>
        </div>

        <div className="mb-2.5">
          <div className="flex gap-1.5">
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
              <BaseButton
                variant="secondary"
                onClick={handleClear}
                label={translate('Clear')}
              />
            )}
          </div>
        </div>

        {isFetching && (
          <div className="text-center py-3">
            <LoadingSpinner
              size={32}
              className="text-brand"
              aria-label={translate('Loading...')}
            />
          </div>
        )}

        {error && (
          <AlertItem
            type="floating"
            variant="error"
            title={error instanceof Error ? error.message : String(error)}
          />
        )}

        {debouncedQuery && data && data.length > 0 && (
          <>
            {data.length > 1 && (
              <div className="mb-2.5">
                <AlertItem
                  type="floating"
                  variant="info"
                  className="mb-0"
                  title={translate(
                    'Found {count} users',
                    {
                      count: <strong>{data.length}</strong>,
                    },
                    formatJsxTemplate,
                  )}
                />
              </div>
            )}

            <div className="flex flex-col gap-2.5">
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
          <AlertItem
            type="floating"
            variant="warning"
            title={translate('No results found')}
          />
        )}
      </CardContent>
    </Card>
  );
};
