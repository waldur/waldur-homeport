import { QuestionIcon } from '@phosphor-icons/react';
import { FunctionComponent } from 'react';

import { Tooltip } from 'waldur-ui';

import FormTable from '@/form/FormTable';
import { translate } from '@/i18n';

import { Field } from './Field';
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
      <Tooltip label={props.resource.error_traceback}>
        <QuestionIcon size={17} weight="bold" />
      </Tooltip>{' '}
      {props.resource.error_message}
    </>
  );
};

export const ErrorMessageField: FunctionComponent<
  ResourceSummaryProps & { formTableItem?: boolean }
> = (props) => {
  const Component = props.formTableItem ? FormTable.Item : Field;
  return (
    <Component
      label={translate('Error message')}
      value={formatErrorField(props)}
    />
  );
};
