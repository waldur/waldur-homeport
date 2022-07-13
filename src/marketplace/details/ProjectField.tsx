import { FC } from 'react';
import { Form } from 'react-bootstrap';
import { connect } from 'react-redux';

import { translate } from '@waldur/i18n';
import { ProjectCreateButton } from '@waldur/project/ProjectCreateButton';
import { RootState } from '@waldur/store/reducers';
import { getWorkspace, getCustomer } from '@waldur/workspace/selectors';
import {
  ORGANIZATION_WORKSPACE,
  USER_WORKSPACE,
} from '@waldur/workspace/types';

import { FormGroup } from '../offerings/FormGroup';

import { CustomerCreateGroup } from './CustomerCreateGroup';
import { ProjectCreateGroup } from './ProjectCreateGroup';
import { ProjectSelectField } from './ProjectSelectField';

const mapStateToProps = (state: RootState) => {
  const workspace = getWorkspace(state);
  const customer = getCustomer(state);
  if (workspace === ORGANIZATION_WORKSPACE) {
    return {
      projects: customer.projects,
    };
  } else {
    return { workspace };
  }
};

const connector = connect(mapStateToProps);

type StateProps = ReturnType<typeof mapStateToProps>;

type OwnProps = { previewMode?: boolean };

type ProjectFieldProps = StateProps & OwnProps;

const PureProjectField: FC<ProjectFieldProps> = (props) =>
  props.projects ? (
    <FormGroup
      labelClassName="col-sm-3"
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
      <Form.Text className="mb-0 text-muted">
        {translate('The project will be changed for all items in cart.')}
      </Form.Text>
    </FormGroup>
  ) : props.workspace === USER_WORKSPACE ? (
    <>
      <CustomerCreateGroup />
      <ProjectCreateGroup />
    </>
  ) : null;

export const ProjectField = connector(PureProjectField);
