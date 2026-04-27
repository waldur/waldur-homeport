import { FC, useCallback } from 'react';

import { ProgressStep } from '@/core/ProgressSteps';
import { translate } from '@/i18n';
import { Wizard } from '@/wizard';

import type { ArrowSetupFormValues } from '../types';

import { Step1Credentials } from './Step1Credentials';
import { Step2CustomerDiscovery } from './Step2CustomerDiscovery';
import { Step3Preview } from './Step3Preview';

const steps: ProgressStep[] = [
  { key: 'credentials', label: translate('Credentials'), completed: false },
  { key: 'customers', label: translate('Customer Mapping'), completed: false },
  { key: 'preview', label: translate('Preview & Save'), completed: false },
];

const wizardForms = [Step1Credentials, Step2CustomerDiscovery, Step3Preview];

const initialValues: Partial<ArrowSetupFormValues> = {
  api_url: 'https://xsp.arrow.com/index.php/api/',
  api_key: '',
  credentialsValid: false,
  partnerInfo: null,
  discoveryComplete: false,
  customers: [],
  waldurCustomers: [],
  suggestions: [],
  exportTypes: [],
  selectedMappings: {},
};

export const ArrowSetupDialog: FC = () => {
  // Final submission is handled by Step3Preview's save button
  const handleSubmit = useCallback(() => Promise.resolve(), []);

  // Each step provides its own footer
  const renderFooter = useCallback(() => null, []);

  return (
    <Wizard<ArrowSetupFormValues>
      title={translate('Arrow Integration Setup')}
      steps={steps}
      wizardForms={wizardForms}
      onSubmit={handleSubmit}
      initialValues={initialValues}
      renderFooter={renderFooter}
      modalProps={{ bodyClassName: 'p-0' }}
    />
  );
};
