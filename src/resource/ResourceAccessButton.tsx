import { FC } from 'react';

import { translate } from '@waldur/i18n';

interface ResourceAccessButtonProps {
  resource: {
    access_url?: string;
    name?: string;
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
        className="btn btn-warning me-3"
        href={resource.access_url}
        target="_blank"
        rel="noopener noreferrer"
      >
        {translate('Access {name}', { name: resource.name })}
      </a>
    );
  }
  return null;
};
