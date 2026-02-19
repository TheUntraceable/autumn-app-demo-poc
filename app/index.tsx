import { useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { hasApiKey } from '@/utils/storage';

export default function IndexScreen() {
  useEffect(() => {
    async function checkApiKey() {
      const hasKey = await hasApiKey();
      if (hasKey) {
        router.replace('/dashboard');
      } else {
        router.replace('/setup');
      }
    }
    checkApiKey();
  }, []);

  return (
    <View className="bg-background text-foreground flex-1 items-center justify-center">
      <ActivityIndicator size="large" />
    </View>
  );
}
