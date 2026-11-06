import { useMemo } from 'react';
import { Resource, Offering } from 'waldur-js-client';

import { Card, CardContent, CardHeader, CardTitle } from 'waldur-ui';

import { CodePreview } from '@/core/CodePreview';
import { formatJsxTemplate, translate } from '@/i18n';
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
    <Card bordered>
      <CardHeader>
        <CardTitle as="div">
          <h3>{translate('Getting started')}</h3>
        </CardTitle>
      </CardHeader>
      <CardContent>
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
              'To access {resource}, use the Access resource button at the top of the page',
              { resource: <b>{resource.name}</b> },
              formatJsxTemplate,
            )}
          </p>
        )}
      </CardContent>
    </Card>
  ) : null;
};
