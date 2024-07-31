import { Question } from '@phosphor-icons/react';
import { FunctionComponent } from 'react';

import { Tip } from '@waldur/core/Tooltip';
import { translate } from '@waldur/i18n';

import { Field } from './Field';
import { ResourceSummaryProps } from './types';

const formatErrorField = (props: ResourceSummaryProps) => {
  if (
    props.resource.state !== 'Erred' &&
    props.resource.runtime_state !== 'ERROR'
  ) {
    return null;
  }
  if (!props.resource.error_message) {
    return translate('Reason unknown, please contact support.');
  }
  if (!props.resource.error_traceback) {
    return props.resource.error_message;
  }
  return (
    <>
      <Tip id="error-traceback" label={props.resource.error_traceback}>
        <Question size={17} />
      </Tip>{' '}
      {props.resource.error_message}
    </>
  );
};

export const ErrorMessageField: FunctionComponent<ResourceSummaryProps> = (
  props,
) => (
  <Field label={translate('Error message')} value={formatErrorField(props)} />
);
