import { CalendarBlankIcon } from '@phosphor-icons/react';
import { DateTime } from 'luxon';
import { FunctionComponent, useState } from 'react';
import Flatpickr from 'react-flatpickr';
import { VersionHistory } from 'waldur-js-client';

import { useFlatpickrTheme } from '@waldur/form/useFlatpickrTheme';
import { translate } from '@waldur/i18n';

import { useVersionAtTimestamp } from './api';
import { HistoryEntityType } from './types';

interface VersionStateAtTimestampProps {
  entityType: HistoryEntityType;
  entityUuid: string;
  onVersionLoaded: (version: VersionHistory) => void;
}

export const VersionStateAtTimestamp: FunctionComponent<
  VersionStateAtTimestampProps
> = ({ entityType, entityUuid, onVersionLoaded }) => {
  const [timestamp, setTimestamp] = useState<Date | null>(null);
  const [queryTimestamp, setQueryTimestamp] = useState<string | null>(null);

  useFlatpickrTheme();

  const { data, isLoading, error } = useVersionAtTimestamp(
    entityType,
    entityUuid,
    queryTimestamp,
  );

  const handleQuery = () => {
    if (timestamp) {
      const isoTimestamp = DateTime.fromJSDate(timestamp).toISO();
      setQueryTimestamp(isoTimestamp);
    }
  };

  // When data is loaded, notify parent
  if (data && queryTimestamp) {
    onVersionLoaded(data);
    setQueryTimestamp(null);
  }

  return (
    <div className="d-flex align-items-center gap-3">
      <label className="form-label mb-0 text-nowrap text-muted fs-7">
        {translate('State at:')}
      </label>
      <div style={{ position: 'relative' }}>
        <Flatpickr
          value={timestamp}
          onChange={(dates) => setTimestamp(dates[0] || null)}
          options={{
            enableTime: true,
            dateFormat: 'Y-m-d H:i',
            maxDate: new Date(),
            time_24hr: true,
          }}
          className="form-control form-control-sm"
          placeholder={translate('Select date and time')}
          style={{ width: '180px' }}
        />
        <span
          className="svg-icon svg-icon-2 svg-icon-muted"
          style={{
            position: 'absolute',
            right: 10,
            top: 8,
            pointerEvents: 'none',
          }}
        >
          <CalendarBlankIcon weight="bold" />
        </span>
      </div>
      <button
        type="button"
        className="btn btn-sm btn-light-primary"
        onClick={handleQuery}
        disabled={!timestamp || isLoading}
      >
        {isLoading ? (
          <span className="spinner-border spinner-border-sm" />
        ) : (
          translate('Load')
        )}
      </button>
      {error && (
        <span className="text-danger fs-7">
          {translate('No version found at this time')}
        </span>
      )}
    </div>
  );
};
