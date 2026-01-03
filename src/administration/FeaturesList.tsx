import { useMemo } from 'react';
import { Badge, Card, Nav, Tab } from 'react-bootstrap';
import { Field, Form } from 'react-final-form';
import { featureValues } from 'waldur-js-client';

import { TelemetryExampleButton } from '@waldur/administration/TelemetryExampleButton';
import { ENV } from '@waldur/core/config';
import { SaveButton } from '@waldur/core/SaveButton';
import { FeaturesDescription } from '@waldur/features/FeaturesDescription';
import { FeatureSection } from '@waldur/features/types';
import { DeploymentFeatures } from '@waldur/FeaturesEnums';
import { AwesomeCheckboxField } from '@waldur/form/AwesomeCheckboxField';
import FormTable from '@waldur/form/FormTable';
import { translate } from '@waldur/i18n';
import { useNotify } from '@waldur/store/hooks';
import { TableQuery } from '@waldur/table/TableQuery';

import { useSettingsUrlSync } from './settings/useSettingsUrlSync';

// Plugin sections that will be grouped into a single "Plugins" tab
const PLUGIN_SECTION_KEYS = ['openstack', 'rancher', 'slurm'];

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
          <Field
            name={`${section.key}.${item.key}`}
            component={AwesomeCheckboxField as any}
            data-testid={`${section.key}.${item.key}`}
          />
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

// Build tabs: regular sections + grouped Plugins tab
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
];

export const FeaturesList = () => {
  const { showErrorResponse, showSuccess } = useNotify();
  const { activeKey, handleSelect, defaultActiveKey, params, state, router } =
    useSettingsUrlSync(FEATURES_TABS);

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
            <Card.Body>
              <Tab.Container
                defaultActiveKey={defaultActiveKey}
                activeKey={activeKey}
                onSelect={handleSelect}
              >
                <Nav variant="tabs" className="nav-line-tabs mb-5">
                  {FEATURES_TABS.map((tab) => {
                    const filteredCount = getFilteredCount(tab.key);
                    const hasMatches = filteredCount > 0;
                    return (
                      <Nav.Item key={tab.key}>
                        <Nav.Link
                          eventKey={tab.key}
                          className={!hasMatches && query ? 'text-muted' : ''}
                        >
                          {tab.title}
                          {query && (
                            <Badge
                              bg={hasMatches ? 'light' : 'secondary'}
                              text={hasMatches ? 'dark' : 'white'}
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
                            <p className="text-muted">
                              {translate(
                                'No matching features in this section.',
                              )}
                            </p>
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
                          <p className="text-muted">
                            {translate('No matching features in this section.')}
                          </p>
                        )}
                      </Tab.Pane>
                    );
                  })}
                </Tab.Content>
              </Tab.Container>
            </Card.Body>
          </Card>
        </form>
      )}
    />
  );
};
