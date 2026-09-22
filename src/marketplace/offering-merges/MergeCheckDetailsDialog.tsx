import { FC, Fragment } from 'react';
import { OfferingMergeCheck } from 'waldur-js-client';

import { StateIndicator } from '@/core/StateIndicator';
import { translate } from '@/i18n';
import { CloseDialogButton } from '@/modal/CloseDialogButton';
import { ModalDialog } from '@/modal/ModalDialog';
import { renderFieldOrDash } from '@/table/utils';

import { humanizeDetailsKey } from './utils';

/**
 * A check's details, rendered by shape: an object as a definition list, an
 * array as a list, anything else as its own text. The payloads are nested and
 * differ per check, so the shape is all there is to go on.
 */
const DetailsValue: FC<{ value: unknown }> = ({ value }) => {
  if (value === null || value === undefined) {
    return <>{renderFieldOrDash(null)}</>;
  }
  if (Array.isArray(value)) {
    if (value.length === 0) {
      return <span className="text-muted">{translate('Empty list')}</span>;
    }
    return (
      <ul className="mb-0 ps-4">
        {value.map((item, index) => (
          <li key={index}>
            <DetailsValue value={item} />
          </li>
        ))}
      </ul>
    );
  }
  if (typeof value === 'object') {
    const entries = Object.entries(value);
    if (entries.length === 0) {
      return <span className="text-muted">{translate('Nothing here')}</span>;
    }
    return (
      <dl className="row mb-0">
        {entries.map(([key, item]) => (
          <Fragment key={key}>
            <dt className="col-sm-4 text-break fw-semibold">
              {humanizeDetailsKey(key)}
            </dt>
            <dd className="col-sm-8 mb-2 text-break">
              <DetailsValue value={item} />
            </dd>
          </Fragment>
        ))}
      </dl>
    );
  }
  if (typeof value === 'number') {
    return <>{value.toLocaleString()}</>;
  }
  if (typeof value === 'boolean') {
    return <>{value ? translate('Yes') : translate('No')}</>;
  }
  return <>{String(value)}</>;
};

interface MergeCheckDetailsDialogProps {
  resolve: {
    check: OfferingMergeCheck;
  };
}

/** One verification check, with its payload readable and the raw JSON kept. */
export const MergeCheckDetailsDialog: FC<MergeCheckDetailsDialogProps> = ({
  resolve: { check },
}) => (
  <ModalDialog
    title={translate('Verification check')}
    subtitle={
      <span className="d-flex flex-wrap align-items-center gap-2">
        <code className="fs-8">{check.code}</code>
        <StateIndicator
          label={check.passed ? translate('Passed') : translate('Failed')}
          variant={check.passed ? 'success' : 'danger'}
          tone="outline"
          shape="pill"
        />
      </span>
    }
    footer={<CloseDialogButton label={translate('Close')} />}
  >
    <DetailsValue value={check.details ?? null} />
    <details className="mt-5" data-testid="merge-check-raw">
      <summary className="text-muted">{translate('Raw payload')}</summary>
      <pre className="fs-8 mb-0 mt-2 overflow-auto">
        {JSON.stringify(check.details ?? null, null, 2)}
      </pre>
    </details>
  </ModalDialog>
);
