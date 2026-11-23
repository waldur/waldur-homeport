# waldur-charts

Charts shared by the portal (`src/`) and the micro-apps (`apps/*`): the
ECharts build, its light and dark themes, the chart colours, and the view
that draws a backend `ChartSpec` (the charts the assistant, HPC Insights and
AI inference Trends send as data).

## What is here

| Module             | What it holds                                                                                |
| ------------------ | -------------------------------------------------------------------------------------------- |
| `echarts.ts`       | The tree-shaken ECharts build (`waldur-charts/echarts`), loaded on first use                 |
| `themes.ts`        | The `light-metronic` and `dark-metronic` themes, registered with that build                  |
| `chartColors.ts`   | `getChartThemeColors`, `useChartThemeColors`, categorical colours and the saturation ramp    |
| `chartSpecOptions` | A `ChartSpec` as ECharts options: series, tones, annotations, tooltips                       |
| `EChartCanvas`     | An ECharts chart and nothing else: follows its container's size and the theme                |
| `ChartSpecView`    | A `ChartSpec` with its title, subtitle and empty message, drawn by `EChartCanvas` by default |

## Rules

- **No router, no store, no `@/` imports.** The theme comes in as a prop
  (`'light'` or `'dark'`), and the brand colour is read from the page's
  `--brand-color`.
- **The portal adds its own chrome on top.** `src/core/charts/ChartSpecView`
  passes the portal's `EChart`, which has the export menu, as `Chart`; the
  portal's `src/echarts` and `src/dashboard/chartColors` re-export from here.
