import { FC, ReactNode } from 'react';
import { FieldRenderProps } from 'react-final-form';

import { FieldError } from '@/form/FieldError';
import { MonacoEditor } from '@/form/MonacoEditor';
import { withEditField } from '@/form/withEditField';
import { translate } from '@/i18n';

import { validateJsonObject } from './agentConfiguration';

/** The text a JSON object is edited as. */
const formatJsonObject = (value: unknown): string =>
  typeof value === 'string' ? value : JSON.stringify(value ?? {}, null, 2);

/** A JSON editor's validator: the text must be a JSON object. */
export const jsonObjectValidator = (value: unknown): string | undefined => {
  const problem = validateJsonObject(value);
  if (problem === 'syntax') {
    return translate('Not valid JSON.');
  }
  if (problem === 'object') {
    return translate('Enter a JSON object, such as {"key": "value"}.');
  }
  return undefined;
};

/** A JSON value editor's validator: the text must be JSON of any kind. */
export const jsonValueValidator = (value: unknown): string | undefined => {
  if (typeof value !== 'string' || !value.trim()) {
    return undefined;
  }
  try {
    JSON.parse(value);
  } catch {
    return translate('Not valid JSON.');
  }
  return undefined;
};

/** The text any JSON value is edited as; an unset one as an empty editor. */
const formatJsonValue = (value: unknown): string =>
  typeof value === 'string'
    ? value
    : value === undefined || value === null
      ? ''
      : JSON.stringify(value, null, 2);

type JsonObjectFieldProps = FieldRenderProps<any> & {
  formatText?: (value: unknown) => string;
};

// Monaco's line height at its 14px font, and room for its padding.
const LINE_HEIGHT = 19;
const MIN_HEIGHT = 120;
const MAX_HEIGHT = 560;

// Tall enough for the text, so its first lines do not scroll out of view,
// within bounds; a longer text scrolls inside the editor.
const editorHeight = (text: string) =>
  Math.min(
    MAX_HEIGHT,
    Math.max(MIN_HEIGHT, (text.split('\n').length + 2) * LINE_HEIGHT),
  );

const JsonTextField: FC<JsonObjectFieldProps> = ({
  input,
  meta,
  formatText = formatJsonObject,
}) => {
  const text = formatText(input.value);
  return (
    <>
      <div className="border border-secondary rounded-lg overflow-hidden">
        <MonacoEditor
          language="json"
          value={text}
          onChange={input.onChange}
          height={editorHeight(text)}
        />
      </div>
      {meta.error && meta.modified && <FieldError error={meta.error} />}
    </>
  );
};

const renderJsonObject = (value: unknown): ReactNode =>
  value && typeof value === 'object' && Object.keys(value).length ? (
    <pre className="max-h-60 overflow-auto whitespace-pre-wrap font-mono text-xs mb-0">
      {formatJsonObject(value)}
    </pre>
  ) : undefined;

/** An edit field holding a JSON object, edited as text in Monaco. */
export const JsonObjectEditField = withEditField(JsonTextField, {
  displayValue: renderJsonObject,
});

const JsonValueField: FC<FieldRenderProps<any>> = (props) => (
  <JsonTextField {...props} formatText={formatJsonValue} />
);

/**
 * An edit field holding any JSON value (a list, a nested object), edited as
 * text in Monaco. Pass `jsonValueValidator` as its `validate`.
 */
export const JsonValueEditField = withEditField(JsonValueField);
