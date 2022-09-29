import { FunctionComponent } from 'react';
import { Field } from 'redux-form';

import { AwesomeCheckboxField } from '@waldur/form/AwesomeCheckboxField';
import { translate } from '@waldur/i18n';
import { Division } from '@waldur/marketplace/types';

interface PureAttributeFilterDivisionProps {
  divisions: Division[];
}

export const AttributeFilterDivision: FunctionComponent<PureAttributeFilterDivisionProps> =
  (props) => (
    <section>
      <h3 className="text-gray-700 mb-6">{translate('Divisions')}</h3>
      {props.divisions.map((division: Division, i) => (
        <Field
          name={`list-divisions-${i}`}
          key={division.uuid}
          component={AwesomeCheckboxField}
          label={division.name}
          className="ms-2 mb-2"
          normalize={(v) => (v ? division.uuid : '')}
        />
      ))}
    </section>
  );
