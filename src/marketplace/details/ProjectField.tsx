import * as React from 'react';
import { connect } from 'react-redux';

import { translate } from '@waldur/i18n';
import { ProjectCreateButton } from '@waldur/project/ProjectCreateButton';
import { getWorkspace, getCustomer } from '@waldur/workspace/selectors';
import { Project, OuterState } from '@waldur/workspace/types';

import { FormGroup } from '../offerings/FormGroup';

import { ProjectSelectField } from './ProjectSelectField';

const connector = connect<{ projects?: Project[] }, {}, {}, OuterState>(
  state => {
    const workspace = getWorkspace(state);
    const customer = getCustomer(state);
    if (workspace === 'organization') {
      return {
        projects: customer.projects,
      };
    } else {
      return {};
    }
  },
);

const PureProjectField = props =>
  props.projects ? (
    <FormGroup
      labelClassName="control-label col-sm-3"
      valueClassName="col-sm-9"
      label={translate('Project')}
      required={true}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        {props.projects.length > 0 && (
          <div style={{ flexGrow: 1, marginRight: 10 }}>
            <ProjectSelectField projects={props.projects} />
          </div>
        )}
        {!props.previewMode && <ProjectCreateButton />}
      </div>
      <div className="help-block m-b-none text-muted">
        {translate('The project will be changed for all items in cart.')}
      </div>
    </FormGroup>
  ) : null;

export const ProjectField = connector(PureProjectField);
