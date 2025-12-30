import { createContext } from 'react';
import { Issue } from 'waldur-js-client';

export const IssueCommentsContext = createContext<Issue | null>(null);
