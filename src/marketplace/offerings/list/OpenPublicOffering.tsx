import { useRouter } from '@uirouter/react';
import { Dropdown } from 'react-bootstrap';

import { translate } from '@waldur/i18n';

export const OpenPublicOffering = ({ row }) => {
  const router = useRouter();

  return (
    <Dropdown.Item
      as="button"
      onClick={() => {
        router.stateService.go('public.marketplace-public-offering', {
          uuid: row.uuid,
        });
      }}
    >
      {translate('Open public page')}
    </Dropdown.Item>
  );
};
