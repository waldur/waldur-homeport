import { ArrowBendDownRightIcon } from '@phosphor-icons/react';
import { FC } from 'react';

import { translate } from '@/i18n';
import { DependencyCondition } from '@/marketplace-checklist/questionDependencies';

interface QuestionDependencyInfo {
  logic: 'and' | 'or';
  conditions: DependencyCondition[];
}

interface QuestionDependencyHintProps {
  dependencyInfo: QuestionDependencyInfo;
}

export const QuestionDependencyHint: FC<QuestionDependencyHintProps> = ({
  dependencyInfo,
}) => {
  const { logic, conditions } = dependencyInfo;

  if (!conditions?.length) return null;

  // Format question names (truncate only if very long)
  const formatQuestion = (desc: string) => {
    const maxLength = 80;
    return desc.length > maxLength
      ? `${desc.substring(0, maxLength)}...`
      : desc;
  };

  // Build the dependency text
  const questionNames = conditions.map(
    (c) => `"${formatQuestion(c.question_description)}"`,
  );
  const connector = logic === 'or' ? translate('or') : translate('and');

  let dependencyText: string;
  if (questionNames.length === 1) {
    dependencyText = questionNames[0];
  } else if (questionNames.length === 2) {
    dependencyText = `${questionNames[0]} ${connector} ${questionNames[1]}`;
  } else {
    const lastQuestion = questionNames.pop();
    dependencyText = `${questionNames.join(', ')}, ${connector} ${lastQuestion}`;
  }

  return (
    <div className="d-flex align-items-center gap-1 text-muted small mb-2">
      <ArrowBendDownRightIcon size={14} weight="bold" />
      <span>
        {translate('Shown based on: {questions}', {
          questions: dependencyText,
        })}
      </span>
    </div>
  );
};
