import * as React from 'react';
import * as Gravatar from 'react-gravatar';
import { useDispatch } from 'react-redux';
import useAsync from 'react-use/lib/useAsync';

import { getList } from '@waldur/core/api';
import { formatDateTime } from '@waldur/core/dateUtils';
import { Link } from '@waldur/core/Link';
import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { translate } from '@waldur/i18n';
import { openModalDialog } from '@waldur/modal/actions';

interface Comment {
  user: {
    email: string;
    username: string;
  };
  key: string;
  text: string;
  created: string;
}

export const IssuesActivityStream = () => {
  const { loading, error, value } = useAsync(
    async () => await getList<Comment>('/support-comments/'),
    [],
  );
  const dispatch = useDispatch();
  const callback = user =>
    dispatch(
      openModalDialog('userPopover', {
        resolve: {
          user,
        },
      }),
    );
  return (
    <div className="ibox float-e-margins">
      <div className="ibox-title">
        <span className="pull-right">
          <button className="btn btn-default btn-xs">
            <small>
              <i className="fa fa-list"></i>
            </small>{' '}
            <span>{translate('See all')}</span>
          </button>

          <button className="btn btn-default btn-xs">
            <small>
              <i className="fa fa-refresh"></i>
            </small>{' '}
            <span>{translate('Refresh')}</span>
          </button>
        </span>

        <h5>{translate('Activity stream')}</h5>
      </div>
      <div className="ibox-content">
        {loading ? (
          <LoadingSpinner />
        ) : error ? (
          translate('Unable to load data.')
        ) : value.length == 0 ? (
          translate('There is no activity yet.')
        ) : (
          <div
            id="vertical-timeline"
            className="vertical-container dark-timeline"
          >
            {value.map((item, index) => (
              <div className="vertical-timeline-block" key={index}>
                <div className="vertical-timeline-icon">
                  <Gravatar
                    email={item.user.email}
                    className="b-r-xl img-sm"
                    size={32}
                  />
                </div>
                <div className="vertical-timeline-content">
                  <p className="m-n">
                    <a onClick={() => callback(item.user)}>
                      {item.user.username}
                    </a>
                    <span>{translate('commented on')}</span>{' '}
                    <Link state="issue.details" params={{ key: item.key }}>
                      {item.key}
                    </Link>{' '}
                    {item.text}
                  </p>
                  <span className="vertical-date small text-muted">
                    {formatDateTime(item.created)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
