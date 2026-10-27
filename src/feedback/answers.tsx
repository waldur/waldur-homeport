import { ProjectMetadataAnswer } from 'waldur-js-client';

import { ENV } from '@/core/config';
import { translate } from '@/i18n';
import { getLikertOptions } from '@/marketplace-checklist/LikertField';
import { LikertScaleLength } from '@/marketplace-checklist/types';

const isFile = (value): value is { name: string; stored_file_id?: string } =>
  typeof value === 'object' && value !== null && 'name' in value;

const fileText = (file) =>
  file.stored_file_id
    ? `${file.name} (${ENV.apiEndpoint}api/media/${file.stored_file_id}/)`
    : file.name;

/** A rating or likert answer on its scale, e.g. "7 / 10" or "Agree (4/5)". */
export const formatScaleAnswer = (answer: ProjectMetadataAnswer) => {
  const value = answer.answer;
  if (answer.question_type === 'rating' && value != null) {
    return answer.max_value != null
      ? `${value} / ${Number(answer.max_value)}`
      : String(value);
  }
  if (answer.question_type === 'likert' && value != null) {
    if (value === 'na') return translate('N/A');
    const options = getLikertOptions({
      likert_scale_length: (answer.likert_scale_length ??
        5) as LikertScaleLength,
      likert_low_label: answer.likert_low_label,
      likert_high_label: answer.likert_high_label,
    }).filter((option) => option.value !== 'na');
    const index = Number(value);
    return `${options[index]?.label ?? value} (${index + 1}/${options.length})`;
  }
  return undefined;
};

export const answerFieldName = (uuid: string) => `q_${uuid}`;

const isEmptyAnswer = (value: unknown) =>
  value == null || (Array.isArray(value) && value.length === 0);

/**
 * The answers to save from the prompt's form values. A stored answer that was
 * cleared, or whose question is now hidden, is sent as null, which deletes it.
 */
export const buildAnswers = (
  questions: Array<{ uuid: string }>,
  visibleUuids: Set<string>,
  values: Record<string, unknown>,
  storedUuids: Set<string>,
) =>
  questions.flatMap((question) => {
    const value = visibleUuids.has(question.uuid)
      ? values[answerFieldName(question.uuid)]
      : undefined;
    if (!isEmptyAnswer(value)) {
      return [{ question_uuid: question.uuid, answer_data: value }];
    }
    return storedUuids.has(question.uuid)
      ? [{ question_uuid: question.uuid, answer_data: null }]
      : [];
  });

/** The answer as plain text, for the export. */
export const answerText = (answer: ProjectMetadataAnswer): string => {
  const scale = formatScaleAnswer(answer);
  if (scale !== undefined) return scale;
  const value = answer.answer;
  if (value == null) return '';
  if (isFile(value)) return fileText(value);
  if (Array.isArray(value)) {
    return value
      .map((item) => (isFile(item) ? fileText(item) : item))
      .join(', ');
  }
  if (typeof value === 'boolean') {
    return value ? translate('Yes') : translate('No');
  }
  return String(value);
};
