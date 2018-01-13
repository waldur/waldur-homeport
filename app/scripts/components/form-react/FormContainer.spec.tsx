import {
  renderTestForm,
  getFieldGroups,
  getNameField,
  getDescriptionField,
  getRequiredFields,
  getErrors,
  getDescriptions,
  submitForm,
  renderOptionalFieldForm,
} from './FormContainer.fixture';
import {
  errorOnSubmit,
  setFieldValue,
  getTestFormValues,
} from './testUtils';

describe('FormContainer', () => {
  it('renders form group for each field', () => {
    const wrapper = renderTestForm({});
    expect(getFieldGroups(wrapper).length).toBe(2);
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
      expect(getRequiredFields(wrapper).length).toBe(0);
    });

    it('indicates required field', () => {
      const wrapper = renderTestForm({required: true});
      expect(getRequiredFields(wrapper).length).toBe(2);
    });
  });

  describe('error rendering', () => {
    it('does not render errors by default', () => {
      const wrapper = renderTestForm({});
      expect(getErrors(wrapper).length).toBe(0);
    });

    it('renders errors for each field individually', () => {
      const {onSubmit, promise} = errorOnSubmit({
        name: 'This field is required.',
        description: 'This field is too short.',
      });
      const wrapper = renderTestForm({onSubmit});
      submitForm(wrapper);
      return promise.then(() => {
        expect(getErrors(wrapper).length).toBe(2);
      });
    });
  });

  it('resets value of field when it is unmounted', () => {
    const wrapper = renderOptionalFieldForm();
    setFieldValue(wrapper, 'type', 'subtask');
    setFieldValue(wrapper, 'parent', 'New value');
    expect(getTestFormValues(wrapper)).toEqual({
      type: 'subtask',
      parent: 'New value',
    });

    setFieldValue(wrapper, 'type', 'task');
    expect(getTestFormValues(wrapper)).toEqual({type: 'task'});
  });

  it('renders field description if provided', () => {
    const description = 'This name will be visible in accounting data.';
    const wrapper = renderTestForm({description});
    const actual = getDescriptions(wrapper).first();
    expect(actual.text()).toBe(description);
  });

  it('renders label class for each form group if provided', () => {
    const wrapper = renderTestForm({labelClass: 'col-sm-3'});
    expect(wrapper.find('label.col-sm-3').length).toBe(2);
  });

  it('renders control class for each form group if provided', () => {
    const wrapper = renderTestForm({controlClass: 'col-sm-5'});
    expect(wrapper.find('div.col-sm-5').length).toBe(2);
  });
});
