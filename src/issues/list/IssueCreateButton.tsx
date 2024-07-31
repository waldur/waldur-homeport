import { PlusCircle } from '@phosphor-icons/react';
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
    iconNode={<PlusCircle />}
    variant="primary"
  />
);

const createRequestDialog = (scope, refetch) => {
  return openIssueCreateDialog(
    { issue: scope, refetch },
    ISSUE_CREATION_FORM_ID,
  );
};

const mapDispatchToProps = (dispatch, ownProps) => ({
  onClick: () =>
    dispatch(createRequestDialog(ownProps.scope, ownProps.refetch)),
});

const enhance = connect(null, mapDispatchToProps);

export const IssueCreateButton = enhance(PureIssueCreateButton);
