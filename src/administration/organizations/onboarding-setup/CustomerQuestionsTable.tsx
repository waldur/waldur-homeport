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
          <span className="text-gray-600 fs-7">{translate('Customer')}: </span>
          <code className="text-primary">{row.maps_to_customer_field}</code>
        </div>
      );
    }
    return <span className="text-muted">—</span>;
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
