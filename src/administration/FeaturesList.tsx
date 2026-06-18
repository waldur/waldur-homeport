import { DotsThreeVerticalIcon } from '@phosphor-icons/react';
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { Card, Dropdown, Nav, Tab } from 'react-bootstrap';
import { Field, Form } from 'react-final-form';
import { featureValues } from 'waldur-js-client';

import { TelemetryExampleButton } from '@/administration/TelemetryExampleButton';
import { Badge } from '@/core/Badge';
import { ENV } from '@/core/config';
import { SaveButton } from '@/core/SaveButton';
import { FeaturesDescription } from '@/features/FeaturesDescription';
import { FeatureSection } from '@/features/types';
import { DeploymentFeatures } from '@/FeaturesEnums';
import { AwesomeCheckboxField } from '@/form/AwesomeCheckboxField';
import FormTable from '@/form/FormTable';
import { translate } from '@/i18n';
import { NoResult } from '@/navigation/header/search/NoResult';
import { useNotify } from '@/store/notify';
import { TableQuery } from '@/table/TableQuery';

import { useSettingsUrlSync } from './settings/useSettingsUrlSync';

// Plugin sections that will be grouped into a single "Plugins" tab
const PLUGIN_SECTION_KEYS = ['openstack', 'rancher'];

const FeatureSectionContent = ({ section }: { section: FeatureSection }) => (
  <FormTable>
    {section.items.map((item) => (
      <FormTable.Item
        key={item.key}
        description={
          <>
            {item.description}
            {`${section.key}.${item.key}` ===
            DeploymentFeatures.send_metrics ? (
              <div>
                <TelemetryExampleButton />
              </div>
            ) : null}
          </>
        }
        actions={
          <Field name={`${section.key}.${item.key}`} type="checkbox">
            {({ input }) => (
              <AwesomeCheckboxField
                input={input}
                data-testid={`${section.key}.${item.key}`}
              />
            )}
          </Field>
        }
      />
    ))}
  </FormTable>
);

const FeatureSectionPanel = ({
  section,
  hasItems,
}: {
  section: FeatureSection;
  hasItems: boolean;
}) => (
  <FormTable.Card
    title={section.description}
    className="card-bordered mb-5"
    key={section.key}
  >
    {hasItems ? (
      <FeatureSectionContent section={section} />
    ) : (
      <p className="text-muted p-5 mb-0">
        {translate('No matching features in this section.')}
      </p>
    )}
  </FormTable.Card>
);

// Build tabs: regular sections + grouped Plugins tab, sorted alphabetically
const FEATURES_TABS = [
  ...FeaturesDescription.filter(
    (section) => !PLUGIN_SECTION_KEYS.includes(section.key),
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
  const { activeKey, handleSelect, defaultActiveKey, params, state, router } =
    useSettingsUrlSync(FEATURES_TABS);

  const scrollRef = useRef<HTMLDivElement>(null);
  const [hiddenTabKeys, setHiddenTabKeys] = useState<Set<string>>(new Set());

  const updateOverflow = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const containerRect = el.getBoundingClientRect();
    const items = el.querySelectorAll('.nav-item');
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
    const tabEl = el.querySelector(
      `.nav-item:nth-child(${index + 1})`,
    ) as HTMLElement;
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
        .filter((s) => PLUGIN_SECTION_KEYS.includes(s.key))
        .reduce((sum, s) => sum + s.items.length, 0);
    }
    const section = filteredSections.find((s) => s.key === tabKey);
    return section?.items.length || 0;
  };

  const pluginSections = filteredSections.filter((s) =>
    PLUGIN_SECTION_KEYS.includes(s.key),
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
          <Card className="card-bordered">
            <Card.Header>
              <div className="d-flex flex-column">
                <Card.Title className="mb-0">
                  <h3>{translate('Features')}</h3>
                </Card.Title>
              </div>
              <div className="card-toolbar d-flex align-items-center gap-4 flex-nowrap">
                <TableQuery query={query} setQuery={setQuery} />
                <SaveButton
                  type="submit"
                  onClick={handleSubmit}
                  submitting={submitting}
                  dirty={dirty}
                />
              </div>
            </Card.Header>
            <Card.Body style={{ paddingTop: 8 }}>
              <Tab.Container
                defaultActiveKey={defaultActiveKey}
                activeKey={activeKey}
                onSelect={handleSelect}
              >
                <div
                  className="d-flex align-items-end gap-1"
                  style={{ borderBottom: '1px solid var(--bs-border-color)' }}
                >
                  <div
                    ref={scrollRef}
                    className="flex-grow-1"
                    style={{
                      overflowX: 'auto',
                      scrollbarWidth: 'none',
                      minWidth: 0,
                      paddingBottom: 2,
                      marginBottom: -2,
                    }}
                  >
                    <Nav
                      variant="tabs"
                      className="nav-line-tabs flex-nowrap border-bottom-0"
                      style={{ minWidth: 'max-content' }}
                    >
                      {FEATURES_TABS.map((tab) => {
                        const filteredCount = getFilteredCount(tab.key);
                        const hasMatches = filteredCount > 0;
                        return (
                          <Nav.Item
                            key={tab.key}
                            style={{ whiteSpace: 'nowrap' }}
                          >
                            <Nav.Link
                              eventKey={tab.key}
                              disabled={!hasMatches && !!query}
                              className={
                                !hasMatches && query ? 'text-muted' : ''
                              }
                            >
                              {tab.title}
                              {query && (
                                <Badge
                                  variant="secondary"
                                  size="sm"
                                  light
                                  className="ms-2"
                                >
                                  {filteredCount}
                                </Badge>
                              )}
                            </Nav.Link>
                          </Nav.Item>
                        );
                      })}
                    </Nav>
                  </div>
                  {hiddenTabKeys.size > 0 && (
                    <Dropdown
                      className="flex-shrink-0"
                      style={{ marginBottom: 2 }}
                      onToggle={updateOverflow}
                    >
                      <Dropdown.Toggle
                        variant="text-secondary"
                        className="btn-icon no-arrow w-35px h-35px"
                      >
                        <DotsThreeVerticalIcon size={22} weight="bold" />
                      </Dropdown.Toggle>
                      <Dropdown.Menu align="end">
                        <div className="mh-200px overflow-auto">
                          {FEATURES_TABS.filter((tab) =>
                            hiddenTabKeys.has(tab.key),
                          ).map((tab) => {
                            const filteredCount = getFilteredCount(tab.key);
                            const hasMatches = filteredCount > 0;
                            return (
                              <Dropdown.Item
                                key={tab.key}
                                active={tab.key === activeKey}
                                disabled={!hasMatches && !!query}
                                className="d-flex justify-content-between align-items-center"
                                onClick={() => {
                                  handleSelect(tab.key);
                                  scrollToTab(tab.key);
                                }}
                              >
                                {tab.title}
                                {query && (
                                  <Badge
                                    variant="default"
                                    size="sm"
                                    outline
                                    className="ms-2"
                                  >
                                    {filteredCount}
                                  </Badge>
                                )}
                              </Dropdown.Item>
                            );
                          })}
                        </div>
                      </Dropdown.Menu>
                    </Dropdown>
                  )}
                </div>
                {query && tabsWithMatches.length > 0 && (
                  <div className="d-flex align-items-center gap-2 pt-3 pb-4 flex-wrap border-bottom">
                    <span className="text-muted fs-7">
                      {translate('{count} results found in:', {
                        count: totalResults,
                      })}
                    </span>
                    {tabsWithMatches.map((tab) => (
                      <button
                        key={tab.key}
                        type="button"
                        className="btn btn-flush p-0"
                        onClick={() => handleSelect(tab.key)}
                      >
                        <Badge variant="default" size="sm" outline>
                          {tab.title} ({getFilteredCount(tab.key)})
                        </Badge>
                      </button>
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
                  <Tab.Content>
                    {FEATURES_TABS.map((tab) => {
                      if (tab.isPluginsTab) {
                        const hasAnyItems = pluginSections.some(
                          (s) => s.items.length > 0,
                        );
                        return (
                          <Tab.Pane key={tab.key} eventKey={tab.key}>
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
                          </Tab.Pane>
                        );
                      }

                      const section = filteredSections.find(
                        (s) => s.key === tab.key,
                      );
                      if (!section) return null;

                      return (
                        <Tab.Pane key={tab.key} eventKey={tab.key}>
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
                        </Tab.Pane>
                      );
                    })}
                  </Tab.Content>
                )}
              </Tab.Container>
            </Card.Body>
          </Card>
        </form>
      )}
    />
  );
};
