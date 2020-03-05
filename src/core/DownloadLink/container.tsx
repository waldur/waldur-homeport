import { connect } from 'react-redux';

import {
  downloadRequest as downloadAction,
  downloadReset as resetAction,
} from './actions';
import { PureDownloadLink } from './component';
import { getDownloadLinkState } from './reducers';

interface StateProps {
  loading: boolean;
  loaded: boolean;
  erred: boolean;
}

interface DispatchProps {
  onDownload(): void;
  onReset(): void;
}

interface OwnProps {
  filename: string;
  label: string;
  url: string;
}

const mapStateToDispatch = (dispatch, ownProps) => ({
  onDownload: () => dispatch(downloadAction(ownProps.url, ownProps.filename)),
  onReset: () => dispatch(resetAction()),
});

const connector = connect<StateProps, DispatchProps, OwnProps>(
  getDownloadLinkState,
  mapStateToDispatch,
);

export const DownloadLink = connector(PureDownloadLink);
