import { FORM_ERROR } from 'final-form';
import { load } from 'js-yaml';

import { format, getErrorBody } from '@/core/ErrorMessageFormatter';
import { translate } from '@/i18n';

type DocumentRecord = Record<string, unknown>;

const isRecord = (value: unknown): value is DocumentRecord =>
  Boolean(value) && typeof value === 'object' && !Array.isArray(value);

/** Every item of a list section, mappings or not, each at the position the
 * API's errors name it by (parameters.N). */
const documentItems = (document: unknown, section: string): unknown[] => {
  if (!isRecord(document)) return [];
  const value = document[section];
  return Array.isArray(value) ? value : [];
};

/** A list section of a template document (components, plans),
 * keeping only its entries that are objects. */
export const documentList = (
  document: unknown,
  section: string,
): DocumentRecord[] => documentItems(document, section).filter(isRecord);

/** The text the document editor starts with when editing a template. */
export const documentToText = (document: unknown): string =>
  document && typeof document === 'object' && Object.keys(document).length
    ? JSON.stringify(document, null, 2)
    : '';

type ParsedDocument =
  | { document: DocumentRecord; error?: undefined }
  | { document?: undefined; error: string };

/**
 * Reads the editor's text as the API will: JSON is YAML, so one YAML parser
 * takes both. The text itself is what gets sent; this is only for checking it
 * and for showing the parameters it declares.
 */
const parseDocumentText = (text: string): ParsedDocument => {
  try {
    const document = load(text);
    if (!document || typeof document !== 'object' || Array.isArray(document)) {
      return {
        error: translate(
          'The document must be a mapping of sections, such as offering, components and plans.',
        ),
      };
    }
    return { document: document as DocumentRecord };
  } catch (error) {
    const reason =
      (error as { reason?: string; message?: string })?.reason ??
      (error as Error)?.message;
    return {
      error: translate('The document is not valid JSON or YAML: {reason}', {
        reason,
      }),
    };
  }
};

export const validateDocumentText = (text?: string) => {
  if (!text?.trim()) {
    return translate('This field is required.');
  }
  return parseDocumentText(text).error;
};

/**
 * The items under parameters in the document text, read as well as it
 * parses. They are what was typed, not yet checked: read each one with
 * readParameter before showing it.
 */
export const documentParameters = (text: string): unknown[] => {
  const parsed = parseDocumentText(text);
  return parsed.document ? documentItems(parsed.document, 'parameters') : [];
};

/** A parameter as the parameters table shows it. */
export interface ParameterView {
  /** The item is not a mapping, so it declares nothing; the API refuses it. */
  invalid: boolean;
  key?: string;
  label?: string;
  /** The type as written; the API's default, string, when left out. */
  type: string;
  /** A boolean as written, true (the API's default) when left out, and any
   * other value as its text: the API refuses it. */
  required: boolean | string;
  default?: string;
  paths: string[];
}

/** A value of a typed document as text, whatever it holds: a scalar as
 * itself, a mapping or list as JSON. Empty when there is nothing to show. */
const asText = (value: unknown): string | undefined => {
  if (value === null || value === undefined || value === '') return undefined;
  if (typeof value !== 'object') return String(value);
  try {
    return JSON.stringify(value);
  } catch {
    return String(value);
  }
};

/**
 * Reads one parameter item of a document being typed, without trusting its
 * shape: every field may hold anything, and the item may not be a mapping at
 * all. A path given as one string is that one path; other entries that are
 * not text are left out. Missing fields take the API's defaults.
 */
export const readParameter = (item: unknown): ParameterView => {
  if (!isRecord(item)) {
    return { invalid: true, type: 'string', required: true, paths: [] };
  }
  const { key, label, type, required, paths } = item;
  return {
    invalid: false,
    key: asText(key),
    label: asText(label),
    type: type === undefined ? 'string' : (asText(type) ?? String(type)),
    required:
      required === undefined
        ? true
        : typeof required === 'boolean'
          ? required
          : (asText(required) ?? String(required)),
    default: asText(item.default),
    paths:
      typeof paths === 'string'
        ? paths
          ? [paths]
          : []
        : Array.isArray(paths)
          ? paths.filter(
              (path): path is string => typeof path === 'string' && path !== '',
            )
          : [],
  };
};

export interface DocumentError {
  /** Dotted path into the document, such as parameters.1.paths. */
  path: string;
  message: string;
  /** Set when the path falls inside one of the declared parameters. */
  parameterIndex?: number;
}

const PARAMETER_PATH = /^parameters\.(\d+)(?:\.|$)/;

const joinPath = (path: string, key: string) => (path ? `${path}.${key}` : key);

/**
 * Turns the API's document errors into one entry per message. The API keys
 * them by a dotted path ({"parameters.1.paths": [...]}) or by section; a
 * nested shape ({"parameters": {"1": {"paths": [...]}}}) reads the same.
 */
export const flattenDocumentErrors = (
  value: unknown,
  path = '',
): DocumentError[] => {
  if (value === null || value === undefined || value === '') return [];
  if (typeof value !== 'object') {
    const match = PARAMETER_PATH.exec(path);
    return [
      {
        path,
        message: String(value),
        ...(match ? { parameterIndex: Number(match[1]) } : {}),
      },
    ];
  }
  if (Array.isArray(value)) {
    // A list of messages belongs to the path itself; a list of objects is a
    // list field's errors, one per item.
    return value.every((item) => typeof item !== 'object' || item === null)
      ? value.flatMap((item) => flattenDocumentErrors(item, path))
      : value.flatMap((item, index) =>
          flattenDocumentErrors(item, joinPath(path, String(index))),
        );
  }
  return Object.entries(value).flatMap(([key, item]) =>
    flattenDocumentErrors(item, joinPath(path, key)),
  );
};

const formatDocumentError = (
  error: DocumentError,
  parameters: unknown[] = [],
): string => {
  const parameterKey =
    error.parameterIndex !== undefined &&
    error.parameterIndex < parameters.length
      ? readParameter(parameters[error.parameterIndex]).key
      : undefined;
  const where = parameterKey
    ? translate('{path} (parameter {key})', {
        path: error.path,
        key: parameterKey,
      })
    : error.path;
  return where ? `${where}: ${error.message}` : error.message;
};

/** Where the structured document errors of the last submit are kept, beside
 * the messages the document field shows. */
export const DOCUMENT_ERRORS = 'documentErrors';

/** Keys of a refusal that are about the request as a whole, not a path. */
const GENERAL_ERROR_KEYS = ['non_field_errors', 'detail'];

/**
 * A rejected save as react-final-form submit errors: each field's message on
 * that field, the document's errors listed under the document editor, and
 * anything else above the form, each message after the path it is about
 * (document.agent_configuration.backend_settings.foo: ...).
 */
export const toSubmitErrors = (
  error: unknown,
  fields: string[],
  documentText?: string,
): Record<string, unknown> => {
  const status =
    (error as { response?: { status?: number }; status?: number })?.response
      ?.status ?? (error as { status?: number })?.status;
  if (status !== 400) {
    return { [FORM_ERROR]: format(error) };
  }
  const body = getErrorBody(error) ?? {};
  const result: Record<string, unknown> = {};
  const rest: string[] = [];
  if (Array.isArray(body)) {
    rest.push(...flattenDocumentErrors(body).map((item) => item.message));
  }
  for (const [key, value] of Array.isArray(body) ? [] : Object.entries(body)) {
    if (key === 'document' && fields.includes('document')) {
      const errors = flattenDocumentErrors(value);
      const parameters = documentText ? documentParameters(documentText) : [];
      result.document = errors.map((item) =>
        formatDocumentError(item, parameters),
      );
      result[DOCUMENT_ERRORS] = errors;
    } else if (fields.includes(key)) {
      result[key] = value;
    } else {
      const path = GENERAL_ERROR_KEYS.includes(key) ? '' : key;
      rest.push(
        ...flattenDocumentErrors(value, path).map((item) =>
          formatDocumentError(item),
        ),
      );
    }
  }
  if (rest.length) {
    result[FORM_ERROR] = rest.join(' ');
  }
  return result;
};
