import { FunctionComponent } from 'react';
import { connect } from 'react-redux';
import { compose } from 'redux';

import { translate } from '@waldur/i18n';
import { ActionDialog } from '@waldur/modal/ActionDialog';
import { closeModalDialog } from '@waldur/modal/actions';

import * as actions from './actions';

interface IssueCommentDeleteDialogProps {
  onSubmit(evt: Event): void;
  resolve: {
    uuid: string;
  };
}

export const PureIssueCommentDeleteDialog: FunctionComponent<IssueCommentDeleteDialogProps> =
  (props) => {
    const { onSubmit } = props;
    return (
      <ActionDialog submitLabel={translate('Delete')} onSubmit={onSubmit}>
        <h3 className="text-center">
          {translate('Do you really want to delete comment?')}
        </h3>
      </ActionDialog>
    );
  };

const mapDispatchToProps = (dispatch, ownProps) => ({
  onSubmit: (evt: Event): void => {
    evt.preventDefault();
    dispatch(actions.issueCommentsDelete(ownProps.resolve.uuid));
    dispatch(closeModalDialog());
  },
});

const enhance = compose(connect(null, mapDispatchToProps));

export const IssueCommentDeleteDialog = enhance(PureIssueCommentDeleteDialog);
