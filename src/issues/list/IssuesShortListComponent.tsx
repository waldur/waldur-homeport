import * as React from 'react';

import { Link } from '@waldur/core/Link';
import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { QueryChildProps } from '@waldur/core/Query';
import { translate } from '@waldur/i18n';

import { IssueRow } from './IssueRow';
import { Issue } from './types';

type Props = QueryChildProps<Issue[]>;

export const IssuesShortListComponent: React.SFC<Props> = ({ loading, data, loadData }) => (
  <div className="ibox float-e-margins">
    <div className="ibox-title">
      <span className="pull-right">
        <Link className="btn btn-default btn-xs" state="support.list">
          <small><i className="fa fa-list"/></small>
          {' '}
          {translate('See all')}
        </Link>
        {' '}
        <a className="btn btn-default btn-xs" onClick={loadData}>
          <small><i className="fa fa-refresh"/></small>
          {' '}
          {translate('Refresh')}
        </a>
      </span>
      <h5>{translate('Reported by me')}</h5>
    </div>
    <div className="ibox-content">
      {loading && <LoadingSpinner/>}
      {!loading && data.length === 0 && translate('There are no requests yet.')}
      {!loading && data.length > 0 && (
        <table className="table table-hover no-margins">
          <thead>
            <tr>
              <th style={{width: 80}}>{translate('Key')}</th>
              <th>{translate('Description')}</th>
              <th style={{width: 100}} className="hidden-xs">{translate('Updated')}</th>
              <th style={{width: 100}} className="hidden-xs">{translate('Time in progress')}</th>
            </tr>
          </thead>
          <tbody>
            {data.map((item, index) => <IssueRow item={item} key={index}/>)}
          </tbody>
        </table>
      )}
    </div>
  </div>
);
