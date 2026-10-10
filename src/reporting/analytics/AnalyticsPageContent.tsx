import { FC } from 'react';
import { Card } from 'react-bootstrap';

import { Tabs, TabsContent, TabsList, TabsTrigger } from 'waldur-ui';

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
    <Tabs
      value={activeMode}
      onValueChange={(k) => setActiveMode(k as AnalyticsMode)}
    >
      <Card className="card-bordered">
        <Card.Header className="border-bottom-0">
          <TabsList scrollable>
            {capability.supportedModes.map((mode) => (
              <TabsTrigger
                key={mode}
                value={mode}
                hint={modeConfig[mode].description}
              >
                {modeConfig[mode].label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Card.Header>

        <Card.Body>
          <TabsContent value={activeMode}>
            {activeMode === 'what-if' &&
              supportsWhatIf &&
              capability.simulationParams &&
              capability.calculateSimulation && (
                <WhatIfSimulator
                  params={capability.simulationParams}
                  calculate={capability.calculateSimulation}
                  data={data}
                />
              )}

            {activeMode === 'why-so' &&
              supportsWhySo &&
              capability.initialDimension && (
                <WhySoDrillDown
                  initialData={drillDownData}
                  initialDimension={capability.initialDimension}
                  valueLabel={capability.whySoValueLabel}
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
          </TabsContent>
        </Card.Body>
      </Card>
    </Tabs>
  );
};
