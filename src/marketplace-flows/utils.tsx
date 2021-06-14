import { getFormValues } from 'redux-form';

import { formatDateTime } from '@waldur/core/dateUtils';
import { translate } from '@waldur/i18n';
import { RootState } from '@waldur/store/reducers';

import { RequestStateIndicator } from './RequestStateIndicator';

export const flowFilterFormSelector = (state: RootState) =>
  getFormValues('FlowListFilter')(state);

export const getColumns = () => [
  {
    title: translate('Requested by'),
    render: ({ row }) => <>{row.requested_by_full_name}</>,
  },
  {
    title: translate('Requested at'),
    render: ({ row }) => formatDateTime(row.created),
  },

  {
    title: translate('Reviewed by'),
    render: ({ row }) =>
      row.reviewed_by_full_name ? row.reviewed_by_full_name : 'N/A',
  },
  {
    title: translate('Reviewed at'),
    render: ({ row }) =>
      row.reviewed_at ? formatDateTime(row.reviewed_at) : 'N/A',
  },
  {
    title: translate('State'),
    render: RequestStateIndicator,
  },
];
