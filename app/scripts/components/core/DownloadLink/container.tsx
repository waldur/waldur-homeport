import { connect } from 'react-redux';

import { downloadRequest as downloadAction} from './actions';
import { downloadReset as resetAction} from './actions';
import { PureDownloadLink } from './component';
import { getDownloadLinkState } from './reducers';

const mapStateToDispatch = (dispatch, ownProps) => ({
  onDownload: () => dispatch(downloadAction(ownProps.url, ownProps.filename)),
  onReset: () => dispatch(resetAction()),
});

export const DownloadLink = connect(getDownloadLinkState, mapStateToDispatch)(PureDownloadLink);
