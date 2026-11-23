import { AttributeTypeEnum, NestedAttribute } from 'waldur-js-client';

import { translate } from '@/i18n';

export const getAttributeTypeOptions = (): {
  value: AttributeTypeEnum;
  label: string;
}[] => [
  { value: 'string', label: translate('Short text') },
  { value: 'text', label: translate('Long text') },
  { value: 'integer', label: translate('Number') },
  { value: 'boolean', label: translate('Yes/No') },
  { value: 'choice', label: translate('Single choice') },
  { value: 'list', label: translate('Multiple choice') },
];

export const formatAttributeType = (type: AttributeTypeEnum) =>
  getAttributeTypeOptions().find((option) => option.value === type)?.label ??
  type;

/** Choice and list attributes pick their values from a list of options. */
export const hasOptions = (type: AttributeTypeEnum) =>
  type === 'choice' || type === 'list';

/**
 * An option key is what offerings store as the attribute's value, so it is
 * derived from the title once, kept unique within the attribute, and never
 * changed afterwards.
 */
export const makeOptionKey = (title: string, taken: Set<string>) => {
  const base =
    title
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9_-]+/g, '_')
      .replace(/^_+|_+$/g, '') || 'option';
  let key = base;
  let suffix = 2;
  while (taken.has(key)) {
    key = `${base}_${suffix}`;
    suffix += 1;
  }
  return key;
};

type AttributeWithDefault = Pick<NestedAttribute, 'type' | 'default'> & {
  options?: { key?: string; title: string }[];
};

export const formatDefaultValue = (attribute: AttributeWithDefault): string => {
  const value = attribute.default as unknown;
  if (value === null || value === undefined || value === '') {
    return '';
  }
  const optionTitle = (key: unknown) =>
    attribute.options?.find((option) => option.key === key)?.title ??
    String(key);
  switch (attribute.type) {
    case 'boolean':
      return value ? translate('Yes') : translate('No');
    case 'choice':
      return optionTitle(value);
    case 'list':
      return Array.isArray(value) ? value.map(optionTitle).join(', ') : '';
    default:
      return String(value);
  }
};
