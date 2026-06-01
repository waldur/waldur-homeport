import { FunctionComponent, useMemo, useState } from 'react';
import { Col, Row } from 'react-bootstrap';
import { overrideSettings } from 'waldur-js-client';

import { AwesomeCheckbox } from '@/core/AwesomeCheckbox';
import { ENV } from '@/core/config';
import { CountryFlagIcon } from '@/core/CountryFlagIcon';
import { Panel } from '@/core/Panel';
import { SaveButton } from '@/core/SaveButton';
import { translate } from '@/i18n';
import { useLanguageSelector } from '@/i18n/useLanguageSelector';
import { LanguageCountry } from '@/navigation/header/LanguageSelectorDropdown';
import { useNotify } from '@/store/notify';
import { TableQuery } from '@/table/TableQuery';

export const AdministrationLanguages: FunctionComponent = () => {
  const [query, setQuery] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const initialLanguages = ENV.plugins.WALDUR_CORE.LANGUAGE_CHOICES;
  const [selectedLanguages, setSelectedLanguages] =
    useState<string[]>(initialLanguages);
  const { showError, showErrorResponse, showSuccess } = useNotify();
  const { currentLanguage } = useLanguageSelector();

  const hasChanges = useMemo(() => {
    const currentSorted = [...selectedLanguages].sort();
    const initialSorted = [...initialLanguages].sort();
    return JSON.stringify(currentSorted) !== JSON.stringify(initialSorted);
  }, [selectedLanguages, initialLanguages]);

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
      return;
    }
    setSubmitting(true);
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
    } finally {
      setSubmitting(false);
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
        <div className="d-flex align-items-center">
          <TableQuery query={query} setQuery={setQuery} />
          <SaveButton
            className="ms-4"
            onClick={saveLanguageOptions}
            submitting={submitting}
            dirty={hasChanges}
          />
        </div>
      }
    >
      <Row className="mb-n1">
        {filteredLanguages.map((language: { code: string; label: string }) => (
          <Col key={language.code} sm={6} md={4}>
            <div className="border-bottom py-5">
              <AwesomeCheckbox
                data-testid={`language_${language.code}`}
                className="d-flex justify-content-between flex-row-reverse align-items-center"
                size="sm"
                value={selectedLanguages.includes(language.code)}
                onChange={() => handleLanguageChange(language.code)}
                label={
                  <div className="d-flex align-items-center">
                    <CountryFlagIcon
                      countryCode={
                        LanguageCountry[language.code] || language.code
                      }
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
