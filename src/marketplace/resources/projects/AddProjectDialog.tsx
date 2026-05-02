import { FC } from 'react';
import { Resource, ResourceProject } from 'waldur-js-client';

import { CreateModalButton } from '@/core/buttons';
import { lazyComponent } from '@/core/lazyComponent';
import { translate } from '@/i18n';

const ResourceProjectForm = lazyComponent(() =>
  import('./ResourceProjectForm').then((module) => ({
    default: module.ResourceProjectForm,
  })),
);

export const AddProjectButton: FC<{
  resource: Resource;
  offering?;
  siblings?: ResourceProject[];
  refetch(): void;
}> = ({ resource, offering, siblings, refetch }) => (
  <CreateModalButton
    title={translate('Create')}
    dialog={ResourceProjectForm}
    resolve={{ resource, offering, siblings, refetch }}
    size="lg"
  />
);
