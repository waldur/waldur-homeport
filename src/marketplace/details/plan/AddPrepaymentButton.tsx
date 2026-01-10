import { CalendarPlusIcon, XIcon } from '@phosphor-icons/react';
import { DateTime } from 'luxon';
import { useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { change } from 'redux-form';

import { calculateMonthsDifference, formatDate } from '@waldur/core/dateUtils';
import { lazyComponent } from '@waldur/core/lazyComponent';
import { translate } from '@waldur/i18n';
import { orderProjectSelector } from '@waldur/marketplace/deploy/selectors';
import { useModal } from '@waldur/modal/hooks';
import { CompactActionButton } from '@waldur/table/CompactActionButton';

import { ORDER_FORM_ID } from '../constants';

import { Component } from './types';
import { getEndDate, getStartDate } from './utils';

const AddPrepaidPeriodDialog = lazyComponent(() =>
  import('./AddPrepaidPeriodDialog').then((module) => ({
    default: module.AddPrepaidPeriodDialog,
  })),
);

export const AddPrepaymentButton = ({
  component,
}: {
  component: Component;
}) => {
  const { openDialog, closeDialog } = useModal();
  const dispatch = useDispatch();
  const endDate = useSelector(getEndDate);
  const startDate = useSelector(getStartDate);
  const project = useSelector(orderProjectSelector);

  const handleAddPrepayment = (component: Component) => {
    openDialog(AddPrepaidPeriodDialog, {
      component,
      project,
      startDate,
      onSubmit: (data: { end_date: string }) => {
        // Update the end_date field in the parent redux-form
        dispatch(change(ORDER_FORM_ID, `attributes.end_date`, data.end_date));
      },
      resolve: closeDialog,
    });
  };

  const handleClearEndDate = () => {
    dispatch(change(ORDER_FORM_ID, `attributes.end_date`, null));
  };

  const monthsDuration = useMemo(() => {
    if (endDate) {
      return calculateMonthsDifference(startDate, endDate);
    }
    return null;
  }, [startDate, endDate]);

  const dateRangeDisplay = useMemo(() => {
    if (!endDate) return '';
    const start = DateTime.fromISO(startDate);
    const end = DateTime.fromISO(endDate);
    if (start.year === end.year) {
      // Same year: format start date without year for brevity
      const formattedStart = start.toLocaleString({
        month: 'short',
        day: 'numeric',
      });
      const formattedEnd = end.toLocaleString({
        month: 'short',
        day: 'numeric',
      });
      return `${formattedStart} - ${formattedEnd}`;
    } else {
      // Different years: show full dates for clarity
      return `${formatDate(startDate)} - ${formatDate(endDate)}`;
    }
  }, [startDate, endDate]);

  if (endDate) {
    return (
      <div className="d-flex flex-column align-items-start">
        <span className="d-flex align-items-center gap-2 badge-outline-success badge-pill badge">
          <span>{dateRangeDisplay}</span>
          <button
            type="button"
            className="btn btn-link p-0 text-white"
            onClick={handleClearEndDate}
            style={{ lineHeight: 1 }}
          >
            <XIcon weight="bold" />
          </button>
        </span>
        {monthsDuration !== null && (
          <small className="text-muted mt-1">
            {translate('{count} mo prepayment', { count: monthsDuration })}
          </small>
        )}
      </div>
    );
  }

  return (
    <CompactActionButton
      variant="text-primary"
      className="mb-1"
      action={() => handleAddPrepayment(component)}
      iconNode={<CalendarPlusIcon weight="bold" />}
      title={translate('Add prepayment')}
    />
  );
};
