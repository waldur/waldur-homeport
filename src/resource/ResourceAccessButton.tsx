import { Copy } from '@phosphor-icons/react';
import copy from 'copy-to-clipboard';
import { FC, useCallback, useMemo } from 'react';
import { Button, OverlayTrigger, Popover, Table } from 'react-bootstrap';
import { useDispatch } from 'react-redux';

import { Tip } from '@waldur/core/Tooltip';
import { translate } from '@waldur/i18n';
import { showSuccess } from '@waldur/store/notify';

import { getResourceAccessEndpoints, isSshFormat } from './utils';

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

  const extendURLWithUsername = (url) => {
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

  const endpoints = useMemo(
    () => getResourceAccessEndpoints(resource, offering),
    [resource, offering],
  );

  if (endpoints.length === 0) {
    return null;
  }
  return (
    <OverlayTrigger
      trigger="click"
      placement="bottom-end"
      overlay={
        <Popover className="w-350px">
          <Table bordered>
            <tbody>
              {endpoints.map((endpoint, index) => (
                <tr key={index} style={{ borderBottom: '1px solid #e5e5e5' }}>
                  <td>
                    <a
                      href={
                        isSshFormat(endpoint.url) && resource.username
                          ? extendURLWithUsername(endpoint.url)
                          : endpoint.url
                      }
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {endpoint.name}
                    </a>
                  </td>
                  <td className="col-sm-1">
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
                        className="p-0"
                        onClick={() => copyText(endpoint.url)}
                      >
                        <Copy />
                      </Button>
                    </Tip>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Popover>
      }
      rootClose={true}
    >
      <Button
        variant="outline-dark"
        className="d-flex btn-outline btn-active-secondary border-gray-400"
      >
        <div className="me-2">{translate('Access resource')}</div>
        <div>
          <i className="fa fa-caret-down fa-lg" />
        </div>
      </Button>
    </OverlayTrigger>
  );
};
