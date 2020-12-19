import { FunctionComponent } from 'react';

import { translate } from '@waldur/i18n';
import { StepsList } from '@waldur/marketplace/common/StepsList';

export const ShoppingCartSteps: FunctionComponent = () => (
  <StepsList
    choices={[
      translate('Configure'),
      translate('Approve'),
      translate('Review'),
    ]}
    value={translate('Configure')}
  />
);
