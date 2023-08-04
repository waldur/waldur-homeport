import copy from 'copy-to-clipboard';
import { FC, useCallback } from 'react';
import { Button, OverlayTrigger, Popover, Table } from 'react-bootstrap';
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

  const endpoints = [...resource.endpoints, ...offering.endpoints];
  if (endpoints.length === 0) {
    return null;
  }
  return (
    <OverlayTrigger
      trigger="click"
      placement="bottom-start"
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
                      <Button variant="link" className="p-0">
                        <i
                          className="fa fa-copy fa-lg"
                          onClick={() => copyText(endpoint.url)}
                        />
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
      <Button className="me-3 d-flex" variant="success">
        <div className="me-3">{translate('Access resource')}</div>
        <div>
          <i className="fa fa-angle-down fa-lg"></i>
        </div>
      </Button>
    </OverlayTrigger>
  );
};
