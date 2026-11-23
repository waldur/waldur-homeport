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

type JsonObjectFieldProps = FieldRenderProps<any>;

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

const JsonObjectField: FC<JsonObjectFieldProps> = ({ input, meta }) => {
  const text = formatJsonObject(input.value);
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
export const JsonObjectEditField = withEditField(JsonObjectField, {
  displayValue: renderJsonObject,
});
