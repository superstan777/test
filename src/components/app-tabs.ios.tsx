import { GlassContainer, GlassView } from 'expo-glass-effect';
import { Tabs, TabList, TabTrigger, TabSlot } from 'expo-router/ui';
import type { TabListProps, TabTriggerSlotProps } from 'expo-router/ui';
import { SymbolView } from 'expo-symbols';
import type { SymbolViewProps } from 'expo-symbols';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type SymbolName = SymbolViewProps['name'];

type TabButtonProps = TabTriggerSlotProps & {
  label: string;
  symbol: SymbolName;
};

function TabButton({ label, symbol, isFocused, ...props }: TabButtonProps) {
  return (
    <Pressable {...props} style={styles.tabButton}>
      <SymbolView
        name={symbol}
        style={styles.symbol}
        type="hierarchical"
        tintColor={isFocused ? '#007AFF' : '#8E8E93'}
      />
      <Text style={[styles.tabLabel, isFocused && styles.tabLabelFocused]}>
        {label}
      </Text>
    </Pressable>
  );
}

type GlassTabListProps = TabListProps & { bottomInset: number };

function GlassTabList({ children, bottomInset }: GlassTabListProps) {
  return (
    <View style={[styles.tabBarWrapper, { bottom: bottomInset }]}>
      <GlassContainer>
        <GlassView glassEffectStyle="regular" style={styles.tabBar}>
          {children}
        </GlassView>
      </GlassContainer>
    </View>
  );
}

export default function AppTabs() {
  const insets = useSafeAreaInsets();
  const bottomInset = Math.max(insets.bottom, 8) + 8;

  return (
    <View style={StyleSheet.absoluteFillObject}>
      <Tabs>
        <TabSlot style={styles.content} />
        <TabList asChild>
          <GlassTabList bottomInset={bottomInset}>
            <TabTrigger name="index" href="/" asChild>
              <TabButton label="Map" symbol={'map' as SymbolName} />
            </TabTrigger>
            <TabTrigger name="visits" href="/visits" asChild>
              <TabButton label="Visits" symbol={'fork.knife' as SymbolName} />
            </TabTrigger>
            <TabTrigger name="want-to-go" href="/want-to-go" asChild>
              <TabButton label="Want to Go" symbol={'bookmark' as SymbolName} />
            </TabTrigger>
          </GlassTabList>
        </TabList>
      </Tabs>
    </View>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
  },
  tabBarWrapper: {
    position: 'absolute',
    left: 20,
    right: 20,
    alignItems: 'stretch',
  },
  tabBar: {
    flexDirection: 'row',
    borderRadius: 30,
    paddingVertical: 10,
    paddingHorizontal: 4,
    overflow: 'hidden',
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
    paddingHorizontal: 4,
    gap: 3,
  },
  symbol: {
    width: 24,
    height: 24,
  },
  tabLabel: {
    fontSize: 10,
    color: '#8E8E93',
    fontWeight: '500',
  },
  tabLabelFocused: {
    color: '#007AFF',
    fontWeight: '600',
  },
});
