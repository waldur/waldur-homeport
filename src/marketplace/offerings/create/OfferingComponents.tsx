import * as React from 'react';
import { WrappedFieldArrayProps } from 'redux-form';

import { withTranslation, TranslateProps } from '@waldur/i18n';

import { RemoveButton } from '../RemoveButton';
import { ComponentAddButton } from './ComponentAddButton';
import { ComponentForm } from './ComponentForm';

type Props = TranslateProps & WrappedFieldArrayProps<any>;

export const OfferingComponents = withTranslation((props: Props) => (
  <div className="form-group">
    <div className="col-sm-offset-3 col-sm-9">
      {props.fields.map((component, index) => (
        <div key={index} className="panel panel-default">
          <div className="panel-heading">
            <RemoveButton onClick={() => props.fields.remove(index)}/>
            <h4>{props.translate('Component #{index}', {index: index + 1})}</h4>
          </div>
          <div className="panel-body">
            <ComponentForm component={component}/>
          </div>
        </div>
      ))}
      <ComponentAddButton onClick={() => props.fields.push({})}/>
    </div>
  </div>
));
