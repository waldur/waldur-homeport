import { useQuery } from '@tanstack/react-query';
import { FC, useMemo } from 'react';
import { marketplaceSlurmPeriodicUsagePoliciesPreviewImpact } from 'waldur-js-client';

import {
  AlertItem,
  Badge,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from 'waldur-ui';

import { FAST_STALE_TIME } from '@/core/constants';
import { LoadingSpinner } from '@/core/LoadingSpinner';
import { MermaidChart } from '@/core/MermaidChart';
import { translate } from '@/i18n';
import { CloseDialogButton } from '@/modal/CloseDialogButton';
import { ModalDialog } from '@/modal/ModalDialog';

interface SlurmPolicyConfig {
  limit_type?: string;
  tres_billing_enabled?: boolean;
  carryover_factor?: number;
  grace_ratio?: number;
  carryover_enabled?: boolean;
  raw_usage_reset?: boolean;
  apply_to_all?: boolean;
  actions?: string[];
  period?: number;
}

interface PlanAllocation {
  planName: string;
  components: {
    name: string;
    type: string;
    amount: number;
    measuredUnit: string;
  }[];
}

interface Props {
  resolve: {
    config: SlurmPolicyConfig;
    planAllocations: PlanAllocation[];
  };
}

const periodLabels: Record<number, string> = {
  1: 'Monthly',
  2: 'Quarterly',
  3: 'Semi-annual',
  4: 'Annual',
};

const limitTypeLabels: Record<string, string> = {
  GrpTRESMins: 'GrpTRESMins',
  MaxTRESMins: 'MaxTRESMins',
  GrpTRES: 'GrpTRES',
};

const getGracePercent = (graceRatio: number): number =>
  Math.round((1 + graceRatio) * 100);

const generateEndToEndFlowDiagram = (config: SlurmPolicyConfig): string => {
  const carryoverEnabled = config.carryover_enabled ?? false;
  const gracePercent = getGracePercent(config.grace_ratio ?? 0.2);

  return `
flowchart TB
    subgraph trigger["1. Trigger"]
        A[ComponentUsage created/updated] --> B[Django post_save signal]
        B --> C[Celery task queued]
    end
    subgraph evaluation["2. Evaluation"]
        C --> D["Get base allocation<br/>from resource limits"]
        D --> E{Carryover enabled?}
        E -->|Yes| F[Apply carryover factor]
        E -->|No| G[Use base allocation]
        F & G --> H[Calculate usage percentage]
    end
    subgraph decision["3. Decision"]
        H --> I{Usage level?}
        I -->|"&ge; ${gracePercent}%"| J[Pause resource]
        I -->|"&ge; 100%"| K[Downscale resource]
        I -->|"&ge; 80%"| L[Notify owners]
        I -->|"< 80%"| M[No action / recover]
    end
    subgraph execution["4. Execution"]
        J & K --> N[Generate SLURM settings]
        N --> O[Send STOMP message to site agent]
        O --> P[Site agent runs sacctmgr commands]
        P --> Q[Report result back to Waldur]
    end

    style E fill:${carryoverEnabled ? 'var(--status-success-bg-strong)' : 'var(--status-danger-bg-strong)'},color:var(--text-primary)
`;
};

const generateUsageCalculationDiagram = (config: SlurmPolicyConfig): string => {
  const carryoverEnabled = config.carryover_enabled ?? false;
  const carryoverPct = config.carryover_factor ?? 50;

  return `
flowchart LR
    A["Base allocation<br/>(from resource limits)"] --> B{Carryover?}
    B -->|"Carryover factor: ${carryoverPct}%"| C["unused = max(0, base &minus; prev_usage)"]
    C --> D["cap = ${carryoverPct}% &times; base"]
    D --> E["carryover = min(unused, cap)"]
    E --> F["Total = base + carryover"]
    B -->|Disabled| F
    F --> G["Usage % = current_usage / total &times; 100"]

    style B fill:${carryoverEnabled ? 'var(--status-success-bg-strong)' : 'var(--status-danger-bg-strong)'},color:var(--text-primary)
`;
};

const generateSiteAgentDiagram = (): string => `
sequenceDiagram
    participant W as Waldur MasterMind
    participant S as STOMP Broker
    participant A as Site Agent
    participant SLURM as SLURM Cluster

    W->>S: Publish periodic_limits message
    S->>A: Deliver message
    A->>SLURM: Execute sacctmgr commands
    SLURM-->>A: Command result
    A->>W: POST /report-command-result/
    W->>W: Update evaluation log
`;

const PreviewCommands: FC<{ config: SlurmPolicyConfig }> = ({ config }) => {
  const params = useMemo(
    () => ({
      allocation: 1000,
      grace_ratio: config.grace_ratio ?? 0.2,
      previous_usage: 600,
      carryover_factor: config.carryover_factor ?? 50,
      carryover_enabled: config.carryover_enabled ?? true,
    }),
    [config.grace_ratio, config.carryover_factor, config.carryover_enabled],
  );

  const { data, isLoading, error } = useQuery({
    queryKey: ['slurm-policy-preview-commands', params],
    queryFn: async () => {
      const response = await marketplaceSlurmPeriodicUsagePoliciesPreviewImpact(
        {
          body: params,
        },
      );
      return response.data;
    },
    staleTime: FAST_STALE_TIME,
  });

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (error || !data?.preview_commands?.length) {
    return (
      <p className="text-quaternary italic">
        {translate('Preview commands are not available.')}
      </p>
    );
  }

  return (
    <Table density="normal">
      <TableHeader>
        <TableRow>
          <TableHead>{translate('Type')}</TableHead>
          <TableHead>{translate('Description')}</TableHead>
          <TableHead>{translate('Shell command')}</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.preview_commands.map((cmd, idx) => (
          <TableRow key={idx}>
            <TableCell>
              <Badge variant="secondary" size="sm" shape="pill" tone="outline">
                {cmd.type}
              </Badge>
            </TableCell>
            <TableCell className="text-tertiary">{cmd.description}</TableCell>
            <TableCell>
              <code className="text-xs">{cmd.command}</code>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export const SlurmPolicySummaryDialog: FC<Props> = ({ resolve }) => {
  const { config, planAllocations } = resolve;
  const gracePercent = getGracePercent(config.grace_ratio ?? 0.2);
  const actions = config.actions ?? [];
  const limitType =
    limitTypeLabels[config.limit_type ?? 'GrpTRESMins'] ?? config.limit_type;
  const carryoverPct = config.carryover_factor ?? 50;
  const carryoverRatio = carryoverPct / 100;

  // Example values for the numerical walkthrough
  const exBase = 1000;
  const exPrevUsage = 600;
  const exUnused = Math.max(0, exBase - exPrevUsage);
  const exCap = carryoverRatio * exBase;
  const exCarryover = Math.min(exUnused, exCap);
  const exTotal = exBase + exCarryover;
  const exCurrentUsage = 700;
  const exUsagePercent = (exCurrentUsage / exTotal) * 100;

  const thresholds = [
    {
      threshold: translate('Notification'),
      condition: translate('Usage {sign} 80%', { sign: '\u2265' }),
      action: translate('Notify organization owners'),
      setting: 'notify_organization_owners',
    },
    {
      threshold: translate('Downscale'),
      condition: translate('Usage {sign} 100%', { sign: '\u2265' }),
      action: translate('Downscale resource (QoS slowdown)'),
      setting: 'request_slurm_resource_downscaling',
    },
    {
      threshold: translate('Pause'),
      condition: translate('Usage {sign} {percent}%', {
        sign: '\u2265',
        percent: gracePercent,
      }),
      action: translate('Pause resource (QoS blocked)'),
      setting: 'request_slurm_resource_pausing',
    },
    {
      threshold: translate('Recovery'),
      condition: translate('Usage drops below threshold'),
      action: translate('Auto-remove pause/downscale'),
      setting: null,
    },
  ];

  const configSummary = [
    {
      label: translate('Period'),
      value: periodLabels[config.period ?? 2] ?? String(config.period),
    },
    { label: translate('Limit type'), value: limitType },
    {
      label: translate('Grace ratio'),
      value: `${config.grace_ratio ?? 0.2} (${gracePercent}%)`,
    },
    {
      label: translate('Carryover'),
      value: config.carryover_enabled
        ? translate('Enabled')
        : translate('Disabled'),
      enabled: config.carryover_enabled,
    },
    {
      label: translate('Carryover factor'),
      value: `${carryoverPct}%`,
    },
    {
      label: translate('TRES billing'),
      value: config.tres_billing_enabled
        ? translate('Enabled')
        : translate('Disabled'),
      enabled: config.tres_billing_enabled,
    },
    {
      label: translate('Reset usage'),
      value: config.raw_usage_reset
        ? translate('Enabled')
        : translate('Disabled'),
      enabled: config.raw_usage_reset,
    },
    {
      label: translate('Apply to all'),
      value: config.apply_to_all ? translate('Yes') : translate('No'),
      enabled: config.apply_to_all,
    },
  ];

  return (
    <ModalDialog
      title={translate('How SLURM periodic usage policy works')}
      footer={<CloseDialogButton label={translate('Close')} />}
    >
      <div className="flex flex-col gap-6">
        {/* Section 1: End-to-end flow */}
        <section>
          <h4 className="mb-3">{translate('End-to-end flow')}</h4>
          <p className="text-quaternary mb-3">
            {translate(
              'When component usage is reported, the system evaluates the policy and takes action based on configured thresholds.',
            )}
          </p>
          <div className="border rounded p-3">
            <MermaidChart
              code={generateEndToEndFlowDiagram(config)}
              className="text-center"
            />
          </div>
        </section>

        {/* Section 2: Base allocation source */}
        <section>
          <h4 className="mb-3">{translate('Base allocation')}</h4>
          <p className="text-quaternary mb-3">
            {translate(
              'The base allocation for each TRES component is read from the resource limits (set at provisioning time from plan components). Each offering can define multiple components (e.g. cpu, mem, gpu, billing) — the policy evaluates limits per component.',
            )}
          </p>
          {planAllocations.length > 0 ? (
            <Table density="compact">
              <TableHeader>
                <TableRow>
                  <TableHead>{translate('Plan')}</TableHead>
                  <TableHead>{translate('Component')}</TableHead>
                  <TableHead>{translate('Type')}</TableHead>
                  <TableHead>{translate('Amount')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {planAllocations.flatMap((plan) =>
                  plan.components.map((comp, idx) => (
                    <TableRow key={`${plan.planName}-${idx}`}>
                      {idx === 0 ? (
                        <TableCell
                          className="font-medium"
                          rowSpan={plan.components.length}
                        >
                          {plan.planName}
                        </TableCell>
                      ) : null}
                      <TableCell className="text-tertiary">
                        {comp.name}
                      </TableCell>
                      <TableCell>
                        <code className="text-xs">{comp.type}</code>
                      </TableCell>
                      <TableCell className="text-tertiary">
                        {comp.amount.toLocaleString()} {comp.measuredUnit}
                      </TableCell>
                    </TableRow>
                  )),
                )}
              </TableBody>
            </Table>
          ) : (
            <p className="text-quaternary italic">
              {translate('No plans with components found for this offering.')}
            </p>
          )}
        </section>

        {/* Section 3: Usage calculation */}
        <section>
          <h4 className="mb-3">{translate('Usage calculation')}</h4>
          <p className="text-quaternary mb-3">
            {translate(
              'Usage percentage is calculated by comparing current consumption against the total available allocation, which may include carryover from the previous period.',
            )}
          </p>
          <div className="border rounded p-3">
            <MermaidChart
              code={generateUsageCalculationDiagram(config)}
              className="text-center"
            />
          </div>

          <h5 className="mt-5 mb-3">{translate('Carryover formula')}</h5>
          <p className="text-quaternary mb-1.5">
            {translate(
              'When carryover is enabled, unused allocation from the previous period carries over, capped at {pct}% of the base allocation:',
              { pct: carryoverPct },
            )}
          </p>
          <pre className="bg-tertiary dark:bg-quaternary rounded p-3 text-xs mb-3">
            {[
              `unused    = max(0, base − previous_usage)`,
              `cap       = ${carryoverPct}% × base`,
              `carryover = min(unused, cap)`,
              `total     = base + carryover`,
            ].join('\n')}
          </pre>

          <h5 className="mb-3">
            {translate('Numerical example with current settings')}
          </h5>
          <p className="text-quaternary mb-1.5">
            {translate(
              'Given base allocation of {base} Nh, previous usage of {prev} Nh, and current usage of {current} Nh:',
              {
                base: exBase,
                prev: exPrevUsage,
                current: exCurrentUsage,
              },
            )}
          </p>
          <Table density="compact">
            <TableBody>
              <TableRow>
                <TableCell className="font-medium w-[250px]">
                  {translate('Unused from previous period')}
                </TableCell>
                <TableCell>
                  <code>
                    max(0, {exBase} - {exPrevUsage}) = {exUnused.toFixed(0)} Nh
                  </code>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">
                  {translate('Carryover cap')}
                </TableCell>
                <TableCell>
                  <code>
                    {carryoverPct}% &times; {exBase} = {exCap.toFixed(0)} Nh
                  </code>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">
                  {translate('Carryover')}
                </TableCell>
                <TableCell>
                  <code>
                    min({exUnused.toFixed(0)}, {exCap.toFixed(0)}) ={' '}
                    {exCarryover.toFixed(0)} Nh
                  </code>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">
                  {translate('Total allocation')}
                </TableCell>
                <TableCell>
                  <code>
                    {exBase} + {exCarryover.toFixed(0)} = {exTotal.toFixed(0)}{' '}
                    Nh
                  </code>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">
                  {translate('Usage percentage')}
                </TableCell>
                <TableCell>
                  <code>
                    {exCurrentUsage} / {exTotal.toFixed(0)} &times; 100 ={' '}
                    {exUsagePercent.toFixed(1)}%
                  </code>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">
                  {translate('Result')}
                </TableCell>
                <TableCell>
                  {exUsagePercent < 80 ? (
                    <Badge variant="success" shape="pill" tone="outline">
                      {translate('No action')}
                    </Badge>
                  ) : exUsagePercent < 100 ? (
                    <Badge variant="warning" shape="pill" tone="outline">
                      {translate('Notification threshold')}
                    </Badge>
                  ) : exUsagePercent < gracePercent ? (
                    <Badge variant="danger" shape="pill" tone="outline">
                      {translate('Downscale threshold')}
                    </Badge>
                  ) : (
                    <Badge variant="danger" shape="pill" tone="outline">
                      {translate('Pause threshold')}
                    </Badge>
                  )}
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </section>

        {/* Section 4: Action thresholds */}
        <section>
          <h4 className="mb-3">{translate('Action thresholds')}</h4>
          <p className="text-quaternary mb-3">
            {translate(
              'Actions are triggered when usage crosses these thresholds. Each action can be independently enabled or disabled.',
            )}
          </p>

          <AlertItem
            variant="info"
            type="floating"
            className="mb-3"
            title={translate('Carryover vs Grace ratio')}
            body={
              <>
                <p className="mb-1.5">
                  <strong>{translate('Carryover factor')}</strong> (
                  {carryoverPct}
                  %):{' '}
                  {translate(
                    'Increases the total allocation at the start of a period by adding unused capacity from the previous period (capped at {pct}% of the base). This gives users a larger budget to work with.',
                    { pct: carryoverPct },
                  )}
                </p>
                <p className="mb-0">
                  <strong>{translate('Grace ratio')}</strong> (
                  {config.grace_ratio ?? 0.2}):{' '}
                  {translate(
                    'Allows temporary overconsumption beyond the total allocation before the resource is fully blocked. At 100% usage the resource is downscaled (slowed down), but it is not paused until {percent}%. This is an overdraft buffer, not extra allocation.',
                    { percent: gracePercent + '%' },
                  )}
                </p>
              </>
            }
          />
          <Table density="normal">
            <TableHeader>
              <TableRow>
                <TableHead>{translate('Threshold')}</TableHead>
                <TableHead>{translate('Condition')}</TableHead>
                <TableHead>{translate('Action')}</TableHead>
                <TableHead>{translate('Status')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {thresholds.map((row) => {
                const isEnabled =
                  row.setting === null || actions.includes(row.setting);
                return (
                  <TableRow key={row.threshold}>
                    <TableCell className="font-medium">
                      {row.threshold}
                    </TableCell>
                    <TableCell className="text-tertiary">
                      {row.condition}
                    </TableCell>
                    <TableCell className="text-tertiary">
                      {row.action}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={isEnabled ? 'success' : 'secondary'}
                        shape="pill"
                        tone="outline"
                      >
                        {isEnabled
                          ? translate('Enabled')
                          : translate('Disabled')}
                      </Badge>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </section>

        {/* Section 5: SLURM commands generated */}
        <section>
          <h4 className="mb-3">{translate('SLURM commands generated')}</h4>
          <p className="text-quaternary mb-3">
            {translate(
              'The site agent executes these sacctmgr commands on the SLURM cluster to enforce the policy. The commands below are generated from the current configuration using example values (allocation: 1000, previous usage: 600).',
            )}
          </p>
          <PreviewCommands config={config} />
        </section>

        {/* Section 6: Site agent communication */}
        <section>
          <h4 className="mb-3">{translate('Site agent communication')}</h4>
          <p className="text-quaternary mb-3">
            {translate(
              'Waldur communicates with the SLURM cluster through a STOMP message broker and the site agent.',
            )}
          </p>
          <div className="border rounded p-3">
            <MermaidChart
              code={generateSiteAgentDiagram()}
              className="text-center"
            />
          </div>
        </section>

        {/* Section 7: Multi-offering behavior */}
        <section>
          <h4 className="mb-3">
            {translate('Multiple offerings on same SLURM cluster')}
          </h4>
          <p className="text-quaternary mb-3">
            {translate(
              'When multiple Waldur offerings target the same SLURM cluster, each offering maps to a separate SLURM account. SLURM uses a hierarchical Fair Tree algorithm where usage propagates up the account tree.',
            )}
          </p>
          <Table density="compact">
            <TableHeader>
              <TableRow>
                <TableHead>{translate('Aspect')}</TableHead>
                <TableHead>{translate('Behavior')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell className="font-medium">
                  {translate('Fairshare')}
                </TableCell>
                <TableCell className="text-tertiary">
                  {translate(
                    'Each offering sets fairshare independently per account. SLURM calculates level_fs = shares_norm / usage_efctv within sibling accounts under the same parent.',
                  )}
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">
                  {translate('TRES limits')}
                </TableCell>
                <TableCell className="text-tertiary">
                  {translate(
                    '{limitType} is enforced per account at job submission time. Each offering controls its own account limits independently.',
                    { limitType },
                  )}
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">
                  {translate('QoS')}
                </TableCell>
                <TableCell className="text-tertiary">
                  {translate(
                    'QoS levels (normal/slowdown/blocked) are set per account. Different offerings can have different QoS states simultaneously.',
                  )}
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">
                  {translate('Usage tracking')}
                </TableCell>
                <TableCell className="text-tertiary">
                  {translate(
                    'SLURM raw usage is per-account but propagates to parent accounts. RawUsage=0 resets only the target account.',
                  )}
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </section>

        {/* Section 8: Current configuration summary */}
        <section>
          <h4 className="mb-3">{translate('Current configuration summary')}</h4>
          <Table density="normal">
            <TableBody>
              {configSummary.map((row) => (
                <TableRow key={row.label}>
                  <TableCell className="font-medium w-[200px]">
                    {row.label}
                  </TableCell>
                  <TableCell className="text-tertiary">
                    {'enabled' in row ? (
                      <Badge
                        variant={row.enabled ? 'success' : 'secondary'}
                        shape="pill"
                        tone="outline"
                      >
                        {row.value}
                      </Badge>
                    ) : (
                      row.value
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </section>
      </div>
    </ModalDialog>
  );
};
