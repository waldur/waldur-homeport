import { FunctionComponent } from 'react';

import './LanguageSelectorMenuItem.scss';
import { LanguageSelectorBox } from './LanguageSelectorBox';

export const LanguageSelectorMenuItem: FunctionComponent = () => (
  <li className="navigation-menu-item">
    <i className="fa fa-language fixed-width-icon m-r-xs"></i>
    <LanguageSelectorBox />
  </li>
);
