import * as React from 'react';

import { connectAngularComponent } from '@waldur/store/connect';

import { useLanguageSelector } from './useLanguageSelector';
import './LanguageSelectorMenuItem.scss';

export const LanguageSelectorMenuItem = () => {
  const {
    currentLanguage,
    languageChoices,
    setLanguage,
  } = useLanguageSelector();

  const handleChange = event => {
    setLanguage(
      languageChoices.find(language => language.code === event.target.value),
    );
  };

  return (
    <li className="navigation-menu-item">
      <i className="fa fa-language fixed-width-icon m-r-xs"></i>
      <select onChange={handleChange} value={currentLanguage.code}>
        {languageChoices.map((option, index) => (
          <option value={option.code} key={index}>
            {option.label}
          </option>
        ))}
      </select>
    </li>
  );
};

export default connectAngularComponent(LanguageSelectorMenuItem);
