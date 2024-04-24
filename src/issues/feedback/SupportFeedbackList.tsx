import { FC } from 'react';
import { useSelector } from 'react-redux';
import { getFormValues } from 'redux-form';
import { createSelector } from 'reselect';

import { formatDateTime } from '@waldur/core/dateUtils';
import { translate } from '@waldur/i18n';
import {
  SUPPORT_FEEDBACK_LIST,
  SUPPORT_FEEDBACK_LIST_FILTER_FORM,
} from '@waldur/issues/feedback/constants';
import { IssueField } from '@waldur/issues/feedback/IssueField';
import { SupportFeedbackListExpandableRow } from '@waldur/issues/feedback/SupportFeedbackListExpandableRow';
import { getStartAndEndDatesOfMonth } from '@waldur/issues/utils';
import { createFetcher, Table } from '@waldur/table';
import { useTable } from '@waldur/table/utils';

import { SupportFeedbackListFilter } from './SupportFeedbackListFilter';

export const SupportFeedbackList: FC = () => {
  const filter = useSelector(mapStateToProps);
  const props = useTable({
    table: SUPPORT_FEEDBACK_LIST,
    fetchData: createFetcher('support-feedbacks'),
    filter,
    exportRow,
    exportFields,
    queryField: 'query',
  });
  const columns = [
    {
      title: translate('Issue'),
      render: IssueField,
    },
    {
      title: translate('User'),
      render: ({ row }) => row.user_full_name,
      orderField: 'user_full_name',
    },
    {
      title: translate('Evaluation'),
      render: ({ row }) => row.evaluation,
      orderField: 'evaluation',
    },
    {
      title: translate('Created'),
      render: ({ row }) => formatDateTime(row.created),
      orderField: 'created',
    },
  ];
  return (
    <Table
      {...props}
      columns={columns}
      verboseName={translate('support feedback')}
      expandableRow={SupportFeedbackListExpandableRow}
      initialSorting={{ field: 'created', mode: 'desc' }}
      hasQuery={true}
      enableExport={true}
      showPageSizeSelector={true}
      filters={<SupportFeedbackListFilter />}
    />
  );
};

const exportRow = (row) => [
  row.issue_uuid,
  row.user_name,
  row.evaluation,
  row.created,
];

const exportFields = [
  translate('Issue'),
  translate('User'),
  translate('Evaluation'),
  translate('Created'),
];

const mapStateToProps = createSelector(
  getFormValues(SUPPORT_FEEDBACK_LIST_FILTER_FORM),
  (filterValues: any) => {
    const filter: Record<string, string | number> = {};
    if (!filterValues) {
      return {};
    }
    if (filterValues.evaluation) {
      filter.evaluation = filterValues.evaluation.value;
    }
    if (filterValues.period) {
      const { start, end } = getStartAndEndDatesOfMonth(
        filterValues.period.value,
      );
      filter.created_after = start;
      filter.created_before = end;
    }
    if (filterValues.user) {
      filter.user = filterValues.user.url;
    }
    return filter;
  },
);
