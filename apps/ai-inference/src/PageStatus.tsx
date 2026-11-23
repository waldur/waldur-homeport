import { translate } from 'waldur-i18n-runtime';
import {
  BaseButton,
  Card,
  CardContent,
  EmptyState,
  LoadingSpinner,
} from 'waldur-ui';

import { navigate } from './router';

/**
 * What a page shows instead of its content while the project's services
 * load, when they fail to, or when the project has none. Null otherwise.
 */
export const pageStatus = (data: {
  isLoading: boolean;
  isError: boolean;
  refetch: () => void;
  services: unknown[];
  /** Where "Add a service" goes, when the page offers it. */
  addHref?: string;
}) => {
  if (data.isLoading) {
    return <LoadingSpinner />;
  }
  if (data.isError) {
    return (
      <EmptyState
        title={translate('Could not load the inference services')}
        message={translate('Check your connection and try again.')}
        action={
          <BaseButton
            variant="tertiary"
            label={translate('Try again')}
            onClick={data.refetch}
          />
        }
      />
    );
  }
  if (!data.services.length) {
    return (
      <Card>
        <CardContent>
          <EmptyState
            title={translate('No inference service in this project yet')}
            message={translate(
              'Add one: once it is set up, a project manager can give you a key.',
            )}
            action={
              data.addHref ? (
                <BaseButton
                  variant="primary"
                  label={translate('Add a service')}
                  onClick={() => navigate(data.addHref)}
                />
              ) : undefined
            }
          />
        </CardContent>
      </Card>
    );
  }
  return null;
};
