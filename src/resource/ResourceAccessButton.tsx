import {
  ArrowSquareOutIcon,
  CaretDownIcon,
  CopyIcon,
} from '@phosphor-icons/react';
import { FC, useCallback, useMemo } from 'react';
import { Button, Dropdown } from 'react-bootstrap';
import { useDispatch } from 'react-redux';

import { Tip } from '@waldur/core/Tooltip';
import { translate } from '@waldur/i18n';
import { showSuccess } from '@waldur/store/notify';

import { getResourceAccessEndpoints, isSshFormat } from './utils';

interface Endpoint {
  name?: string;
  url?: string;
}
interface ResourceAccessButtonProps {
  resource: {
    endpoints?: Endpoint[];
    username?: string;
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

  const extendURLWithUsername = (url) => {
    const [protocol, restUrl] = url.split('://');
    const [hostname, port] = restUrl.split(':');
    return `${protocol}://${resource.username}${resource.username ? '@' : ''}${
      hostname
    }${port ? `:${port}` : ''}`;
  };

  const copyText = useCallback(
    (value) => {
      if (isSshFormat(value) && resource.username) {
        const [hostname, port] = value.split('://')[1].split(':');
        const valueToCopy = `ssh ${resource.username}@${hostname}${
          port ? ` -p ${port}` : ''
        }`;

        navigator.clipboard.writeText(valueToCopy).then(() => {
          dispatch(showSuccess(translate('Text has been copied')));
        });
      } else {
        navigator.clipboard.writeText(value).then(() => {
          dispatch(showSuccess(translate('Text has been copied')));
        });
      }
    },
    [dispatch, resource.username],
  );

  const endpoints = useMemo(
    () => getResourceAccessEndpoints(resource, offering),
    [resource, offering],
  );

  if (endpoints.length === 0) {
    return null;
  }
  return (
    <Dropdown placement="bottom-end">
      <Dropdown.Toggle
        variant="outline btn-outline-default"
        className="no-arrow btn-icon-right"
      >
        {translate('Access resource')}
        <span className="svg-icon svg-icon-2 rotate-180">
          <CaretDownIcon weight="bold" />
        </span>
      </Dropdown.Toggle>
      <Dropdown.Menu flip>
        {endpoints.map((endpoint, index) => (
          <Dropdown.Item
            key={index}
            eventKey={endpoint.url}
            href={endpoint.url}
            target="_blank"
            rel="noopener noreferrer"
            className="d-flex justify-content-between text-anchor text-primary px-5 py-3"
          >
            <span className="d-flex flex-center me-6">
              <span className="svg-icon svg-icon-2 svg-icon-primary">
                <ArrowSquareOutIcon weight="bold" />
              </span>
              {endpoint.name}
            </span>
            <Tip
              id="resource-endpoint-tooltip"
              label={
                isSshFormat(endpoint.url) && resource.username
                  ? extendURLWithUsername(endpoint.url)
                  : endpoint.url
              }
            >
              <Button
                variant="link"
                size="sm"
                className="btn-icon h-20px"
                onClick={(e) => {
                  copyText(endpoint.url);
                  e.preventDefault();
                }}
              >
                <span className="svg-icon svg-icon-2">
                  <CopyIcon weight="bold" />
                </span>
              </Button>
            </Tip>
          </Dropdown.Item>
        ))}
      </Dropdown.Menu>
    </Dropdown>
  );
};
