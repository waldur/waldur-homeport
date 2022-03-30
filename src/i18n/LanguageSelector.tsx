import { FunctionComponent } from 'react';
import { Dropdown } from 'react-bootstrap';

import { useLanguageSelector } from './useLanguageSelector';

export const LanguageSelector: FunctionComponent = () => {
  const { currentLanguage, languageChoices, setLanguage } =
    useLanguageSelector();

  if (languageChoices.length < 2) {
    return null;
  }

  return (
    <Dropdown id="language-selector" as="li">
      <Dropdown.Toggle title={currentLanguage.label}>
        {currentLanguage.display_code
          ? currentLanguage.display_code.toUpperCase()
          : currentLanguage.code.toUpperCase()}
      </Dropdown.Toggle>
      <Dropdown.Menu>
        {languageChoices.map((language) => (
          <Dropdown.Item
            key={language.code}
            onClick={() => setLanguage(language)}
            className={language === currentLanguage ? 'font-bold' : ''}
          >
            {language.label}
          </Dropdown.Item>
        ))}
      </Dropdown.Menu>
    </Dropdown>
  );
};
