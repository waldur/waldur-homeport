import * as React from 'react';
import { connect } from 'react-redux';

import { translate } from '@waldur/i18n/translate';
import ActionButton from '@waldur/table-react/ActionButton';
import { isOwnerOrStaff } from '@waldur/workspace/selectors';
import { Project } from '@waldur/workspace/types';

import { deleteProject } from './actions';

interface OwnProps {
  project: Project;
}

const PureProjectDeleteButton = props => (
  <ActionButton
    title={translate('Delete')}
    action={props.deleteProject}
    tooltip={props.tooltip}
    icon={'fa fa-trash'}
    disabled={props.disabled}
  />
);

const mapStateToProps = state => {
  const ownerOrStaff = isOwnerOrStaff(state);

  if (!ownerOrStaff) {
    return {
      disabled: true,
      tooltip: translate('You don\'t have enough privileges to perform this operation.'),
    };
  } else {
    return {
      disabled: false,
    };
  }
};

const mapDispatchToProps = (dispatch, ownProps: OwnProps) => ({
  deleteProject: () => dispatch(deleteProject(ownProps.project)),
});

const enhance = connect(mapStateToProps, mapDispatchToProps);

export const ProjectDeleteButton = enhance(PureProjectDeleteButton) as React.ComponentType<OwnProps>;
