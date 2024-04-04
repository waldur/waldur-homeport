import React, { useState } from 'react';
import { Button, Card, Form } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';

import { translate } from '@waldur/i18n';
import { PermissionEnum } from '@waldur/permissions/enums';
import { hasPermission } from '@waldur/permissions/hasPermission';
import { getCustomer, getUser } from '@waldur/workspace/selectors';
import { Project } from '@waldur/workspace/types';

import * as actions from './actions';

interface ProjectDeleteProps {
  project: Project;
}

export const ProjectDelete: React.FC<ProjectDeleteProps> = (props) => {
  const [confirm, setConfirm] = useState(false);
  const dispatch = useDispatch();
  const user = useSelector(getUser);
  const customer = useSelector(getCustomer);
  const canDelete =
    hasPermission(user, {
      permission: PermissionEnum.DELETE_PROJECT,
      customerId: customer.uuid,
    }) ||
    hasPermission(user, {
      permission: PermissionEnum.DELETE_PROJECT,
      projectId: props.project.uuid,
    });

  return canDelete ? (
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
          onClick={() =>
            dispatch(
              actions.showProjectRemoveDialog(
                () => dispatch(actions.deleteProject(props.project)),
                props.project.name,
              ),
            )
          }
          disabled={!confirm}
        >
          {translate('Deletion')}
        </Button>
      </Card.Body>
    </Card>
  ) : null;
};
