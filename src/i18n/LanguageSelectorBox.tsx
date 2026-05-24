import { FunctionComponent } from 'react';

import { Select } from '@/form/select';

import { useLanguageSelector } from './useLanguageSelector';

export const LanguageSelectorBox: FunctionComponent = () => {
  const { currentLanguage, languageChoices, setLanguage } =
    useLanguageSelector();

  const handleChange = (lang) => {
    setLanguage(
      languageChoices.find((language) => language.code === lang.code),
    );
  };

  return (
    <Select
      options={languageChoices}
      value={currentLanguage}
      getOptionValue={(opt) => opt.code}
      onChange={handleChange}
      size="sm"
      className="login-lang-select"
    />
  );
};
