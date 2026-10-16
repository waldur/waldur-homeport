import { FC } from 'react';

import { translate } from '@/i18n';
import { TableWithPortal } from '@/table/types';

import { BaseQuestionsTable } from './BaseQuestionsTable';
import {
  CUSTOMER_CHECKLIST_QUESTIONS,
  PredefinedQuestion,
} from './predefinedQuestions';

export const CustomerQuestionsTable: FC<TableWithPortal> = ({ portal }) => {
  const getMappingDisplay = (row: PredefinedQuestion) => {
    if (row.maps_to_customer_field) {
      return (
        <div>
          <span className="text-tertiary text-xs">
            {translate('Customer')}:{' '}
          </span>
          <code className="text-brand">{row.maps_to_customer_field}</code>
        </div>
      );
    }
    return <span className="text-quaternary">—</span>;
  };

  return (
    <BaseQuestionsTable
      portal={portal}
      checklistType="customer"
      checklistTypeLabel={translate('customer data')}
      predefinedQuestions={CUSTOMER_CHECKLIST_QUESTIONS}
      getMappingDisplay={getMappingDisplay}
    />
  );
};
