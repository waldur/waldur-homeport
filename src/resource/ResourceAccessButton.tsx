import copy from 'copy-to-clipboard';
import { FC, useCallback } from 'react';
import { Dropdown, DropdownButton } from 'react-bootstrap';
import { useDispatch } from 'react-redux';

import { Tip } from '@waldur/core/Tooltip';
import { translate } from '@waldur/i18n';
import { showSuccess } from '@waldur/store/notify';

interface Endpoint {
  name: string;
  url: string;
}
interface ResourceAccessButtonProps {
  resource: {
    endpoints?: Endpoint[];
    username: string;
  };
  offering: {
    endpoints?: Endpoint[];
  };
}

export const ResourceAccessButton: FC<ResourceAccessButtonProps> = ({
  resource,
  offering,
}) => {
  const dispatch = useDispatch();

  const isSshFormat = (url) => {
    try {
      const parsedUrl = new URL(url);
      return parsedUrl.protocol === 'ssh:';
    } catch (error) {
      return false;
    }
  };

  const formatUrlForTooltip = (url) => {
    const [protocol, restUrl] = url.split('://');
    const [hostname, port] = restUrl.split(':');
    return `${protocol}://${resource.username}${
      resource.username ? '@' : ''
    }${hostname}${port ? `:${port}` : ''}`;
  };

  const copyText = useCallback(
    (value) => {
      if (isSshFormat(value) && resource.username) {
        const [hostname, port] = value.split('://')[1].split(':');
        const valueToCopy = `ssh ${resource.username}@${hostname}${
          port ? ` -p ${port}` : ''
        }`;
        copy(valueToCopy);
      } else {
        copy(value);
      }
      dispatch(showSuccess(translate('Text has been copied')));
    },
    [dispatch, resource.username],
  );

  const endpoints = [...resource.endpoints, ...offering.endpoints];
  if (endpoints.length === 0) {
    return null;
  }
  return (
    <DropdownButton
      title={translate('Access resource')}
      className="me-3"
      variant="primary"
    >
      {endpoints.map((endpoint, index) => (
        <Dropdown.Item
          key={index}
          className="d-flex"
          onClick={() => copyText(endpoint.url)}
        >
          <Tip
            id="resource-endpoint-tooltip"
            className="flex-grow-1"
            label={
              isSshFormat(endpoint.url) && resource.username
                ? formatUrlForTooltip(endpoint.url)
                : endpoint.url
            }
          >
            {endpoint.name}
            <i className="fa fa-copy fa-lg float-end" />
          </Tip>
        </Dropdown.Item>
      ))}
    </DropdownButton>
  );
};
