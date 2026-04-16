/**
 * Multi-sheet Excel export for ProjectUsageReport and ProjectStorageReport.
 *
 * Uses the same JSZip-based XLSX approach as @waldur/table/exporters/excel,
 * extended to support multiple worksheets.
 *
 * Usage report sheets:
 *   "Mappings"            — Type | Display Name | Identifier  [if nameMaps provided]
 *   "Project members"     — Project name | Project identifier | User name | User identifier
 *   "Daily totals"        — Date | Total usage (h) | Total jobs | Avg wait (min)
 *   "Monthly totals"      — Month | Total usage (h) | Total jobs | Avg wait (min)
 *   "Usage by project"    — Date | <project>... | Total (h)  [multi-project only]
 *   "Jobs by project"     — Date | <project>... | Total      [multi-project only]
 *   "Wait by project"     — Date | <project>... | Total avg  [multi-project only]
 *   "Usage by user"       — Date | <user>... | Total (h)
 *   "Jobs by user"        — Date | <user>... | Total
 *   "Wait by user"        — Date | <user>... | Total avg (min)
 *   "Comp <name>"         — one per component, Date | <user>... | Total (h)
 *
 * Storage report sheets:
 *   "Snapshot"            — Type | User | Volume | Usage | Limit | % Used
 *   "Daily user totals"   — Date | <user>... | Total (GB)
 *   "Monthly user totals" — Month | <user>... | Total (GB)
 *   "Vol <name>"          — one per volume, Date | Project (GB) | <user>... (GB)
 */

import JSZip from 'jszip';
import type { ProjectAccountingSummary } from 'waldur-js-client';

import { translate } from '@waldur/i18n';
import { SharedStrings, getSheetData } from '@waldur/table/exporters/excel';
import { saveFile } from '@waldur/table/exporters/saveFile';

import { ProjectStorageReport } from './ProjectStorageReport';
import { ProjectUsageReport } from './ProjectUsageReport';
import { secondsToHours } from './storage';
import { isDayWaitSpurious, NameMaps } from './usageChartOptions';

// ── XML escaping ─────────────────────────────────────────────────────────────

const esc = (s: string) =>
  String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

// ── Styles XML (same as the single-sheet exporter) ───────────────────────────

const STYLES_XML =
  '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
  '<styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">' +
  '<numFmts count="1">' +
  '<numFmt numFmtId="164" formatCode="yyyy-mm-dd hh:mm:ss"/>' +
  '</numFmts>' +
  '<fonts count="1"><font><sz val="11"/><name val="Calibri"/></font></fonts>' +
  '<fills count="2"><fill><patternFill patternType="none"/></fill><fill><patternFill patternType="gray125"/></fill></fills>' +
  '<borders count="1"><border><left/><right/><top/><bottom/><diagonal/></border></borders>' +
  '<cellXfs count="4">' +
  '<xf numFmtId="0" fontId="0" fillId="0" borderId="0"/>' +
  '<xf numFmtId="164" fontId="0" fillId="0" borderId="0" applyNumberFormat="1"/>' +
  '<xf numFmtId="0" fontId="0" fillId="0" borderId="0" applyAlignment="1"><alignment wrapText="1"/></xf>' +
  '<xf numFmtId="164" fontId="0" fillId="0" borderId="0" applyNumberFormat="1" applyAlignment="1"><alignment wrapText="1"/></xf>' +
  '</cellXfs>' +
  '</styleSheet>';

// ── Sheet XML builder ─────────────────────────────────────────────────────────

interface SheetSpec {
  name: string;
  rows: any[][];
}

function buildSheetXml(ss: SharedStrings, rows: any[][]): string {
  const colCount = rows.length > 0 ? rows[0].length : 0;
  let cols = '<cols>';
  for (let i = 1; i <= colCount; i++) {
    const w = i === 1 ? 13 : 16;
    cols += `<col min="${i}" max="${i}" width="${w}" customWidth="1"/>`;
  }
  cols += '</cols>';

  return (
    '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
    '<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" ' +
    'xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">' +
    cols +
    '<sheetData>' +
    getSheetData(ss, rows) +
    '</sheetData>' +
    '</worksheet>'
  );
}

// ── Multi-sheet XLSX builder ──────────────────────────────────────────────────

async function downloadMultiSheetExcel(
  filename: string,
  sheets: SheetSpec[],
  onProgress?: (current: number, total: number) => void,
): Promise<void> {
  const zip = new JSZip();
  const ss = new SharedStrings();

  // [Content_Types].xml
  const overrides = sheets
    .map(
      (_, i) =>
        `<Override PartName="/xl/worksheets/sheet${i + 1}.xml" ` +
        `ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml" />`,
    )
    .join('');
  zip.file(
    '[Content_Types].xml',
    '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
      '<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">' +
      '<Default Extension="xml" ContentType="application/xml" />' +
      '<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml" />' +
      '<Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml" />' +
      '<Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/>' +
      '<Override PartName="/xl/sharedStrings.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sharedStrings+xml"/>' +
      overrides +
      '</Types>',
  );

  // _rels/.rels
  zip.file(
    '_rels/.rels',
    '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
      '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">' +
      '<Relationship Id="rId1" ' +
      'Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" ' +
      'Target="xl/workbook.xml"/>' +
      '</Relationships>',
  );

  // xl/workbook.xml
  const sheetEls = sheets
    .map(
      (s, i) =>
        `<sheet name="${esc(s.name)}" sheetId="${i + 1}" r:id="rId${i + 1}"/>`,
    )
    .join('');
  zip.file(
    'xl/workbook.xml',
    '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
      '<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" ' +
      'xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">' +
      '<sheets>' +
      sheetEls +
      '</sheets>' +
      '</workbook>',
  );

  // xl/_rels/workbook.xml.rels
  const n = sheets.length;
  const sheetRels = sheets
    .map(
      (_, i) =>
        `<Relationship Id="rId${i + 1}" ` +
        `Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" ` +
        `Target="worksheets/sheet${i + 1}.xml"/>`,
    )
    .join('');
  zip.file(
    'xl/_rels/workbook.xml.rels',
    '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
      '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">' +
      sheetRels +
      `<Relationship Id="rId${n + 1}" ` +
      `Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/sharedStrings" ` +
      `Target="sharedStrings.xml"/>` +
      `<Relationship Id="rId${n + 2}" ` +
      `Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" ` +
      `Target="styles.xml"/>` +
      '</Relationships>',
  );

  // worksheets
  for (let i = 0; i < sheets.length; i++) {
    if (onProgress) onProgress(i + 1, sheets.length);
    // Small yield to allow React to re-render the progress
    await new Promise((r) => setTimeout(r, 0));
    zip.file(
      `xl/worksheets/sheet${i + 1}.xml`,
      buildSheetXml(ss, sheets[i].rows),
    );
  }

  zip.file('xl/sharedStrings.xml', ss.serialize());
  zip.file('xl/styles.xml', STYLES_XML);

  const blob = await zip.generateAsync({
    type: 'blob',
    mimeType:
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });
  saveFile(blob, filename);
}

// ── Usage report ─────────────────────────────────────────────────────────────

function buildUsageSheets(
  reports: ProjectUsageReport[],
  nameMaps?: NameMaps,
): SheetSpec[] {
  // Combine all reports for the per-day/per-user sheets
  const report =
    reports.length === 1 ? reports[0] : ProjectUsageReport.combine(reports);

  const dates = report.dates;
  const users = report.localUsers(); // full local_username e.g. "chris.aiproject"
  const components = report.componentNames();

  // Resolve user display names
  const userLabels = users.map((u) => {
    const uid = report.localToIdentifier[u];
    return uid && nameMaps?.user?.[uid] ? nameMaps.user[uid] : u;
  });

  const round2 = (n: number) => +n.toFixed(2);

  // ── Sheet 1: Daily totals ─────────────────────────────────────────────────
  const dailyTotals: any[][] = [
    [
      translate('Date'),
      translate('Total usage (h)'),
      translate('Total jobs'),
      translate('Avg wait (min)'),
    ],
    ...dates.map((date) => {
      const daily = report.getReport(date);
      if (!daily) return [date, 0, 0, ''];
      const totalH = round2(secondsToHours(daily.totalUsage().seconds));
      const totalJobs = daily.numJobs;
      const avgWait =
        totalJobs > 0 && !isDayWaitSpurious(daily.totalWaitSeconds, totalJobs)
          ? Math.round(daily.totalWaitSeconds / totalJobs / 60)
          : '';
      return [date, totalH, totalJobs, avgWait];
    }),
  ];

  // ── Sheet 2: Monthly totals ───────────────────────────────────────────────
  const months = [...new Set(dates.map((d) => d.slice(0, 7)))].sort();
  const monthlyTotals: any[][] = [
    [
      translate('Month'),
      translate('Total usage (h)'),
      translate('Total jobs'),
      translate('Avg wait (min)'),
    ],
    ...months.map((month) => {
      const monthDates = dates.filter((d) => d.startsWith(month));
      let totalSec = 0;
      let totalJobs = 0;
      let totalWaitSec = 0;
      for (const date of monthDates) {
        const daily = report.getReport(date);
        if (!daily) continue;
        totalSec += daily.totalUsage().seconds;
        totalJobs += daily.numJobs;
        if (!isDayWaitSpurious(daily.totalWaitSeconds, daily.numJobs))
          totalWaitSec += daily.totalWaitSeconds;
      }
      return [
        month,
        round2(secondsToHours(totalSec)),
        totalJobs,
        totalJobs > 0 ? Math.round(totalWaitSec / totalJobs / 60) : '',
      ];
    }),
  ];

  // ── Sheet 3: Usage by user (hours) ───────────────────────────────────────
  const usageByUser: any[][] = [
    [translate('Date'), ...userLabels, translate('Total (h)')],
    ...dates.map((date) => {
      const daily = report.getReport(date);
      const vals = users.map((u) =>
        round2(
          secondsToHours((daily?.usageForUser(u) ?? { seconds: 0 }).seconds),
        ),
      );
      return [date, ...vals, round2(vals.reduce((s, v) => s + v, 0))];
    }),
  ];

  // ── Sheet 4: Jobs by user ─────────────────────────────────────────────────
  const jobsByUser: any[][] = [
    [translate('Date'), ...userLabels, translate('Total')],
    ...dates.map((date) => {
      const daily = report.getReport(date);
      const vals = users.map((u) => daily?.userJobCounts[u] ?? 0);
      return [date, ...vals, vals.reduce((s, v) => s + v, 0)];
    }),
  ];

  // ── Sheet 5: Average wait by user (minutes) ───────────────────────────────
  const waitByUser: any[][] = [
    [translate('Date'), ...userLabels, translate('Total avg (min)')],
    ...dates.map((date) => {
      const daily = report.getReport(date);
      const vals = users.map((u) => {
        if (!daily) return '';
        const jobs = daily.userJobCounts[u] ?? 0;
        const waitSec = daily.userWaitSeconds[u] ?? 0;
        return jobs > 0 && !isDayWaitSpurious(waitSec, jobs)
          ? Math.round(waitSec / jobs / 60)
          : '';
      });
      const totalJobs = daily?.numJobs ?? 0;
      const totalWaitSec = daily?.totalWaitSeconds ?? 0;
      const avgAll =
        totalJobs > 0 && !isDayWaitSpurious(totalWaitSec, totalJobs)
          ? Math.round(totalWaitSec / totalJobs / 60)
          : '';
      return [date, ...vals, avgAll];
    }),
  ];

  // ── Per-project sheets (only when multiple distinct projects) ─────────────
  // Built before per-user sheets so they appear first in the workbook.
  const distinctProjects = [...new Set(reports.map((r) => r.project))].sort();
  const projectLabels = distinctProjects.map(
    (p) => nameMaps?.project?.[p] ?? p,
  );
  const projectSheets: SheetSpec[] = [];
  if (distinctProjects.length > 1) {
    // Build a map: project → combined report for that project
    const byProject = new Map<string, ProjectUsageReport>();
    for (const r of reports) {
      const existing = byProject.get(r.project);
      byProject.set(
        r.project,
        existing ? ProjectUsageReport.combine([existing, r]) : r,
      );
    }

    const allDates = [...new Set(reports.flatMap((r) => r.dates))].sort();

    // Usage by project (daily)
    const usageByProject: any[][] = [
      [translate('Date'), ...projectLabels, translate('Total (h)')],
      ...allDates.map((date) => {
        const vals = distinctProjects.map((proj) => {
          const pr = byProject.get(proj);
          if (!pr) return 0;
          const daily = pr.getReport(date);
          return round2(daily ? secondsToHours(daily.totalUsage().seconds) : 0);
        });
        return [date, ...vals, round2(vals.reduce((s, v) => s + v, 0))];
      }),
    ];

    // Jobs by project (daily)
    const jobsByProject: any[][] = [
      [translate('Date'), ...projectLabels, translate('Total')],
      ...allDates.map((date) => {
        const vals = distinctProjects.map((proj) => {
          const pr = byProject.get(proj);
          if (!pr) return 0;
          return pr.getReport(date)?.numJobs ?? 0;
        });
        return [date, ...vals, vals.reduce((s, v) => s + v, 0)];
      }),
    ];

    // Wait by project (daily)
    const waitByProject: any[][] = [
      [translate('Date'), ...projectLabels, translate('Total avg (min)')],
      ...allDates.map((date) => {
        const vals = distinctProjects.map((proj) => {
          const pr = byProject.get(proj);
          if (!pr) return '';
          const daily = pr.getReport(date);
          if (!daily || daily.numJobs === 0) return '';
          if (isDayWaitSpurious(daily.totalWaitSeconds, daily.numJobs))
            return '';
          return Math.round(daily.totalWaitSeconds / daily.numJobs / 60);
        });
        let grandJobs = 0;
        let grandWait = 0;
        for (const proj of distinctProjects) {
          const daily = byProject.get(proj)?.getReport(date);
          if (
            !daily ||
            isDayWaitSpurious(daily.totalWaitSeconds, daily.numJobs)
          )
            continue;
          grandJobs += daily.numJobs;
          grandWait += daily.totalWaitSeconds;
        }
        return [
          date,
          ...vals,
          grandJobs > 0 ? Math.round(grandWait / grandJobs / 60) : '',
        ];
      }),
    ];

    projectSheets.push({
      name: translate('Usage by project'),
      rows: usageByProject,
    });
    projectSheets.push({
      name: translate('Jobs by project'),
      rows: jobsByProject,
    });
    projectSheets.push({
      name: translate('Wait by project'),
      rows: waitByProject,
    });
  }

  const sheets: SheetSpec[] = [
    { name: translate('Daily totals'), rows: dailyTotals },
    { name: translate('Monthly totals'), rows: monthlyTotals },
    ...projectSheets,
    { name: translate('Usage by user'), rows: usageByUser },
    { name: translate('Jobs by user'), rows: jobsByUser },
    { name: translate('Wait by user'), rows: waitByUser },
  ];

  // ── Per-component sheets ──────────────────────────────────────────────────
  for (const comp of components) {
    const compRows: any[][] = [
      [translate('Date'), ...userLabels, translate('Total (h)')],
      ...dates.map((date) => {
        const daily = report.getReport(date);
        const vals = users.map((u) =>
          round2(
            secondsToHours(
              (daily?.componentUsageForUser(comp, u) ?? { seconds: 0 }).seconds,
            ),
          ),
        );
        return [date, ...vals, round2(vals.reduce((s, v) => s + v, 0))];
      }),
    ];
    sheets.push({
      name: translate('Comp {name}', { name: comp }).slice(0, 31),
      rows: compRows,
    });
  }

  // ── Project members sheet ────────────────────────────────────────────────
  const memberRows: any[][] = [
    [
      translate('Project name'),
      translate('Project identifier'),
      translate('User name'),
      translate('User identifier'),
    ],
  ];
  for (const projId of [...new Set(reports.map((r) => r.project))].sort()) {
    const projName = nameMaps?.project?.[projId] ?? projId;
    // Collect all users across every monthly report for this project
    const userMap: Record<string, string> = {}; // userId → localUsername
    for (const r of reports) {
      if (r.project !== projId) continue;
      for (const [uid, local] of Object.entries(r.users)) {
        userMap[uid] = local;
      }
    }
    for (const [uid, local] of Object.entries(userMap).sort(([, a], [, b]) =>
      a.localeCompare(b),
    )) {
      memberRows.push([projName, projId, nameMaps?.user?.[uid] ?? local, uid]);
    }
  }
  sheets.unshift({ name: translate('Project members'), rows: memberRows });

  // ── Mappings sheet (identifier → display name) ───────────────────────────
  if (nameMaps) {
    const mappingRows: any[][] = [
      [translate('Type'), translate('Display Name'), translate('Identifier')],
    ];
    if (nameMaps.offering) {
      for (const [id, name] of Object.entries(nameMaps.offering)) {
        mappingRows.push([translate('Offering'), name, id]);
      }
    }
    if (nameMaps.project) {
      for (const [id, name] of Object.entries(nameMaps.project)) {
        mappingRows.push([translate('Project'), name, id]);
      }
    }
    if (nameMaps.user) {
      // Build reverse map: UserIdentifier → local_username for display
      const localToUid = report.localToIdentifier;
      for (const [id, name] of Object.entries(nameMaps.user)) {
        const localUser =
          Object.entries(localToUid).find(([, uid]) => uid === id)?.[0] ?? id;
        mappingRows.push([translate('User'), name, localUser]);
      }
    }
    if (mappingRows.length > 1) {
      sheets.unshift({ name: translate('Mappings'), rows: mappingRows });
    }
  }

  return sheets;
}

export async function downloadUsageExcel(
  reports: ProjectUsageReport[],
  title: string,
  nameMaps?: NameMaps,
  onProgress?: (current: number, total: number) => void,
): Promise<void> {
  const sheets = buildUsageSheets(reports, nameMaps);
  await downloadMultiSheetExcel(`${title}.xlsx`, sheets, onProgress);
}

// ── Storage report ────────────────────────────────────────────────────────────

const GB = 1024 ** 3;
// 6 decimal places: precise to ~1 KB, prevents small values rounding to zero
const toGB = (bytes: number) => +(bytes / GB).toFixed(6);

function buildStorageSheets(
  report: ProjectStorageReport,
  nameMaps?: NameMaps,
): SheetSpec[] {
  const uids = report.userIdentifiers();
  // Use mapped full_name if available, otherwise local_username
  const displayNames = uids.map(
    (uid) => nameMaps?.user?.[uid] ?? report.users[uid] ?? uid,
  );
  const dates = report.dates;
  const volumes = report.volumes();

  // ── Sheet 1: Snapshot — current quota state per user/volume ──────────────
  const snapshotRows: any[][] = [
    [
      translate('Type'),
      translate('User'),
      translate('Volume'),
      translate('Usage (GB)'),
      translate('Limit (GB)'),
      translate('% Used'),
    ],
  ];
  for (const [vol, q] of Object.entries(report.projectQuotas)) {
    snapshotRows.push([
      translate('Project'),
      '-',
      vol,
      toGB(q.usageBytes),
      isFinite(q.limitBytes) ? toGB(q.limitBytes) : '',
      +(q.usedFraction * 100).toFixed(1),
    ]);
  }
  for (const uid of uids) {
    const displayName = nameMaps?.user?.[uid] ?? report.users[uid] ?? uid;
    for (const [vol, q] of Object.entries(report.quotaForUser(uid))) {
      snapshotRows.push([
        translate('User'),
        displayName,
        vol,
        toGB(q.usageBytes),
        isFinite(q.limitBytes) ? toGB(q.limitBytes) : '',
        +(q.usedFraction * 100).toFixed(1),
      ]);
    }
  }

  // ── Sheet 2: Daily user totals (GB) ──────────────────────────────────────
  const dailyTotals: any[][] = [
    [translate('Date'), ...displayNames, translate('Total (GB)')],
    ...dates.map((date) => {
      const daily = report.getReport(date);
      let totalBytes = 0;
      const vals = uids.map((uid) => {
        if (!daily) return 0;
        const bytes = Object.values(daily.userQuotas[uid] ?? {}).reduce(
          (s, q) => s + q.usageBytes,
          0,
        );
        totalBytes += bytes;
        return toGB(bytes);
      });
      return [date, ...vals, toGB(totalBytes)];
    }),
  ];

  // ── Sheet 3: Monthly user totals (last reading per month) ─────────────────
  const allMonths = [...new Set(dates.map((d) => d.slice(0, 7)))].sort();
  const monthlyTotals: any[][] = [
    [translate('Month'), ...displayNames, translate('Total (GB)')],
    ...allMonths.map((month) => {
      const monthDates = dates.filter((d) => d.startsWith(month));
      const lastDate = monthDates[monthDates.length - 1];
      const daily = report.getReport(lastDate);
      let totalBytes = 0;
      const vals = uids.map((uid) => {
        if (!daily) return 0;
        const bytes = Object.values(daily.userQuotas[uid] ?? {}).reduce(
          (s, q) => s + q.usageBytes,
          0,
        );
        totalBytes += bytes;
        return toGB(bytes);
      });
      return [month, ...vals, toGB(totalBytes)];
    }),
  ];

  const sheets: SheetSpec[] = [
    { name: translate('Snapshot'), rows: snapshotRows },
    { name: translate('Daily user totals'), rows: dailyTotals },
    { name: translate('Monthly user totals'), rows: monthlyTotals },
  ];

  // ── Per-volume sheets ─────────────────────────────────────────────────────
  for (const vol of volumes) {
    const volRows: any[][] = [
      [translate('Date'), translate('Project (GB)'), ...displayNames],
      ...dates.map((date) => {
        const daily = report.getReport(date);
        const projectGB = toGB(daily?.projectQuotas[vol]?.usageBytes ?? 0);
        const userVals = uids.map((uid) =>
          toGB(daily?.userQuotas[uid]?.[vol]?.usageBytes ?? 0),
        );
        return [date, projectGB, ...userVals];
      }),
    ];
    sheets.push({
      name: translate('Vol {name}', { name: vol }).slice(0, 31),
      rows: volRows,
    });
  }

  // ── Mappings sheet ────────────────────────────────────────────────────────
  if (nameMaps) {
    const mappingRows: any[][] = [
      [translate('Type'), translate('Display Name'), translate('Identifier')],
    ];
    if (nameMaps.offering) {
      for (const [id, name] of Object.entries(nameMaps.offering)) {
        mappingRows.push([translate('Offering'), name, id]);
      }
    }
    if (nameMaps.user) {
      for (const [uid, name] of Object.entries(nameMaps.user)) {
        mappingRows.push([translate('User'), name, report.users[uid] ?? uid]);
      }
    }
    if (mappingRows.length > 1) {
      sheets.unshift({ name: translate('Mappings'), rows: mappingRows });
    }
  }

  return sheets;
}

export async function downloadStorageExcel(
  report: ProjectStorageReport,
  title: string,
  nameMaps?: NameMaps,
  onProgress?: (current: number, total: number) => void,
): Promise<void> {
  const sheets = buildStorageSheets(report, nameMaps);
  await downloadMultiSheetExcel(`${title}.xlsx`, sheets, onProgress);
}

// ── Allocation summary ────────────────────────────────────────────────────────

const parseNum = (v: string) => parseFloat(v) || 0;

const addDaysLocal = (d: Date, days: number): Date => {
  const out = new Date(d);
  out.setDate(out.getDate() + days);
  return out;
};

const toDateStrLocal = (d: Date): string => d.toISOString().slice(0, 10);

const daysBetweenLocal = (a: Date, b: Date): number =>
  Math.round((b.getTime() - a.getTime()) / 86_400_000);

function buildAllocationSheets(
  summaries: ProjectAccountingSummary[],
  currencyName: string,
): SheetSpec[] {
  const round2 = (n: number) => +n.toFixed(2);

  // ── Sheet 1: Summary ──────────────────────────────────────────────────────
  const summaryRows: any[][] = [
    [
      translate('Project'),
      translate('Start date'),
      translate('End date'),
      translate('Total {currency} awarded', { currency: currencyName }),
      translate('Total {currency} spent', { currency: currencyName }),
      translate('Remaining {currency}', { currency: currencyName }),
    ],
    ...summaries.map((s) => {
      const spent = parseNum(s.total_spend) + parseNum(s.current_month_spend);
      const remaining = round2(parseNum(s.total_credits) - spent);
      return [
        s.project_name,
        s.start_date ?? '',
        s.end_date ?? '',
        round2(parseNum(s.total_credits)),
        round2(spent),
        remaining,
      ];
    }),
  ];

  const sheets: SheetSpec[] = [
    { name: translate('Summary'), rows: summaryRows },
  ];

  // ── Sheet 2: Burn-down ────────────────────────────────────────────────────
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const eligible = summaries.filter((s) => {
    if (!s.end_date) return false;
    const end = new Date(s.end_date);
    end.setHours(0, 0, 0, 0);
    return end > today;
  });

  if (eligible.length > 0) {
    const endDates = eligible.map((s) => {
      const d = new Date(s.end_date!);
      d.setHours(0, 0, 0, 0);
      return d;
    });
    const maxEnd = new Date(Math.max(...endDates.map((d) => d.getTime())));

    const projectNames = eligible.map((s) => s.project_name);

    // Pre-compute per-project remaining / totalDays
    const projectData = eligible.map((s) => {
      const remaining =
        parseNum(s.total_credits) -
        parseNum(s.total_spend) -
        parseNum(s.current_month_spend);
      const end = new Date(s.end_date!);
      end.setHours(0, 0, 0, 0);
      const totalDays = Math.max(1, daysBetweenLocal(today, end));
      return { remaining, end, totalDays };
    });

    const remainingAt = (
      pd: (typeof projectData)[0],
      refDate: Date,
    ): number => {
      if (refDate >= pd.end) return 0;
      const daysLeft = pd.totalDays - daysBetweenLocal(today, refDate);
      return round2(Math.max(0, (pd.remaining * daysLeft) / pd.totalDays));
    };

    // ── Daily burn-down sheet ─────────────────────────────────────────────
    const dates: string[] = [];
    for (let i = 0; ; i++) {
      const d = addDaysLocal(today, i);
      if (d >= maxEnd) break;
      dates.push(toDateStrLocal(d));
    }

    const burnRows: any[][] = [
      [
        translate('Date'),
        ...projectNames,
        translate('Total {currency} remaining', { currency: currencyName }),
      ],
      ...dates.map((dateStr) => {
        const d = new Date(dateStr);
        const vals = projectData.map((pd) => remainingAt(pd, d));
        return [dateStr, ...vals, round2(vals.reduce((s, v) => s + v, 0))];
      }),
    ];
    sheets.push({ name: translate('Burn-down (daily)'), rows: burnRows });

    // ── Monthly burn-down sheet ───────────────────────────────────────────
    // Sample remaining at the last day of each month (capped before maxEnd).
    const monthRows: any[][] = [
      [
        translate('Month'),
        ...projectNames,
        translate('Total {currency} remaining', { currency: currencyName }),
      ],
    ];
    const cursor = new Date(today.getFullYear(), today.getMonth(), 1);
    cursor.setHours(0, 0, 0, 0);
    while (cursor < maxEnd) {
      const monthLabel = toDateStrLocal(cursor).slice(0, 7);
      const monthEnd = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 0);
      monthEnd.setHours(0, 0, 0, 0);
      const refDate = monthEnd < maxEnd ? monthEnd : addDaysLocal(maxEnd, -1);
      const vals = projectData.map((pd) => remainingAt(pd, refDate));
      monthRows.push([
        monthLabel,
        ...vals,
        round2(vals.reduce((s, v) => s + v, 0)),
      ]);
      cursor.setMonth(cursor.getMonth() + 1);
    }
    sheets.push({ name: translate('Burn-down (monthly)'), rows: monthRows });

    // ── Consumption (daily) sheet ─────────────────────────────────────────
    const consumptionDailyRows: any[][] = [
      [
        translate('Date'),
        ...projectNames,
        translate('Total {currency} / day', { currency: currencyName }),
      ],
      ...dates.map((dateStr) => {
        const d = new Date(dateStr);
        const vals = projectData.map((pd) => {
          if (d >= pd.end) return 0;
          return round2(Math.max(0, pd.remaining) / pd.totalDays);
        });
        return [dateStr, ...vals, round2(vals.reduce((s, v) => s + v, 0))];
      }),
    ];
    sheets.push({
      name: translate('Consumption (daily)'),
      rows: consumptionDailyRows,
    });

    // ── Consumption (monthly) sheet ───────────────────────────────────────
    const consumptionMonthRows: any[][] = [
      [
        translate('Month'),
        ...projectNames,
        translate('Total {currency} / month', { currency: currencyName }),
      ],
    ];
    const consumptionCursor = new Date(
      today.getFullYear(),
      today.getMonth(),
      1,
    );
    consumptionCursor.setHours(0, 0, 0, 0);
    while (consumptionCursor < maxEnd) {
      const monthLabel = toDateStrLocal(consumptionCursor).slice(0, 7);
      const monthEnd = new Date(
        consumptionCursor.getFullYear(),
        consumptionCursor.getMonth() + 1,
        0,
      );
      monthEnd.setHours(0, 0, 0, 0);
      const vals = projectData.map((pd) => {
        const activeStart =
          consumptionCursor >= today ? consumptionCursor : today;
        const projectLastDay = addDaysLocal(pd.end, -1);
        const activeEnd =
          projectLastDay <= monthEnd ? projectLastDay : monthEnd;
        const activeDays =
          activeEnd >= activeStart
            ? daysBetweenLocal(activeStart, activeEnd) + 1
            : 0;
        return round2((Math.max(0, pd.remaining) / pd.totalDays) * activeDays);
      });
      consumptionMonthRows.push([
        monthLabel,
        ...vals,
        round2(vals.reduce((s, v) => s + v, 0)),
      ]);
      consumptionCursor.setMonth(consumptionCursor.getMonth() + 1);
    }
    sheets.push({
      name: translate('Consumption (monthly)'),
      rows: consumptionMonthRows,
    });
  }

  return sheets;
}

export async function downloadAllocationExcel(
  summaries: ProjectAccountingSummary[],
  currencyName: string,
  title: string,
  onProgress?: (current: number, total: number) => void,
): Promise<void> {
  const sheets = buildAllocationSheets(summaries, currencyName);
  await downloadMultiSheetExcel(`${title}.xlsx`, sheets, onProgress);
}

export function downloadJson(data: any, title: string): void {
  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: 'application/json',
  });
  saveFile(blob, `${title}.json`);
}
