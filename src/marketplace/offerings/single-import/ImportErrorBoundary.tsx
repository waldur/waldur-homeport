import { Component, ReactNode } from 'react';

import { AlertItem } from 'waldur-ui';

import { translate } from '@/i18n';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ImportErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return (
        <AlertItem
          variant="error"
          type="floating"
          title={translate('Import Error')}
          body={
            <>
              <p>
                {translate(
                  'An error occurred during the import process. Please refresh and try again.',
                )}
              </p>
              {this.state.error && (
                <details className="mt-2">
                  <summary>{translate('Error details')}</summary>
                  <pre className="mt-2 small">
                    {this.state.error.toString()}
                  </pre>
                </details>
              )}
            </>
          }
        />
      );
    }

    return this.props.children;
  }
}
