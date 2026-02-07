import React from "react";
export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    console.error("AI Error:", error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="text-red-400 text-sm">
          ⚠ AI Advisor unavailable right now
        </div>
      );
    }

    return this.props.children;
  }
}
