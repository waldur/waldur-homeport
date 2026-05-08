import { LinkSimpleIcon } from '@phosphor-icons/react';
import { FC } from 'react';
import { lexisLinksCreate } from 'waldur-js-client';

import { ENV } from '@/core/config';
import { isFeatureVisible } from '@/features/connect';
import { MarketplaceFeatures } from '@/FeaturesEnums';
import { translate } from '@/i18n';
import { useManagedMutation } from '@/modal/useManagedMutation';
import { PermissionEnum } from '@/permissions/enums';
import { ActionItem } from '@/resource/actions/ActionItem';
import { validateState } from '@/resource/actions/base';
import { useValidators } from '@/resource/actions/useValidators';

const validators = [validateState('OK', 'ERRED')];

interface CreateLexisLinkActionProps {
  resource: any;
  refetch?(): void;
}

export const CreateLexisLinkAction: FC<CreateLexisLinkActionProps> = ({
  resource,
  refetch,
}) => {
  const { tooltip, disabled } = useValidators(validators, resource);

  const { mutate } = useManagedMutation<any, any, void>({
    mutationFn: () => {
      const resource_url = `${ENV.apiEndpoint}api/marketplace-resources/${resource.marketplace_resource_uuid}/`;
      return lexisLinksCreate({ body: { resource: resource_url } });
    },
    successMessage: translate(
      'LEXIS link creation request has been submitted.',
    ),
    errorMessage: translate('Unable to submit LEXIS link creation request.'),
    refetch,
    confirmation: {
      title: translate('Create LEXIS Link for the resource {resourceName}', {
        resourceName: resource.name,
      }),
      body: translate(
        'Are you sure you would like to create a LEXIS link for the resource {resourceName}?',
        { resourceName: resource.name },
      ),
    },
  });

  if (
    disabled ||
    !resource.available_actions?.includes(PermissionEnum.CREATE_LEXIS_LINK) ||
    !isFeatureVisible(MarketplaceFeatures.lexis_links)
  ) {
    return null;
  }

  return (
    <ActionItem
      title={translate('Create LEXIS link')}
      action={mutate}
      tooltip={tooltip}
      disabled={disabled}
      iconNode={<LinkSimpleIcon weight="bold" />}
    />
  );
};
