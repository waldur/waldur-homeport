import * as React from 'react';

import { withTranslation, TranslateProps } from '@waldur/i18n';

interface AddOptionButtonProps extends TranslateProps {
  onClick(): void;
}

export const AddOptionButton = withTranslation((props: AddOptionButtonProps) => (
  <button
    type="button"
    className="btn btn-default"
    onClick={props.onClick}>
    <i className="fa fa-plus"/>
    {' '}
    {props.translate('Add user input field')}
  </button>
));
