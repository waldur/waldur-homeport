import { FC } from 'react';

import FormTable from '@/form/FormTable';
import { SettingsDescription } from '@/SettingsDescription';

import { FieldRow } from './FieldRow';

interface SettingsCardProps {
  groupNames: string[];
  settingsSource?: any;
}

export const SettingsCard: FC<SettingsCardProps> = ({
  groupNames,
  settingsSource,
}) => {
  return (
    <>
      {SettingsDescription.filter((group) =>
        groupNames.includes(group.description),
      ).map((group) => (
        <FormTable.Card
          title={group.description}
          key={group.description}
          className="card-bordered mb-4"
        >
          <FormTable>
            {group.items.map((item) => (
              <FieldRow
                item={item}
                key={item.key}
                value={settingsSource?.[item.key]}
              />
            ))}
          </FormTable>
        </FormTable.Card>
      ))}
    </>
  );
};
