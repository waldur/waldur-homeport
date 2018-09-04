import * as React from 'react';

import { withTranslation } from '@waldur/i18n';

export const PlanRemoveButton = withTranslation(props => (
  <button
    type="button"
    className="close"
    aria-label={props.translate('Remove plan')}
    onClick={props.onClick}>
    <span aria-hidden="true">&times;</span>
  </button>
));
