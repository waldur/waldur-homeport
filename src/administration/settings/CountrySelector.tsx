import { FunctionComponent, useMemo, useState } from 'react';
import { Col, Row } from 'react-bootstrap';
import { useDispatch } from 'react-redux';
import { overrideSettings } from 'waldur-js-client';

import { formDataOptions } from '@/core/api';
import { SubmitButton } from '@/form';
import { AwesomeCheckboxField } from '@/form/AwesomeCheckboxField';
import { translate } from '@/i18n';
import { CountryFlag } from '@/marketplace/common/CountryFlag';
import { closeModalDialog } from '@/modal/actions';
import { CloseDialogButton } from '@/modal/CloseDialogButton';
import { ModalDialog } from '@/modal/ModalDialog';
import { SettingsDescription } from '@/SettingsDescription';
import { useNotify } from '@/store/hooks';
import { TableQuery } from '@/table/TableQuery';

// Get the list of all available country codes from settings configuration default value
const AVAILABLE_COUNTRIES =
  (SettingsDescription.find(
    (group) => group.description === translate('Marketplace Branding'),
  )?.items.find(
    (item) => item.key === 'COUNTRIES' && item.type === 'country_list_field',
  )?.default as string[]) || [];

interface CountrySelectorProps {
  resolve: {
    value: string[] | string;
    settingKey: string;
  };
}

export const CountrySelectorDialog: FunctionComponent<CountrySelectorProps> = ({
  resolve,
}) => {
  const dispatch = useDispatch();
  const { value = [], settingKey } = resolve;
  const [query, setQuery] = useState('');
  const { showError, showErrorResponse, showSuccess } = useNotify();

  // Handle array with single string element containing comma-separated values
  const initialValue =
    Array.isArray(value) && value.length === 1 && typeof value[0] === 'string'
      ? value[0].split(',')
      : Array.isArray(value)
        ? value
        : [];

  const [selectedCountries, setSelectedCountries] =
    useState<string[]>(initialValue);

  const saveCountryOptions = async () => {
    if (selectedCountries.length === 0) {
      showError(translate('Please select at least one country'));
    } else {
      try {
        const sortedCountries = [...selectedCountries].sort();
        await overrideSettings({
          body: {
            [settingKey]: sortedCountries,
          },
          ...formDataOptions,
        });
        showSuccess(translate('Country list has been updated'));
        dispatch(closeModalDialog());
        window.location.reload();
      } catch (e) {
        showErrorResponse(e, translate('Unable to update country list'));
      }
    }
  };

  const handleCountryChange = (code: string) => {
    setSelectedCountries((prevSelectedCountries) => {
      const isCodeSelected = prevSelectedCountries.includes(code);
      if (isCodeSelected) {
        return prevSelectedCountries.filter((country) => country !== code);
      } else {
        return [...prevSelectedCountries, code];
      }
    });
  };

  const filteredCountries = useMemo(() => {
    const q = query.trim().toLowerCase();
    return !q
      ? AVAILABLE_COUNTRIES
      : AVAILABLE_COUNTRIES.filter((country) =>
          country.toLowerCase().includes(q),
        );
  }, [query]);

  const isDirty =
    JSON.stringify(selectedCountries.sort()) !==
    JSON.stringify(initialValue.sort());
  return (
    <ModalDialog
      title={translate('Available countries')}
      className="country-selector-modal"
      bodyClassName="p-0"
      footer={
        <>
          <CloseDialogButton className="flex-equal" />
          <SubmitButton
            submitting={false}
            className="flex-equal"
            onClick={saveCountryOptions}
            disabled={!isDirty}
            type="button"
            label={translate('Save')}
          />
        </>
      }
    >
      <div className="p-7">
        <div className="mb-4">
          <TableQuery query={query} setQuery={setQuery} />
        </div>
        <Row className="mb-n1">
          {filteredCountries.map((countryCode) => (
            <Col key={countryCode} sm={6} md={4}>
              <div className="border-bottom py-5">
                <AwesomeCheckboxField
                  data-testid={`country_${countryCode}`}
                  name={`country_${countryCode}`}
                  alignMiddle
                  className="d-flex justify-content-between flex-row-reverse w-100"
                  size="sm"
                  input={
                    {
                      value: selectedCountries.includes(countryCode),
                      onChange: () => handleCountryChange(countryCode),
                    } as any
                  }
                  label={
                    <div className="d-flex align-items-center">
                      <div className="symbol symbol-20px me-2">
                        <CountryFlag
                          countryCode={countryCode}
                          fontSize={16}
                          className="lh-1"
                        />
                      </div>
                      {countryCode}
                    </div>
                  }
                />
              </div>
            </Col>
          ))}
        </Row>
      </div>
    </ModalDialog>
  );
};
