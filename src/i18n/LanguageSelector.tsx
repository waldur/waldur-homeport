import { FunctionComponent } from 'react';
import {
  Dropdown,
  DropdownMenu,
  DropdownToggle,
  MenuItem,
} from 'react-bootstrap';

import { useLanguageSelector } from './useLanguageSelector';

export const LanguageSelector: FunctionComponent = () => {
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
      <DropdownToggle useAnchor noCaret title={currentLanguage.label}>
        {currentLanguage.display_code
          ? currentLanguage.display_code.toUpperCase()
          : currentLanguage.code.toUpperCase()}
      </DropdownToggle>
      <DropdownMenu>
        {languageChoices.map((language) => (
          <MenuItem
            key={language.code}
            onClick={() => setLanguage(language)}
            className={language === currentLanguage ? 'font-bold' : ''}
          >
            {language.label}
          </MenuItem>
        ))}
      </DropdownMenu>
    </Dropdown>
  );
};
