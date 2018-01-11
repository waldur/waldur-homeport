import * as classNames from 'classnames';
import * as React from 'react';
import { connect } from 'react-redux';

import { ExternalLinkProps } from '../ExternalLink';
import { downloadRequest as downloadAction} from './actions';
import { getDownloadLinkState } from './reducers';

interface DownloadLinkProps extends ExternalLinkProps {
  filename: string;
  onDownload(): void;
  loading: boolean;
  erred: boolean;
}

export const PureDownloadLink = (props: DownloadLinkProps) => (
  <a onClick={props.onDownload}
    className={classNames({disabled: props.loading})}>
    <i className="fa fa-download m-r-xs"/>
    {' '}
    {props.label}
    {' '}
    {props.loading && <i className="fa fa-spinner fa-spin"/>}
    {props.erred && <i className="fa fa-exclamation-triangle"/>}
  </a>
);

const mapStateToDispatch = (dispatch, ownProps) => ({
  onDownload: () => dispatch(downloadAction(ownProps.url, ownProps.filename)),
});

export const DownloadLink = connect(getDownloadLinkState, mapStateToDispatch)(PureDownloadLink);
