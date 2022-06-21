import { FunctionComponent } from 'react';
import { connect } from 'react-redux';

import { Tip } from '@waldur/core/Tooltip';
import { translate } from '@waldur/i18n';
import { issueAttachmentsGet } from '@waldur/issues/attachments/actions';
import { getIsLoading as getAttachmentsIsLoading } from '@waldur/issues/attachments/selectors';
import { issueCommentsGet } from '@waldur/issues/comments/actions';
import { getIsLoading as getCommentsIsLoading } from '@waldur/issues/comments/selectors';
import './IssueReload.scss';
import { RootState } from '@waldur/store/reducers';

interface PureIssueReloadProps {
  issueUrl: string;
  loading: boolean;
  fetchData(): void;
}

export const PureIssueReload: FunctionComponent<PureIssueReloadProps> = (
  props,
) => {
  const { fetchData, loading } = props;

  return (
    <Tip label={translate('Reload issue data')} id="reload_issue_tooltip">
      <span className="issue-reload" onClick={fetchData}>
        <i className={`fa fa-refresh ${loading ? 'fa-spin' : ''}`} />
      </span>
    </Tip>
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

const enhance = connect(mapStateToProps, mapDispatchToProps);

export const IssueReload = enhance(PureIssueReload);
