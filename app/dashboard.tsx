import { clearApiKey, getApiKey } from '@/utils/storage';
import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { Autumn } from 'autumn-js';
import { Stack, useRouter } from 'expo-router';
import { Avatar } from 'heroui-native/avatar';
import { Card } from 'heroui-native/card';
import { Chip } from 'heroui-native/chip';
import { PressableFeedback } from 'heroui-native/pressable-feedback';
import { Skeleton } from 'heroui-native/skeleton';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function DashboardScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { data: customers, isLoading } = useQuery({
    queryKey: ['customers'],
    refetchInterval: 60000,
    queryFn: async () => {
      const key = await getApiKey();
      const autumn = new Autumn({
        secretKey: key || '',
      });
      const customers = await autumn.customers.list({ limit: 100 });
      if (customers.error) {
        if (customers.error.code === 'invalid_secret_key') {
          await clearApiKey();
          router.replace('/setup');
        }
        console.log('Error fetching customers:', JSON.stringify(customers.error));
      }
      return customers.data;
    },
  });
  const { data: me } = useQuery({
    queryKey: ['me'],
    queryFn: async () => {
      const key = await getApiKey();
      const autumn = new Autumn({
        secretKey: key || '',
      });
      const r = await autumn.get('/organization/me');
      return r.data;
    },
  });

  const totalCustomers = customers?.total ?? 0;
  const customerList = customers?.list ?? [];
  const activeSubscriptions = customerList.filter((c) =>
    c.products?.some((p) => p.status === 'active')
  ).length;
  const recentCustomers = customerList.slice(0, 3);

  const getInitials = (name: string | null) => {
    if (!name) return '?';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'success';
      case 'trialing':
        return 'warning';
      case 'past_due':
        return 'danger';
      default:
        return 'default';
    }
  };

  return (
    <View className="bg-background flex-1">
      <Stack.Screen
        options={{
          autoHideHomeIndicator: true,
          header: () => {
            return (
              <View
                className="bg-surface border-border border-b"
                style={{ paddingTop: insets.top }}>
                <View className="flex-row items-center justify-between px-5 py-4">
                  <View className="gap-0.5">
                    <Text className="text-foreground text-2xl font-bold tracking-tight">
                      Dashboard
                    </Text>
                    <Text className="text-default-500 text-sm">Manage your customers</Text>
                  </View>
                  <Pressable
                    onPress={() => router.push('/settings')}
                    className="bg-default active:bg-surface-secondary h-10 w-10 items-center justify-center rounded-full">
                    <Ionicons name="settings-outline" size={20} color="#6b7280" />
                  </Pressable>
                </View>
              </View>
            );
          },
        }}
      />
      <ScrollView className="flex-1 px-4 pb-6 pt-5">
        <View className="mb-6">
          <Text className="text-foreground mb-4 text-lg font-semibold">Overview</Text>
          <View className="flex-row flex-wrap gap-3">
            <Card className="w-full" variant="default">
              <Card.Body className="items-center py-4">
                {isLoading || !me ? (
                  <Skeleton className="h-8 w-16 rounded-md" />
                ) : (
                  <Text className="text-foreground text-lg font-bold" numberOfLines={1}>
                    {me.name}
                  </Text>
                )}
                <Text className="text-default-500 text-xs">{me?.env ?? ''}</Text>
              </Card.Body>
            </Card>
            <Card className="flex-1" variant="default">
              <Card.Body className="items-center py-4">
                {isLoading ? (
                  <Skeleton className="h-8 w-16 rounded-md" />
                ) : (
                  <Text className="text-foreground text-2xl font-bold">{activeSubscriptions}</Text>
                )}
                <Text className="text-default-500 text-xs">Active</Text>
              </Card.Body>
            </Card>
            <Card className="flex-1" variant="default">
              <Card.Body className="items-center py-4">
                {isLoading ? (
                  <Skeleton className="h-8 w-16 rounded-md" />
                ) : (
                  <Text className="text-foreground text-2xl font-bold">{totalCustomers}</Text>
                )}
                <Text className="text-default-500 text-xs">Customers</Text>
              </Card.Body>
            </Card>
          </View>
        </View>

        <View className="mb-6">
          <Text className="text-foreground mb-3 text-lg font-semibold">Recent Customers</Text>
          {isLoading ? (
            <View className="gap-3 flex flex-col">
              {[1, 2, 3].map((i) => (
                <Card key={i} variant="secondary">
                  <Card.Body className="flex-row items-center gap-3 py-3">
                    <Skeleton className="size-10 rounded-full" />
                    <View className="flex-1 gap-1">
                      <Skeleton className="h-4 w-24 rounded-md" />
                      <Skeleton className="h-3 w-32 rounded-md" />
                    </View>
                  </Card.Body>
                </Card>
              ))}
            </View>
          ) : recentCustomers.length === 0 ? (
            <Card variant="default">
              <Card.Body className="items-center py-8">
                <Text className="text-default-500">No customers yet</Text>
              </Card.Body>
            </Card>
          ) : (
            <View className="gap-2">
              {recentCustomers.map((customer) => {
                const activeProduct = customer.products?.find((p) => p.status === 'active');
                return (
                  <PressableFeedback
                    key={customer.id}
                    onPress={() =>
                      router.push({
                        pathname: '/customer/[id]',
                        params: { id: customer.id },
                      })
                    }>
                    <Card variant="default">
                      <Card.Body className="flex-row items-center gap-3 py-3">
                        <Avatar size="md" alt={customer.name || 'Customer'} color="default">
                          <Avatar.Fallback>{getInitials(customer.name)}</Avatar.Fallback>
                        </Avatar>
                        <View className="flex-1">
                          <Text className="text-foreground text-sm font-medium">
                            {customer.name || 'Unknown'}
                          </Text>
                          <Text className="text-default-500 text-xs">
                            {customer.email || 'No email'}
                          </Text>
                        </View>
                        {activeProduct && (
                          <Chip
                            size="sm"
                            variant="primary"
                            color={getStatusColor(activeProduct.status)}>
                            {activeProduct.name || activeProduct.id}
                          </Chip>
                        )}
                      </Card.Body>
                    </Card>
                  </PressableFeedback>
                );
              })}
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}
