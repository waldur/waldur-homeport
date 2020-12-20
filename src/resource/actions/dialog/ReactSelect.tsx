import { FC, useEffect, useState } from 'react';
import Select from 'react-select';

import { ngInjector } from '@waldur/core/services';
import { reactSelectMenuPortaling } from '@waldur/form/utils';

type Choice = { value: string; display_name: string };

interface ReactSelectProps {
  field: {
    name: string;
    placeholder: string;
    choices: Choice[];
  };
  model: Record<string, any>;
  form: angular.IFormController;
}

export const ReactSelect: FC<ReactSelectProps> = (props) => {
  const [value, setValue] = useState<any[]>(props.model[props.field.name]);
  const $timeout = ngInjector.get('$timeout');
  useEffect(() => {
    if (value !== props.model[props.field.name]) {
      $timeout(() => {
        props.model[props.field.name] = value;
        props.form.$setDirty();
      });
    }
  }, [value]);
  return (
    <Select
      isMulti={true}
      value={value}
      onChange={setValue}
      placeholder={props.field.placeholder}
      getOptionValue={(option: Choice) => option.value}
      getOptionLabel={(option: Choice) => option.display_name}
      options={props.field.choices}
      {...reactSelectMenuPortaling()}
    />
  );
};
