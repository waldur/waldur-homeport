import * as React from 'react';
import * as Row from 'react-bootstrap/lib/Row';

import { translate } from '@waldur/i18n';

import { EnumField } from './EnumField';
import { GroupHeader } from './GroupHeader';
import { StringField } from './StringField';

export const ApplicationConfiguration = props => (
  <>
    <GroupHeader title={translate('Application configuration')} />
    <Row>
      <StringField required={true} label={translate('Name')} variable="name" />
      <StringField label={translate('Description')} variable="description" />
      <EnumField
        required={true}
        label={translate('Version')}
        variable="version"
        options={props.versions}
      />
      <EnumField
        required={true}
        label={translate('Project')}
        variable="project"
        options={props.projects}
      />
      <EnumField
        required={true}
        label={translate('Namespace')}
        variable="namespace"
        options={props.namespaces}
      />
    </Row>
  </>
);
