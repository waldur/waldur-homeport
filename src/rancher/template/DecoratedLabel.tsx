import * as React from 'react';

import { Question } from './types';

export const DecoratedLabel = ({ question }: { question: Question }) => (
  <>
    {question.label}
    {question.required && <span className="text-danger"> *</span>}
  </>
);
