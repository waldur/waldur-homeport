import copy from 'copy-to-clipboard';
import { FC, useCallback } from 'react';
import { Dropdown, DropdownButton } from 'react-bootstrap';
import { useDispatch } from 'react-redux';

import { translate } from '@waldur/i18n';
import { showSuccess } from '@waldur/store/notify';

interface Endpoint {
  name: string;
  url: string;
}
interface ResourceAccessButtonProps {
  resource: {
    endpoints?: Endpoint[];
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

  const copyText = useCallback(
    (value) => {
      copy(value);
      dispatch(showSuccess(translate('Text has been copied')));
    },
    [dispatch],
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
          <div className="flex-grow-1">{endpoint.name || endpoint.url}</div>
          <div>
            <i className="fa fa-copy fa-lg" />
          </div>
        </Dropdown.Item>
      ))}
    </DropdownButton>
  );
};
