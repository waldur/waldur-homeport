import { StackIcon } from '@phosphor-icons/react';
import { useRouter } from '@uirouter/react';
import { FC } from 'react';
import { marketplaceOfferingTemplatesCreateOffering } from 'waldur-js-client';

import type { ProgressStep } from 'waldur-ui';
import { Wizard } from 'waldur-wizard';

import { translate } from '@/i18n';
import { useManagedMutation } from '@/modal/useManagedMutation';
import { useCustomer } from '@/workspace/hooks';

import { AgentRolesStep } from './AgentRolesStep';
import { BasicsStep } from './BasicsStep';
import { ParametersStep } from './ParametersStep';
import { getCustomerUuid, ReviewStep } from './ReviewStep';
import { TemplateStep } from './TemplateStep';
import { CreateFromTemplateFormData } from './types';
import { buildCreateRequest } from './utils';

const getSteps = (): ProgressStep[] => [
  { key: 'template', label: translate('Template'), completed: false },
  { key: 'basics', label: translate('Basics'), completed: false },
  { key: 'parameters', label: translate('Parameters'), completed: false },
  { key: 'roles', label: translate('Agent roles'), completed: false },
  { key: 'review', label: translate('Review'), completed: false },
];

const wizardForms = [
  TemplateStep,
  BasicsStep,
  ParametersStep,
  AgentRolesStep,
  ReviewStep,
];

// One object for every render: a new one would reset the form whenever the
// dialog re-renders.
const INITIAL_VALUES: Partial<CreateFromTemplateFormData> = {
  parameters: {},
  agent_roles: {},
  custom_backends: [],
  backend_settings: {},
};

interface CreateFromTemplateDialogProps {
  resolve: {
    fetch?(): void;
    showProvider?: boolean;
  };
}

/** A site-agent offering from a published offering template: the template,
 * the offering's name and category, the template's parameters and the
 * agent's role backends, checked by a dry run before it is created. */
export const CreateFromTemplateDialog: FC<CreateFromTemplateDialogProps> = ({
  resolve: { fetch, showProvider = false },
}) => {
  const customer = useCustomer();
  const router = useRouter();
  const data = { showProvider, customerUuid: customer?.uuid };

  const createMutation = useManagedMutation<
    any,
    any,
    CreateFromTemplateFormData
  >({
    mutationFn: (values) =>
      marketplaceOfferingTemplatesCreateOffering({
        path: { uuid: values.template.uuid },
        body: buildCreateRequest(values, getCustomerUuid(values, data), false),
      }).then((response) => response.data),
    successMessage: translate('Offering has been created.'),
    errorMessage: translate('Unable to create offering.'),
    refetch: fetch,
    onSuccess: (result, values) => {
      // The agent configuration: what the agent runs, and from its
      // actions what it loads and what is left to do on the agent's side.
      router.stateService.go('marketplace-offering-update', {
        uuid: getCustomerUuid(values, data),
        offering_uuid: result.offering_uuid,
        // The page's tabs are its leaves: Integration → Agent configuration.
        tab: 'agent-configuration',
      });
    },
  });

  return (
    <Wizard<CreateFromTemplateFormData>
      title={translate('New offering from a template')}
      subtitle={translate(
        'A site-agent offering set up from a published offering template.',
      )}
      steps={getSteps()}
      wizardForms={wizardForms}
      initialValues={INITIAL_VALUES}
      onSubmit={(values) => createMutation.mutateAsync(values).catch(() => {})}
      submitLabel={translate('Create')}
      data={data}
      modalProps={{
        iconNode: <StackIcon weight="bold" />,
        iconColor: 'success',
      }}
    />
  );
};
