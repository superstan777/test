import React from 'react';
import { SafeAreaView, Text, View } from 'react-native';

export default function WantToGoScreen() {
  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-black">
      <View className="px-4 pt-4 pb-2">
        <Text className="text-2xl font-bold text-gray-900 dark:text-white">
          Want to Go
        </Text>
      </View>
      <View className="flex-1 items-center justify-center px-8">
        <Text className="text-5xl mb-4">🔖</Text>
        <Text className="text-base font-medium text-gray-500 dark:text-gray-400 text-center">
          Nothing saved yet.
        </Text>
        <Text className="text-sm text-gray-400 dark:text-gray-500 text-center mt-2">
          Long-press any restaurant on the map to save it.
        </Text>
      </View>
    </SafeAreaView>
  );
}
