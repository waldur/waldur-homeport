import { FunctionComponent } from 'react';

import { useLanguageSelector } from './useLanguageSelector';

export const LanguageSelectorBox: FunctionComponent = () => {
  const { currentLanguage, languageChoices, setLanguage } =
    useLanguageSelector();

  const handleChange = (event) => {
    setLanguage(
      languageChoices.find((language) => language.code === event.target.value),
    );
  };

  return (
    <select onChange={handleChange} value={currentLanguage.code}>
      {languageChoices.map((option, index) => (
        <option value={option.code} key={index}>
          {option.label}
        </option>
      ))}
    </select>
  );
};
