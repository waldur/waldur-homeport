import { FC, useMemo, useState } from 'react';
import { ToggleButton, ToggleButtonGroup } from 'react-bootstrap';

import { Badge } from '@/core/Badge';
import { EChart } from '@/core/EChart';
import { generateBrandColors } from '@/core/generateColors';
import { getBrandColor } from '@/core/utils';
import { useChartThemeColors } from '@/dashboard/chartColors';
import { translate } from '@/i18n';

import { MixBanner } from '../MixBanner';
import { ComponentRow, detectMix } from '../mixDetection';

interface Props {
  components: ComponentRow[];
}

type SizeMode = 'usage' | 'limit' | 'pct';

interface Node {
  name: string;
  value: number;
  children?: Node[];
  itemStyle?: any;
  // Stored for tooltip rendering.
  _meta?: {
    level: string;
    label: string;
    detail?: string;
  };
}

function rowValue(r: ComponentRow, mode: SizeMode): number {
  if (mode === 'limit') return r.limit ?? 0;
  if (mode === 'pct') {
    if (!r.limit || r.limit <= 0) return 0;
    const used = r.billing_type === 'limit' ? r.limit_usage || 0 : r.usage || 0;
    return Math.round((used / r.limit) * 1000) / 10;
  }
  return r.billing_type === 'limit' ? r.limit_usage || 0 : r.usage || 0;
}

function buildHierarchy(
  rows: ComponentRow[],
  mode: SizeMode,
  brandColors: Record<string, string>,
): Node[] {
  // Group offering -> billing_type -> component_type so that mixed shops
  // (D/E) get a clear visual partition between usage and limit children.
  const offerings = new Map<string, ComponentRow[]>();
  for (const r of rows) {
    const arr = offerings.get(r.offering_uuid) ?? [];
    arr.push(r);
    offerings.set(r.offering_uuid, arr);
  }

  const offeringNodes: Node[] = [];
  let i = 0;
  for (const [, list] of offerings) {
    const offeringName = list[0].offering_name;
    const billingGroups = new Map<string, ComponentRow[]>();
    for (const r of list) {
      const arr = billingGroups.get(r.billing_type) ?? [];
      arr.push(r);
      billingGroups.set(r.billing_type, arr);
    }
    const children: Node[] = [];
    for (const [bt, list2] of billingGroups) {
      const leafChildren: Node[] = list2.map((r) => {
        const v = rowValue(r, mode);
        return {
          // Prefix the level so the breadcrumb (and rectangle label) is
          // unambiguous: a reader who lands on "Compute" can't tell whether
          // it's an offering, billing class, or component without the prefix.
          name: `${translate('Component')}: ${r.name}`,
          value: v,
          _meta: {
            level: translate('Component'),
            label: r.name,
            detail: `${r.measured_unit} · ${
              r.billing_type === 'limit'
                ? `${translate('Limit-based')} · ${r.current_period_label ?? ''}`
                : translate('Usage-based')
            }`,
          },
        };
      });
      const sum = leafChildren.reduce((a, c) => a + c.value, 0);
      const billingLabel =
        bt === 'limit' ? translate('Limit-based') : translate('Usage-based');
      children.push({
        name: `${translate('Billing')}: ${billingLabel}`,
        value: sum,
        children: leafChildren,
        _meta: { level: translate('Billing'), label: billingLabel },
        itemStyle: {
          color: bt === 'limit' ? brandColors[400] : brandColors[200],
        },
      });
    }
    const sumOffering = children.reduce((a, c) => a + c.value, 0);
    offeringNodes.push({
      name: `${translate('Offering')}: ${offeringName}`,
      value: sumOffering,
      children,
      _meta: { level: translate('Offering'), label: offeringName },
      itemStyle: {
        color: brandColors[String(300 + (i % 3) * 100)] ?? brandColors['300'],
      },
    });
    i++;
  }
  return offeringNodes;
}

export const TreemapView: FC<Props> = ({ components }) => {
  const mix = useMemo(() => detectMix(components), [components]);
  const [mode, setMode] = useState<SizeMode>(mix.hasLimit ? 'pct' : 'usage');

  const brandColors = useMemo(() => generateBrandColors(getBrandColor()), []);
  // Treemap gaps, breadcrumb and labels are drawn on canvas, so they need
  // resolved colors rather than CSS variables — and they must follow the theme.
  const colors = useChartThemeColors();

  const data = useMemo(
    () => buildHierarchy(components ?? [], mode, brandColors),
    [components, mode, brandColors],
  );

  if (!components?.length) return null;

  // Disable %-of-limit mode in pure usage scenarios (A) — there is nothing to
  // normalize against. We keep the toggle visible but prevent the bad mode.
  const disablePct = !mix.hasLimit;

  const tooltipFormatter = (info: any) => {
    const meta = info?.data?._meta;
    const v = info.value;
    const unit = mode === 'pct' ? '%' : '';
    const label = meta?.label ?? info.name;
    const levelChip = meta?.level
      ? `<span style="display:inline-block;background:${colors.track};color:${colors.muted};padding:1px 6px;border-radius:8px;font-size:10px;margin-right:4px">${meta.level}</span>`
      : '';
    const detail = meta?.detail ? `<br/><small>${meta.detail}</small>` : '';
    return `${levelChip}<strong>${label}</strong><br/>${
      mode === 'pct' ? translate('Saturation') : translate('Size')
    }: ${v}${unit}${detail}`;
  };

  const options = {
    tooltip: {
      formatter: tooltipFormatter,
    },
    series: [
      {
        type: 'treemap',
        roam: false,
        nodeClick: 'zoomToNode',
        breadcrumb: {
          show: true,
          top: 0,
          itemStyle: {
            color: colors.track,
            borderColor: colors.border,
            textStyle: { color: colors.text },
          },
        },
        label: {
          show: true,
          formatter: (info: any) => {
            const v = info.value ?? 0;
            const unit = mode === 'pct' ? '%' : '';
            return `${info.name}\n${v}${unit}`;
          },
          textStyle: { fontSize: 11, color: colors.text },
        },
        upperLabel: { show: true, height: 20 },
        levels: [
          {
            itemStyle: {
              borderColor: colors.surface,
              borderWidth: 4,
              gapWidth: 4,
            },
          },
          {
            itemStyle: {
              borderColor: colors.surface,
              borderWidth: 2,
              gapWidth: 2,
            },
            colorSaturation: [0.35, 0.6],
          },
          {
            itemStyle: {
              borderColor: colors.surface,
              borderWidth: 1,
              gapWidth: 1,
            },
          },
        ],
        data,
      },
    ],
  };

  return (
    <>
      <MixBanner
        mix={mix}
        groupedBy={translate(
          'offering → billing_type → component (3-level hierarchy)',
        )}
        normalization={
          mode === 'pct'
            ? translate('rectangle area = % of limit consumed')
            : mode === 'limit'
              ? translate('rectangle area = configured limit (cap)')
              : translate('rectangle area = absolute usage in measured_unit')
        }
        scenarioNote={
          mix.code === 'C' || mix.code === 'E'
            ? translate(
                'Caution: rectangle areas mix periods (e.g., monthly vs annual caps). Use the % toggle to normalize, or read areas only within the same period.',
              )
            : undefined
        }
      />
      <div className="d-flex flex-wrap align-items-center gap-3 mb-2">
        <div className="d-flex align-items-center gap-1 small">
          <span className="text-secondary fw-medium">
            {translate('Levels')}:
          </span>
          <Badge
            variant="indigo"
            light
            roundless
            tooltip={translate('Top-level rectangles — one per offering')}
          >
            {translate('Offering')}
          </Badge>
          <span className="text-secondary">›</span>
          <Badge
            variant="warning"
            light
            roundless
            tooltip={translate(
              'Inside each offering — usage-based vs limit-based components',
            )}
          >
            {translate('Billing type')}
          </Badge>
          <span className="text-secondary">›</span>
          <Badge
            variant="success"
            light
            roundless
            tooltip={translate('Leaf rectangles — one per OfferingComponent')}
          >
            {translate('Component')}
          </Badge>
        </div>
        <small className="text-secondary">{translate('Size by')}:</small>
        <ToggleButtonGroup
          type="radio"
          name="treemap-mode"
          value={mode}
          onChange={(v) => setMode(v as SizeMode)}
          size="sm"
        >
          <ToggleButton id="tm-usage" value="usage" variant="tertiary">
            {translate('Usage')}
          </ToggleButton>
          <ToggleButton
            id="tm-limit"
            value="limit"
            variant="tertiary"
            disabled={!mix.hasLimit}
          >
            {translate('Limit')}
          </ToggleButton>
          <ToggleButton
            id="tm-pct"
            value="pct"
            variant="tertiary"
            disabled={disablePct}
          >
            {translate('% of limit')}
          </ToggleButton>
        </ToggleButtonGroup>
        {disablePct && (
          <small className="text-muted">
            {translate(
              '“% of limit” is disabled because no limits exist on these offerings.',
            )}
          </small>
        )}
      </div>
      <EChart options={options} height="420px" width="100%" />
    </>
  );
};
