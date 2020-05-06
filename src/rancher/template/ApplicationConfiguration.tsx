import * as React from 'react';
import * as Row from 'react-bootstrap/lib/Row';

import { required } from '@waldur/core/validators';
import { translate } from '@waldur/i18n';

import { RancherProject, Namespace } from '../types';

import { EnumField } from './EnumField';
import { GroupHeader } from './GroupHeader';
import { NamespaceField } from './NamespaceField';
import { StringField } from './StringField';

interface ApplicationConfigurationProps {
  versions: string[];
  projects: RancherProject[];
  namespaces: Namespace[];
}

const NAME_REGEXP = new RegExp('^[a-z0-9]([-a-z0-9]*[a-z0-9])?$');

const validateName = value =>
  !value.match(NAME_REGEXP)
    ? translate(
        "Name must consist of lower case alphanumeric characters or '-', and must start and end with an alphanumeric character (e.g. 'my-name',  or '123-abc')",
      )
    : undefined;

export const ApplicationConfiguration: React.FC<ApplicationConfigurationProps> = props => (
  <>
    <GroupHeader title={translate('Application configuration')} />
    <Row>
      <StringField
        required={true}
        label={translate('Name')}
        variable="name"
        validate={[required, validateName]}
      />
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
        getLabel={({ name }) => name}
        getValue={({ url }) => url}
      />
      <NamespaceField options={props.namespaces} />
    </Row>
  </>
);
