import { FORM_ERROR } from 'final-form';
import { describe, expect, it } from 'vitest';

import {
  documentParameters,
  flattenDocumentErrors,
  readParameter,
  toSubmitErrors,
} from './templateDocument';

const validationError = (body: unknown) => ({
  data: body,
  status: 400,
  response: { status: 400 },
});

describe('flattenDocumentErrors', () => {
  it('keeps dotted paths and finds the parameter they point into', () => {
    expect(
      flattenDocumentErrors({
        'parameters.1.paths': ['Not a path.'],
        agent_configuration: ['Unknown backend.'],
      }),
    ).toEqual([
      { path: 'parameters.1.paths', message: 'Not a path.', parameterIndex: 1 },
      { path: 'agent_configuration', message: 'Unknown backend.' },
    ]);
  });

  it('joins nested errors into one path', () => {
    expect(
      flattenDocumentErrors({
        parameters: [{}, { paths: ['Not a path.'] }],
      }),
    ).toEqual([
      { path: 'parameters.1.paths', message: 'Not a path.', parameterIndex: 1 },
    ]);
  });

  it('keeps a message about the whole document without a path', () => {
    expect(flattenDocumentErrors(['Not valid YAML.'])).toEqual([
      { path: '', message: 'Not valid YAML.' },
    ]);
  });
});

describe('documentParameters', () => {
  it('keeps every item at its position, mappings or not', () => {
    expect(documentParameters('parameters: [oops, {key: a}, 3, [x]]')).toEqual([
      'oops',
      { key: 'a' },
      3,
      ['x'],
    ]);
  });

  it('finds none in a document that does not parse or has no list', () => {
    expect(documentParameters('parameters: [')).toEqual([]);
    expect(documentParameters('parameters: {key: a}')).toEqual([]);
  });
});

describe('readParameter', () => {
  it('fills in the defaults the API applies', () => {
    expect(
      readParameter({ key: 'a', label: 'A', paths: ['offering.x'] }),
    ).toEqual({
      invalid: false,
      key: 'a',
      label: 'A',
      type: 'string',
      required: true,
      default: undefined,
      paths: ['offering.x'],
    });
  });

  it('reads any value as text and keeps only text paths', () => {
    expect(
      readParameter({
        key: { nested: 'key' },
        label: 4,
        type: ['string'],
        required: 'maybe',
        default: false,
        paths: ['offering.x', 7, { path: 'y' }, null, ''],
      }),
    ).toEqual({
      invalid: false,
      key: '{"nested":"key"}',
      label: '4',
      type: '["string"]',
      required: 'maybe',
      default: 'false',
      paths: ['offering.x'],
    });
  });

  it('takes a single path given as text as that path', () => {
    expect(readParameter({ paths: 'offering.backend_id' }).paths).toEqual([
      'offering.backend_id',
    ]);
    expect(readParameter({ paths: { a: 1 } }).paths).toEqual([]);
  });

  it('marks an item that is not a mapping as invalid', () => {
    for (const item of ['oops', 3, null, ['a']]) {
      expect(readParameter(item)).toMatchObject({ invalid: true, paths: [] });
    }
  });
});

describe('toSubmitErrors', () => {
  it('shows the path of an error outside the form fields', () => {
    expect(
      toSubmitErrors(
        validationError({
          document: {
            agent_configuration: {
              backend_settings: { foo: ['This setting is required.'] },
            },
          },
          non_field_errors: ['The offering is archived.'],
        }),
        ['name', 'description'],
      ),
    ).toEqual({
      [FORM_ERROR]:
        'document.agent_configuration.backend_settings.foo: This setting is required. The offering is archived.',
    });
  });

  it('names the parameter a document error falls in, by its position', () => {
    const result = toSubmitErrors(
      validationError({ document: { 'parameters.1.key': ['Taken.'] } }),
      ['document'],
      'parameters: [oops, {key: a}]',
    );
    expect(result.document).toEqual(['parameters.1.key (parameter a): Taken.']);
  });
});
