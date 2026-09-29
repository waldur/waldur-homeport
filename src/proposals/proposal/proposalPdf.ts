import { RequestedResource, UserRoleDetails } from 'waldur-js-client';

import { formatDate, formatDateTime } from '@/core/dateUtils';
import { formatUsageValue } from '@/core/formatNumber';
import { decodeFileName } from '@/core/utils';
import { translate } from '@/i18n';
import {
  formatPrepaidMonths,
  getRequestedPrepaidMonths,
} from '@/proposals/prepaidDuration';
import { Proposal } from '@/proposals/types';
import { formatProposalState } from '@/proposals/utils';

/** The application as one document. Built in the browser so no PDF toolchain
 * enters the image; attachments are named, never embedded. */

const EMPTY = '—';

const value = (text?: string | number | null) =>
  text === null || text === undefined || text === '' ? EMPTY : String(text);

const field = (label: string, text?: string | number | null) => [
  { text: label, style: 'label' },
  { text: value(text) },
];

const definitionTable = (rows: object[][]) => ({
  table: { widths: [150, '*'], body: rows },
  layout: 'noBorders',
  margin: [0, 0, 0, 12] as [number, number, number, number],
});

const heading = (text: string) => ({
  text,
  style: 'heading',
  margin: [0, 12, 0, 6] as [number, number, number, number],
});

/** "Core hours: 2 400 000 h" per line. Grouped here but not in the CSV: this
 * is read, that is loaded into a spreadsheet. */
const requestedAmounts = (resource: RequestedResource): string[] => {
  const components = resource.requested_offering.components ?? [];
  const limits = resource.limits ?? {};
  const lines = Object.entries(limits)
    .filter(([, amount]) => amount !== null && amount !== undefined)
    .map(([type, amount]) => {
      const component = components.find((item) => item.type === type);
      const unit = component?.measured_unit
        ? ` ${component.measured_unit}`
        : '';
      return `${component?.name ?? type}: ${formatUsageValue(amount)}${unit}`;
    });
  return lines.length ? lines : [EMPTY];
};

const attachmentNames = (
  proposal: Proposal,
  resources: RequestedResource[],
): string[] => {
  const names = (proposal.supporting_documentation ?? [])
    .map((document) => document.file_name)
    .filter(Boolean);
  // A purchase order is an attachment too: named, not handed over.
  resources.forEach((resource) => {
    if (resource.attachment) {
      names.push(decodeFileName(resource.attachment));
    }
  });
  return names;
};

export const buildProposalDocument = (
  proposal: Proposal,
  resources: RequestedResource[],
  team: UserRoleDetails[],
) => {
  const content: object[] = [
    { text: proposal.name, style: 'title' },
    {
      text: [proposal.slug, proposal.call_name, proposal.round?.name]
        .filter(Boolean)
        .join(' · '),
      style: 'subtitle',
      margin: [0, 0, 0, 16],
    },
    heading(translate('Application')),
    definitionTable([
      field(translate('Proposal ID'), proposal.slug),
      field(translate('State'), formatProposalState(proposal.state)),
      field(translate('Applicant'), proposal.created_by_name),
      field(translate('Email'), proposal.applicant_email),
      field(translate('Organisation'), proposal.applicant_organization),
      field(translate('Science sub-domain'), proposal.science_sub_domain_name),
      field(translate('Created'), formatDateTime(proposal.created)),
    ]),
  ];

  if (proposal.project_summary) {
    content.push(heading(translate('Summary')), {
      text: proposal.project_summary,
      margin: [0, 0, 0, 12],
    });
  }
  if (proposal.description) {
    content.push(heading(translate('Description')), {
      text: proposal.description,
      margin: [0, 0, 0, 12],
    });
  }

  content.push(heading(translate('Requested resources')));
  content.push(
    resources.length
      ? {
          table: {
            headerRows: 1,
            widths: ['*', '*', 'auto', 'auto'],
            body: [
              [
                { text: translate('Offering'), style: 'tableHeader' },
                { text: translate('Requested'), style: 'tableHeader' },
                { text: translate('Period'), style: 'tableHeader' },
                { text: translate('Purchase order'), style: 'tableHeader' },
              ],
              ...resources.map((resource) => {
                const months = getRequestedPrepaidMonths(resource);
                return [
                  value(resource.requested_offering.offering_name),
                  { stack: requestedAmounts(resource) },
                  months ? formatPrepaidMonths(months) : EMPTY,
                  value(resource.purchase_order_reference),
                ];
              }),
            ],
          },
          margin: [0, 0, 0, 12],
        }
      : { text: translate('No resources requested.'), margin: [0, 0, 0, 12] },
  );

  content.push(heading(translate('Project team')));
  content.push(
    team.length
      ? {
          table: {
            headerRows: 1,
            widths: ['*', '*', 'auto'],
            body: [
              [
                { text: translate('Name'), style: 'tableHeader' },
                { text: translate('Email'), style: 'tableHeader' },
                { text: translate('Role'), style: 'tableHeader' },
              ],
              ...team.map((member) => [
                value(member.user_full_name || member.user_username),
                value(member.user_email),
                value(member.role_name),
              ]),
            ],
          },
          margin: [0, 0, 0, 12],
        }
      : { text: translate('No team members.'), margin: [0, 0, 0, 12] },
  );

  const attachments = attachmentNames(proposal, resources);
  content.push(heading(translate('Attachments')));
  content.push(
    attachments.length
      ? { ul: attachments }
      : { text: translate('No attachments.') },
  );

  return {
    content,
    footer: (currentPage: number, pageCount: number) => ({
      text: translate('{name} — page {current} of {total}, exported {date}', {
        name: proposal.slug || proposal.name,
        current: currentPage,
        total: pageCount,
        date: formatDate(new Date().toISOString()),
      }),
      style: 'footer',
      margin: [40, 10, 40, 0],
    }),
    styles: {
      title: { fontSize: 18, bold: true },
      subtitle: { fontSize: 10, color: '#6c757d' },
      heading: { fontSize: 13, bold: true },
      label: { bold: true },
      tableHeader: { bold: true, color: 'white', fillColor: '#2d4154' },
      footer: { fontSize: 8, color: '#6c757d' },
    },
    defaultStyle: { font: 'OpenSans', fontSize: 10 },
  };
};

export const downloadProposalPdf = async (
  proposal: Proposal,
  resources: RequestedResource[],
  team: UserRoleDetails[],
) => {
  // Large bundle: kept off the page until someone asks for a document.
  const [{ default: pdfmake }, { getFonts }, { saveFile }] = await Promise.all([
    import('pdfmake/build/pdfmake.min'),
    import('@/table/exporters/pdf'),
    import('@/table/exporters/saveFile'),
  ]);
  const pdf = pdfmake.createPdf(
    buildProposalDocument(proposal, resources, team),
    null,
    getFonts(),
  );
  await new Promise<void>((resolve) =>
    pdf.getBuffer((buffer) => {
      saveFile(
        new Blob([buffer], { type: 'application/pdf' }),
        `${proposal.slug || proposal.name}.pdf`,
      );
      resolve();
    }),
  );
};
