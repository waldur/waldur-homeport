import { useContext, useEffect } from 'react';
import { Col, Panel } from 'react-bootstrap';
import { useDispatch } from 'react-redux';
import { WrappedFieldArrayProps, FormSection, change } from 'redux-form';

import { FormLayoutContext } from '@waldur/form/context';
import { withTranslation, TranslateProps } from '@waldur/i18n';
import { FORM_ID } from '@waldur/marketplace/offerings/store/constants';
import { parseComponents } from '@waldur/marketplace/offerings/update/utils';
import { OfferingComponent } from '@waldur/marketplace/types';

import { RemoveButton } from '../RemoveButton';

import { ComponentAddButton } from './ComponentAddButton';
import { ComponentForm } from './ComponentForm';

interface ComponentsListProps
  extends TranslateProps,
    WrappedFieldArrayProps<OfferingComponent> {
  removeOfferingComponent(component: string): void;
  removeOfferingQuotas(component: string): void;
  builtinComponents: OfferingComponent[];
  isUpdatingOffering: boolean;
}

export const ComponentsList = withTranslation((props: ComponentsListProps) => {
  const dispatch = useDispatch();
  useEffect(() => {
    if (props.builtinComponents.length > 0 && !props.isUpdatingOffering) {
      dispatch(
        change(FORM_ID, 'components', parseComponents(props.builtinComponents)),
      );
    }
  }, []);

  const { layout } = useContext(FormLayoutContext);

  const col = layout === 'vertical' ? 0 : 8;
  const offset = layout === 'vertical' ? 0 : 2;

  return (
    <div className="form-group">
      <Col sm={{ span: col, offset: offset }} className="m-b-sm">
        <p className="form-control-static">
          <strong>{props.translate('Plan components')}</strong>
        </p>
      </Col>

      <Col sm={{ span: col, offset: offset }}>
        {props.fields.map((component, index) => (
          <Panel key={index}>
            <Panel.Heading>
              {!props.builtinComponents.length && (
                <RemoveButton
                  onClick={() => {
                    props.removeOfferingComponent(props.fields.get(index).type);
                    props.fields.remove(index);
                  }}
                />
              )}
              <h4>
                {props.translate('Component #{index}', { index: index + 1 })}
              </h4>
            </Panel.Heading>
            <Panel.Body>
              <FormSection name={component}>
                <ComponentForm
                  removeOfferingQuotas={() =>
                    props.removeOfferingQuotas(props.fields.get(index).type)
                  }
                  builtinComponents={props.builtinComponents}
                />
              </FormSection>
            </Panel.Body>
          </Panel>
        ))}
        {!props.builtinComponents.length && (
          <ComponentAddButton
            onClick={() => {
              props.fields.push({} as OfferingComponent);
            }}
          />
        )}
      </Col>
    </div>
  );
});
