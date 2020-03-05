import * as React from 'react';

import { withTranslation, TranslateProps } from '@waldur/i18n';

interface RemoveButtonProps extends TranslateProps {
  onClick(): void;
}

export const RemoveButton = withTranslation((props: RemoveButtonProps) => (
  <button
    type="button"
    className="close"
    aria-label={props.translate('Remove')}
    onClick={props.onClick}
  >
    <span aria-hidden="true">&times;</span>
  </button>
));
