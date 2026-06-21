import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../ui/button.jsx';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    if (import.meta.env.DEV) {
      console.error('Application error boundary caught:', error, info);
    }
  }

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <div className="container flex min-h-[60vh] max-w-xl flex-col items-center justify-center py-16 text-center">
        <h1 className="text-3xl font-bold">Something went wrong</h1>
        <p className="mt-3 text-muted-foreground">
          The page hit an unexpected error. You can return home and continue shopping.
        </p>
        <div className="mt-6 flex gap-3">
          <Button variant="gradient" onClick={() => this.setState({ hasError: false })}>
            Try Again
          </Button>
          <Button asChild variant="outline">
            <Link to="/">Home</Link>
          </Button>
        </div>
      </div>
    );
  }
}
