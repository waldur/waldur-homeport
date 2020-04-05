import * as React from 'react';
import * as Dropdown from 'react-bootstrap/lib/Dropdown';
import * as MenuItem from 'react-bootstrap/lib/MenuItem';

import { ngInjector } from '@waldur/core/services';
import { connectAngularComponent } from '@waldur/store/connect';

import { translate } from './translate';

interface Language {
  code: string;
  label: string;
}

export const LanguageSelector = () => {
  const service = ngInjector.get('LanguageUtilsService');

  const [currentLanguage, setCurrentLanguage] = React.useState<Language>(
    service.getCurrentLanguage(),
  );

  const languageChoices = React.useMemo<Language[]>(
    () => service.getChoices().sort((a, b) => a.code.localeCompare(b.code)),
    [],
  );

  const setLanguage = React.useCallback((language: Language) => {
    setCurrentLanguage(language);
    service.setCurrentLanguage(language);
  }, []);

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

export default () => ({
  ...connectAngularComponent(LanguageSelector),
  replace: true,
});
