import * as React from 'react';
import * as Table from 'react-bootstrap/lib/Table';

import { translate } from '@waldur/i18n';
import { Row } from '@waldur/user/support/Row';

import { RolesRenderer } from './RolesRenderer';

export const UserDetailsTable = (props) => (
  <Table responsive={true} bordered={true}>
    <tbody>
      <Row label={translate('Full name')} value={props.user.full_name} />
      <Row label={translate('Username')} value={props.user.user_name} />
      {props.user.cluster_roles.length ? (
        <Row
          label={translate('Cluster roles')}
          value={<RolesRenderer roles={props.user.cluster_roles} />}
        />
      ) : null}
      {props.user.project_roles.length ? (
        <Row
          label={translate('Project roles')}
          value={<RolesRenderer roles={props.user.project_roles} />}
        />
      ) : null}
      <Row
        label={translate('Is active')}
        value={translate(props.user.is_active ? 'Yes' : 'No')}
      />
    </tbody>
  </Table>
);
