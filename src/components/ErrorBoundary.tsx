import { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#e7e3d0] flex items-center justify-center p-4">
          <div className="bg-white/80 backdrop-blur-lg rounded-2xl p-8 max-w-md w-full shadow-xl">
            <h1 className="text-2xl font-bold text-[#0c4c6d] mb-4">
              Something went wrong
            </h1>
            <p className="text-gray-700 mb-6">
              We're sorry, but something unexpected happened. Please try refreshing the page.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="w-full bg-[#0c4c6d] text-white py-3 rounded-lg font-semibold hover:bg-[#0a3d5a] transition-colors"
            >
              Refresh Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

