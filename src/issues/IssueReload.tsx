import { FunctionComponent } from 'react';
import { connect } from 'react-redux';
import { compose } from 'redux';

import { Tooltip } from '@waldur/core/Tooltip';
import { TranslateProps, withTranslation } from '@waldur/i18n';
import { issueAttachmentsGet } from '@waldur/issues/attachments/actions';
import { getIsLoading as getAttachmentsIsLoading } from '@waldur/issues/attachments/selectors';
import { issueCommentsGet } from '@waldur/issues/comments/actions';
import { getIsLoading as getCommentsIsLoading } from '@waldur/issues/comments/selectors';
import './IssueReload.scss';
import { RootState } from '@waldur/store/reducers';

interface PureIssueReloadProps extends TranslateProps {
  issueUrl: string;
  loading: boolean;
  fetchData(): void;
}

export const PureIssueReload: FunctionComponent<PureIssueReloadProps> = (
  props,
) => {
  const { fetchData, loading, translate } = props;

  return (
    <Tooltip label={translate('Reload issue data')} id="reload_issue_tooltip">
      <span className="issue-reload" onClick={fetchData}>
        <i className={`fa fa-refresh ${loading ? 'fa-spin' : ''}`} />
      </span>
    </Tooltip>
  );
};

const mapStateToProps = (state: RootState) => ({
  loading: getAttachmentsIsLoading(state) || getCommentsIsLoading(state),
});

const mapDispatchToProps = (dispatch, ownProps) => ({
  fetchData: (): void => {
    dispatch(issueAttachmentsGet(ownProps.issueUrl));
    dispatch(issueCommentsGet(ownProps.issueUrl));
  },
});

const enhance = compose(
  connect(mapStateToProps, mapDispatchToProps),
  withTranslation,
);

export const IssueReload = enhance(PureIssueReload);
