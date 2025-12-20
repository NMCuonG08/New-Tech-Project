import { Component } from 'react';

export class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('❌ Error caught by boundary:', error, errorInfo);
    this.setState({ error, errorInfo });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ 
          background: '#1e293b', 
          color: '#f1f5f9', 
          padding: '40px', 
          minHeight: '100vh',
          fontFamily: 'system-ui'
        }}>
          <h1 style={{ color: '#ef4444', marginBottom: '20px' }}>⚠️ Something went wrong</h1>
          <details style={{ 
            background: '#0f172a', 
            padding: '20px', 
            borderRadius: '8px',
            border: '1px solid #334155'
          }}>
            <summary style={{ cursor: 'pointer', marginBottom: '10px', fontWeight: 'bold' }}>
              Error Details
            </summary>
            <pre style={{ 
              overflow: 'auto', 
              fontSize: '12px',
              color: '#94a3b8'
            }}>
              {this.state.error && this.state.error.toString()}
              {'\n\n'}
              {this.state.errorInfo && this.state.errorInfo.componentStack}
            </pre>
          </details>
          <button 
            onClick={() => window.location.reload()}
            style={{
              marginTop: '20px',
              padding: '10px 20px',
              background: '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer'
            }}
          >
            Reload Page
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
