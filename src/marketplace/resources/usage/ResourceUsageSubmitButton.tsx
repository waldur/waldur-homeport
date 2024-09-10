import React from 'react';

import { SubmitButton } from '@waldur/form';
import { translate } from '@waldur/i18n';
import { CloseDialogButton } from '@waldur/modal/CloseDialogButton';

import { ResourceUsageFormProps } from './ResourceUsageForm';
import { enhance } from './ResourceUsageFormContainer';
import { UsageReportContext } from './types';

export const ResourceUsageSubmitButton = enhance(
  (props: ResourceUsageFormProps) => (
    <form
      onSubmit={props.handleSubmit(props.submitReport)}
      className="d-flex flex-grow-1 gap-2"
    >
      <CloseDialogButton className="flex-equal" />
      <SubmitButton
        disabled={props.invalid}
        submitting={props.submitting}
        label={translate('Submit usage report')}
        className="btn btn-primary flex-equal"
      />
    </form>
  ),
) as React.ComponentType<{ params: UsageReportContext }>;
