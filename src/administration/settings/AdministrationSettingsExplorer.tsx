import { ArrowSquareOutIcon } from '@phosphor-icons/react';
import { useQuery } from '@tanstack/react-query';
import { useCurrentStateAndParams, useRouter } from '@uirouter/react';
import { FC, useCallback, useMemo } from 'react';
import { overrideSettingsRetrieve } from 'waldur-js-client';

import { Switch, Tabs, TabsList, TabsTrigger } from 'waldur-ui';

import { ENV } from '@/core/config';
import { lazyComponent } from '@/core/lazyComponent';
import { Link } from '@/core/Link';
import { LoadingErred } from '@/core/LoadingErred';
import { LoadingSpinner } from '@/core/LoadingSpinner';
import FormTable from '@/form/FormTable';
import { translate } from '@/i18n';
import { getMarketplaceTitle } from '@/marketplace/title';
import { useModal } from '@/modal/actions';
import { NoResult } from '@/navigation/header/search/NoResult';
import { SettingsDescription } from '@/SettingsDescription';
import { RootState } from '@/store/reducers';
import { TableQuery } from '@/table/TableQuery';
import { useUser } from '@/workspace/hooks';

import { FieldRow } from './FieldRow';
import {
  AdminRegistryLocation,
  formatAdminLocationBreadcrumb,
  getSettingGroupLocations,
  isAdminLocationAccessible,
} from './registry';
import { getKeyTitle, isSettingModified } from './utils';

const CountrySelector = lazyComponent(() =>
  import('./CountrySelector').then((module) => ({
    default: module.CountrySelectorDialog,
  })),
);

const LoginPageListEditDialog = lazyComponent(() =>
  import('./LoginPageListEditDialog').then((module) => ({
    default: module.LoginPageListEditDialog,
  })),
);

const resolveSettingValue = (
  item: { key: string; type: string },
  data: Record<string, any> | undefined,
) => {
  if (item.type === 'country_list_field') {
    return data?.COUNTRIES;
  }
  if (item.type === 'multilingual_image_field') {
    return data?.[item.key] || {};
  }
  if (data && item.key in data && data[item.key] !== undefined) {
    return data[item.key];
  }
  return ENV.plugins?.WALDUR_CORE?.[item.key];
};

export const AdministrationSettingsExplorer: FC = () => {
  const { state, params } = useCurrentStateAndParams();
  const router = useRouter();
  const user = useUser();
  // Route permission checks read only the user (and ENV)
  const accessState = useMemo(
    () => ({ workspace: { user } }) as unknown as RootState,
    [user],
  );
  const { openDialog } = useModal();

  const query = (params.q as string) || '';
  const activeCategory = (params.category as string) || 'all';
  const onlyModified = params.modified === 'true' || params.modified === true;

  const updateParams = useCallback(
    (next: Record<string, string | undefined>) => {
      router.stateService.go(
        state.name,
        { ...params, ...next },
        { location: 'replace' },
      );
    },
    [router, state.name, params],
  );

  const setQuery = useCallback(
    (newQuery: string) => {
      updateParams({ q: newQuery || undefined });
    },
    [updateParams],
  );

  const setCategory = useCallback(
    (category: string) => {
      updateParams({ category: category === 'all' ? undefined : category });
    },
    [updateParams],
  );

  const setOnlyModified = useCallback(
    (checked: boolean) => {
      updateParams({ modified: checked ? 'true' : undefined });
    },
    [updateParams],
  );

  const { data, error, isLoading, refetch } = useQuery({
    queryKey: ['AdministrationSettingsExplorer'],
    queryFn: () => overrideSettingsRetrieve().then((response) => response.data),
  });

  const getItemOnEdit = useCallback(
    (item: any, settingsData: any) => {
      if (item.type === 'country_list_field') {
        return () => {
          const countries = settingsData?.COUNTRIES || [];
          openDialog(CountrySelector, {
            resolve: {
              value: countries,
              settingKey: 'COUNTRIES',
            },
            size: 'lg',
          });
        };
      }
      if (item.type === 'json_list_field') {
        return () => {
          const value =
            settingsData?.[item.key] ??
            ENV.plugins?.WALDUR_CORE?.[item.key] ??
            [];
          openDialog(LoginPageListEditDialog, {
            resolve: {
              item,
              value,
            },
            size: 'md',
          });
        };
      }
      return undefined;
    },
    [openDialog],
  );

  // ?category= takes a stable key; the registry's categories are labels
  const categories = useMemo(
    () => [
      { key: 'all', label: translate('All categories') },
      { key: 'configuration', label: translate('Configuration') },
      { key: 'user-interface', label: translate('User interface') },
      { key: 'marketplace', label: getMarketplaceTitle() },
      {
        key: 'organizations-compliance',
        label: translate('Organizations & compliance'),
      },
      { key: 'system-management', label: translate('System management') },
    ],
    [],
  );

  const isInCategory = useCallback(
    (location: AdminRegistryLocation, categoryKey: string) =>
      categoryKey === 'all' ||
      location.category ===
        categories.find((category) => category.key === categoryKey)?.label,
    [categories],
  );

  const accessibleGroups = useMemo(() => {
    const groupLocations = getSettingGroupLocations();
    const q = query.trim().toLowerCase();
    const secretsRedacted = !user?.is_staff;

    return SettingsDescription.map((group) => {
      const location = groupLocations[group.description];
      if (!location || !isAdminLocationAccessible(location, accessState)) {
        return null;
      }

      const items = group.items.filter((item) => {
        const val = resolveSettingValue(item, data);
        if (
          onlyModified &&
          !isSettingModified(item, val, { secretsRedacted })
        ) {
          return false;
        }
        if (!q) {
          return true;
        }
        return (
          item.key.toLowerCase().includes(q) ||
          getKeyTitle(item.key).toLowerCase().includes(q) ||
          item.description?.toLowerCase().includes(q) ||
          group.description.toLowerCase().includes(q)
        );
      });

      return {
        description: group.description,
        location,
        items,
      };
    }).filter(
      (g): g is NonNullable<typeof g> => g !== null && g.items.length > 0,
    );
  }, [accessState, user, data, query, onlyModified]);

  const getCategoryCount = useCallback(
    (categoryKey: string) =>
      accessibleGroups
        .filter((g) => isInCategory(g.location, categoryKey))
        .reduce((sum, g) => sum + g.items.length, 0),
    [accessibleGroups, isInCategory],
  );

  const visibleGroups = useMemo(
    () =>
      accessibleGroups.filter((g) => isInCategory(g.location, activeCategory)),
    [accessibleGroups, activeCategory, isInCategory],
  );

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return (
      <LoadingErred
        message={translate('Unable to load settings.')}
        loadData={refetch}
      />
    );
  }

  return (
    <div className="card card-bordered">
      <div className="card-header">
        <div className="flex flex-col">
          <div className="card-title mb-0">
            <h3>{translate('All settings')}</h3>
          </div>
        </div>
        <div className="card-toolbar flex items-center gap-4 flex-wrap">
          <Switch
            size="sm"
            checked={onlyModified}
            onCheckedChange={setOnlyModified}
            label={translate('Modified only')}
          />
          <TableQuery query={query} setQuery={setQuery} />
        </div>
      </div>
      <div className="card-body">
        <Tabs value={activeCategory} onValueChange={setCategory}>
          <TabsList scrollable className="mb-6">
            {categories.map((cat) => (
              <TabsTrigger
                key={cat.key}
                value={cat.key}
                count={getCategoryCount(cat.key)}
              >
                {cat.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        {visibleGroups.length > 0 ? (
          visibleGroups.map((group) => (
            <FormTable.Card
              key={group.description}
              title={group.description}
              className="card-bordered mb-5"
              actions={
                <Link
                  state={group.location.state}
                  params={group.location.params}
                  buttonVariant="tertiary"
                  buttonSize="sm"
                >
                  <ArrowSquareOutIcon weight="bold" className="me-2" />
                  {formatAdminLocationBreadcrumb(group.location)}
                </Link>
              }
            >
              <FormTable>
                {group.items.map((item) => (
                  <FieldRow
                    key={item.key}
                    item={item}
                    value={resolveSettingValue(item, data)}
                    onEdit={getItemOnEdit(item, data)}
                  />
                ))}
              </FormTable>
            </FormTable.Card>
          ))
        ) : (
          <NoResult
            title={translate('No matching settings found')}
            message={translate(
              'Try adjusting your search query or clearing the filters.',
            )}
            callback={() =>
              updateParams({
                q: undefined,
                category: undefined,
                modified: undefined,
              })
            }
            buttonTitle={translate('Clear filters')}
          />
        )}
      </div>
    </div>
  );
};
