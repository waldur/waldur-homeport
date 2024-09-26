import { FC } from 'react';
import { Card, Table } from 'react-bootstrap';

import { translate } from '@waldur/i18n';
import { RefreshButton } from '@waldur/marketplace/offerings/update/components/RefreshButton';
import { Offering } from '@waldur/marketplace/types';

import { Resource } from '../types';

import { OptionValue } from './OptionValue';
import { UpdateResourceOptionButton } from './UpdateResourceOptionButton';

interface ResourceOptionsCardProps {
  resource: Resource;
  offering: Offering;
  refetch?;
  isLoading?;
}

const OptionRow = ({ option, value, resource, refetch }) => (
  <tr>
    <td className="col-md-3">{option.label}</td>
    <td className="col-md-3">{option.help_text}</td>
    <td className="col-md-6">
      <OptionValue option={option} value={value} />
    </td>
    <td className="row-actions">
      <div>
        <UpdateResourceOptionButton
          resource={resource}
          refetch={refetch}
          option={option}
        />
      </div>
    </td>
  </tr>
);

export const ResourceOptionsCard: FC<ResourceOptionsCardProps> = (props) => {
  const resourceOptions = props.offering.resource_options;
  if (!resourceOptions?.order?.length) {
    return null;
  }
  return (
    <Card className="card-bordered">
      <Card.Header className="border-2 border-bottom">
        <Card.Title className="h5">
          {translate('Options')}
          <RefreshButton refetch={props.refetch} loading={props.isLoading} />
        </Card.Title>
      </Card.Header>
      <Card.Body>
        {resourceOptions.order?.length > 0 ? (
          <Table bordered={true} hover={true} responsive={true}>
            <tbody>
              {resourceOptions.order?.map((key) => (
                <OptionRow
                  key={key}
                  option={{
                    ...resourceOptions.options[key],
                    name: key,
                  }}
                  value={props.resource.options && props.resource.options[key]}
                  resource={props.resource}
                  refetch={props.refetch}
                />
              ))}
            </tbody>
          </Table>
        ) : (
          <div className="justify-content-center row">
            <div className="col-sm-4">
              <p className="text-center">
                {translate("Resource doesn't have options.")}
              </p>
            </div>
          </div>
        )}
      </Card.Body>
    </Card>
  );
};
