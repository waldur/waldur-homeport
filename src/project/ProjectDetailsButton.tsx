import * as React from 'react';
import { connect } from 'react-redux';

import { translate } from '@waldur/i18n/translate';
import { openModalDialog } from '@waldur/modal/actions';
import ActionButton from '@waldur/table-react/ActionButton';
import { Project } from '@waldur/workspace/types';

interface OwnProps {
  project: Project;
}

const PureProjectDetailsButton = props => (
  <ActionButton
    title={translate('Details')}
    action={props.openProjectDialog}
    icon="fa fa-eye"
  />
);

const openProjectDialog = (project: Project) =>
  openModalDialog('projectDialog', {resolve: {project}, size: 'lg'});

const mapDispatchToProps = (dispatch, ownProps: OwnProps) => ({
  openProjectDialog: () => dispatch(openProjectDialog(ownProps.project)),
});

const enhance = connect(null, mapDispatchToProps);

export const ProjectDetailsButton = enhance(PureProjectDetailsButton) as React.ComponentType<OwnProps>;
