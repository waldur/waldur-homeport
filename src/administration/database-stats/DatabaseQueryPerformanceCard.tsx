import { WarningCircleIcon } from '@phosphor-icons/react';
import { FC } from 'react';
import { Col, Row, Table } from 'react-bootstrap';

import { AccordionCard } from '@waldur/core/AccordionCard';
import { formatFilesize } from '@waldur/core/utils';
import { translate } from '@waldur/i18n';

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
          <h6 className="text-uppercase text-muted mb-3">
            {translate('Scan statistics')}
          </h6>
          <Table size="sm" borderless className="mb-0">
            <tbody>
              <tr>
                <td className="text-muted">{translate('Sequential scans')}</td>
                <td
                  className={`fw-semibold text-end ${hasHighSeqScans ? 'text-warning' : ''}`}
                >
                  {formatNumber(data.seq_scan_count)}
                </td>
              </tr>
              <tr>
                <td className="text-muted ps-4">{translate('Rows fetched')}</td>
                <td className="text-end text-muted">
                  {formatNumber(data.seq_scan_rows)}
                </td>
              </tr>
              <tr>
                <td className="text-muted">{translate('Index scans')}</td>
                <td className="fw-semibold text-end text-success">
                  {formatNumber(data.index_scan_count)}
                </td>
              </tr>
              <tr>
                <td className="text-muted ps-4">{translate('Rows fetched')}</td>
                <td className="text-end text-muted">
                  {formatNumber(data.index_scan_rows)}
                </td>
              </tr>
            </tbody>
          </Table>
          {hasHighSeqScans && (
            <small className="text-warning mt-2 d-block">
              {translate(
                'High sequential scan ratio ({ratio}%). Consider adding indexes.',
                { ratio: seqScanRatio.toFixed(1) },
              )}
            </small>
          )}
        </Col>
        <Col lg={6}>
          <h6 className="text-uppercase text-muted mb-3">
            {translate('Temporary files')}
          </h6>
          <Table size="sm" borderless className="mb-0">
            <tbody>
              <tr>
                <td className="text-muted">
                  <div className="d-flex align-items-center">
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
                  className={`fw-semibold text-end ${data.temp_files_count > 0 ? 'text-warning' : ''}`}
                >
                  {formatNumber(data.temp_files_count)}
                </td>
              </tr>
              <tr>
                <td className="text-muted">{translate('Total size')}</td>
                <td
                  className={`fw-semibold text-end ${hasTempFilesWarning ? 'text-danger' : ''}`}
                >
                  {formatFilesize(data.temp_files_bytes, 'B')}
                </td>
              </tr>
            </tbody>
          </Table>
          {hasTempFilesWarning && (
            <small className="text-danger mt-2 d-block">
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
