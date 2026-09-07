import React from 'react';

import { FormFooter } from '@/form/FormFooter';
import { translate } from '@/i18n';

import { UsageReportContext } from './types';

interface ResourceUsageSubmitButtonProps {
  params: UsageReportContext;
}

export const ResourceUsageSubmitButton: React.FC<
  ResourceUsageSubmitButtonProps
> = ({ params }) => (
  <FormFooter
    submitLabel={
      params.userUsage ? translate('Submit') : translate('Submit usage report')
    }
  />
);
