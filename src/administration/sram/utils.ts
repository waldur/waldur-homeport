import { FORM_ERROR } from 'final-form';
import type {
  SramProjectRule,
  SramProjectRuleField as ProjectFieldEnum,
  SramProjectRuleMatch as ProjectMatchEnum,
  SramProjectRuleSourceKind as SourceKindEnum,
  SramProjectRuleRequest,
} from 'waldur-js-client';

import { getErrorBody } from '@/core/ErrorMessageFormatter';
import { translate } from '@/i18n';

/** Placeholders the backend substitutes into a rule's project pattern. */
export const SRAM_PATTERN_PLACEHOLDERS = [
  'co_external_id',
  'co_identifier',
  'co_short_name',
  'org_short_name',
  'group_short_name',
] as const;

export const DEFAULT_PROJECT_PATTERN = '{co_external_id}_';

export interface SramRuleFormValues {
  name: string;
  is_active: boolean;
  source_kind: SourceKindEnum;
  labels: string[];
  group_short_name_patterns: string[];
  project_field: ProjectFieldEnum;
  project_match: ProjectMatchEnum;
  project_pattern: string;
  /** UUID of an active project-scoped role. */
  project_role: string | null;
}

interface Option<T> {
  value: T;
  label: string;
}

export const getSourceKindOptions = (): Option<SourceKindEnum>[] => [
  { value: 'co', label: translate('Collaboration') },
  { value: 'group', label: translate('Group') },
  { value: 'any', label: translate('Collaboration or group') },
];

export const getProjectFieldOptions = (): Option<ProjectFieldEnum>[] => [
  { value: 'backend_id', label: translate('Backend ID') },
  { value: 'slug', label: translate('Slug') },
];

export const getProjectMatchOptions = (): Option<ProjectMatchEnum>[] => [
  { value: 'exact', label: translate('Exact') },
  { value: 'prefix', label: translate('Prefix') },
  { value: 'regex', label: translate('Regular expression') },
];

export const getOptionLabel = <T extends string>(
  options: Option<T>[],
  value: T | null | undefined,
): string | undefined =>
  options.find((option) => option.value === value)?.label ?? value;

/**
 * The API types `labels` and `group_short_name_patterns` as free-form JSON,
 * although both hold a list of strings. Anything else is dropped.
 */
export const toStringList = (value: unknown): string[] =>
  Array.isArray(value)
    ? value
        .filter((item): item is string => typeof item === 'string')
        .map((item) => item.trim())
        .filter(Boolean)
    : [];

/** Group short-name patterns are only accepted for group or any sources. */
export const groupPatternsAllowed = (sourceKind: SourceKindEnum | undefined) =>
  sourceKind === 'group' || sourceKind === 'any';

export const getRuleInitialValues = (
  rule?: SramProjectRule,
  isDuplicate = false,
): SramRuleFormValues => {
  if (!rule) {
    return {
      name: '',
      is_active: true,
      source_kind: 'co',
      labels: [],
      group_short_name_patterns: [],
      project_field: 'backend_id',
      project_match: 'prefix',
      project_pattern: DEFAULT_PROJECT_PATTERN,
      project_role: null,
    };
  }
  return {
    name: isDuplicate
      ? translate('{name} (copy)', { name: rule.name })
      : rule.name,
    is_active: rule.is_active ?? true,
    source_kind: rule.source_kind ?? 'co',
    labels: toStringList(rule.labels),
    group_short_name_patterns: toStringList(rule.group_short_name_patterns),
    project_field: rule.project_field ?? 'backend_id',
    project_match: rule.project_match ?? 'prefix',
    project_pattern: rule.project_pattern ?? DEFAULT_PROJECT_PATTERN,
    project_role: rule.project_role ?? null,
  };
};

export const serializeRule = (
  values: SramRuleFormValues,
): SramProjectRuleRequest => ({
  name: values.name.trim(),
  is_active: Boolean(values.is_active),
  source_kind: values.source_kind,
  labels: toStringList(values.labels),
  group_short_name_patterns: toStringList(values.group_short_name_patterns),
  project_field: values.project_field,
  project_match: values.project_match,
  project_pattern: values.project_pattern,
  project_role: values.project_role,
});

type RenderResult = { rendered: string } | { error: string };

/**
 * Substitute every placeholder the way the backend's `str.format_map` does,
 * so a pattern it would reject is caught before submitting: `{{` and `}}` are
 * literal braces, and anything else in braces must be a known placeholder.
 */
export const renderProjectPattern = (pattern: string): RenderResult => {
  const invalid = (detail: string): RenderResult => ({
    // Braces are passed as values: the translation template syntax uses them.
    error: translate(
      'Invalid placeholder: {detail}. Use {placeholders}, and write a literal brace as {open} or {close}.',
      {
        detail,
        placeholders: SRAM_PATTERN_PLACEHOLDERS.map((name) => `{${name}}`).join(
          ', ',
        ),
        open: '{{',
        close: '}}',
      },
    ),
  });
  let rendered = '';
  let index = 0;
  while (index < pattern.length) {
    const char = pattern[index];
    const next = pattern[index + 1];
    if (char === '{' && next === '{') {
      rendered += '{';
      index += 2;
    } else if (char === '}' && next === '}') {
      rendered += '}';
      index += 2;
    } else if (char === '{') {
      const end = pattern.indexOf('}', index);
      if (end === -1) {
        return invalid(translate('unclosed {brace}', { brace: '"{"' }));
      }
      const name = pattern.slice(index + 1, end);
      if (!(SRAM_PATTERN_PLACEHOLDERS as readonly string[]).includes(name)) {
        return invalid(`{${name}}`);
      }
      rendered += 'x';
      index = end + 1;
    } else if (char === '}') {
      return invalid(translate('single {brace}', { brace: '"}"' }));
    } else {
      rendered += char;
      index += 1;
    }
  }
  return { rendered };
};

export const validateProjectPattern = (
  value: string | undefined,
  allValues?: Partial<SramRuleFormValues>,
): string | undefined => {
  if (!value) {
    return translate('This field is required.');
  }
  const result = renderProjectPattern(value);
  if ('error' in result) {
    return result.error;
  }
  if (!result.rendered) {
    return translate('The pattern must not be empty.');
  }
  // Python-only syntax such as (?P<name>...) is left to the server.
  if (allValues?.project_match === 'regex' && !value.includes('(?P')) {
    try {
      new RegExp(result.rendered);
    } catch {
      return translate('Invalid regular expression.');
    }
  }
  return undefined;
};

export const validateGroupPatterns = (
  value: string[] | undefined,
  allValues?: Partial<SramRuleFormValues>,
): string | undefined =>
  toStringList(value).length && !groupPatternsAllowed(allValues?.source_kind)
    ? translate(
        'Group short names apply only to groups. Set the source to "Group" or "Collaboration or group", or clear the patterns.',
      )
    : undefined;

/**
 * Turn a DRF validation body into react-final-form submit errors, so each
 * message is shown under its own field.
 */
export const toSubmitErrors = (
  error: unknown,
): Record<string, string> | undefined => {
  const body = getErrorBody(error);
  if (!body) return undefined;
  const errors: Record<string, string> = {};
  Object.entries(body).forEach(([field, value]) => {
    const message = Array.isArray(value)
      ? value.join(' ')
      : typeof value === 'string'
        ? value
        : JSON.stringify(value);
    if (field === 'non_field_errors' || field === 'detail') {
      errors[FORM_ERROR] = message;
    } else {
      errors[field] = message;
    }
  });
  return Object.keys(errors).length ? errors : undefined;
};
