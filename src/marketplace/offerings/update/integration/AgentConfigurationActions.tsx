import { FileTextIcon, GitDiffIcon } from '@phosphor-icons/react';
import { FC } from 'react';
import { ProviderOfferingDetails } from 'waldur-js-client';

import { BaseButton } from 'waldur-ui';

import { lazyComponent } from '@/core/lazyComponent';
import { translate } from '@/i18n';
import { useModal } from '@/modal/actions';

const AgentLoadsDialog = lazyComponent(() =>
  import('./AgentLoadsDialog').then((module) => ({
    default: module.AgentLoadsDialog,
  })),
);

const TemplateDifferencesDialog = lazyComponent(() =>
  import('./TemplateDifferencesDialog').then((module) => ({
    default: module.TemplateDifferencesDialog,
  })),
);

/**
 * The agent configuration section's header actions: what the agent loads
 * (with the configuration file's generator) and, for an offering created
 * from a template, how it differs from that template.
 */
export const AgentConfigurationActions: FC<{
  offering: ProviderOfferingDetails;
}> = ({ offering }) => {
  const { openDialog } = useModal();
  return (
    <>
      <BaseButton
        variant="tertiary"
        iconNode={<FileTextIcon weight="bold" />}
        label={translate('What the agent loads')}
        onClick={() =>
          openDialog(AgentLoadsDialog, { resolve: { offering }, size: 'lg' })
        }
        data-testid="agent-loads-button"
      />
      {offering.template_uuid ? (
        <BaseButton
          variant="tertiary"
          iconNode={<GitDiffIcon weight="bold" />}
          label={translate('Template differences')}
          onClick={() =>
            openDialog(TemplateDifferencesDialog, {
              resolve: { offering },
              size: 'lg',
            })
          }
          data-testid="template-differences-button"
        />
      ) : null}
    </>
  );
};
