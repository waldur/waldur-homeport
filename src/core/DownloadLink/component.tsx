import * as classNames from 'classnames';
import * as React from 'react';

import { ExternalLinkProps } from '../ExternalLink';

interface DownloadLinkProps extends ExternalLinkProps {
  filename: string;
  onDownload(): void;
  onReset(): void;
  loading: boolean;
  loaded: boolean;
  erred: boolean;
  className?: string;
}

export class PureDownloadLink extends React.Component<DownloadLinkProps> {
  render() {
    const { label, loading, loaded, erred, onDownload } = this.props;
    return (
      <span>
        <a onClick={onDownload}
          className={classNames({disabled: loading}, this.props.className)}>
          <i className="fa fa-download m-r-xs"/>
          {' '}
          {label}
        </a>
        {' '}
        {loading && <i className="text-info fa fa-spinner fa-spin"/>}
        {loaded && <i className="text-success fa fa-check"/>}
        {erred && <i className="text-danger fa fa-exclamation-triangle"/>}
      </span>
    );
  }

  componentWillUnmount() {
    this.props.onReset();
  }
}
