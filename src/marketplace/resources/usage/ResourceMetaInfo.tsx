import { FunctionComponent } from 'react';
import { Resource } from 'waldur-js-client';

import { translate } from '@/i18n';

interface ResourceMetaInfoProps {
  resource: Pick<Resource, 'customer_name' | 'project_name' | 'backend_id'>;
}

export const ResourceMetaInfo: FunctionComponent<ResourceMetaInfoProps> = ({
  resource,
}) => (
  <>
    {resource.customer_name && (
      <p>
        <b>{translate('Client organization')}: </b>
        {resource.customer_name}
      </p>
    )}
    {resource.project_name && (
      <p>
        <b>{translate('Client project')}: </b>
        {resource.project_name}
      </p>
    )}
    {resource.backend_id && (
      <p>
        <b>{translate('Backend ID')}: </b>
        {resource.backend_id}
      </p>
    )}
  </>
);
