import { feedbackOptions } from '@waldur/issues/feedback/utils';

export const EvaluationField = ({ row }) =>
  feedbackOptions().find(({ value }) => value === row.evaluation).label;
