import { CheckCircleIcon } from '@phosphor-icons/react';
import { FunctionComponent, useMemo, useState } from 'react';
import { Button, Col, Row } from 'react-bootstrap';
import { overrideSettings } from 'waldur-js-client';

import { ENV } from '@waldur/core/config';
import { CountryFlagIcon } from '@waldur/core/CountryFlagIcon';
import { Panel } from '@waldur/core/Panel';
import { AwesomeCheckboxField } from '@waldur/form/AwesomeCheckboxField';
import { translate } from '@waldur/i18n';
import { useLanguageSelector } from '@waldur/i18n/useLanguageSelector';
import { LanguageCountry } from '@waldur/navigation/header/LanguageSelectorDropdown';
import { useNotify } from '@waldur/store/hooks';
import { TableQuery } from '@waldur/table/TableQuery';

export const AdministrationLanguages: FunctionComponent = () => {
  const [query, setQuery] = useState('');
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>(
    ENV.plugins.WALDUR_CORE.LANGUAGE_CHOICES,
  );
  const { showError, showErrorResponse, showSuccess } = useNotify();
  const { currentLanguage } = useLanguageSelector();

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
        showError(translate('You cannot unselect the current UI language'));
        return selectedLanguagesArray;
      }

      if (ENV.defaultLanguage === code && isCodeSelected) {
        showError(translate('You cannot unselect the default language'));
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
      showError(
        translate('Please select at least one language to save changes'),
      );
    } else {
      try {
        const selectedLanguageCodes = selectedLanguages.join(',');
        await overrideSettings({
          body: {
            LANGUAGE_CHOICES: selectedLanguageCodes,
          },
        });
        showSuccess(
          translate(
            'A list of languages available for selection has been updated',
          ),
        );
        location.reload();
      } catch (e) {
        showErrorResponse(
          e,
          translate('Unable to update languages available for selection'),
        );
      }
    }
  };

  const filteredLanguages = useMemo(() => {
    const q = query.trim().toLowerCase();
    return !q
      ? ENV.languageChoices
      : ENV.languageChoices.filter((item) =>
          item.label.toLowerCase().includes(q),
        );
  }, [query]);

  return (
    <Panel
      title={translate('Language options')}
      cardBordered
      className="pb-1"
      bodyClassName="py-0 overflow-hidden"
      actions={
        <>
          <TableQuery query={query} setQuery={setQuery} />
          <Button className="min-w-80px ms-4" onClick={saveLanguageOptions}>
            <span className="svg-icon svg-icon-2">
              <CheckCircleIcon weight="bold" />
            </span>
            {translate('Save')}
          </Button>
        </>
      }
    >
      <Row className="mb-n1">
        {filteredLanguages.map((language: { code: string; label: string }) => (
          <Col key={language.code} sm={6} md={4}>
            <div className="border-bottom py-5">
              <AwesomeCheckboxField
                data-testid={`language_${language.code}`}
                name={`language_${language.code}`}
                alignMiddle
                className="justify-content-between flex-row-reverse"
                size="sm"
                input={
                  {
                    value: selectedLanguages.includes(language.code),
                    onChange: () => handleLanguageChange(language.code),
                  } as any
                }
                label={
                  <div className="d-flex align-items-center">
                    <CountryFlagIcon
                      countryCode={LanguageCountry[language.code]}
                      className="me-2"
                    />
                    {language.label}
                  </div>
                }
              />
            </div>
          </Col>
        ))}
      </Row>
    </Panel>
  );
};
