import { FunctionComponent } from 'react';
import { Button, Card } from 'react-bootstrap';
import { useSelector } from 'react-redux';
import { useAsyncFn, useEffectOnce } from 'react-use';

import { Link } from '@waldur/core/Link';
import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { translate } from '@waldur/i18n';
import { getUser } from '@waldur/workspace/selectors';

import { getIssues } from '../api';

import { IssueRow } from './IssueRow';

export const IssuesShortList: FunctionComponent = () => {
  const user = useSelector(getUser);
  const [{ loading, error, value }, loadData] = useAsyncFn(
    () => getIssues({ caller: user.url }),
    [user],
  );
  useEffectOnce(() => {
    loadData();
  });
  return (
    <Card>
      <Card.Header>
        <Card.Title>
          <h3>{translate('Reported by me')}</h3>
        </Card.Title>
        <div className="card-toolbar">
          <Link className="btn btn-secondary" state="support.list">
            <small>
              <i className="fa fa-list" />
            </small>{' '}
            {translate('See all')}
          </Link>{' '}
          <Button as="a" size="sm" onClick={loadData}>
            <small>
              <i className="fa fa-refresh" />
            </small>{' '}
            {translate('Refresh')}
          </Button>
        </div>
      </Card.Header>
      <Card.Body>
        {loading ? (
          <LoadingSpinner />
        ) : error ? (
          <>{translate('Unable to load data.')}</>
        ) : !value ? null : value.length === 0 ? (
          translate('There are no requests yet.')
        ) : (
          <table className="table table-hover no-margins">
            <thead>
              <tr>
                <th style={{ width: 80 }}>{translate('Key')}</th>
                <th>{translate('Description')}</th>
                <th style={{ width: 100 }} className="hidden-xs">
                  {translate('Updated')}
                </th>
                <th style={{ width: 100 }} className="hidden-xs">
                  {translate('Time in progress')}
                </th>
              </tr>
            </thead>
            <tbody>
              {value.map((item, index) => (
                <IssueRow item={item} key={index} />
              ))}
            </tbody>
          </table>
        )}
      </Card.Body>
    </Card>
  );
};
