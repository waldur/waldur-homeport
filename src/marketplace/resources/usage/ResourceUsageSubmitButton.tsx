import React from 'react';
import { useFormState } from 'react-final-form';

import { SubmitButton } from '@/form';
import { translate } from '@/i18n';
import { CloseDialogButton } from '@/modal/CloseDialogButton';

import { UsageReportContext } from './types';

interface ResourceUsageSubmitButtonProps {
  params: UsageReportContext;
}

export const ResourceUsageSubmitButton: React.FC<
  ResourceUsageSubmitButtonProps
> = ({ params }) => {
  const { submitting, invalid } = useFormState();

  return (
    <div className="d-flex flex-grow-1 gap-2">
      <CloseDialogButton className="flex-equal" />
      <SubmitButton
        disabled={invalid}
        submitting={submitting}
        label={
          params.userUsage
            ? translate('Submit')
            : translate('Submit usage report')
        }
        className="btn btn-primary flex-equal"
      />
    </div>
  );
};
