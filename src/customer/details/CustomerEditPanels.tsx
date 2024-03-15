import { FunctionComponent } from 'react';

import { isExperimentalUiComponentsVisible } from '@waldur/marketplace/utils';

import { CustomerAccessControlPanel } from './CustomerAccessControlPanel';
import { CustomerBillingPanel } from './CustomerBillingPanel';
import { CustomerContactPanel } from './CustomerContactPanel';
import { CustomerDetailsPanel } from './CustomerDetailsPanel';
import { CustomerMediaPanel } from './CustomerMediaPanel';
import { CustomerEditPanelProps } from './types';

export const CustomerEditPanels: FunctionComponent<CustomerEditPanelProps> = (
  props,
) => {
  const showExperimentalUiComponents = isExperimentalUiComponentsVisible();

  return (
    <>
      <CustomerDetailsPanel {...props} />
      <CustomerContactPanel {...props} />
      {showExperimentalUiComponents && <CustomerAccessControlPanel />}
      <CustomerBillingPanel {...props} />
      <CustomerMediaPanel {...props} />
    </>
  );
};
