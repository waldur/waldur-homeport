import * as React from 'react';

import { formatFromNow, formatMediumDateTime } from '@waldur/core/dateUtils';
import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import Panel from '@waldur/core/Panel';
import { TranslateProps } from '@waldur/i18n';

import { FeedItem } from './types';

interface Props extends TranslateProps {
  title: string;
  typesTitle: string;
  emptyText: string;
  loading: boolean;
  items: FeedItem[];
  listLink: string;
  showDetails?: (item: FeedItem) => void;
  showTypes: () => void;
}

class DashboardFeed extends React.PureComponent<Props> {
  render() {
    return (
      <Panel
        title={this.props.title}
        actions={this.renderTypesButton()}
        className="float-e-margins"
        children={this.renderList()}
      />
    );
  }

  renderTypesButton() {
    const { showTypes, typesTitle } = this.props;
    return (
      <div className="pull-right">
        <a className="btn btn-xs btn-link" onClick={showTypes}>
          <i className="fa fa-question-circle"></i> {typesTitle}
        </a>
      </div>
    );
  }

  renderList() {
    const { props } = this;
    if (props.loading) {
      return <LoadingSpinner />;
    }

    if (props.items.length === 0) {
      return props.emptyText;
    }

    return (
      <div>
        <div className="feed-activity-list">
          {props.items.map((item, index) => this.renderItem(item, index))}
        </div>
        <a className="btn btn-default btn-block m-t" href={props.listLink}>
          {props.translate('Show all')}
        </a>
      </div>
    );
  }

  renderItem(item, index) {
    const { props } = this;
    return (
      <div className="feed-element" key={index}>
        {props.showDetails && (
          <a className="pull-right" onClick={() => props.showDetails(item)}>
            {props.translate('Details')}
          </a>
        )}
        <div dangerouslySetInnerHTML={{__html: item.html_message}}></div>
        <small className="pull-right">{formatFromNow(item.created)}</small>
        <small className="text-muted">{formatMediumDateTime(item.created)}</small>
      </div>
    );
  }
}

export { DashboardFeed };
