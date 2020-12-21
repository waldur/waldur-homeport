import { FunctionComponent } from 'react';
import { connect } from 'react-redux';

import { translate } from '@waldur/i18n';
import { ActionButton } from '@waldur/table/ActionButton';

import { openIssueCreateDialog } from '../create/actions';
import { ISSUE_CREATION_FORM_ID } from '../create/constants';

const PureIssueCreateButton: FunctionComponent<any> = (props) => (
  <ActionButton
    title={translate('Create')}
    action={props.onClick}
    icon="fa fa-plus"
  />
);

const createRequestDialog = (scope) =>
  openIssueCreateDialog({ issue: scope }, ISSUE_CREATION_FORM_ID);

const mapDispatchToProps = (dispatch, ownProps) => ({
  onClick: () => dispatch(createRequestDialog(ownProps.scope)),
});

const enhance = connect(null, mapDispatchToProps);

export const IssueCreateButton = enhance(PureIssueCreateButton);
