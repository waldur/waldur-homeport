import * as React from 'react';
import { connect } from 'react-redux';
import { compose } from 'redux';

import { TranslateProps, withTranslation } from '@waldur/i18n';

import * as actions from './actions';
import { IssueCommentsFormContainer } from './IssueCommentsFormContainer';
import { getCommentFormIsOpen, getIsUiDisabled } from './selectors';

interface PureIssueCommentsFomrMainContainerProps extends TranslateProps {
  formId: string;
  opened: boolean;
  uiDisabled: boolean;
  toggle(): void;
}

export const PureIssueCommentsFormMainContainer = (
  props: PureIssueCommentsFomrMainContainerProps,
) => {
  const { opened, toggle, formId, uiDisabled, translate } = props;

  return (
    <div>
      <div className="m-t-lg">
        {opened ? (
          <span className="text-muted">{translate('Comment')}</span>
        ) : (
          <button
            className="btn btn-default"
            disabled={uiDisabled}
            onClick={toggle}
          >
            <i className="fa fa-comment-o" />
            <span className="p-w-xs">{translate('Add comment')}</span>
          </button>
        )}
      </div>
      <IssueCommentsFormContainer formId={formId} />
    </div>
  );
};

const mapStateToProps = (state, ownProps) => ({
  opened: getCommentFormIsOpen(state, ownProps),
  uiDisabled: getIsUiDisabled(state),
});

const mapDispatchToProps = (dispatch, ownProps) => ({
  toggle: (): void =>
    dispatch(actions.issueCommentsFormToggle(ownProps.formId)),
});

const enhance = compose(
  connect(mapStateToProps, mapDispatchToProps),
  withTranslation,
);

export const IssueCommentsFormMainContainer = enhance(
  PureIssueCommentsFormMainContainer,
);
