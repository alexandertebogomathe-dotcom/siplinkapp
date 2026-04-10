import React, { Component, ReactNode, ErrorInfo } from 'react';
import { containerStyle, headerStyle, errorAlertStyle } from '../styles/theme';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

/**
 * Error boundary component for catching and displaying runtime errors
 */
class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Error caught by ErrorBoundary:', error, errorInfo);
    this.setState({
      errorInfo
    });
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null
    });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            background: 'linear-gradient(135deg, #ffebee 0%, #ffcdd2 100%)',
            minHeight: '100vh',
            padding: 20,
            fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif"
          }}
        >
          <div style={containerStyle}>
            <div style={{ ...headerStyle, color: '#c62828' }}>⚠️ Oops!</div>

            <div
              style={{
                ...errorAlertStyle,
                marginBottom: 20,
                padding: 16,
                borderRadius: 8
              }}
            >
              <h3 style={{ marginTop: 0, color: '#c62828' }}>Something went wrong</h3>
              <p style={{ margin: '8px 0', fontSize: '14px', color: '#d32f2f' }}>
                {this.state.error && this.state.error.toString()}
              </p>

              {this.state.errorInfo && (
                <details
                  style={{
                    marginTop: 12,
                    padding: 8,
                    background: 'rgba(0, 0, 0, 0.05)',
                    borderRadius: 4,
                    cursor: 'pointer'
                  }}
                >
                  <summary style={{ fontWeight: 'bold', color: '#6f4e37' }}>
                    Error Details
                  </summary>
                  <pre
                    style={{
                      marginTop: 8,
                      fontSize: '12px',
                      overflow: 'auto',
                      background: '#fafafa',
                      padding: 8,
                      borderRadius: 4,
                      color: '#333'
                    }}
                  >
                    {this.state.errorInfo.componentStack}
                  </pre>
                </details>
              )}
            </div>

            <button
              onClick={this.handleReset}
              style={{
                width: '100%',
                padding: 12,
                background: 'linear-gradient(135deg, #d2691e, #cd853f)',
                color: 'white',
                border: 'none',
                borderRadius: 5,
                cursor: 'pointer',
                fontWeight: 'bold',
                fontSize: '16px'
              }}
            >
              Try Again 🔄
            </button>

            <p style={{ marginTop: 20, fontSize: '14px', color: '#666', textAlign: 'center' }}>
              If the problem persists, please refresh the page or contact support.
            </p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
