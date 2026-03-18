import React from 'react';
import { SafeAreaView, Text, View } from 'react-native';

export default function WantToGoScreen() {
  return (
    <SafeAreaView className="flex-1 bg-neutral-50 dark:bg-neutral-950">
      <View className="px-5 pt-2 pb-3 border-b border-neutral-200 dark:border-neutral-800">
        <Text className="text-3xl font-bold tracking-tight text-neutral-900 dark:text-white">
          Want to Go
        </Text>
        <Text className="text-sm text-neutral-500 dark:text-neutral-400 mt-0.5">
          Saved for later
        </Text>
      </View>

      <View className="flex-1 items-center justify-center px-10 pb-28">
        <View className="w-20 h-20 rounded-3xl bg-neutral-100 dark:bg-neutral-800 items-center justify-center mb-5">
          <Text className="text-4xl">🔖</Text>
        </View>
        <Text className="text-lg font-semibold text-neutral-700 dark:text-neutral-300 text-center mb-2">
          Nothing saved yet
        </Text>
        <Text className="text-sm text-neutral-400 dark:text-neutral-500 text-center leading-5">
          Long-press any restaurant on the map to save it here.
        </Text>
      </View>
    </SafeAreaView>
  );
}
