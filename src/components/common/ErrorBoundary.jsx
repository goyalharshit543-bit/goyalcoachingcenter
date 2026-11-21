import React, { Component } from 'react';

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('CRITICAL REACT ERROR CAUGHT BY BOUNDARY:', error, errorInfo);
    this.setState({ error, errorInfo });
  }

  handleReset = () => {
    try {
      localStorage.removeItem('GCC_DATA_STORE_V2');
    } catch {
      // ignore
    }
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-950 text-white p-6 sm:p-12 flex items-center justify-center font-sans">
          <div className="max-w-xl w-full bg-slate-900 border border-rose-500/40 rounded-3xl p-8 shadow-2xl">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/20 text-rose-400 flex items-center justify-center font-bold mb-4 border border-rose-500/30">
              ⚠️
            </div>
            <h2 className="text-xl font-black text-rose-300 font-outfit mb-2">
              Something went wrong loading this view
            </h2>
            <p className="text-xs text-slate-300 mb-4">
              A temporary render error was intercepted. You can safely return to the homepage or reset the local cache.
            </p>

            <div className="bg-slate-950 rounded-xl p-3 border border-slate-800 text-[11px] font-mono text-rose-400 mb-6 overflow-x-auto">
              {this.state.error?.toString()}
            </div>

            <div className="flex gap-3">
              <button
                onClick={this.handleReset}
                className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs cursor-pointer shadow-lg transition-all"
              >
                Return to Homepage
              </button>
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs cursor-pointer transition-all"
              >
                Reload Page
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
