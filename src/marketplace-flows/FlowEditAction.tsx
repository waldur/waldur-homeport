import { triggerTransition } from '@uirouter/redux';
import { FunctionComponent } from 'react';
import { useDispatch } from 'react-redux';

import { translate } from '@waldur/i18n/translate';
import { ActionButton } from '@waldur/table/ActionButton';

export const FlowEditAction: FunctionComponent<{ flow }> = (props) => {
  const dispatch = useDispatch();
  const callback = () =>
    dispatch(
      triggerTransition('profile.flow-edit', {
        flow_uuid: props.flow.uuid,
      }),
    );

  return (
    <ActionButton
      action={callback}
      title={translate('Edit')}
      icon="fa fa-edit"
    />
  );
};
