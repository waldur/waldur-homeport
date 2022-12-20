import copy from 'copy-to-clipboard';
import { FunctionComponent, useCallback } from 'react';
import { useDispatch } from 'react-redux';

import { formatFilesize } from '@waldur/core/utils';
import { translate } from '@waldur/i18n';
import { ResourceDetailsLink } from '@waldur/marketplace/resources/details/ResourceDetailsLink';
import { CategoryColumn } from '@waldur/marketplace/types';
import { validateIP } from '@waldur/marketplace/utils';
import { INSTANCE_TYPE } from '@waldur/openstack/constants';
import { showSuccess } from '@waldur/store/notify';

import { Resource } from '../types';

interface CategoryColumnFieldProps {
  row: Resource;
  column: CategoryColumn;
}

export const CategoryColumnField: FunctionComponent<CategoryColumnFieldProps> =
  (props) => {
    const metadata = props.row.backend_metadata;
    const value = props.column.attribute
      ? metadata[props.column.attribute]
      : undefined;

    const dispatch = useDispatch();

    const copyIp = useCallback(
      (ip) => {
        copy(ip);
        dispatch(showSuccess(translate('{ip} has been copied', { ip })));
      },
      [dispatch],
    );

    switch (props.column.widget) {
      case 'csv':
        if (!Array.isArray(value) || value.length === 0) {
          return 'N/A';
        }
        if (validateIP(value[0])) {
          return value.map((ip) => (
            <span key={ip} className="text-nowrap">
              {ip}
              <button
                className="btn btn-sm btn-icon btn-active-light-primary ms-1 position-relative z-index-1"
                onClick={() => copyIp(ip)}
              >
                <i className="fa fa-copy" />
              </button>
            </span>
          ));
        } else {
          return value.join(', ');
        }

      case 'filesize':
        return formatFilesize(value);

      case 'attached_instance':
        return (
          <ResourceDetailsLink
            item={{
              offering_type: INSTANCE_TYPE,
              resource_uuid: metadata.instance_uuid,
              resource_type: INSTANCE_TYPE,
            }}
          >
            {metadata.instance_name}
          </ResourceDetailsLink>
        );

      default:
        return value || 'N/A';
    }
  };
