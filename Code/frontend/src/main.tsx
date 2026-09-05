import React, { StrictMode, Component, ErrorInfo, ReactNode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught runtime error:", error, errorInfo);
    this.setState({ error, errorInfo });
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '30px', color: '#ff5555', background: '#080b0e', fontFamily: 'monospace', minHeight: '100vh' }}>
          <h1 style={{ color: '#ffb03a' }}>🚨 Application Runtime Error</h1>
          <pre style={{ background: '#11161b', padding: '15px', border: '1px solid #334155', color: '#38bdf8', overflowX: 'auto' }}>
            {this.state.error?.toString()}
          </pre>
          <pre style={{ background: '#11161b', padding: '15px', border: '1px solid #334155', color: '#94a3b8', fontSize: '12px', overflowX: 'auto' }}>
            {this.state.errorInfo?.componentStack}
          </pre>
          <button
            onClick={() => window.location.reload()}
            style={{ marginTop: '15px', padding: '10px 20px', background: '#38bdf8', color: '#080b0e', border: 'none', fontWeight: 'bold', cursor: 'pointer' }}
          >
            Reload Enclave
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

const rootEl = document.getElementById('root');
if (rootEl) {
  createRoot(rootEl).render(
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  );
}
