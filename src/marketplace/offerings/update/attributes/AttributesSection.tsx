import { FC, Fragment } from 'react';
import { Card, Table } from 'react-bootstrap';

import { translate } from '@waldur/i18n';
import { AttributeCell } from '@waldur/marketplace/common/AttributeCell';

import { RefreshButton } from '../components/RefreshButton';
import { OfferingSectionProps } from '../types';

import { EditAttributeButton } from './EditAttributeButton';
import { EditCategoryButton } from './EditCategoryButton';

export const AttributesSection: FC<OfferingSectionProps & { category }> = (
  props,
) => (
  <Card>
    <Card.Header className="border-2 border-bottom">
      <Card.Title className="h5">
        <span className="me-2">{translate('Category')}</span>
        <RefreshButton refetch={props.refetch} loading={props.loading} />
      </Card.Title>
      <div className="card-toolbar">
        <EditCategoryButton {...props} />
      </div>
    </Card.Header>
    <Card.Body>
      <p>
        <strong>{translate('Category')}</strong>: {props.category.title}
      </p>
      <Table bordered={true} hover={true} responsive={true}>
        <tbody>
          {props.category.sections.map((section, sectionIndex) => (
            <Fragment key={sectionIndex}>
              {section.attributes.map((attribute, attributeIndex) => (
                <tr key={attributeIndex}>
                  <td className="col-md-3">{section.title}</td>
                  <td className="col-md-3">{attribute.title}</td>
                  <td className="col-md-6">
                    <AttributeCell
                      attr={attribute}
                      value={props.offering.attributes[attribute.key]}
                    />
                  </td>
                  <td className="row-actions">
                    <div>
                      <EditAttributeButton
                        offering={props.offering}
                        refetch={props.refetch}
                        attribute={attribute}
                        section={section}
                        value={props.offering.attributes[attribute.key]}
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </Fragment>
          ))}
        </tbody>
      </Table>
    </Card.Body>
  </Card>
);
