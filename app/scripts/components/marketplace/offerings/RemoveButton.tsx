import * as React from 'react';

import { withTranslation } from '@waldur/i18n';

export const RemoveButton = withTranslation(props => (
  <button
    type="button"
    className="close"
    aria-label={props.translate('Remove')}
    onClick={props.onClick}>
    <span aria-hidden="true">&times;</span>
  </button>
));
