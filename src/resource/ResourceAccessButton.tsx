import { FC } from 'react';

import { translate } from '@waldur/i18n';

interface ResourceAccessButtonProps {
  resource: {
    access_url?: string;
  };
}

export const ResourceAccessButton: FC<ResourceAccessButtonProps> = ({
  resource,
}) => {
  if (
    typeof resource.access_url === 'string' &&
    resource.access_url.startsWith('http')
  ) {
    return (
      <a
        className="btn btn-success"
        href={resource.access_url}
        target="_blank"
        rel="noopener noreferrer"
      >
        {translate('Access')}
      </a>
    );
  }
  return null;
};
