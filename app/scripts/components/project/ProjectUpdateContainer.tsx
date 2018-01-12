import * as React from 'react';
import { connect } from 'react-redux';
import { compose } from 'redux';

import { withTranslation } from '@waldur/i18n';
import { connectAngularComponent } from '@waldur/store/connect';
import { getCurrentCustomer } from '@waldur/store/currentCustomer';
import { getCurrentUser } from '@waldur/table-react/selectors';

import * as actions from './actions';
import { ProjectDetails } from './ProjectDetails';
import { ProjectUpdateForm } from './ProjectUpdateForm';

const ProjectUpdateComponent = props =>
  props.canManage ? (
    <ProjectUpdateForm {...props}/>
  ) : (
    <ProjectDetails
      name={props.project.name}
      description={props.project.description}
      translate={props.translate}
    />
  );

const canManageProject = state => {
  const user = getCurrentUser(state);
  if (user.is_staff) {
    return true;
  }
  const customer = getCurrentCustomer(state);
  const isOwner = customer.owners.find(owner => owner.uuid === user.uuid) !== undefined;
  return isOwner;
};

const mapStateToProps = (state, ownProps) => ({
  customer: getCurrentCustomer(state),
  project_uuid: ownProps.project.uuid,
  initialValues: {
    name: ownProps.project.name,
    description: ownProps.project.description,
  },
  canManage: canManageProject(state),
});

const mapDispatchToProps = (dispatch, ownProps) => ({
  updateProject: data => actions.updateProject({...data, uuid: ownProps.project.uuid}, dispatch),
});

const enhance = compose(
  withTranslation,
  connect(mapStateToProps, mapDispatchToProps),
);

const ProjectUpdateContainer = enhance(ProjectUpdateComponent);

export default connectAngularComponent(ProjectUpdateContainer, ['project']);
