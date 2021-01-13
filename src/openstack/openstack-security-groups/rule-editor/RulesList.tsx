import { FC } from 'react';
import { Table } from 'react-bootstrap';
import { FormName, FormSection, WrappedFieldArrayProps } from 'redux-form';

import { translate } from '@waldur/i18n';

import { SecurityGroup } from '../types';

import { RuleAddButton } from './RuleAddButton';
import { RuleRow } from './RuleRow';
import { RulesHeader } from './RulesHeader';

const RulesPlaceholder: FC = () => (
  <tr>
    <td className="text-center" colSpan={5}>
      {translate('Security group does not contain any rule yet.')}
    </td>
  </tr>
);

interface Props extends WrappedFieldArrayProps {
  remoteSecurityGroups: SecurityGroup[];
}

export const RulesList: FC<Props> = ({ fields, remoteSecurityGroups }) => (
  <>
    <Table bordered>
      {fields.length === 0 ? (
        <tbody>
          <RulesPlaceholder />
        </tbody>
      ) : (
        <>
          <thead>
            <RulesHeader />
          </thead>
          <tbody>
            <FormName>
              {({ form }) =>
                fields.map((rule, index) => (
                  <FormSection name={rule} key={index}>
                    <RuleRow
                      formName={form}
                      ruleName={rule}
                      onRemove={() => fields.remove(index)}
                      remoteSecurityGroups={remoteSecurityGroups}
                    />
                  </FormSection>
                ))
              }
            </FormName>
          </tbody>
        </>
      )}
    </Table>
    <RuleAddButton fields={fields} />
  </>
);
