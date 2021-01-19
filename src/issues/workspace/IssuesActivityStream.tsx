import { FunctionComponent } from 'react';
import Gravatar from 'react-gravatar';
import { useDispatch } from 'react-redux';
import { useAsync } from 'react-use';

import { getList } from '@waldur/core/api';
import { formatDateTime } from '@waldur/core/dateUtils';
import { FormattedJira } from '@waldur/core/FormattedJira';
import { Link } from '@waldur/core/Link';
import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { translate, formatJsxTemplate } from '@waldur/i18n';
import { openUserPopover } from '@waldur/user/actions';

interface Comment {
  issue_key: string;
  author_name: string;
  author_email: string;
  author_uuid: string;
  description: string;
  created: string;
}

export const IssuesActivityStream: FunctionComponent = () => {
  const { loading, error, value } = useAsync(
    async () => await getList<Comment>('/support-comments/'),
    [],
  );
  const dispatch = useDispatch();
  const callback = (user_uuid) =>
    dispatch(
      openUserPopover({
        user_uuid,
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
            <>{translate('See all')}</>
          </button>

          <button className="btn btn-default btn-xs">
            <small>
              <i className="fa fa-refresh"></i>
            </small>{' '}
            <>{translate('Refresh')}</>
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
                  {item.author_email ? (
                    <Gravatar
                      email={item.author_email}
                      className="b-r-xl img-sm"
                      size={32}
                    />
                  ) : null}
                </div>
                <div className="vertical-timeline-content">
                  <p className="m-n">
                    {translate(
                      '{user} commented on {issue}',
                      {
                        user: item.author_uuid ? (
                          <a onClick={() => callback(item.author_uuid)}>
                            {item.author_name}
                          </a>
                        ) : (
                          item.author_name
                        ),
                        issue: (
                          <Link
                            state="issue.details"
                            params={{ key: item.issue_key }}
                          >
                            {item.issue_key}
                          </Link>
                        ),
                      },
                      formatJsxTemplate,
                    )}{' '}
                  </p>
                  <FormattedJira text={item.description} />
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
