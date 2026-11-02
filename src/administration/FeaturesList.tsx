import { DotsThreeVerticalIcon } from '@phosphor-icons/react';
import { useCurrentStateAndParams, useRouter } from '@uirouter/react';
import classNames from 'classnames';
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { Field, Form } from 'react-final-form';
import { featureValues } from 'waldur-js-client';

import {
  Badge,
  BaseButton,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Menu,
  PropertyCard,
  Switch,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from 'waldur-ui';

import { TelemetryExampleButton } from '@/administration/TelemetryExampleButton';
import { ENV } from '@/core/config';
import { SaveButton } from '@/core/SaveButton';
import { FeaturesDescription } from '@/features/FeaturesDescription';
import { FeatureSection } from '@/features/types';
import { DeploymentFeatures } from '@/FeaturesEnums';
import { translate } from '@/i18n';
import { NoResult } from '@/navigation/header/search/NoResult';
import { useUrlTab } from '@/navigation/useUrlTab';
import { useNotify } from '@/store/notify';
import { ActionsMenu } from '@/table/ActionsDropdown';
import { TableQuery } from '@/table/TableQuery';
import { useUser } from '@/workspace/hooks';

import { FEATURE_PLUGIN_SECTION_KEYS } from './settings/registry';
import { useHighlightSettingRow } from './settings/useHighlightSettingRow';

/**
 * One feature toggle: its description names the switch through a real
 * `<label>`, so the row reads as a form control, not a property. Without the
 * right to edit, the value reads Yes or No.
 */
const FeatureRow = ({
  sectionKey,
  item,
  canEdit,
}: {
  sectionKey: string;
  item: FeatureSection['items'][number];
  canEdit: boolean;
}) => {
  const featureKey = `${sectionKey}.${item.key}`;
  const isHighlighted = useHighlightSettingRow(featureKey, 'feature-');
  const inputId = `feature-input-${featureKey}`;
  const labelId = `feature-label-${featureKey}`;

  return (
    <li
      id={`feature-${featureKey}`}
      data-testid={`feature-${featureKey}`}
      className={classNames(
        'flex min-h-[49px] items-center justify-between gap-6 border-b-[1px] border-b-secondary py-3.5 last:border-b-0',
        isHighlighted && 'bg-warning-subtle',
      )}
    >
      <div className="min-w-0 text-sm text-quaternary">
        {canEdit ? (
          <label id={labelId} htmlFor={inputId} className="mb-0">
            {item.description}
          </label>
        ) : (
          item.description
        )}
        {featureKey === DeploymentFeatures.send_metrics ? (
          <div>
            <TelemetryExampleButton />
          </div>
        ) : null}
      </div>
      <div className="shrink-0 pe-[3px]">
        {canEdit ? (
          <Field name={featureKey} type="checkbox">
            {({ input }) => (
              <Switch
                id={inputId}
                checked={Boolean(input.checked)}
                onCheckedChange={input.onChange}
                aria-labelledby={labelId}
                data-testid={featureKey}
              />
            )}
          </Field>
        ) : (
          <Field name={featureKey}>
            {({ input }) => (
              <span>{input.value ? translate('Yes') : translate('No')}</span>
            )}
          </Field>
        )}
      </div>
    </li>
  );
};

const FeatureSectionContent = ({ section }: { section: FeatureSection }) => {
  const canEdit = Boolean(useUser()?.is_staff);
  return (
    <ul className="m-0 list-none p-0">
      {section.items.map((item) => (
        <FeatureRow
          key={item.key}
          sectionKey={section.key}
          item={item}
          canEdit={canEdit}
        />
      ))}
    </ul>
  );
};

const FeatureSectionPanel = ({
  section,
  hasItems,
}: {
  section: FeatureSection;
  hasItems: boolean;
}) => (
  <PropertyCard
    bordered
    title={section.description}
    className="mb-4"
    key={section.key}
  >
    {hasItems ? (
      <FeatureSectionContent section={section} />
    ) : (
      <p className="text-quaternary p-4 mb-0">
        {translate('No matching features in this section.')}
      </p>
    )}
  </PropertyCard>
);

// Build tabs: regular sections + grouped Plugins tab, sorted alphabetically
const FEATURES_TABS = [
  ...FeaturesDescription.filter(
    (section) => !FEATURE_PLUGIN_SECTION_KEYS.includes(section.key),
  ).map((section) => ({
    key: section.key,
    title: section.description,
    isPluginsTab: false,
  })),
  {
    key: 'plugins',
    title: translate('Plugins'),
    isPluginsTab: true,
  },
].sort((a, b) => a.title.localeCompare(b.title));

export const FeaturesList = () => {
  const { showErrorResponse, showSuccess } = useNotify();
  const canEdit = Boolean(useUser()?.is_staff);
  const { state, params } = useCurrentStateAndParams();
  const router = useRouter();
  const { activeKey, handleSelect } = useUrlTab(FEATURES_TABS, 'tab');

  const scrollRef = useRef<HTMLDivElement>(null);
  const [hiddenTabKeys, setHiddenTabKeys] = useState<Set<string>>(new Set());

  const updateOverflow = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const containerRect = el.getBoundingClientRect();
    const items = el.querySelectorAll('[role="tab"]');
    const hidden = new Set<string>();
    items.forEach((item, i) => {
      const rect = item.getBoundingClientRect();
      if (
        rect.right > containerRect.right + 1 ||
        rect.left < containerRect.left - 1
      ) {
        hidden.add(FEATURES_TABS[i].key);
      }
    });
    setHiddenTabKeys(hidden);
  }, []);

  useLayoutEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    updateOverflow();
    el.addEventListener('scroll', updateOverflow);
    window.addEventListener('resize', updateOverflow);
    return () => {
      el.removeEventListener('scroll', updateOverflow);
      window.removeEventListener('resize', updateOverflow);
    };
  }, [updateOverflow]);

  const scrollToTab = useCallback((tabKey: string) => {
    const el = scrollRef.current;
    if (!el) return;
    const index = FEATURES_TABS.findIndex((t) => t.key === tabKey);
    const tabEl = el.querySelectorAll<HTMLElement>('[role="tab"]')[index];
    if (tabEl && tabEl.scrollIntoView) {
      tabEl.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
        inline: 'center',
      });
    }
  }, []);

  useEffect(() => {
    if (activeKey) {
      scrollToTab(activeKey);
    }
  }, [activeKey, scrollToTab]);

  // Sync search query with URL
  const query = (params.q as string) || '';
  const setQuery = (newQuery: string) => {
    router.stateService.go(
      state.name,
      { ...params, q: newQuery || undefined },
      { location: 'replace' },
    );
  };

  const saveFeaturesCallback = async (formData) => {
    try {
      await featureValues({ body: formData });
      showSuccess(translate('Features have been updated.'));
      location.reload();
    } catch (e) {
      showErrorResponse(e, translate('Unable to update features.'));
    }
  };

  const filteredSections = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return FeaturesDescription;

    return FeaturesDescription.map((section) => ({
      ...section,
      items: section.items.filter(
        (item) =>
          item.description.toLowerCase().includes(q) ||
          item.key.toLowerCase().includes(q) ||
          section.description.toLowerCase().includes(q),
      ),
    }));
  }, [query]);

  const getFilteredCount = (tabKey: string) => {
    if (tabKey === 'plugins') {
      return filteredSections
        .filter((s) => FEATURE_PLUGIN_SECTION_KEYS.includes(s.key))
        .reduce((sum, s) => sum + s.items.length, 0);
    }
    const section = filteredSections.find((s) => s.key === tabKey);
    return section?.items.length || 0;
  };

  const pluginSections = filteredSections.filter((s) =>
    FEATURE_PLUGIN_SECTION_KEYS.includes(s.key),
  );

  // Compute total search results and tabs with matches for search summary
  const tabsWithMatches = useMemo(() => {
    if (!query) return [];
    return FEATURES_TABS.filter((tab) => getFilteredCount(tab.key) > 0);
  }, [query, filteredSections]);

  const totalResults = useMemo(() => {
    if (!query) return 0;
    return filteredSections.reduce((sum, s) => sum + s.items.length, 0);
  }, [query, filteredSections]);

  return (
    <Form
      onSubmit={saveFeaturesCallback}
      initialValues={ENV.FEATURES}
      render={({ handleSubmit, submitting, dirty }) => (
        <form onSubmit={handleSubmit}>
          <Card bordered>
            <CardHeader>
              <CardTitle>{translate('Features')}</CardTitle>
              <div className="my-[0.5rem] flex items-center gap-3 flex-nowrap">
                <TableQuery
                  query={query}
                  setQuery={setQuery}
                  inputClassName="h-11"
                />
                {canEdit && (
                  <SaveButton
                    type="submit"
                    onClick={handleSubmit}
                    submitting={submitting}
                    dirty={dirty}
                  />
                )}
              </div>
            </CardHeader>
            <CardContent className="pt-2">
              <Tabs mount="all" value={activeKey} onValueChange={handleSelect}>
                <div
                  className="flex items-end gap-1"
                  style={{
                    borderBottom: '1px solid var(--border-secondary)',
                  }}
                >
                  <div
                    ref={scrollRef}
                    className="grow"
                    style={{
                      overflowX: 'auto',
                      scrollbarWidth: 'none',
                      minWidth: 0,
                      paddingBottom: 2,
                      marginBottom: -2,
                    }}
                  >
                    <TabsList
                      bordered={false}
                      style={{ minWidth: 'max-content' }}
                    >
                      {FEATURES_TABS.map((tab) => {
                        const filteredCount = getFilteredCount(tab.key);
                        const hasMatches = filteredCount > 0;
                        return (
                          <TabsTrigger
                            key={tab.key}
                            style={{ whiteSpace: 'nowrap' }}
                            value={tab.key}
                            disabled={!hasMatches && !!query}
                            className={
                              !hasMatches && query ? 'text-quaternary' : ''
                            }
                          >
                            {tab.title}
                            {query && (
                              <Badge
                                variant="secondary"
                                size="sm"
                                tone="outline"
                                className="ms-1.5"
                              >
                                {filteredCount}
                              </Badge>
                            )}
                          </TabsTrigger>
                        );
                      })}
                    </TabsList>
                  </div>
                  {hiddenTabKeys.size > 0 && (
                    <ActionsMenu
                      side="bottom"
                      toggle={
                        <BaseButton
                          variant="text-secondary"
                          size="md"
                          className="shrink-0"
                          style={{ marginBottom: 2 }}
                          tooltip={translate('More tabs')}
                          iconNode={
                            <DotsThreeVerticalIcon size={22} weight="bold" />
                          }
                        />
                      }
                      align="end"
                      onOpenChange={updateOverflow}
                    >
                      <div className="max-h-[200px] overflow-auto">
                        {FEATURES_TABS.filter((tab) =>
                          hiddenTabKeys.has(tab.key),
                        ).map((tab) => {
                          const filteredCount = getFilteredCount(tab.key);
                          const hasMatches = filteredCount > 0;
                          return (
                            <Menu.Item
                              key={tab.key}
                              disabled={!hasMatches && !!query}
                              className={classNames(
                                'flex justify-between items-center',
                                { active: tab.key === activeKey },
                              )}
                              onClick={() => {
                                handleSelect(tab.key);
                                scrollToTab(tab.key);
                              }}
                            >
                              {tab.title}
                              {query && (
                                <Badge
                                  variant="neutral"
                                  size="sm"
                                  tone="outline"
                                  className="ms-1.5"
                                >
                                  {filteredCount}
                                </Badge>
                              )}
                            </Menu.Item>
                          );
                        })}
                      </div>
                    </ActionsMenu>
                  )}
                </div>
                {query && tabsWithMatches.length > 0 && (
                  <div className="flex items-center gap-1.5 pt-2.5 pb-3 flex-wrap border-b-[1px] border-b-secondary">
                    <span className="text-quaternary text-xs">
                      {translate('{count} results found in:', {
                        count: totalResults,
                      })}
                    </span>
                    {tabsWithMatches.map((tab) => (
                      <BaseButton
                        key={tab.key}
                        variant="tertiary-ghost"
                        className="p-0"
                        onClick={() => handleSelect(tab.key)}
                        label={
                          <Badge variant="neutral" size="sm" tone="outline">
                            {tab.title} ({getFilteredCount(tab.key)})
                          </Badge>
                        }
                      />
                    ))}
                  </div>
                )}
                {query && tabsWithMatches.length === 0 && (
                  <NoResult
                    title={translate('No results found')}
                    message={translate(
                      'No matching features found. Try a different search term.',
                    )}
                    callback={() => setQuery('')}
                    buttonTitle={translate('Clear search')}
                  />
                )}
                {!(query && tabsWithMatches.length === 0) && (
                  <>
                    {FEATURES_TABS.map((tab) => {
                      if (tab.isPluginsTab) {
                        const hasAnyItems = pluginSections.some(
                          (s) => s.items.length > 0,
                        );
                        return (
                          <TabsContent key={tab.key} value={tab.key}>
                            {hasAnyItems || !query ? (
                              pluginSections.map((section) => (
                                <FeatureSectionPanel
                                  key={section.key}
                                  section={section}
                                  hasItems={section.items.length > 0}
                                />
                              ))
                            ) : (
                              <NoResult
                                title={translate('No results found')}
                                message={translate(
                                  'No matching features in this section. Try a different search term.',
                                )}
                                callback={() => setQuery('')}
                                buttonTitle={translate('Clear search')}
                              />
                            )}
                          </TabsContent>
                        );
                      }

                      const section = filteredSections.find(
                        (s) => s.key === tab.key,
                      );
                      if (!section) return null;

                      return (
                        <TabsContent key={tab.key} value={tab.key}>
                          {section.items.length > 0 ? (
                            <FeatureSectionContent section={section} />
                          ) : (
                            <NoResult
                              title={translate('No results found')}
                              message={translate(
                                'No matching features in this section. Try a different search term.',
                              )}
                              callback={() => setQuery('')}
                              buttonTitle={translate('Clear search')}
                            />
                          )}
                        </TabsContent>
                      );
                    })}
                  </>
                )}
              </Tabs>
            </CardContent>
          </Card>
        </form>
      )}
    />
  );
};
