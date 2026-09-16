import { FC } from 'react';
import { PosixIdPool } from 'waldur-js-client';

import { translate } from '@/i18n';

import { SharingOffering } from './useOfferingAccountContext';

interface SharedAccountsValueProps {
  offeringUuid: string;
  /** Whether the offering's effective account scope is per service provider. */
  shared: boolean;
  sharingOfferings: SharingOffering[];
}

/** The other offerings a person's account on this offering is shared with. */
export const SharedAccountsValue: FC<SharedAccountsValueProps> = ({
  offeringUuid,
  shared,
  sharingOfferings,
}) => {
  if (!shared) {
    return (
      <span className="text-muted">
        {translate('Not shared: this offering holds its own accounts')}
      </span>
    );
  }
  const others = sharingOfferings
    .filter((item) => item.uuid !== offeringUuid)
    .map((item) => item.name);
  if (!others.length) {
    return (
      <span className="text-muted">
        {translate('No other offering of this service provider yet')}
      </span>
    );
  }
  return <span>{others.join(', ')}</span>;
};

const formatRange = (
  label: string,
  min?: number | null,
  max?: number | null,
  used?: number,
) =>
  min === null || min === undefined
    ? null
    : translate('{label} {min}–{max} ({used} used)', {
        label,
        min,
        max,
        used: used ?? 0,
      });

interface PosixIdPoolSummaryProps {
  pool: PosixIdPool | null;
  offeringUuid: string;
}

/** The pool an offering's accounts draw their UIDs and GIDs from. */
export const PosixIdPoolSummary: FC<PosixIdPoolSummaryProps> = ({
  pool,
  offeringUuid,
}) => {
  if (!pool) {
    return (
      <span className="text-warning">
        {translate(
          'No POSIX ID pool: accounts get no UID or GID from a pool until one is created.',
        )}
      </span>
    );
  }
  const ranges = [
    formatRange(translate('UIDs'), pool.min_uid, pool.max_uid, pool.uid_used),
    formatRange(translate('GIDs'), pool.min_gid, pool.max_gid, pool.gid_used),
  ].filter(Boolean);
  return (
    <div className="d-flex flex-column align-items-start">
      <span>{ranges.join(' · ')}</span>
      <small className="text-muted">
        {pool.offering === offeringUuid
          ? translate('Pool of this offering')
          : translate('Service provider pool')}
      </small>
    </div>
  );
};
