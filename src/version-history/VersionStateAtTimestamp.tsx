import { DateTime } from 'luxon';
import { FunctionComponent, useState } from 'react';
import { Form } from 'react-bootstrap';
import { VersionHistory } from 'waldur-js-client';

import { BaseButton, DatePicker } from 'waldur-ui';

import { translate } from '@/i18n';

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
      <Form.Label className="mb-0 text-nowrap text-muted fs-7">
        {translate('State at:')}
      </Form.Label>
      <DatePicker
        enableTime
        value={timestamp}
        onChange={setTimestamp}
        maxDate="now"
        clearable={false}
        size="sm"
        placeholder={translate('Select date and time')}
        style={{ width: '180px' }}
      />
      <BaseButton
        variant="secondary"
        size="sm"
        onClick={handleQuery}
        disabled={!timestamp || isLoading}
        disabledReason={translate('Select a date and time first')}
        pending={isLoading}
        label={translate('Load')}
      />
      {error && (
        <span className="text-danger fs-7">
          {translate('No version found at this time')}
        </span>
      )}
    </div>
  );
};
