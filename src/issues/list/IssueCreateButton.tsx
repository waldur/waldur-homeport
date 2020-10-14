import * as React from 'react';
import { connect } from 'react-redux';

import { translate } from '@waldur/i18n';
import { openModalDialog } from '@waldur/modal/actions';
import { ActionButton } from '@waldur/table/ActionButton';

import { ISSUE_CREATION_FORM_ID } from '../create/constants';
import { IssueCreateDialog } from '../create/IssueCreateDialog';

const PureIssueCreateButton = (props) => (
  <ActionButton
    title={translate('Create')}
    action={props.onClick}
    icon="fa fa-plus"
  />
);

const createRequestDialog = (scope) =>
  openModalDialog(IssueCreateDialog, {
    resolve: { issue: scope },
    formId: ISSUE_CREATION_FORM_ID,
  });

const mapDispatchToProps = (dispatch, ownProps) => ({
  onClick: () => dispatch(createRequestDialog(ownProps.scope)),
});

const enhance = connect(null, mapDispatchToProps);

export const IssueCreateButton = enhance(PureIssueCreateButton);
