import { useContext } from 'react';
import { Card, Table } from 'react-bootstrap';

import { Tip } from '@waldur/core/Tooltip';
import { FormFieldsContext } from '@waldur/form/context';
import { translate } from '@waldur/i18n';
import { showOfferingOptions } from '@waldur/marketplace/common/registry';

import { AddOptionButton } from './AddOptionButton';
import { FIELD_TYPES } from './constants';
import { DeleteOptionButton } from './DeleteOptionButton';
import { EditOptionButton } from './EditOptionButton';

export const OfferingOptionsSection = (props) => {
  const { readOnlyFields } = useContext(FormFieldsContext);
  if (!showOfferingOptions(props.offering.type)) {
    return null;
  }
  return (
    <Card className="mb-10" id="options">
      <div className="border-2 border-bottom card-header">
        <div className="card-title h5">
          {translate('User input variables')}

          <Tip
            id="form-field-tooltip"
            label={translate(
              'If you want user to provide additional details when ordering, please configure input form for the user below',
            )}
            className="ms-2"
          >
            <i className="fa fa-question-circle" />
          </Tip>
        </div>
        {!readOnlyFields.includes('options') ? (
          <div className="card-toolbar">
            <AddOptionButton {...props} />
          </div>
        ) : null}
      </div>
      <Card.Body>
        {props.offering.options?.order?.length === 0 ? (
          <div className="justify-content-center row">
            <div className="col-sm-4">
              <p className="text-center">
                {translate("Offering doesn't have input variables.")}
              </p>
            </div>
          </div>
        ) : (
          <Table bordered={true} hover={true} responsive={true}>
            <tbody>
              {props.offering.options?.order?.map((key) => (
                <tr key={key}>
                  <td className="col-md-3">
                    {props.offering.options.options[key]?.label}
                  </td>
                  <td className="col-md-9">
                    {
                      FIELD_TYPES.find(
                        (fieldType) =>
                          fieldType.value ===
                          props.offering.options?.options[key]?.type,
                      ).label
                    }
                  </td>
                  <td className="row-actions">
                    <div>
                      <EditOptionButton
                        {...props}
                        option={{
                          ...props.offering.options?.options[key],
                          name: key,
                        }}
                      />
                      <DeleteOptionButton
                        offering={props.offering}
                        optionKey={key}
                        optionLabel={
                          props.offering.options?.options[key]?.label
                        }
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}
      </Card.Body>
    </Card>
  );
};
