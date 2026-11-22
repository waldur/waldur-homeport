import { translate } from 'waldur-i18n-runtime';
import { Project, ResourceApiKeyStatus } from 'waldur-js-client';
import { Column, SimpleTable } from 'waldur-table';
import { Card, CardContent, CardHeader, CardTitle, Code } from 'waldur-ui';

import { Chip, PAGE_CLASS, PageHeader, ServiceMark } from '../components';
import { pageStatus } from '../PageStatus';
import { sectionHref } from '../router';
import { keyName, mayCall } from '../services';
import { InferenceService, useInferenceData } from '../useInferenceData';

interface ModelRow {
  name: string;
  keys: ResourceApiKeyStatus[];
}

const columns: Column<ModelRow>[] = [
  {
    title: translate('Model'),
    render: ({ row }) => <Code>{row.name}</Code>,
  },
  {
    title: translate('Your keys that may call it'),
    render: ({ row }) =>
      row.keys.length ? (
        <>{row.keys.map(keyName).join(', ')}</>
      ) : (
        <span className="text-warning">{translate('None of your keys')}</span>
      ),
  },
];

const ServiceModels = ({
  service,
  userUuid,
}: {
  service: InferenceService;
  userUuid?: string;
}) => {
  const myKeys = service.keys.filter((key) => key.user_uuid === userUuid);
  return (
    <Card>
      <CardHeader className="flex-nowrap gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <ServiceMark name={service.resource.offering_name} size="sm" />
          <div className="min-w-0">
            <CardTitle>{service.resource.offering_name}</CardTitle>
            <p className="truncate text-xs text-tertiary">
              {service.resource.provider_name}
            </p>
          </div>
        </div>
        {service.models ? (
          <Chip>
            {translate('{count} models', { count: service.models.length })}
          </Chip>
        ) : null}
      </CardHeader>
      {service.models ? (
        <SimpleTable
          columns={columns}
          rowKey="name"
          rows={service.models.map((name) => ({
            name,
            keys: myKeys.filter((key) => mayCall(key, name)),
          }))}
        />
      ) : (
        <CardContent>
          <p className="text-sm text-tertiary">
            {translate(
              'This service does not list its models here. Your key lists them at the endpoint’s /models.',
            )}
          </p>
        </CardContent>
      )}
    </Card>
  );
};

export const ModelsPage = ({ project }: { project: Project }) => {
  const data = useInferenceData(project);
  const status = pageStatus({
    ...data,
    addHref: sectionHref(project.uuid, 'add'),
  });
  return (
    <div className={PAGE_CLASS}>
      <PageHeader
        project={project}
        title={translate('Models')}
        description={translate(
          'The models each service lists for this project, and which of your keys may call them.',
        )}
      />
      {status ??
        data.services.map((service) => (
          <ServiceModels
            key={service.resource.uuid}
            service={service}
            userUuid={data.me?.uuid}
          />
        ))}
    </div>
  );
};
