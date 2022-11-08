import { FunctionComponent } from 'react';

import { translate } from '@waldur/i18n';

interface ResourceMetaInfoProps {
  resource: {
    customer_name?: string;
    project_name?: string;
    backend_id?: string;
  };
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
