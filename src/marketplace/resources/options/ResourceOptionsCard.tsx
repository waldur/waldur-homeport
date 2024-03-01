import { FC } from 'react';
import { Card, Table } from 'react-bootstrap';

import { translate } from '@waldur/i18n';
import { RefreshButton } from '@waldur/marketplace/offerings/update/components/RefreshButton';
import { Offering } from '@waldur/marketplace/types';

import { Resource } from '../types';

import { UpdateResourceOptionButton } from './UpdateResourceOptionButton';

interface ResourceOptionsCardProps {
  resource: Resource;
  offering: Offering;
  refetch?;
  loading?;
}

export const ResourceOptionsCard: FC<ResourceOptionsCardProps> = (props) => {
  const resourceOptions = props.offering.resource_options;
  if (!resourceOptions?.order?.length) {
    return null;
  }
  return (
    <Card className="mb-10" id="resource-options">
      <div className="border-2 border-bottom card-header">
        <div className="card-title h5">
          {translate('Options')}
          <RefreshButton refetch={props.refetch} loading={props.loading} />
        </div>
      </div>
      <Card.Body>
        {resourceOptions.order?.length > 0 ? (
          <Table bordered={true} hover={true} responsive={true}>
            <tbody>
              {resourceOptions.order?.map((key) => (
                <tr key={key}>
                  <td className="col-md-3">
                    {resourceOptions.options[key]?.label}
                  </td>
                  <td className="col-md-9">
                    {(props.resource.options && props.resource.options[key]) ||
                      'N/A'}
                  </td>
                  <td className="row-actions">
                    <div>
                      <UpdateResourceOptionButton
                        {...props}
                        option={{
                          ...resourceOptions?.options[key],
                          name: key,
                        }}
                      />
                    </div>
                  </td>
                </tr>
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
