import { FileSvgIcon, ImageIcon } from '@phosphor-icons/react';
import { FC, useId, useMemo, useRef, useState } from 'react';
import { WorkflowDescription } from 'waldur-js-client';

import { BaseButton, Select, Switch } from 'waldur-ui';

import { translate } from '@/i18n';
import { useNotify } from '@/store/notify';

import { PanelHeaderControls } from '../PanelHeaderControls';
import { useCallWorkflowProgress } from '../queries';
import { OpenStep } from '../RoleMatrix';

import { describeDiagram, DiagramTextList } from './diagramText';
import { downloadPng, downloadSvg } from './exportSvg';
import { progressByStep, progressLegend } from './overlay';
import { paletteVars, useDiagramPalette } from './palette';
import { ScrollRegion } from './ScrollRegion';
import { SwimlaneDiagram, useDiagramLayout } from './SwimlaneDiagram';

import './WorkflowDiagram.scss';

export const ExportButtons: FC<{
  getSvg: () => SVGSVGElement | null;
  name: string;
}> = ({ getSvg, name }) => {
  const { showError } = useNotify();
  return (
    <>
      <BaseButton
        variant="tertiary"
        size="lg"
        label={translate('SVG')}
        iconNode={<FileSvgIcon weight="bold" />}
        onClick={() => {
          const svg = getSvg();
          if (svg) downloadSvg(svg, name);
        }}
      />
      <BaseButton
        variant="tertiary"
        size="lg"
        label={translate('PNG')}
        iconNode={<ImageIcon weight="bold" />}
        onClick={() => {
          const svg = getSvg();
          if (svg) {
            downloadPng(svg, name).catch((error) => showError(error.message));
          }
        }}
      />
    </>
  );
};

const Legend: FC<{ progress: boolean }> = ({ progress }) => {
  const palette = useDiagramPalette();
  return (
    <ul
      className="workflow-diagram-legend list-unstyled flex flex-wrap gap-3 text-xs text-quaternary mt-2.5 mb-0"
      style={paletteVars(palette)}
    >
      <li>
        <span className="legend-line" />
        {translate('Next stage')}
      </li>
      <li>
        <span className="legend-line legend-input" />
        {translate('Reads the outputs of')}
      </li>
      <li>
        <span className="legend-diamond" />
        {translate('Runs only if a condition holds')}
      </li>
      <li>
        <span className="legend-line legend-bypass" />
        {translate('Skipped when the condition does not hold')}
      </li>
      <li>
        <span className="legend-line legend-negative" />
        {translate('A negative outcome ends the proposal')}
      </li>
      <li>
        <span className="legend-line legend-change-request" />
        {translate('Changes may be requested of the applicant')}
      </li>
      <li>{translate('Eye: the applicant sees the step')}</li>
      <li>{translate('Dashed box: disabled step')}</li>
      {progress ? (
        <li className="flex items-center gap-1.5">
          {translate('Median against planned:')}
          {progressLegend(palette).map((item) => (
            <span key={item.label} className="inline-flex items-center">
              <span
                className="legend-swatch"
                style={{ backgroundColor: item.color }}
              />
              {item.label}
            </span>
          ))}
        </li>
      ) : null}
    </ul>
  );
};

/**
 * The workflow as a swimlane diagram: who completes each step, stage by
 * stage, and where outcomes lead. On a running call, each step can carry
 * how its proposals are moving through it.
 */
export const WorkflowDiagramPanel: FC<{
  description: WorkflowDescription;
  name: string;
  /** A call's: progress can be overlaid. */
  callUuid?: string;
  onOpenStep?: OpenStep;
  showDisabled?: boolean;
}> = ({ description, name, callUuid, onOpenStep, showDisabled }) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const listId = useId();
  const layout = useDiagramLayout(description, showDisabled);
  const steps = useMemo(() => describeDiagram(layout), [layout]);
  const [showProgress, setShowProgress] = useState(false);
  const [roundUuid, setRoundUuid] = useState<string | null>(null);
  const { data: progress, isError } = useCallWorkflowProgress(
    callUuid ?? '',
    roundUuid,
    Boolean(callUuid) && showProgress,
  );
  const overlay = useMemo(
    () => (showProgress ? progressByStep(progress) : undefined),
    [showProgress, progress],
  );
  const roundOptions = useMemo(
    () => [
      { value: null, label: translate('All rounds') },
      ...(progress?.rounds ?? []).map((round) => ({
        value: round.uuid,
        label: round.name || round.uuid,
      })),
    ],
    [progress],
  );
  return (
    <div data-testid="workflow-diagram-panel">
      <PanelHeaderControls className="flex flex-wrap items-center gap-2.5 mb-2.5">
        {callUuid ? (
          <Switch
            label={translate('Show progress')}
            checked={showProgress}
            onCheckedChange={setShowProgress}
          />
        ) : null}
        {showProgress && progress ? (
          <div className="min-w-[200px]">
            <Select
              aria-label={translate('Round')}
              options={roundOptions}
              value={roundOptions.find((option) => option.value === roundUuid)}
              onChange={(option: any) => setRoundUuid(option?.value ?? null)}
              isClearable={false}
              isSearchable={false}
            />
          </div>
        ) : null}
        {showProgress && progress ? (
          <span className="text-quaternary text-xs">
            {translate('{count} proposals in the workflow', {
              count: progress.proposals,
            })}
          </span>
        ) : null}
        {showProgress && isError ? (
          <span className="text-danger text-xs">
            {translate('Progress could not be loaded.')}
          </span>
        ) : null}
        <div className="ms-auto flex gap-1.5">
          <ExportButtons getSvg={() => svgRef.current} name={name} />
        </div>
      </PanelHeaderControls>
      <ScrollRegion
        className="workflow-diagram-scroll"
        label={translate('Workflow diagram')}
      >
        <SwimlaneDiagram
          description={description}
          showDisabled={showDisabled}
          onOpenStep={onOpenStep}
          progress={overlay}
          svgRef={svgRef}
          describedBy={steps.length ? listId : undefined}
        />
      </ScrollRegion>
      {steps.length ? (
        // The drawing's text version, for a screen reader: the step list
        // and the role matrix show the same to the eye.
        <DiagramTextList id={listId} steps={steps} className="sr-only" />
      ) : null}
      <Legend progress={Boolean(overlay)} />
    </div>
  );
};
