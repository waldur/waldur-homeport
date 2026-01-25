import { FlaskIcon, LightbulbIcon } from '@phosphor-icons/react';
import { FC } from 'react';
import { Card, Nav, Tab } from 'react-bootstrap';

import { AnalyticsCapability, AnalyticsMode, DrillDownDataItem } from './types';
import { WhatIfSimulator } from './WhatIfSimulator';
import { WhySoDrillDown } from './WhySoDrillDown';

interface AnalyticsPageContentProps {
  activeMode: AnalyticsMode;
  setActiveMode: (mode: AnalyticsMode) => void;
  capability: AnalyticsCapability;
  data: unknown;
  drillDownData: DrillDownDataItem[];
  modeConfig: Record<AnalyticsMode, { label: string; description: string }>;
}

/**
 * Shared content component for analytics pages.
 * Renders the tabbed card with What-if and Why-so analysis panels.
 */
export const AnalyticsPageContent: FC<AnalyticsPageContentProps> = ({
  activeMode,
  setActiveMode,
  capability,
  data,
  drillDownData,
  modeConfig,
}) => {
  const supportsWhatIf = capability.supportedModes.includes('what-if');
  const supportsWhySo = capability.supportedModes.includes('why-so');

  return (
    <Card className="card-bordered">
      <Card.Header className="border-bottom-0">
        <Tab.Container
          activeKey={activeMode}
          onSelect={(k) => setActiveMode(k as AnalyticsMode)}
        >
          <Nav variant="tabs" className="nav-line-tabs">
            {capability.supportedModes.map((mode) => {
              const config = modeConfig[mode];
              return (
                <Nav.Item key={mode}>
                  <Nav.Link
                    as="button"
                    eventKey={mode}
                    className="d-flex align-items-center gap-2"
                  >
                    {mode === 'what-if' && <FlaskIcon weight="bold" />}
                    {mode === 'why-so' && <LightbulbIcon weight="bold" />}
                    {config.label}
                  </Nav.Link>
                </Nav.Item>
              );
            })}
          </Nav>
        </Tab.Container>
      </Card.Header>

      <Card.Body>
        <div className="mb-6 pb-4 border-bottom">
          <p className="text-muted mb-0">
            {modeConfig[activeMode].description}
          </p>
        </div>

        {activeMode === 'what-if' &&
          supportsWhatIf &&
          capability.simulationParams &&
          capability.calculateSimulation && (
            <WhatIfSimulator
              params={capability.simulationParams}
              calculate={capability.calculateSimulation}
              data={data}
              dataSource={capability.whatIfDataSource}
              dataSourceDescription={capability.whatIfDataSourceDescription}
            />
          )}

        {activeMode === 'why-so' &&
          supportsWhySo &&
          capability.initialDimension && (
            <WhySoDrillDown
              initialData={drillDownData}
              initialDimension={capability.initialDimension}
              dataSource={capability.whySoDataSource}
              dataSourceDescription={capability.whySoDataSourceDescription}
              onDrillDown={async (item, currentDimension) => {
                const path = capability.drillDownPaths?.find(
                  (p) => p.from === currentDimension,
                );
                if (path?.fetchData) {
                  const fetchedData = await path.fetchData(item.id);
                  return { data: fetchedData, dimension: path.to };
                }
                return null;
              }}
            />
          )}
      </Card.Body>
    </Card>
  );
};
