import { FC, useMemo } from 'react';

import { OfferingComponent } from '@/marketplace/types';
import { ModalDialog } from '@/modal/ModalDialog';

import { ComponentUserUsage } from './types';

interface UserUsagesDialogProps {
  resolve: {
    userUsages: ComponentUserUsage[];
    component: OfferingComponent;
  };
}

export const UserUsagesDialog: FC<UserUsagesDialogProps> = ({
  resolve: { userUsages, component },
}) => {
  const sumUsages = useMemo(
    () => userUsages.reduce((acc, item) => acc + Number(item.usage), 0),
    [userUsages],
  );

  return (
    <ModalDialog
      title={component.name + ': ' + sumUsages + ' ' + component.measured_unit}
    >
      <ul className="mb-0">
        {userUsages.map((item, i) => (
          <li key={i}>
            {item.username} - {item.usage} {item.measured_unit}
          </li>
        ))}
      </ul>
    </ModalDialog>
  );
};
