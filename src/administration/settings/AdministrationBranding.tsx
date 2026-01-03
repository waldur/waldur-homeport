import { useCallback, useMemo } from 'react';
import { useDispatch } from 'react-redux';

import { ENV } from '@waldur/core/config';
import { lazyComponent } from '@waldur/core/lazyComponent';
import { translate } from '@waldur/i18n';
import { openModalDialog } from '@waldur/modal/actions';

import { SettingsTab, SettingsWithTabs } from './SettingsWithTabs';

const CountrySelector = lazyComponent(() =>
  import('./CountrySelector').then((module) => ({
    default: module.CountrySelectorDialog,
  })),
);

const BRANDING_TABS: SettingsTab[] = [
  {
    key: 'branding',
    title: translate('Branding'),
    groupName: translate('Branding'),
  },
  {
    key: 'marketplace',
    title: translate('Marketplace Branding'),
    groupName: translate('Marketplace Branding'),
  },
  {
    key: 'notifications',
    title: translate('Notifications'),
    groupName: translate('Notifications'),
  },
  {
    key: 'links',
    title: translate('Links'),
    groupName: translate('Links'),
  },
  {
    key: 'theme',
    title: translate('Theme'),
    groupName: translate('Theme'),
  },
  {
    key: 'images',
    title: translate('Images'),
    groupName: translate('Images'),
  },
];

export const AdministrationBranding = () => {
  const dispatch = useDispatch();

  const getItemValue = useCallback((item, data) => {
    if (item.type === 'country_list_field') {
      return data?.COUNTRIES;
    }
    if (item.type === 'multilingual_image_field') {
      return data?.[item.key] || {};
    }
    const value = ENV.plugins.WALDUR_CORE[item.key];
    if (value === false) return value;
    return value || ' ';
  }, []);

  const getItemOnEdit = useMemo(() => {
    return (item, data) => {
      if (item.type === 'country_list_field') {
        return () => {
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
        };
      }
      return undefined;
    };
  }, [dispatch]);

  const getItemIsLoading = useCallback((item, isLoading) => {
    return isLoading && item.type === 'country_list_field';
  }, []);

  return (
    <SettingsWithTabs
      title={translate('Branding')}
      tabs={BRANDING_TABS}
      queryKey="AdministrationBranding"
      getItemValue={getItemValue}
      getItemOnEdit={getItemOnEdit}
      getItemIsLoading={getItemIsLoading}
    />
  );
};
