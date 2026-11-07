import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useLayoutEffect,
  useMemo,
  useState,
} from 'react';

import { downloadFile } from '@/form/upload/FileDownloader';
import { translate } from '@/i18n';
import { Call } from '@/proposals/types';
import { TableExportButton } from '@/table/TableExportButton';
import { TableFullExport, TableProps } from '@/table/types';

/** The whole validation as the server writes it, as a table's full export. */
const useValidationReport = (call: Call): TableFullExport =>
  useMemo(
    () => ({
      label: translate('Validation report'),
      description: translate(
        'PDF of the whole validation: check, roles, notifications, diagram, timeline.',
      ),
      format: 'pdf',
      errorMessage: translate('Unable to export the validation.'),
      download: ({ signal }) =>
        downloadFile(
          `${call.url}workflow-report/`,
          `${call.slug || call.uuid}-workflow.pdf`,
          signal,
        ),
    }),
    [call.url, call.slug, call.uuid],
  );

interface ExportSlot {
  /** Where in the panel's header a table puts its Export. */
  element: HTMLElement | null;
  report: TableFullExport;
  /** Says a table's Export is in the header; the returned call takes it
   * back. */
  claim(): () => void;
}

const ExportSlotContext = createContext<ExportSlot | null>(null);

/**
 * The Export at the end of a validation panel's header: the Export of the
 * table on show, with the validation report as its second choice of
 * content, or -- with no table on show -- the report alone. Either way one
 * button, where a table's Export always is.
 */
export const useValidationExport = (
  call: Call,
): { button: ReactNode; slot: ExportSlot } => {
  const report = useValidationReport(call);
  const [element, setElement] = useState<HTMLElement | null>(null);
  const [claims, setClaims] = useState(0);
  const claim = useCallback(() => {
    setClaims((count) => count + 1);
    return () => setClaims((count) => count - 1);
  }, []);
  const slot = useMemo<ExportSlot>(
    () => ({ element, report, claim }),
    [element, report, claim],
  );
  const button = (
    <>
      <span ref={setElement} className="contents" />
      {claims ? null : <TableExportButton fullExport={report} />}
    </>
  );
  return { button, slot };
};

/** Around a validation panel's content, with `useValidationExport`'s slot. */
export const ValidationExportProvider = ExportSlotContext.Provider;

/**
 * The props that give a table on a validation panel its Export, in the
 * panel's header; none anywhere else. A panel shows one table at a time.
 */
export const useValidationTableExport = (): Partial<TableProps> => {
  const slot = useContext(ExportSlotContext);
  const claim = slot?.claim;
  // Before paint, so the report-only Export does not flash first.
  useLayoutEffect(() => claim?.(), [claim]);
  return useMemo(
    () =>
      slot
        ? {
            enableExport: true,
            fullExport: slot.report,
            portal: { toolbar: slot.element ?? undefined },
          }
        : {},
    [slot],
  );
};
