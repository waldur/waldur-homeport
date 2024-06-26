import { Trash } from '@phosphor-icons/react';
import { FC } from 'react';
import { Button } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';

import { Panel } from '@waldur/core/Panel';
import { translate } from '@waldur/i18n';
import { PermissionEnum } from '@waldur/permissions/enums';
import { hasPermission } from '@waldur/permissions/hasPermission';
import { getCustomer, getUser } from '@waldur/workspace/selectors';
import { Project } from '@waldur/workspace/types';

import * as actions from '../actions';

interface ProjectDeleteProps {
  project: Project;
}

export const ProjectDelete: FC<ProjectDeleteProps> = (props) => {
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
    <Panel
      title={translate('Delete project')}
      className="card-bordered"
      actions={
        <Button
          id="remove-btn"
          variant="light-danger"
          onClick={() =>
            dispatch(
              actions.showProjectRemoveDialog(
                () => dispatch(actions.deleteProject(props.project)),
                props.project.name,
              ),
            )
          }
        >
          <span className="svg-icon svg-icon-2">
            <Trash weight="bold" />
          </span>
          {translate('Delete')}
        </Button>
      }
    >
      <ul className="text-gray-700">
        <li>
          {translate(
            'You can remove this project by pressing the button above.',
          )}
        </li>
        <li>
          {translate(
            'Only projects without existing resources can be removed.',
          )}
        </li>
        <li>{translate('Removed projects cannot be restored.')}</li>
      </ul>
    </Panel>
  ) : null;
};
