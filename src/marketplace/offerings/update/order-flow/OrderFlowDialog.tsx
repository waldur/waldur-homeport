import { useCurrentStateAndParams, useRouter } from '@uirouter/react';
import { FC, useId, useMemo, useRef, useState } from 'react';
import {
  OrderFlowDescription,
  OrderFlowDescriptionOrderKindEnum,
  OrderFlowDescriptionOrdererEnum,
  OrderFlowSource,
  OrderFlowStep,
} from 'waldur-js-client';

import {
  Badge,
  BaseButton,
  Code,
  Select,
  Switch,
  useModalHide,
} from 'waldur-ui';

import { ExportButtons } from '@/core/diagram/ExportButtons';
import { paletteVars, useDiagramPalette } from '@/core/diagram/palette';
import { ScrollRegion } from '@/core/diagram/ScrollRegion';
import { LoadingErred } from '@/core/LoadingErred';
import { LoadingSpinner } from '@/core/LoadingSpinner';
import { translate } from '@/i18n';
import { ModalDialog } from '@/modal/ModalDialog';

import { OrderFlowDiagram } from './OrderFlowDiagram';
import { OrderFlowQuery, useOrderFlowDescription } from './queries';
import { settingLocation } from './settingLinks';
import {
  decidingRules,
  ruleOutcomeLabel,
  ruleShortLabel,
  sourceKindLabel,
  sourceValueLabel,
  stepStatusLabel,
  stepVerdictLine,
} from './text';
import { OrderFlowOffering } from './types';

import './OrderFlow.scss';

interface Option<T> {
  value: T;
  label: string;
  isDisabled?: boolean;
}

const SourceRow: FC<{
  source: OrderFlowSource;
  onOpen: (source: OrderFlowSource) => void;
}> = ({ source, onOpen }) => {
  const value = sourceValueLabel(source);
  const location = settingLocation(source);
  return (
    <li
      className="flex flex-wrap items-center gap-2"
      data-testid="order-flow-source"
      data-editable={source.editable}
    >
      <Badge variant={source.editable ? 'primary' : 'neutral'}>
        {sourceKindLabel(source)}
      </Badge>
      <Code>{source.field}</Code>
      {value ? <span className="text-tertiary">= {value}</span> : null}
      {location ? (
        <BaseButton
          variant="text-primary"
          size="sm"
          label={translate('Change')}
          onClick={() => onOpen(source)}
        />
      ) : source.editable ? null : (
        <span className="text-quaternary text-xs">
          {translate('Not editable on the offering')}
        </span>
      )}
    </li>
  );
};

const StepDetails: FC<{
  step: OrderFlowStep;
  description: OrderFlowDescription;
  onOpen: (source: OrderFlowSource) => void;
}> = ({ step, description, onOpen }) => {
  const checks =
    step.key === 'placed'
      ? description.checks.filter((check) => check.active)
      : [];
  const stats = description.stats;
  const [allRules, setAllRules] = useState(false);
  const relevant = decidingRules(step);
  const rules = allRules ? step.rules : relevant;
  const hidden = step.rules.length - relevant.length;
  return (
    <section
      className="mt-4 border border-secondary rounded-md p-4"
      aria-live="polite"
      data-testid="order-flow-step-details"
    >
      <div className="flex flex-wrap items-center gap-2 mb-2">
        <h3 className="text-sm font-semibold mb-0">{step.label}</h3>
        <Badge
          variant={
            step.status === 'runs'
              ? 'primary'
              : step.status === 'conditional'
                ? 'warning'
                : 'neutral'
          }
        >
          {stepStatusLabel(step.status)}
        </Badge>
      </div>
      <p className="text-secondary mb-3">{step.summary}</p>
      {step.rules.length ? (
        <>
          <div className="flex flex-wrap items-center gap-3 mb-2">
            <h4 className="text-sm font-semibold mb-0">
              {allRules
                ? translate('All rules, in the order they are asked')
                : translate('Rules that decide this step')}
            </h4>
            {hidden ? (
              <Switch
                label={translate('Show all rules ({count} more)', {
                  count: hidden,
                })}
                checked={allRules}
                onCheckedChange={setAllRules}
              />
            ) : null}
          </div>
          <ol className="list-decimal ps-5 mb-3 grid gap-3">
            {rules.map((rule) => (
              <li
                key={rule.key}
                className={
                  !rule.reached || rule.holds === false
                    ? 'text-quaternary'
                    : undefined
                }
                data-testid={`order-flow-rule-${rule.key}`}
              >
                <div className="font-medium">{ruleShortLabel(rule)}</div>
                <div className="text-sm">{rule.text}</div>
                <div className="text-xs mb-1">{ruleOutcomeLabel(rule)}</div>
                <ul className="list-none ps-0 grid gap-1 mb-0">
                  {rule.sources.map((source) => (
                    <SourceRow
                      key={`${source.kind}-${source.field}`}
                      source={source}
                      onOpen={onOpen}
                    />
                  ))}
                </ul>
              </li>
            ))}
          </ol>
        </>
      ) : null}
      {step.sources.length ? (
        <ul className="list-none ps-0 grid gap-1 mb-3">
          {step.sources.map((source) => (
            <SourceRow
              key={`${source.kind}-${source.field}`}
              source={source}
              onOpen={onOpen}
            />
          ))}
        </ul>
      ) : null}
      {checks.length ? (
        <>
          <h4 className="text-sm font-semibold mb-2">
            {translate('Checked when the order is placed')}
          </h4>
          <ul className="ps-5 grid gap-2 mb-3">
            {checks.map((check) => (
              <li key={check.key}>
                <div className="text-sm">{check.text}</div>
                <ul className="list-none ps-0 grid gap-1 mb-0">
                  {check.sources.map((source) => (
                    <SourceRow
                      key={`${source.kind}-${source.field}`}
                      source={source}
                      onOpen={onOpen}
                    />
                  ))}
                </ul>
              </li>
            ))}
          </ul>
        </>
      ) : null}
      {step.notes.length ? (
        <ul className="ps-5 text-sm text-tertiary mb-0">
          {step.notes.map((note) => (
            <li key={note}>{note}</li>
          ))}
        </ul>
      ) : null}
      {stats && step.key === 'placed' && stats.states.length ? (
        <p className="text-sm text-tertiary mt-3 mb-0">
          {translate('Orders of this kind now, by state: {states}', {
            states: stats.states
              .map((row) => `${row.state} ${row.count}`)
              .join(', '),
          })}
        </p>
      ) : null}
    </section>
  );
};

const Legend: FC = () => {
  const palette = useDiagramPalette();
  return (
    <ul
      className="order-flow-legend list-unstyled flex flex-wrap gap-3 text-xs text-quaternary mt-2.5 mb-0"
      style={paletteVars(palette)}
    >
      <li>
        <span className="legend-box" />
        {translate('Always happens')}
      </li>
      <li>
        <span className="legend-box legend-conditional" />
        {translate('Only for some orders')}
      </li>
      <li>
        <span className="legend-box legend-skipped" />
        {translate('Skipped')}
      </li>
      <li>
        <span className="legend-line legend-negative" />
        {translate('An order can end here')}
      </li>
    </ul>
  );
};

/**
 * How orders for the offering move from placement to done, for the order
 * kind and orderer picked, with the setting behind every branch. Changing
 * a setting happens where it lives: "Change" closes the dialog and opens
 * its section.
 */
export const OrderFlowDialog: FC<{
  resolve: { offering: OrderFlowOffering };
}> = ({ resolve: { offering } }) => {
  const [query, setQuery] = useState<OrderFlowQuery>({
    orderKind: 'create',
    orderer: 'any',
    withStats: false,
  });
  const [showSkipped, setShowSkipped] = useState(true);
  const [selected, setSelected] = useState<string>('consumer_review');
  const svgRef = useRef<SVGSVGElement>(null);
  const listId = useId();
  const hide = useModalHide();
  const router = useRouter();
  const { state, params } = useCurrentStateAndParams();
  const { data, isLoading, isError, refetch } = useOrderFlowDescription(
    offering.uuid,
    query,
  );

  const kindOptions = useMemo<Option<OrderFlowDescriptionOrderKindEnum>[]>(
    () =>
      (data?.order_kinds ?? []).map((kind) => ({
        value: kind.key as OrderFlowDescriptionOrderKindEnum,
        label: kind.supported ? kind.label : `${kind.label} — ${kind.reason}`,
        isDisabled: !kind.supported,
      })),
    [data?.order_kinds],
  );
  const ordererOptions = useMemo<Option<string>[]>(
    () =>
      (data?.orderers ?? []).map((orderer) => ({
        value: orderer.role ? `role:${orderer.role}` : orderer.kind,
        label: orderer.role
          ? translate('Holder of role: {role}', { role: orderer.label })
          : orderer.label,
      })),
    [data?.orderers],
  );
  const ordererValue =
    query.orderer === 'role' ? `role:${query.role}` : query.orderer;
  const step = data?.steps.find((s) => s.key === selected);

  const openSetting = (source: OrderFlowSource) => {
    const location = settingLocation(source);
    if (!location) return;
    hide();
    router.stateService.go(
      state,
      { ...params, tab: location.tab, section: location.section },
      { location: 'replace' },
    );
  };

  return (
    <ModalDialog
      title={translate('Order flow')}
      subtitle={translate(
        'How orders for {offering} move from placement to done, and which settings decide each step.',
        { offering: offering.name },
      )}
      footer={
        <ExportButtons
          getSvg={() => svgRef.current}
          name={`${offering.name} order flow`}
        />
      }
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
        <Select
          aria-label={translate('Order kind')}
          options={kindOptions}
          value={kindOptions.find((option) => option.value === query.orderKind)}
          onChange={(option: any) =>
            option && setQuery({ ...query, orderKind: option.value })
          }
          isOptionDisabled={(option: any) => Boolean(option.isDisabled)}
          isClearable={false}
          isSearchable={false}
        />
        <Select
          aria-label={translate('Ordered by')}
          options={ordererOptions}
          value={ordererOptions.find((option) => option.value === ordererValue)}
          onChange={(option: any) => {
            if (!option) return;
            const [kind, role] = String(option.value).split(':');
            setQuery({
              ...query,
              orderer: (role
                ? 'role'
                : kind) as OrderFlowDescriptionOrdererEnum,
              role: role || undefined,
            });
          }}
          isDisabled={query.orderKind === 'auto_terminate'}
          isClearable={false}
        />
        <div className="flex flex-col gap-2 justify-center">
          <Switch
            label={translate('Show current orders')}
            checked={query.withStats}
            onCheckedChange={(withStats) => setQuery({ ...query, withStats })}
          />
          <Switch
            label={translate('Show skipped steps')}
            checked={showSkipped}
            onCheckedChange={setShowSkipped}
          />
        </div>
      </div>
      {isLoading ? (
        <LoadingSpinner />
      ) : isError || !data ? (
        <LoadingErred loadData={refetch} />
      ) : (
        <>
          {!data.supported ? (
            <p className="text-warning mb-2">{data.reason}</p>
          ) : null}
          <ScrollRegion
            className="order-flow-scroll"
            label={translate('Order flow diagram')}
          >
            <OrderFlowDiagram
              description={data}
              showSkipped={showSkipped}
              selectedStep={selected}
              onSelectStep={(s) => setSelected(s.key)}
              svgRef={svgRef}
              describedBy={listId}
            />
          </ScrollRegion>
          {/* The drawing's text version, for a screen reader. */}
          <ol id={listId} className="sr-only">
            {data.steps.map((s) => (
              <li key={s.key}>
                {[
                  s.label,
                  stepStatusLabel(s.status),
                  stepVerdictLine(s),
                  decidingRules(s)
                    .map((rule) => rule.text)
                    .join(' '),
                ]
                  .filter(Boolean)
                  .join('. ')}
              </li>
            ))}
          </ol>
          <Legend />
          {step ? (
            <StepDetails
              key={step.key}
              step={step}
              description={data}
              onOpen={openSetting}
            />
          ) : null}
        </>
      )}
    </ModalDialog>
  );
};
