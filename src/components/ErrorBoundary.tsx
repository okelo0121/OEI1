import React from "react";

interface ErrorBoundaryProps {
    children: React.ReactNode;
}

interface ErrorBoundaryState {
    error: Error | null;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
    state: ErrorBoundaryState = { error: null };

    static getDerivedStateFromError(error: Error): ErrorBoundaryState {
        return { error };
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
        console.error("Unhandled render error:", error, errorInfo.componentStack);
    }

    handleReload = () => {
        window.location.hash = "";
        window.location.reload();
    };

    render() {
        if (this.state.error) {
            return (
                <div className="error-boundary" role="alert">
                    <h1>Something went wrong</h1>
                    <p>{this.state.error.message}</p>
                    <button onClick={this.handleReload} className="button button-dark-contrast">
                        Reload page
                    </button>
                </div>
            );
        }

        return this.props.children;
    }
}
