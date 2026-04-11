import React from "react";

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Unhandled React error:", error, errorInfo);
  }

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            minHeight: "100vh",
            display: "grid",
            placeItems: "center",
            background: "#f8fafc",
            color: "#0f172a",
            padding: "24px",
            fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, sans-serif",
          }}
        >
          <div style={{ maxWidth: "560px", textAlign: "center" }}>
            <h1 style={{ marginBottom: "12px" }}>Something went wrong</h1>
            <p style={{ marginBottom: "20px", lineHeight: 1.6 }}>
              An unexpected error occurred while rendering this page. Try reloading,
              and if the issue continues, check the console for details.
            </p>
            {this.state.error?.message ? (
              <pre
                style={{
                  textAlign: "left",
                  background: "#e2e8f0",
                  borderRadius: "10px",
                  padding: "12px",
                  overflow: "auto",
                  marginBottom: "20px",
                  fontSize: "12px",
                }}
              >
                {this.state.error.message}
              </pre>
            ) : null}
            <button
              onClick={this.handleReload}
              style={{
                border: "none",
                borderRadius: "10px",
                background: "#0ea5e9",
                color: "#fff",
                padding: "10px 16px",
                cursor: "pointer",
                fontWeight: 600,
              }}
            >
              Reload Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
