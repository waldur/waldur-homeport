import { FC } from 'react';
import { Form } from 'react-bootstrap';
import { connect } from 'react-redux';

import { translate } from '@waldur/i18n';
import { ProjectCreateButton } from '@waldur/project/ProjectCreateButton';
import { RootState } from '@waldur/store/reducers';
import { getCustomer } from '@waldur/workspace/selectors';

import { FormGroup } from '../offerings/FormGroup';

import { CustomerCreateGroup } from './CustomerCreateGroup';
import { ProjectCreateGroup } from './ProjectCreateGroup';
import { ProjectSelectField } from './ProjectSelectField';

const mapStateToProps = (state: RootState) => {
  const customer = getCustomer(state);
  return { projects: customer?.projects };
};

const connector = connect(mapStateToProps);

type StateProps = ReturnType<typeof mapStateToProps>;

type OwnProps = { previewMode?: boolean };

type ProjectFieldProps = StateProps & OwnProps;

const PureProjectField: FC<ProjectFieldProps> = (props) =>
  props.projects ? (
    <FormGroup label={translate('Project')} required={true}>
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
  ) : (
    <>
      <CustomerCreateGroup />
      <ProjectCreateGroup />
    </>
  );

export const ProjectField = connector(PureProjectField);
