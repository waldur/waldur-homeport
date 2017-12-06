import * as moment from 'moment';
import * as React from 'react';

import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import Panel from '@waldur/core/Panel';
import { TranslateProps } from '@waldur/i18n';

import { FeedItem } from './types';

type Props = TranslateProps & {
  title?: string;
  buttonTitle?: string;
  emptyText?: string;
  loading: boolean;
  items: FeedItem[];
  showAllUrl: string;

  showDetails?: (item: FeedItem) => void;
  showTypes?: () => void;
};

const DashboardFeed = (props: Props) => {
  const titleAppendix = props.showTypes && (
    <div className="pull-right">
      <a className="btn btn-xs btn-link" onClick={props.showTypes}>
        <i className="fa fa-question-circle"></i> {props.buttonTitle}
      </a>
    </div>);

  return (
    <Panel title={props.title} titleAppendix={titleAppendix} className="float-e-margins">
      {props.loading && (
        <LoadingSpinner />
      ) || (
        props.items.length === 0 && (
          <div>
            {props.emptyText}
          </div>
        ) || (
          <div>
            <div className="feed-activity-list">
              {props.items.map((item, i) => (
                <div key={i} className="feed-element">
                  {props.showDetails && (
                    <a className="pull-right" onClick={() => props.showDetails(item)}>{props.translate('Details')}</a>
                  )}
                  <div dangerouslySetInnerHTML={{__html: item.html_message}}></div>
                  <small className="pull-right">{moment(item.created).fromNow()}</small>
                  <small className="text-muted">{moment(item.created).format('MMM d, y h:mm:ss a')}</small>
                </div>
              ))}
            </div>
            <a className="btn btn-default btn-block m-t" href={props.showAllUrl}>
              <span>{props.translate('Show all')}</span>
            </a>
          </div>
        )
      )}
    </Panel>
  );
}

export { DashboardFeed };
