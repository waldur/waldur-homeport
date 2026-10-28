import { useMemo } from 'react';
import { Resource, Offering } from 'waldur-js-client';

import { CodePreview } from '@/core/CodePreview';
import { formatJsxTemplate, translate } from '@/i18n';
import { ResourceAccessButton } from '@/resource/ResourceAccessButton';
import { getResourceAccessEndpoints } from '@/resource/utils';

export const GettingStartedCard = ({
  resource,
  offering,
}: {
  resource: Resource;
  offering: Offering;
}) => {
  const endpoints = useMemo(
    () => getResourceAccessEndpoints(resource, offering),
    [resource, offering],
  );

  return offering.getting_started || endpoints.length > 0 ? (
    <div className="card card-bordered">
      <div className="card-header">
        <div className="card-title">
          <h3>{translate('Getting started')}</h3>
        </div>
        <div className="card-toolbar">
          <ResourceAccessButton resource={resource} offering={offering} />
        </div>
      </div>
      <div className="card-body">
        {offering.getting_started ? (
          <CodePreview
            template={offering.getting_started}
            context={{
              backend_id: resource.effective_id || resource.backend_id,
              resource_name: resource.name,
              resource_username: resource.username || 'username',
              ...Object.fromEntries(
                Object.entries(resource.backend_metadata || {}).map(
                  ([key, value]) => [`backend_metadata_${key}`, value],
                ),
              ),
              ...Object.fromEntries(
                Object.entries(resource.options || {}).map(([key, value]) => [
                  `options_${key}`,
                  value,
                ]),
              ),
            }}
          />
        ) : (
          <p>
            {translate(
              'To access {resource}, please select one of the supported methods from dropdown on the right',
              { resource: <b>{resource.name}</b> },
              formatJsxTemplate,
            )}
          </p>
        )}
      </div>
    </div>
  ) : null;
};
