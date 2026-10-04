import { FORM_ERROR } from 'final-form';
import { User } from 'waldur-js-client';

import { getErrorBody } from '@/core/ErrorMessageFormatter';
import { translate } from '@/i18n';
import {
  POSIX_ID_MAX,
  POSIX_ID_MIN,
} from '@/marketplace/service-providers/posix-id-pools/poolRanges';
import { checkIsOwnerOrStaff } from '@/workspace/selectors';

// Mirrors the backend's rule for a POSIX group name.
const GROUP_NAME_PATTERN = /^[a-z_][a-z0-9_-]{0,31}$/;

export const validateGroupName = (value?: string) =>
  value && !GROUP_NAME_PATTERN.test(value)
    ? translate(
        'Use 1–32 lowercase letters, digits, "_" and "-", starting with a letter or "_".',
      )
    : undefined;

/** A GID as typed: a whole number in the range POSIX allows for ids. */
export const validateGid = (value?: number | string | null) => {
  if (value == null || value === '') {
    return translate('Enter a GID.');
  }
  const gid = Number(value);
  if (!Number.isInteger(gid) || gid < POSIX_ID_MIN || gid > POSIX_ID_MAX) {
    return translate('Use a whole number from {min} to {max}.', {
      min: POSIX_ID_MIN,
      max: POSIX_ID_MAX,
    });
  }
};

/** Query keys the group dialogs refresh after a change. */
export const PROJECT_GROUP_QUERY_KEYS = [
  { queryKey: ['provider-project-group'] },
  { queryKey: ['project-posix-groups'] },
];

/** Adopting a group and changing a GID are for the provider's owners and staff. */
export const canManageProjectGroups = (user: User, customerUuid: string) =>
  checkIsOwnerOrStaff({ uuid: customerUuid }, user);

/**
 * The body of a 400 response, without the transport fields (status, url, …)
 * the fetch client puts next to it; anything else is not a validation error.
 */
export const getValidationErrors = (error: any): Record<string, any> | null => {
  if (error?.response?.status !== 400 && error?.status !== 400) {
    return null;
  }
  return getErrorBody(error) ?? {};
};

const FIELD_LABELS: Record<string, () => string> = {
  project: () => translate('Project'),
  gid: () => translate('GID'),
  name: () => translate('Group name'),
  allow_outside_range: () => translate('Outside the range'),
  service_provider: () => translate('Service provider'),
};

const fieldLabel = (key: string) => FIELD_LABELS[key]?.() ?? key;

const GENERAL_KEYS = ['non_field_errors', 'detail'];

/**
 * Final Form submission errors from a validation error: messages of the
 * dialog's own fields go under the field, everything else into the banner.
 */
export const toSubmissionErrors = (
  data: Record<string, any>,
  fields: string[],
): Record<string, any> => {
  const fieldErrors = Object.fromEntries(
    Object.entries(data)
      .filter(([key]) => fields.includes(key))
      .map(([key, value]) => [key, asMessages(value)]),
  );
  const rest = Object.fromEntries(
    Object.entries(data).filter(([key]) => !fields.includes(key)),
  );
  const general = formatValidationErrors(rest);
  return {
    ...fieldErrors,
    [FORM_ERROR]: general.length
      ? general.join(' ')
      : Object.keys(fieldErrors).length
        ? undefined
        : translate('The request was refused.'),
  };
};

// The API names its own request field; the dialogs offer it as an option.
const OUTSIDE_RANGE_HINT = /Set allow_outside_range to use it anyway\.?/;

/** An API message in the dialogs' terms. */
const inUiTerms = (message: string) =>
  message.replace(OUTSIDE_RANGE_HINT, () =>
    translate('Select “{option}” to use it anyway.', {
      option: translate('Allow a GID outside the project group range'),
    }),
  );

const asMessages = (value: any): string[] => {
  if (value == null) {
    return [];
  }
  if (typeof value === 'string') {
    return [inUiTerms(value)];
  }
  if (Array.isArray(value)) {
    return value.flatMap(asMessages);
  }
  if (typeof value === 'object') {
    return Object.entries(value).flatMap(([key, nested]) =>
      asMessages(nested).map((message) =>
        GENERAL_KEYS.includes(key) || !isNaN(Number(key))
          ? message
          : translate('{field}: {message}', {
              field: fieldLabel(key),
              message,
            }),
      ),
    );
  }
  return [String(value)];
};

/**
 * The messages of a validation error, one per line: a field's messages are
 * prefixed with its name, and an imported group's with its line number (the
 * backend keys them by position, as a list or as an object; `lines` maps a
 * position to the line it was pasted on).
 */
export const formatValidationErrors = (
  data: Record<string, any>,
  lines?: number[],
): string[] =>
  Object.entries(data).flatMap(([key, value]) => {
    if (key === 'groups' && value && typeof value === 'object') {
      const entries = Array.isArray(value)
        ? value.map((nested, index) => [index, nested] as const)
        : Object.entries(value).map(([index, nested]) => [index, nested]);
      if (entries.every(([index]) => !isNaN(Number(index)))) {
        return entries.flatMap(([index, nested]) => {
          const line = lines?.[Number(index)] ?? Number(index) + 1;
          const perField =
            nested && typeof nested === 'object' && !Array.isArray(nested)
              ? Object.entries(nested)
              : [['non_field_errors', nested]];
          return perField.flatMap(([field, messages]) =>
            asMessages(messages).map((message) =>
              GENERAL_KEYS.includes(field as string)
                ? translate('Line {line}: {message}', { line, message })
                : translate('Line {line}, {field}: {message}', {
                    line,
                    field: fieldLabel(field as string),
                    message,
                  }),
            ),
          );
        });
      }
    }
    return asMessages({ [key]: value });
  });

export interface ParsedGroupLine {
  project: string;
  gid: number;
  name?: string;
}

/**
 * Parses pasted "project,gid[,name]" lines. Blank lines, "#" comments and a
 * header line are skipped; whitespace and semicolons or tabs as separators are
 * accepted. Returns the groups, or the problems with their line numbers.
 */
export const parseGroupLines = (
  text: string,
): { groups: ParsedGroupLine[]; lines: number[]; errors: string[] } => {
  const groups: ParsedGroupLine[] = [];
  const lines: number[] = [];
  const errors: string[] = [];
  (text || '').split(/\r?\n/).forEach((raw, index) => {
    const line = raw.trim();
    if (!line || line.startsWith('#')) {
      return;
    }
    const [project, gid, name, ...rest] = line
      .split(/[,;\t]/)
      .map((part) => part.trim());
    if (groups.length === 0 && !errors.length && /^project$/i.test(project)) {
      return;
    }
    const lineNumber = index + 1;
    if (rest.length || !project || !gid) {
      errors.push(
        translate(
          'Line {line}: expected the project’s UUID or short name, the GID and an optional group name.',
          {
            line: lineNumber,
          },
        ),
      );
      return;
    }
    // A UUID or the project's slug; the backend resolves a slug only when one
    // adoptable project has it. Only a UUID's shape is read as a UUID: 32 hex
    // digits, or 8-4-4-4-12 with dashes. Anything else is a slug, which (as a
    // Django SlugField) is letters, digits, '_' and '-'.
    const isUuid =
      /^[0-9a-f]{32}$/i.test(project) ||
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
        project,
      );
    const projectRef = isUuid
      ? project.replace(/-/g, '').toLowerCase()
      : project;
    if (!isUuid && !/^[-a-zA-Z0-9_]+$/.test(project)) {
      errors.push(
        translate(
          'Line {line}: "{value}" is neither a project UUID nor a short name.',
          {
            line: lineNumber,
            value: project,
          },
        ),
      );
      return;
    }
    if (!/^\d+$/.test(gid)) {
      errors.push(
        translate('Line {line}: "{value}" is not a GID.', {
          line: lineNumber,
          value: gid,
        }),
      );
      return;
    }
    const nameError = validateGroupName(name);
    if (nameError) {
      errors.push(
        translate('Line {line}: {message}', {
          line: lineNumber,
          message: nameError,
        }),
      );
      return;
    }
    groups.push({
      project: projectRef,
      gid: Number(gid),
      ...(name ? { name } : {}),
    });
    lines.push(lineNumber);
  });
  return { groups, lines, errors };
};
