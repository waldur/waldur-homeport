import { Table } from 'react-bootstrap';

import FormTable from '@waldur/form/FormTable';
import { translate } from '@waldur/i18n';
import { SettingsDescription } from '@waldur/SettingsDescription';

import { FieldRow } from './FieldRow';

const BRANDING_SECTIONS = [
  translate('Branding'),
  translate('Marketplace'),
  translate('Notifications'),
  translate('Links'),
  translate('Theme'),
  translate('Images'),
];

export const AdministrationBranding = () => {
  return (
    <>
      {SettingsDescription.filter((group) =>
        BRANDING_SECTIONS.includes(group.description),
      ).map((group) => (
        <FormTable.Card
          title={group.description}
          key={group.description}
          className="card-bordered mb-3"
        >
          <Table bordered={true} responsive={true} className="form-table">
            {group.items.map((item) => (
              <FieldRow item={item} key={item.key} />
            ))}
          </Table>
        </FormTable.Card>
      ))}
    </>
  );
};
