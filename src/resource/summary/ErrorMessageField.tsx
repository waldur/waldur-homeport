import { FunctionComponent } from 'react';

import { HelpIcon, PropertyItem } from 'waldur-ui';

import { translate } from '@/i18n';

import { ResourceSummaryProps } from './types';

const formatErrorField = (props: ResourceSummaryProps) => {
  if (
    props.resource.state !== 'ERRED' &&
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
      <HelpIcon label={props.resource.error_traceback} size={17} />{' '}
      {props.resource.error_message}
    </>
  );
};

export const ErrorMessageField: FunctionComponent<ResourceSummaryProps> = (
  props,
) => {
  return (
    <PropertyItem
      label={translate('Error message')}
      value={formatErrorField(props)}
    />
  );
};
