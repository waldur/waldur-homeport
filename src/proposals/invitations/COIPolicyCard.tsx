import { InfoIcon } from '@phosphor-icons/react';
import { FC } from 'react';
import { InvitationCoiConfiguration } from 'waldur-js-client';

import { FeaturedIcon, Card, CardContent } from 'waldur-ui';

import { translate } from '@/i18n';

interface COIPolicyCardProps {
  config?: InvitationCoiConfiguration | null;
}

// A call can carry a COI configuration with no conflict types set
export const hasCOIPolicy = (config?: InvitationCoiConfiguration | null) =>
  Boolean(
    config?.recusal_required_types?.length ||
    config?.management_allowed_types?.length ||
    config?.disclosure_only_types?.length,
  );

export const COIPolicyCard: FC<COIPolicyCardProps> = ({ config }) => {
  if (!hasCOIPolicy(config)) {
    return null;
  }

  return (
    <Card bordered className="mb-5">
      <CardContent className="flex gap-3">
        <FeaturedIcon
          icon={<InfoIcon weight="bold" />}
          variant="neutral"
          size="sm"
          className="shrink-0"
        />
        <div>
          <h4 className="mb-1">{translate('Conflict of interest policy')}</h4>
          <p className="text-quaternary mb-0">
            {translate(
              'This call has a conflict of interest policy. No proposals are shared with you yet: when specific proposals are assigned to you, decline any you have a conflict with and give the conflict as the reason.',
            )}
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
