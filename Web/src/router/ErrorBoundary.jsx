import { Component } from "react";

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="h-screen flex flex-col items-center justify-center bg-slate-100 dark:bg-[#0B1220] text-slate-900 dark:text-white p-8">
          <h1 className="text-2xl font-bold mb-2">Something went wrong</h1>
          <p className="text-slate-500 dark:text-slate-400 mb-6 text-center max-w-md">
            {this.state.error?.message || "An unexpected error occurred."}
          </p>
          <button
            onClick={() => window.location.reload()}
            className="rounded-xl px-6 py-3 font-semibold text-white"
            style={{ background: "linear-gradient(90deg,#22D3EE,#3B82F6)" }}
          >
            Reload Page
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
