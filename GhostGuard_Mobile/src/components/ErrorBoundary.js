import React from 'react';
import { View, Text, StyleSheet, Button } from 'react-native';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Log error details
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    this.setState({
      error,
      errorInfo
    });
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <View style={styles.container}>
          <View style={styles.card}>
            <Text style={styles.title}>Oops! Something went wrong</Text>
            <Text style={styles.message}>
              The app encountered an unexpected error. This has been logged for review.
            </Text>
            {__DEV__ && this.state.error && (
              <View style={styles.errorDetails}>
                <Text style={styles.errorText}>{this.state.error.toString()}</Text>
                {this.state.errorInfo && (
                  <Text style={styles.stackText}>{this.state.errorInfo.componentStack}</Text>
                )}
              </View>
            )}
            <Button title="Restart App" onPress={this.handleReset} color="#60a5fa" />
          </View>
        </View>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0b1220',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16
  },
  card: {
    backgroundColor: '#0f172a',
    borderWidth: 1,
    borderColor: '#334155',
    borderRadius: 12,
    padding: 20,
    width: '100%',
    maxWidth: 400,
    gap: 16
  },
  title: {
    color: '#ef4444',
    fontSize: 20,
    fontWeight: '700',
    textAlign: 'center'
  },
  message: {
    color: '#e6eef3',
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 22
  },
  errorDetails: {
    backgroundColor: '#0b1220',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#334155',
    marginTop: 8
  },
  errorText: {
    color: '#f59e0b',
    fontSize: 12,
    fontFamily: 'monospace',
    marginBottom: 8
  },
  stackText: {
    color: '#94a3b8',
    fontSize: 10,
    fontFamily: 'monospace'
  }
});

export default ErrorBoundary;

