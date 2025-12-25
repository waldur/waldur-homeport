import { EditModalButton } from '@waldur/core/buttons';
import { lazyComponent } from '@waldur/core/lazyComponent';

const UserAgreementsEditDialog = lazyComponent(() =>
  import('./UserAgreementsEditDialog').then((module) => ({
    default: module.UserAgreementsEditDialog,
  })),
);

export const UserAgreementsEditButton = ({ row, refetch }) => (
  <EditModalButton
    dialog={UserAgreementsEditDialog}
    row={row}
    buildResolve={(r) => ({
      initialValues: {
        uuid: r.uuid,
        agreement_type: r.agreement_type,
        content: r.content,
      },
      refetch,
    })}
    size="lg"
  />
);
