import * as React from 'react';
import * as Dropdown from 'react-bootstrap/lib/Dropdown';
import * as MenuItem from 'react-bootstrap/lib/MenuItem';

import { translate } from './translate';
import { useLanguageSelector } from './useLanguageSelector';

export const LanguageSelector = () => {
  const {
    currentLanguage,
    languageChoices,
    setLanguage,
  } = useLanguageSelector();

  if (languageChoices.length < 2) {
    return null;
  }

  return (
    <Dropdown id="language-selector" componentClass="li">
      <Dropdown.Toggle
        useAnchor
        noCaret
        title={translate(currentLanguage.label)}
      >
        {currentLanguage.code.toUpperCase()}
      </Dropdown.Toggle>
      <Dropdown.Menu>
        {languageChoices.map(language => (
          <MenuItem
            key={language.code}
            onClick={() => setLanguage(language)}
            className={language === currentLanguage ? 'font-bold' : ''}
          >
            {translate(language.label)}
          </MenuItem>
        ))}
      </Dropdown.Menu>
    </Dropdown>
  );
};
