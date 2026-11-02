import { WarningCircleIcon } from '@phosphor-icons/react';
import { FC } from 'react';

import { AccordionCard, PropertyList, PropertyItem } from 'waldur-ui';

import { translate } from '@/i18n';
import { propVal } from '@/property/propertyFields';

import type { QueryPerformance } from './api';

interface DatabaseQueryPerformanceCardProps {
  data: QueryPerformance;
}

const TEMP_FILES_WARNING_BYTES = 100 * 1024 * 1024; // 100MB

export const DatabaseQueryPerformanceCard: FC<
  DatabaseQueryPerformanceCardProps
> = ({ data }) => {
  const hasTempFilesWarning = data.temp_files_bytes > TEMP_FILES_WARNING_BYTES;
  const totalScans = data.seq_scan_count + data.index_scan_count;
  const seqScanRatio =
    totalScans > 0 ? (data.seq_scan_count / totalScans) * 100 : 0;
  const hasHighSeqScans = seqScanRatio > 50;

  return (
    <AccordionCard
      id="database-query-performance"
      title={translate('Query performance')}
      subtitle={translate('Scan statistics and temp file usage')}
      defaultOpen={hasTempFilesWarning || hasHighSeqScans}
      className="mb-5"
    >
      <PropertyList
        variant="compact"
        className="grid grid-cols-1 lg:grid-cols-2 gap-x-5"
      >
        <PropertyList.Section
          title={translate('Scan statistics')}
          description={
            hasHighSeqScans ? (
              <span className="text-warning">
                {translate(
                  'High sequential scan ratio ({ratio}%). Consider adding indexes.',
                  { ratio: seqScanRatio.toFixed(1) },
                )}
              </span>
            ) : undefined
          }
        >
          <PropertyItem
            label={translate('Sequential scans')}
            value={propVal.count(data.seq_scan_count)}
            valueClass={hasHighSeqScans ? 'text-warning' : undefined}
          />
          <PropertyItem
            label={translate('Rows fetched')}
            labelClass="ps-3"
            value={propVal.count(data.seq_scan_rows)}
            valueClass="text-quaternary"
          />
          <PropertyItem
            label={translate('Index scans')}
            value={propVal.count(data.index_scan_count)}
            valueClass="text-success"
          />
          <PropertyItem
            label={translate('Rows fetched')}
            labelClass="ps-3"
            value={propVal.count(data.index_scan_rows)}
            valueClass="text-quaternary"
          />
        </PropertyList.Section>
        <PropertyList.Section
          title={translate('Temporary files')}
          description={
            hasTempFilesWarning ? (
              <span className="text-danger">
                {translate(
                  'Large temp files indicate queries exceeding work_mem. Consider increasing it.',
                )}
              </span>
            ) : undefined
          }
        >
          <PropertyItem
            label={
              <>
                {translate('Files created')}
                {data.temp_files_count > 0 && (
                  <WarningCircleIcon
                    size={16}
                    weight="bold"
                    className="text-warning ms-1.5"
                  />
                )}
              </>
            }
            value={propVal.count(data.temp_files_count)}
            valueClass={data.temp_files_count > 0 ? 'text-warning' : undefined}
          />
          <PropertyItem
            label={translate('Total size')}
            value={propVal.fileSize(data.temp_files_bytes)}
            valueClass={hasTempFilesWarning ? 'text-danger' : undefined}
          />
        </PropertyList.Section>
      </PropertyList>
    </AccordionCard>
  );
};
