import React, { useState } from 'react';
import { Button, Card, Form } from 'react-bootstrap';
import { connect } from 'react-redux';
import { compose } from 'redux';

import { translate } from '@waldur/i18n';
import { isOwnerOrStaff } from '@waldur/workspace/selectors';
import { Project } from '@waldur/workspace/types';

import * as actions from './actions';

interface DispatchProps {
  project: Project;
}

interface ProjectDeleteProps extends DispatchProps {
  canDelete: boolean;
  showProjectRemoval: () => void;
}

const PureProjectDelete: React.FC<ProjectDeleteProps> = (props) => {
  const [confirm, setConfirm] = useState(false);

  return (
    props.canDelete && (
      <Card>
        <Card.Header className="text-danger">
          {translate('Delete project')}
        </Card.Header>
        <Card.Body className="d-flex justify-content-between">
          <Form.Check
            id="chk-confirm-delete-project"
            type="checkbox"
            checked={confirm}
            onChange={(value) => setConfirm(value.target.checked)}
            label={translate('Request project deletion')}
            className="form-check-custom form-check-solid form-check-danger"
          />
          <Button
            id="remove-btn"
            variant="danger"
            size="sm"
            onClick={props.showProjectRemoval}
            disabled={!confirm}
          >
            {translate('Deletion')}
          </Button>
        </Card.Body>
      </Card>
    )
  );
};

const mapStateToProps = (state) => ({
  canDelete: isOwnerOrStaff(state),
});

const mapDispatchToProps = (dispatch, props: DispatchProps) => {
  return {
    showProjectRemoval: () =>
      dispatch(
        actions.showProjectRemoveDialog(
          () => dispatch(actions.deleteProject(props.project)),
          props.project.name,
        ),
      ),
  };
};

const enhance = compose(connect(mapStateToProps, mapDispatchToProps));

export const ProjectDelete = enhance(PureProjectDelete);
