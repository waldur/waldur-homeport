import * as React from 'react';
import { connect } from 'react-redux';
import { compose } from 'redux';

import { withTranslation } from '@waldur/i18n/translate';
import { openModalDialog } from '@waldur/modal/actions';
import ActionButton from '@waldur/table-react/ActionButton';

const PureJiraIssueCreateButton = props => {
  const { translate, onClick } = props;
  return (
    <ActionButton
      title={translate('Create request')}
      action={onClick}
      icon="fa fa-plus"/>
  );
};

const createRequestDialog = project =>
  openModalDialog('jiraIssueCreateDialog', {resolve: {project}});

const mapDispatchToProps = (dispatch, ownProps) => ({
  onClick: () => dispatch(createRequestDialog(ownProps.project)),
});

const enhance = compose(connect(null, mapDispatchToProps), withTranslation);

export const JiraIssueCreateButton = enhance(PureJiraIssueCreateButton);
