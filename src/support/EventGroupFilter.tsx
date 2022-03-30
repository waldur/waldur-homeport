import { FunctionComponent } from 'react';
import { Form } from 'react-bootstrap';
import Select from 'react-select';
import { useAsync } from 'react-use';
import { Field } from 'redux-form';

import { get } from '@waldur/core/api';
import { translate } from '@waldur/i18n';

const getEventGroupOptions = async () => {
  const res = await get('/events/event_groups/');
  const options: string[] = [];
  for (const key in res.data) {
    options.push(key);
  }
  return options.map((option: string) => ({
    label: translate(option),
    value: option,
  }));
};

export const EventGroupFilter: FunctionComponent = () => {
  const { error, value: options } = useAsync(getEventGroupOptions);
  return error ? (
    <>{translate('Unable to load event groups.')}</>
  ) : (
    <>
      <Form.Label>{translate('Event group')}</Form.Label>
      <Field
        name="feature"
        component={(props) => (
          <Select
            placeholder={translate('Select event groups...')}
            value={props.input.value}
            onChange={(value) => props.input.onChange(value)}
            options={options || []}
            isClearable={true}
            isMulti={true}
          />
        )}
      />
    </>
  );
};
