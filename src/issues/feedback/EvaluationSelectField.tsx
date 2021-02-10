import Select from 'react-select';
import { Field } from 'redux-form';

import { translate } from '@waldur/i18n';
import { feedbackOptions } from '@waldur/issues/feedback/utils';

const getOptions = () =>
  feedbackOptions().map(({ label }) => ({
    label,
    value: label,
  }));

export const EvaluationSelectField = () => (
  <Field
    name="evaluation"
    component={(prop) => (
      <Select
        placeholder={translate('Select evaluation...')}
        value={prop.input.value}
        onChange={prop.input.onChange}
        onBlur={(e) => e.preventDefault()}
        options={getOptions()}
        isClearable={true}
      />
    )}
  />
);
