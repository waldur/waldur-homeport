import * as React from 'react';

import {
  renderTestForm,
  getFieldGroups,
  getNameField,
  getDescriptionField,
  getRequiredFields,
  getErrors,
  submitForm,
} from './FormContainer.fixture';
import { errorOnSubmit } from './testUtils';

describe('FormContainer', () => {
  it('renders form group for each field', () => {
    const wrapper = renderTestForm({});
    expect(getFieldGroups(wrapper)).toHaveLength(2);
  });

  describe('disable fields on submit', () => {
    it('enables all input fields by default', () => {
      const wrapper = renderTestForm({});
      expect(getNameField(wrapper).prop('disabled')).toBe(undefined);
      expect(getDescriptionField(wrapper).prop('disabled')).toBe(undefined);
    });

    it('disables all input fields if form is submitting', () => {
      const wrapper = renderTestForm({submitting: true, required: false});
      expect(getNameField(wrapper).prop('disabled')).toBe(true);
      expect(getDescriptionField(wrapper).prop('disabled')).toBe(true);
    });
  });

  describe('required fields indication', () => {
    it('does not indicate required field by default', () => {
      const wrapper = renderTestForm({});
      expect(getRequiredFields(wrapper)).toHaveLength(0);
    });

    it('indicates required field', () => {
      const wrapper = renderTestForm({required: true});
      expect(getRequiredFields(wrapper)).toHaveLength(2);
    });
  });

  describe('error rendering', () => {
    it('does not render errors by default', () => {
      const wrapper = renderTestForm({});
      expect(getErrors(wrapper)).toHaveLength(0);
    });

    it('renders errors for each field individually', () => {
      const {onSubmit, promise} = errorOnSubmit({
        name: 'This field is required.',
        description: 'This field is too short.',
      });
      const wrapper = renderTestForm({onSubmit});
      submitForm(wrapper);
      promise.then(() => {
        expect(getErrors(wrapper)).toHaveLength(2);
      });
    });
  });
});
