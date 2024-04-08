import { useEffect, useState } from 'react';
import { Button } from 'react-bootstrap';
import { useDispatch } from 'react-redux';
import { Field, reduxForm } from 'redux-form';

import { ENV } from '@waldur/configs/default';
import { AwesomeCheckboxField } from '@waldur/form/AwesomeCheckboxField';
import { translate } from '@waldur/i18n';
import { useLanguageSelector } from '@waldur/i18n/useLanguageSelector';
import { LanguageCountry } from '@waldur/navigation/header/LanguageSelectorDropdown';
import {
  showSuccess,
  showErrorResponse,
  showError,
} from '@waldur/store/notify';

import { saveConfig } from '../service-desk/api';

interface LanguageOptionProps {
  languageChoices: any;
}

const LanguageOptionsForm: React.FC<LanguageOptionProps> = ({
  languageChoices,
}) => {
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>([]);
  const dispatch = useDispatch();
  const { currentLanguage } = useLanguageSelector();

  useEffect(() => {
    const selectedLanguageCodes = ENV.plugins.WALDUR_CORE.LANGUAGE_CHOICES;
    setSelectedLanguages(selectedLanguageCodes);
  }, []);

  const handleLanguageChange = (code: string) => {
    setSelectedLanguages((prevSelectedLanguages: string | string[]) => {
      let selectedLanguagesArray = Array.isArray(prevSelectedLanguages)
        ? prevSelectedLanguages
        : prevSelectedLanguages.split(',');

      selectedLanguagesArray = selectedLanguagesArray.filter(
        (lang) => lang !== '',
      );
      const isCodeSelected = selectedLanguagesArray.includes(code);

      if (currentLanguage.code === code) {
        dispatch(
          showError(translate('You cannot unselect the current UI language')),
        );
        return selectedLanguagesArray;
      }

      if (ENV.defaultLanguage === code) {
        dispatch(
          showError(translate('You cannot unselect the deafult language')),
        );
        return selectedLanguagesArray;
      }

      if (isCodeSelected) {
        return selectedLanguagesArray.filter((lang) => lang !== code);
      } else {
        return [...selectedLanguagesArray, code];
      }
    });
  };

  const saveLanguageOptions = async () => {
    if (selectedLanguages.length === 0) {
      dispatch(
        showError(
          translate('Please select at least one language to save changes'),
        ),
      );
    } else {
      try {
        const selectedLanguageCodes = selectedLanguages.join(',');
        await saveConfig({
          LANGUAGE_CHOICES: selectedLanguageCodes,
        });
        dispatch(
          showSuccess(
            translate(
              'A list of languages available for selection has been updated',
            ),
          ),
        );
        location.reload();
      } catch (e) {
        dispatch(
          showErrorResponse(
            e,
            translate('Unable to update languages available for selection'),
          ),
        );
      }
    }
  };

  const renderLanguageCheckbox = (
    language: { code: string; label: string },
    selectedLanguages: string[],
    handleLanguageChange: (code: string) => void,
  ) => (
    <div key={language.code} className="mb-3">
      <Field
        name={`language_${language.code}`}
        component={AwesomeCheckboxField}
        label={
          <div className="d-flex align-items-center">
            <div className="symbol symbol-20px me-2">
              <i className="f16">
                <i className={`flag ${LanguageCountry[language.code]}`} />
              </i>
            </div>
            {language.label}
          </div>
        }
        input={{
          value: selectedLanguages.includes(language.code),
          onChange: () => handleLanguageChange(language.code),
        }}
      />
    </div>
  );

  return (
    <div>
      <div className="row">
        <div className="col-md-6">
          {languageChoices.map(
            (language: { code: string; label: string }, index: number) =>
              index < Math.ceil(languageChoices.length / 2) &&
              renderLanguageCheckbox(
                language,
                selectedLanguages,
                handleLanguageChange,
              ),
          )}
        </div>
        <div className="col-md-6">
          {languageChoices.map(
            (language: { code: string; label: string }, index: number) =>
              index >= Math.ceil(languageChoices.length / 2) &&
              renderLanguageCheckbox(
                language,
                selectedLanguages,
                handleLanguageChange,
              ),
          )}
        </div>
      </div>
      <div className="row">
        <div className="col-md-12 text-end">
          <Button onClick={saveLanguageOptions}>{translate('Save')}</Button>
        </div>
      </div>
    </div>
  );
};

export default reduxForm<FormData, LanguageOptionProps>({
  form: 'languageOptionsForm',
})(LanguageOptionsForm);
