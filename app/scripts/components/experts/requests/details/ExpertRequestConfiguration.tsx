import * as React from 'react';

import { defaultCurrency } from '@waldur/core/services';
import { Field } from '@waldur/resource/summary';

import { ExpertRequest } from '../types';
import { RequestConfiguration } from './types';

export interface ExpertRequestConfigurationProps {
  config: RequestConfiguration;
  model: ExpertRequest;
}

const formatField = (type: string, value: any) => {
  switch (type) {
    case 'money':
    return defaultCurrency(value);

    case 'html_text':
    return value ? <div dangerouslySetInnerHTML={{__html: value}}/> : 'N/A';

    default:
    return value || 'N/A';
  }
};

export const ExpertRequestConfiguration = (props: ExpertRequestConfigurationProps) => (
  <div>
    {props.config.order.map(field => (
      <Field
        key={field}
        label={props.config.options[field].label}
        value={formatField(props.config.options[field].type, props.model[field])}
      />
    ))}
  </div>
);
