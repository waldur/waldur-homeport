import { describe, expect, it } from 'vitest';

import { createRunValidationBody } from './utils';

const dnbNorwayConfig = {
  validation_method: 'dnb_no',
  person_identifier_fields: {
    type: 'object',
    fields: {
      first_name: { type: 'string', label: 'First Name', required: true },
      last_name: { type: 'string', label: 'Last Name', required: true },
      birth_date: { type: 'date', label: 'Date of Birth', required: true },
    },
  },
};

describe('createRunValidationBody', () => {
  it('sends the profile name with the typed birth date for D&B', () => {
    const body = createRunValidationBody(
      {
        validationMethod: 'dnb_no',
        personIdentifierFieldConfig: dnbNorwayConfig,
        person_identifier_birth_date: '1980-05-17',
      },
      { first_name: 'Ola', last_name: 'Nordmann', birth_date: null },
    );
    expect(body).toEqual({
      first_name: 'Ola',
      last_name: 'Nordmann',
      birth_date: '1980-05-17',
    });
  });

  it('sends only the typed fields for other methods', () => {
    const body = createRunValidationBody(
      {
        validationMethod: 'ariregister',
        person_identifier_civil_number: '39901010101',
      },
      { first_name: 'Mari' },
    );
    expect(body).toEqual({ civil_number: '39901010101' });
  });
});
