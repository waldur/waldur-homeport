import * as React from 'react';

import { DownloadLink } from '@waldur/core/DownloadLink';
import { ExternalLink } from '@waldur/core/ExternalLink';
import { TranslateProps } from '@waldur/i18n';

interface ResourceAccessInfoProps extends TranslateProps {
  resource: any;
}

export const ResourceAccessInfo = (props: ResourceAccessInfoProps) => {
  const { resource, translate } = props;
  if (!resource.access_url) {
    return translate('No access info');
  }

  if (Array.isArray(resource.access_url)) {
    return resource.access_url.join(', ');
  }

  if (resource.access_url.startsWith('http')) {
    if (resource.access_url.endsWith('/rdp/')) {
      return <DownloadLink label={translate('Connect')} url={resource.access_url} filename="azure.rdp"/>;
    } else {
      return <ExternalLink label={translate('Open')} url={resource.access_url}/>;
    }
  }

  return resource.access_url;
};
