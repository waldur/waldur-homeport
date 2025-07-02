import { useQuery } from '@tanstack/react-query';
import { celeryStatsRetrieve } from 'waldur-js-client';

import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import FormTable from '@waldur/form/FormTable';
import { translate } from '@waldur/i18n';

type CeleryStats = Record<string, Array<any>>;

const getCeleryStats = () =>
  celeryStatsRetrieve().then(
    (response) =>
      response.data as {
        active: CeleryStats;
        scheduled: CeleryStats;
        reserved: CeleryStats;
        revoked: CeleryStats;
      },
  );

export const CeleryInfoPage = () => {
  const { isLoading, error, data } = useQuery({
    queryKey: ['CeleryInfoPage'],

    queryFn: () => getCeleryStats(),
  });
  if (isLoading) {
    return <LoadingSpinner />;
  }
  if (error) {
    return translate('Unable to load data');
  }
  return (
    <FormTable.Card className="card-bordered">
      <FormTable>
        <FormTable.Item
          label={translate('Active tasks')}
          value={Object.values(data.active).reduce(
            (result, item) => result + item.length,
            0,
          )}
        />

        <FormTable.Item
          label={translate('Scheduled tasks')}
          value={Object.values(data.scheduled).reduce(
            (result, item) => result + item.length,
            0,
          )}
        />

        <FormTable.Item
          label={translate('Reserved tasks')}
          value={Object.values(data.reserved).reduce(
            (result, item) => result + item.length,
            0,
          )}
        />

        <FormTable.Item
          label={translate('Revoked tasks')}
          value={Object.values(data.revoked).reduce(
            (result, item) => result + item.length,
            0,
          )}
        />
      </FormTable>
    </FormTable.Card>
  );
};
