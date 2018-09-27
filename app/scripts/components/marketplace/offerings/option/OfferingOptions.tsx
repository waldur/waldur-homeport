import * as React from 'react';

import { withTranslation } from '@waldur/i18n';

import { RemoveButton } from '../RemoveButton';
import { AddOptionButton } from './AddOptionButton';
import { OptionForm } from './OptionForm';

export const OfferingOptions = withTranslation(props => (
  <div className="form-group">
    <div className="col-sm-offset-3 col-sm-9">
      {props.fields.map((option, index) => (
        <div key={index} className="panel panel-default">
          <div className="panel-heading">
            <RemoveButton onClick={() => props.fields.remove(index)}/>
            <h4>{props.translate('Option #{index}', {index: index + 1})}</h4>
          </div>
          <div className="panel-body">
            <OptionForm option={option}/>
          </div>
        </div>
      ))}
      <AddOptionButton onClick={() => props.fields.push({})}/>
    </div>
  </div>
));
