import { FunctionComponent } from 'react';

import { translate } from '@waldur/i18n';
import { Resource } from '@waldur/marketplace/resources/types';

interface ResourceMetaInfoProps {
  resource: Resource;
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
