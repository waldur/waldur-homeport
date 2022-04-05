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
    <section className="mt-3 mb-3">
      <h3 className="division-title">{translate('Divisions')}</h3>
      {props.divisions.map((division: Division) => (
        <Field
          name={`division-${division.type}`}
          key={division.uuid}
          component={AwesomeCheckboxField}
          label={division.name}
        />
      ))}
    </section>
  );
