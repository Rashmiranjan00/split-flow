import React from 'react';
import { Platform, View, StyleSheet } from 'react-native';

interface AppContainerProps {
  children: React.ReactNode;
}

export const AppContainer: React.FC<AppContainerProps> = ({ children }) => {
  if (Platform.OS !== 'web') {
    return <View style={styles.native}>{children}</View>;
  }

  return (
    <View style={styles.webOuter}>
      <View style={styles.webInner}>{children}</View>
    </View>
  );
};

const styles = StyleSheet.create({
  native: {
    flex: 1,
  },
  webOuter: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    backgroundColor: '#0a0f1a',
  },
  webInner: {
    width: '100%',
    maxWidth: 520,
    flex: 1,
    // @ts-expect-error — web-only boxShadow
    boxShadow: '0 0 60px rgba(0,0,0,0.4)',
  },
});
