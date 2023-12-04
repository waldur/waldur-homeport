import { connect, useSelector } from 'react-redux';

import { PermissionEnum } from '@waldur/permissions/enums';
import { hasPermission } from '@waldur/permissions/hasPermission';
import { getConfig } from '@waldur/store/config';
import { getCustomer, getUser } from '@waldur/workspace/selectors';

import * as actions from './actions';
import { ProjectDetails } from './ProjectDetails';
import { ProjectUpdateForm } from './ProjectUpdateForm';

const ProjectUpdateComponent = (props) => {
  const user = useSelector(getUser);
  const canUpdate =
    hasPermission(user, {
      permission: PermissionEnum.UPDATE_PROJECT,
      customerId: props.customer.uuid,
    }) ||
    hasPermission(user, {
      permission: PermissionEnum.UPDATE_PROJECT,
      projectId: props.project.uuid,
    });

  return canUpdate ? (
    <ProjectUpdateForm {...props} />
  ) : (
    <ProjectDetails
      name={props.project.name}
      description={props.project.description}
      end_date={props.project.end_date}
    />
  );
};

const mapStateToProps = (state, ownProps) => ({
  customer: getCustomer(state),
  project_uuid: ownProps.project.uuid,
  initialValues: {
    name: ownProps.project.name,
    description: ownProps.project.description,
    end_date: ownProps.project.end_date,
    backend_id: ownProps.project.backend_id,
    oecd_fos_2007_code: ownProps.oecdCodes.find(
      (option) => option.value === ownProps.project.oecd_fos_2007_code,
    ),
    is_industry: ownProps.project.is_industry,
    image: ownProps.project.image,
    customer_name: ownProps.project.customer_name,
    isDisabled: !ownProps.canUpdate,
  },
  project_type: ownProps.project.type_name,
  enforceLatinName: getConfig(state).enforceLatinName,
});

const mapDispatchToProps = (dispatch, ownProps) => ({
  updateProject: (data) =>
    actions.updateProject(
      {
        ...data,
        uuid: ownProps.project.uuid,
        cache: ownProps.project,
      },
      dispatch,
    ),
});

const enhance = connect(mapStateToProps, mapDispatchToProps);

export const ProjectUpdateContainer = enhance(ProjectUpdateComponent);
