import { FC, useMemo } from 'react';

import { translate } from '@waldur/i18n';
import { Category } from '@waldur/marketplace/types';
import { useOfferingCategories } from '@waldur/navigation/sidebar/utils';
import { TableWithPortal } from '@waldur/table/types';

import { BaseQuestionsTable } from './BaseQuestionsTable';
import {
  INTENT_CHECKLIST_QUESTIONS,
  PredefinedQuestion,
} from './predefinedQuestions';

export const IntentQuestionsTable: FC<TableWithPortal> = ({ portal }) => {
  const categories: Category[] = useOfferingCategories();

  // Get predefined questions with categories populated
  const predefinedQuestions = useMemo(() => {
    return INTENT_CHECKLIST_QUESTIONS.map((q) => {
      if (q.intent_field === 'services' && categories) {
        return {
          ...q,
          options: categories
            .filter((category) => (category.resource_count || 0) > 0)
            .map((category) => category.title),
        };
      }
      return { ...q };
    });
  }, [categories]);

  const getMappingDisplay = (row: PredefinedQuestion) => {
    if (row.intent_field) {
      return (
        <div>
          <span className="text-gray-600 fs-7">{translate('Intent')}: </span>
          <code className="text-primary">{row.intent_field}</code>
        </div>
      );
    }
    return <span className="text-muted">—</span>;
  };

  return (
    <BaseQuestionsTable
      portal={portal}
      checklistType="intent"
      checklistTypeLabel={translate('intent data')}
      predefinedQuestions={predefinedQuestions}
      getMappingDisplay={getMappingDisplay}
    />
  );
};
