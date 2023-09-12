import { Fragment } from 'react';
import { Card, Table } from 'react-bootstrap';

import { translate } from '@waldur/i18n';
import { AttributeCell } from '@waldur/marketplace/common/AttributeCell';

import { EditAttributeButton } from './EditAttributeButton';
import { EditCategoryButton } from './EditCategoryButton';

export const AttributesSection = (props) => (
  <Card className="mb-10" id="category">
    <div className="border-2 border-bottom card-header">
      <div className="card-title h5">{translate('Category')}</div>
      <div className="card-toolbar">
        <EditCategoryButton {...props} />
      </div>
    </div>
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
