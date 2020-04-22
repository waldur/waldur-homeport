import * as React from 'react';
import { connect } from 'react-redux';

import { formatDate, formatRelative } from '@waldur/core/dateUtils';
import { Link } from '@waldur/core/Link';
import { Tooltip } from '@waldur/core/Tooltip';
import { translate } from '@waldur/i18n';
import { openModalDialog } from '@waldur/modal/actions';

import { Issue } from './types';

interface Props {
  item: Issue;
  openUserDialog(id: string): void;
  openCustomerDialog(id: string): void;
}

const connector = connect(null, dispatch => ({
  openUserDialog: user_uuid =>
    dispatch(openModalDialog('userPopover', { resolve: { user_uuid } })),

  openCustomerDialog: customer_uuid =>
    dispatch(
      openModalDialog('customerPopover', {
        resolve: { customer_uuid },
        size: 'lg',
      }),
    ),
}));

export const IssueRow = connector((props: Props) => (
  <tr>
    <td>
      <Tooltip label={props.item.type} id="issue-type-label">
        <Link
          label={props.item.key || 'N/A'}
          state="support.detail"
          params={{ uuid: props.item.uuid }}
        />
      </Tooltip>
    </td>
    <td>
      {props.item.summary}
      <br />
      <small className="text-muted">
        {translate('Opened by')}{' '}
        <a onClick={() => props.openUserDialog(props.item.caller_uuid)}>
          {props.item.caller_full_name}
        </a>{' '}
        {props.item.customer_uuid && (
          <>
            {translate('from')}{' '}
            <a
              onClick={() => props.openCustomerDialog(props.item.customer_uuid)}
            >
              {props.item.customer_name}
            </a>
          </>
        )}{' '}
        at {formatDate(props.item.created)}
      </small>
    </td>
    <td className="hidden-xs">
      <small>{formatDate(props.item.modified)}</small>
    </td>
    <td className="hidden-xs">
      <small>{formatRelative(props.item.created)} ago</small>
    </td>
  </tr>
));
