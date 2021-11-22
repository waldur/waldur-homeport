import { connect } from 'react-redux';
import { compose } from 'redux';

import { withTranslation } from '@waldur/i18n';
import { getConfig } from '@waldur/store/config';
import {
  getCustomer,
  isOwner,
  isOwnerOrStaff,
  isStaff,
} from '@waldur/workspace/selectors';

import * as actions from './actions';
import { ProjectDetails } from './ProjectDetails';
import { ProjectUpdateForm } from './ProjectUpdateForm';

const ProjectUpdateComponent = (props) =>
  props.canManage ? (
    <ProjectUpdateForm {...props} />
  ) : (
    <ProjectDetails
      name={props.project.name}
      description={props.project.description}
      end_date={props.project.end_date}
      translate={props.translate}
    />
  );

const mapStateToProps = (state, ownProps) => ({
  customer: getCustomer(state),
  project_uuid: ownProps.project.uuid,
  initialValues: {
    name: ownProps.project.name,
    description: ownProps.project.description,
    end_date: ownProps.project.end_date,
  },
  project_type: ownProps.project.type_name,
  canManage: isOwnerOrStaff(state),
  isStaff: isStaff(state),
  isOwner: isOwner(state),
  enforceLatinName: getConfig(state).enforceLatinName,
  isDisabled: !isStaff(state) && !isOwner(state),
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

const enhance = compose(
  connect(mapStateToProps, mapDispatchToProps),
  withTranslation,
);

export const ProjectUpdateContainer = enhance(ProjectUpdateComponent);
