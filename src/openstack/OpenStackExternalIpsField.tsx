import { PlusIcon } from '@phosphor-icons/react';
import { FC } from 'react';
import { FieldArray, FieldArrayRenderProps } from 'react-final-form-arrays';

import {
  BaseButton,
  FormField,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from 'waldur-ui';

import { StringGroup } from '@/form';
import { translate } from '@/i18n';
import { RemovalActionButton } from '@/table/RemovalActionButton';

const FieldsListGroup: FC<FieldArrayRenderProps<any, any>> = ({ fields }) => {
  const addRow = () => {
    fields.push({});
  };

  const removeRow = (index) => fields.remove(index);

  return (
    <>
      {fields.length > 0 && (
        <FormField id="openstack-external-ip-set">
          <div>
            <Table scrollable={false}>
              <TableHeader>
                <TableRow divided={false}>
                  <TableHead className="w-1/2">
                    {translate('Floating IP')}
                  </TableHead>
                  <TableHead>{translate('External IP')}</TableHead>
                  <TableHead className="w-[5px]" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {fields.map((member, i) => (
                  <TableRow key={member} divided={false}>
                    <TableCell>
                      <StringGroup name={`${member}.floating_ip`} />
                    </TableCell>
                    <TableCell>
                      <StringGroup name={`${member}.external_ip`} />
                    </TableCell>
                    <TableCell>
                      <RemovalActionButton action={() => removeRow(i)} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </FormField>
      )}
      <div>
        <BaseButton
          label={translate('Add')}
          onClick={addRow}
          iconNode={<PlusIcon weight="bold" />}
          variant="tertiary"
          size="lg"
        />
      </div>
    </>
  );
};

export const OpenStackExternalIpsField = () => (
  <FieldArray name="value" component={FieldsListGroup} />
);
