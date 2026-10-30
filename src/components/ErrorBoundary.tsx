import React from 'react';
import { ScrollView, Text } from 'react-native';

interface State {
  error: Error | null;
}

/**
 * Catches render-time errors anywhere below it and shows the message + stack
 * on screen (selectable, so it can be copied) instead of leaving the app stuck
 * on a blank/splash screen. Critical for diagnosing release-only crashes that
 * never appear in development.
 */
export class ErrorBoundary extends React.Component<{ children: React.ReactNode }, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    // Also emit to the device console for Console.app / logcat.
    console.error('App error boundary caught:', error, info?.componentStack);
  }

  render() {
    const { error } = this.state;
    if (error) {
      return (
        <ScrollView
          style={{ flex: 1, backgroundColor: '#14110c' }}
          contentContainerStyle={{ padding: 24, paddingTop: 72 }}
        >
          <Text style={{ color: '#ffcf6b', fontSize: 18, fontWeight: '800', marginBottom: 14 }}>
            حدث خطأ في التطبيق
          </Text>
          <Text selectable style={{ color: '#ff8a80', fontSize: 14, marginBottom: 12 }}>
            {error.name}: {error.message}
          </Text>
          <Text selectable style={{ color: '#bbb', fontSize: 11, lineHeight: 16 }}>
            {error.stack}
          </Text>
        </ScrollView>
      );
    }
    return this.props.children as React.ReactElement;
  }
}
