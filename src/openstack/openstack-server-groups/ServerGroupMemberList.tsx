import React from 'react';

import { translate } from '@waldur/i18n';
import { ResourceLink } from '@waldur/resource/ResourceLink';

import { ServerGroupType } from '../types';

interface ServerGroupMemberListProps {
  resource: ServerGroupType[];
}

export const ServerGroupMemberList: React.FC<ServerGroupMemberListProps> = ({
  resource,
}) => (
  <div className="table-responsive">
    <table className="table table-bordered">
      <thead>
        <tr>
          <th>{translate('Instance name')}</th>
          <th>{translate('Instance ID')}</th>
        </tr>
      </thead>
      <tbody>
        {resource['instances'].length > 0 ? (
          resource['instances'].map((item, index) => (
            <tr key={index}>
              <td>
                <ResourceLink
                  type="OpenStackTenant.Instance"
                  uuid={item.uuid}
                  project={resource['project_uuid']}
                  label={item.name}
                />
              </td>
              <td> {item.backend_id}</td>
            </tr>
          ))
        ) : (
          <tr>
            <td colSpan={2} className={'text-center'}>
              {translate('No items to display')}
            </td>
          </tr>
        )}
      </tbody>
    </table>
  </div>
);
