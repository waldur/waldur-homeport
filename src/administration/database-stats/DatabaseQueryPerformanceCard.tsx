import { WarningCircleIcon } from '@phosphor-icons/react';
import { FC } from 'react';
import { Col, Row, Table } from 'react-bootstrap';

import { AccordionCard } from 'waldur-ui';

import { formatFilesize } from '@/core/utils';
import { translate } from '@/i18n';

import type { QueryPerformance } from './api';
import { formatNumber } from './utils';

interface DatabaseQueryPerformanceCardProps {
  data: QueryPerformance;
}

const TEMP_FILES_WARNING_BYTES = 100 * 1024 * 1024; // 100MB

export const DatabaseQueryPerformanceCard: FC<
  DatabaseQueryPerformanceCardProps
> = ({ data }) => {
  const hasTempFilesWarning = data.temp_files_bytes > TEMP_FILES_WARNING_BYTES;
  const seqScanRatio =
    data.seq_scan_count + data.index_scan_count > 0
      ? (data.seq_scan_count / (data.seq_scan_count + data.index_scan_count)) *
        100
      : 0;
  const hasHighSeqScans = seqScanRatio > 50;

  return (
    <AccordionCard
      id="database-query-performance"
      title={translate('Query performance')}
      subtitle={translate('Scan statistics and temp file usage')}
      defaultOpen={hasTempFilesWarning || hasHighSeqScans}
      className="mb-6"
    >
      <Row>
        <Col lg={6}>
          <h6 className="text-uppercase text-quaternary mb-3">
            {translate('Scan statistics')}
          </h6>
          <Table size="sm" borderless className="mb-0">
            <tbody>
              <tr>
                <td className="text-quaternary">
                  {translate('Sequential scans')}
                </td>
                <td
                  className={`text-end ${hasHighSeqScans ? 'text-warning' : ''}`}
                >
                  {formatNumber(data.seq_scan_count)}
                </td>
              </tr>
              <tr>
                <td className="text-quaternary ps-4">
                  {translate('Rows fetched')}
                </td>
                <td className="text-end text-quaternary">
                  {formatNumber(data.seq_scan_rows)}
                </td>
              </tr>
              <tr>
                <td className="text-quaternary">{translate('Index scans')}</td>
                <td className="text-end text-success">
                  {formatNumber(data.index_scan_count)}
                </td>
              </tr>
              <tr>
                <td className="text-quaternary ps-4">
                  {translate('Rows fetched')}
                </td>
                <td className="text-end text-quaternary">
                  {formatNumber(data.index_scan_rows)}
                </td>
              </tr>
            </tbody>
          </Table>
          {hasHighSeqScans && (
            <small className="text-warning mt-2 block">
              {translate(
                'High sequential scan ratio ({ratio}%). Consider adding indexes.',
                { ratio: seqScanRatio.toFixed(1) },
              )}
            </small>
          )}
        </Col>
        <Col lg={6}>
          <h6 className="text-uppercase text-quaternary mb-3">
            {translate('Temporary files')}
          </h6>
          <Table size="sm" borderless className="mb-0">
            <tbody>
              <tr>
                <td className="text-quaternary">
                  <div className="flex items-center">
                    {translate('Files created')}
                    {data.temp_files_count > 0 && (
                      <WarningCircleIcon
                        size={16}
                        weight="bold"
                        className="text-warning ms-2"
                      />
                    )}
                  </div>
                </td>
                <td
                  className={`text-end ${data.temp_files_count > 0 ? 'text-warning' : ''}`}
                >
                  {formatNumber(data.temp_files_count)}
                </td>
              </tr>
              <tr>
                <td className="text-quaternary">{translate('Total size')}</td>
                <td
                  className={`text-end ${hasTempFilesWarning ? 'text-danger' : ''}`}
                >
                  {formatFilesize(data.temp_files_bytes, 'B')}
                </td>
              </tr>
            </tbody>
          </Table>
          {hasTempFilesWarning && (
            <small className="text-danger mt-2 block">
              {translate(
                'Large temp files indicate queries exceeding work_mem. Consider increasing it.',
              )}
            </small>
          )}
        </Col>
      </Row>
    </AccordionCard>
  );
};
