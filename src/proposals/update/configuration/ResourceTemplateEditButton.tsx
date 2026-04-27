import { CallResourceTemplate } from 'waldur-js-client';

import { EditModalButton } from '@/core/buttons';
import { lazyComponent } from '@/core/lazyComponent';
import { Call } from '@/proposals/types';

const ResourceTemplateFormDialog = lazyComponent(() =>
  import('./ResourceTemplateFormDialog').then((module) => ({
    default: module.ResourceTemplateFormDialog,
  })),
);

interface OwnProps {
  call: Call;
  row: CallResourceTemplate;
  refetch(): void;
}

export const ResourceTemplateEditButton = ({
  row,
  refetch,
  call,
}: OwnProps) => (
  <EditModalButton
    dialog={ResourceTemplateFormDialog}
    row={row}
    buildResolve={(r) => ({ call, refetch, uuid: r.uuid })}
    getInitialValues={(r) => ({
      name: r.name,
      offering: {
        uuid: r.requested_offering_uuid,
        url: r.requested_offering,
        offering_name: r.requested_offering_name,
      },
      description: r.description,
      attributes: r.attributes,
      limits: r.limits,
    })}
    size="lg"
    formId="CallResourceTemplateForm"
  />
);
