import { useQuery } from '@tanstack/react-query';
import { useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { overrideSettingsRetrieve } from 'waldur-js-client';

import { ENV } from '@waldur/core/config';
import { lazyComponent } from '@waldur/core/lazyComponent';
import FormTable from '@waldur/form/FormTable';
import { translate } from '@waldur/i18n';
import { openModalDialog } from '@waldur/modal/actions';
import { SettingsDescription } from '@waldur/SettingsDescription';

import { FieldRow } from './FieldRow';

const BRANDING_SECTIONS = [
  translate('Branding'),
  translate('Marketplace Branding'),
  translate('Notifications'),
  translate('Links'),
  translate('Theme'),
  translate('Images'),
];

const CountrySelector = lazyComponent(() =>
  import('./CountrySelector').then((module) => ({
    default: module.CountrySelectorDialog,
  })),
);

export const AdministrationBranding = () => {
  const dispatch = useDispatch();
  const { data, error, isLoading } = useQuery({
    queryKey: ['AdministrationMarketplace'],
    queryFn: () => overrideSettingsRetrieve().then((response) => response.data),
  });

  const openCountryDialog = useCallback(() => {
    const countries = data?.COUNTRIES || [];
    dispatch(
      openModalDialog(CountrySelector, {
        resolve: {
          value: countries,
          settingKey: 'COUNTRIES',
        },
        size: 'xl',
      }),
    );
  }, [data, dispatch]);

  const getItemValue = useCallback(
    (item) => {
      const value =
        item.type === 'country_list_field'
          ? data?.COUNTRIES
          : ENV.plugins.WALDUR_CORE[item.key];
      if (value === false) return value;
      return value || ' ';
    },
    [data?.COUNTRIES],
  );

  return (
    <>
      {SettingsDescription.filter((group) =>
        BRANDING_SECTIONS.includes(group.description),
      ).map((group) => {
        return (
          <FormTable.Card
            title={group.description}
            key={group.description}
            className="card-bordered mb-5"
          >
            <FormTable>
              {group.items.map((item) => {
                if (item.type === 'country_list_field' && error) {
                  return null;
                }
                return (
                  <FieldRow
                    item={item}
                    key={item.key}
                    value={getItemValue(item)}
                    onEdit={
                      item.type === 'country_list_field'
                        ? openCountryDialog
                        : undefined
                    }
                    isLoading={isLoading && item.type === 'country_list_field'}
                  />
                );
              })}
            </FormTable>
          </FormTable.Card>
        );
      })}
    </>
  );
};
