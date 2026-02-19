import { useState } from 'react';
import { View, Alert } from 'react-native';
import { Stack, router } from 'expo-router';
import { Button } from 'heroui-native/button';
import { Input } from 'heroui-native/input';
import { saveApiKey } from '@/utils/storage';

export default function SetupScreen() {
  const [apiKey, setApiKey] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!apiKey.trim()) {
      Alert.alert('Error', 'Please enter your API key');
      return;
    }

    setLoading(true);
    try {
      await saveApiKey(apiKey.trim());
      router.replace('/dashboard');
    } catch {
      Alert.alert('Error', 'Failed to save API key');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="bg-background flex-1 justify-center px-6">
      <Stack.Screen options={{ title: 'Setup', headerBackVisible: false }} />
      <View className="flex flex-col gap-4">
        <Input
          placeholder="Enter your Autumn API Key"
          value={apiKey}
          onChangeText={setApiKey}
          secureTextEntry
          autoCapitalize="none"
          autoCorrect={false}
        />

        <Button onPress={handleSubmit} isDisabled={loading}>
          {loading ? 'Saving...' : 'Continue'}
        </Button>
      </View>
    </View>
  );
}
