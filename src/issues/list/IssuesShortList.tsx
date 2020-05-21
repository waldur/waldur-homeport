import * as React from 'react';
import { useSelector } from 'react-redux';
import useAsyncFn from 'react-use/lib/useAsyncFn';
import useEffectOnce from 'react-use/lib/useEffectOnce';

import { Link } from '@waldur/core/Link';
import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { translate } from '@waldur/i18n';
import { getUser } from '@waldur/workspace/selectors';

import { getIssues } from '../api';

import { IssueRow } from './IssueRow';

export const IssuesShortList = () => {
  const user = useSelector(getUser);
  const [{ loading, error, value }, loadData] = useAsyncFn(
    () => getIssues({ caller: user.url }),
    [user],
  );
  useEffectOnce(() => {
    loadData();
  });
  return (
    <div className="ibox float-e-margins">
      <div className="ibox-title">
        <span className="pull-right">
          <Link className="btn btn-default btn-xs" state="support.list">
            <small>
              <i className="fa fa-list" />
            </small>{' '}
            {translate('See all')}
          </Link>{' '}
          <a className="btn btn-default btn-xs" onClick={loadData}>
            <small>
              <i className="fa fa-refresh" />
            </small>{' '}
            {translate('Refresh')}
          </a>
        </span>
        <h5>{translate('Reported by me')}</h5>
      </div>
      <div className="ibox-content">
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
      </div>
    </div>
  );
};
