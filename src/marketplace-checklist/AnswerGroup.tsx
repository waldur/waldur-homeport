import * as React from 'react';
import * as ToggleButton from 'react-bootstrap/lib/ToggleButton';
import * as ToggleButtonGroup from 'react-bootstrap/lib/ToggleButtonGroup';

import { translate } from '@waldur/i18n';

export const AnswerGroup = ({ answers, question, setAnswers }) => (
  <ToggleButtonGroup
    value={
      { true: 'true', false: 'false', null: 'null' }[answers[question.uuid]]
    }
    onChange={value =>
      setAnswers({
        ...answers,
        [question.uuid]: { true: true, false: false, null: null }[value],
      })
    }
    type="radio"
    name={`checklist-${question.uuid}`}
    defaultValue="null"
  >
    <ToggleButton value="true">{translate('Yes')}</ToggleButton>
    <ToggleButton value="false">{translate('No')}</ToggleButton>
    <ToggleButton value="null">{translate('?')}</ToggleButton>
  </ToggleButtonGroup>
);
