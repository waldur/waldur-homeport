import { UsersThreeIcon } from '@phosphor-icons/react';
import { FC } from 'react';

import { Badge, BaseButton } from 'waldur-ui';

import { lazyComponent } from '@/core/lazyComponent';
import { translate } from '@/i18n';
import { useModal } from '@/modal/actions';

const FeatureRulesDialog = lazyComponent(() =>
  import('./FeatureRulesDialog').then((module) => ({
    default: module.FeatureRulesDialog,
  })),
);

interface FeatureAudienceButtonProps {
  featureKey: string;
  featureLabel: string;
  /** Active rules for the key. */
  ruleCount: number;
  canEdit: boolean;
}

/**
 * Who else gets a feature besides everyone it is switched on for: a count of
 * its active rules and the button that opens them.
 */
export const FeatureAudienceButton: FC<FeatureAudienceButtonProps> = ({
  featureKey,
  featureLabel,
  ruleCount,
  canEdit,
}) => {
  const { openDialog } = useModal();
  return (
    <div className="flex items-center gap-2">
      {ruleCount > 0 ? (
        <Badge
          variant="primary"
          size="sm"
          tone="outline"
          data-testid={`feature-audience-count-${featureKey}`}
        >
          {translate('Selected users ({count})', { count: ruleCount })}
        </Badge>
      ) : null}
      <BaseButton
        variant="tertiary"
        size="sm"
        iconNode={<UsersThreeIcon weight="bold" />}
        label={translate('Audience')}
        tooltip={translate('Turn this feature on for selected users')}
        data-testid={`feature-audience-${featureKey}`}
        onClick={() =>
          openDialog(FeatureRulesDialog, {
            resolve: { featureKey, featureLabel, canEdit },
            size: 'xl',
          })
        }
      />
    </div>
  );
};
