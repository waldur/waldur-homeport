import { FORM_ERROR } from 'final-form';
import { describe, expect, it } from 'vitest';

import { fieldErrors } from './errors';

const refused = (data: unknown) => ({ status: 400, data });

describe('fieldErrors', () => {
  it('puts the errors of known fields on them', () => {
    expect(
      fieldErrors(
        refused({
          subject: ["Template error: Invalid block tag 'load'."],
          body_html: ['Loops may be nested 2 deep at most.'],
        }),
        ['subject', 'body_text', 'body_html'],
      ),
    ).toEqual({
      subject: "Template error: Invalid block tag 'load'.",
      body_html: 'Loops may be nested 2 deep at most.',
    });
  });

  it('gives the rest as the form error', () => {
    const errors = fieldErrors(
      refused({
        recipient: ['The applicant is never mailed about an internal step.'],
        non_field_errors: ['Two rules address the same people.'],
      }),
      ['recipient'],
    );
    expect(errors.recipient).toBe(
      'The applicant is never mailed about an internal step.',
    );
    expect(errors[FORM_ERROR]).toBe('Two rules address the same people.');
  });
});
