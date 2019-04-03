import * as React from 'react';

import { SubmitButton } from '@waldur/form-react';
import { translate } from '@waldur/i18n';
import { CloseDialogButton } from '@waldur/modal/CloseDialogButton';

import { ResourceUsageFormProps } from './ResourceUsageForm';
import { enhance } from './ResourceUsageFormContainer';
import { UsageReportContext } from './types';

export const ResourceUsageSubmitButton = enhance((props: ResourceUsageFormProps) => (
  <form onSubmit={props.handleSubmit(props.submitReport)}>
    <CloseDialogButton/>
    <SubmitButton
      submitting={props.submitting}
      label={translate('Submit usage report')}
    />
  </form>
)) as React.ComponentType<{params: UsageReportContext}>;
