import { clearApiKey } from '@/utils/storage';
import { router, Stack } from 'expo-router';
import { Button } from 'heroui-native/button';
import { Card } from 'heroui-native/card';
import { Dialog } from 'heroui-native/dialog';
import { useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { Uniwind, useUniwind } from 'uniwind';

export default function SettingsScreen() {
  const { theme } = useUniwind();
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleThemeToggle = () => {
    Uniwind.setTheme(theme === 'light' ? 'dark' : 'light');
  };

  const handleClearApiKey = async () => {
    await clearApiKey();
    setIsDialogOpen(false);
    router.replace('/setup');
  };

  return (
    <View className="bg-background flex-1 px-4 pt-4">
      <Stack.Screen options={{ title: 'Settings' }} />

      <ScrollView>
        <Card className="mb-4 p-4">
          <Text className="mb-2 text-sm text-gray-500">Appearance</Text>
          <Button variant="primary" onPress={handleThemeToggle}>
            Theme: {theme === 'light' ? 'Light' : 'Dark'}
          </Button>
        </Card>

        <Card className="p-4">
          <Text className="mb-2 text-sm text-gray-500">Account</Text>
          <Button variant="danger" onPress={() => setIsDialogOpen(true)}>
            Clear API Key
          </Button>
          <Dialog isOpen={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <Dialog.Portal>
              <Dialog.Overlay />
              <Dialog.Content>
                <Dialog.Close />
                <Dialog.Title>Clear API Key</Dialog.Title>
                <View className="py-4">
                  <Text className="text-gray-600">
                    Are you sure you want to clear your API key? You will need to enter it again to
                    use the app.
                  </Text>
                </View>
                <View className="flex flex-row justify-end gap-2">
                  <Button variant="tertiary" onPress={() => setIsDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button variant="danger" onPress={handleClearApiKey}>
                    Clear
                  </Button>
                </View>
              </Dialog.Content>
            </Dialog.Portal>
          </Dialog>
        </Card>
      </ScrollView>
    </View>
  );
}
