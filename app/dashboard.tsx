import { View, Text } from 'react-native';
import { Stack, Link } from 'expo-router';
import { Button } from 'heroui-native/button';

export default function DashboardScreen() {
  return (
    <View className="flex-1 px-6 pt-4">
      <Stack.Screen
        options={{
          title: 'Dashboard',
          headerRight: () => (
            <Link href="/settings" asChild>
              <Button size="sm" variant="light">
                Settings
              </Button>
            </Link>
          ),
        }}
      />

      <View className="flex-1 items-center justify-center">
        <Text className="text-xl font-semibold">Welcome to Autumn</Text>
      </View>
    </View>
  );
}
