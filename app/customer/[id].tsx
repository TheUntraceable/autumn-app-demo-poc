import { getApiKey } from '@/utils/storage';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Autumn, Customer, CustomerProduct } from 'autumn-js';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import { Avatar } from 'heroui-native/avatar';
import { Button } from 'heroui-native/button';
import { Card } from 'heroui-native/card';
import { Chip } from 'heroui-native/chip';
import { Dialog } from 'heroui-native/dialog';
import { Input } from 'heroui-native/input';
import { Label } from 'heroui-native/label';
import { Skeleton } from 'heroui-native/skeleton';
import { TextField } from 'heroui-native/text-field';
import { useState } from 'react';
import { Alert, ScrollView, Text, View } from 'react-native';

type ExpandedCustomer = Customer & {
  invoices?: {
    id: string;
    total: number;
    currency: string;
    status: string;
    created_at: number;
  }[];
  entities?: {
    id: string;
    name: string;
  }[];
};

export default function CustomerDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const queryClient = useQueryClient();
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');

  const { data: customer, isLoading } = useQuery({
    queryKey: ['customer', id],
    queryFn: async () => {
      const key = await getApiKey();
      const autumn = new Autumn({ secretKey: key || '' });
      const result = await autumn.customers.get(id, {
        expand: ['invoices', 'entities'],
      });
      return result.data;
    },
    enabled: !!id,
  });

  const updateMutation = useMutation({
    mutationFn: async (data: { name?: string; email?: string }) => {
      const key = await getApiKey();
      const autumn = new Autumn({ secretKey: key || '' });
      return autumn.customers.update(id, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customer', id] });
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      setEditModalOpen(false);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async () => {
      const key = await getApiKey();
      const autumn = new Autumn({ secretKey: key || '' });
      return autumn.customers.delete(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      router.back();
    },
  });

  const handleDelete = () => {
    Alert.alert('Delete Customer', 'Are you sure you want to delete this customer?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => deleteMutation.mutate(),
      },
    ]);
  };

  const handleEdit = () => {
    setEditName(customer?.name || '');
    setEditEmail(customer?.email || '');
    setEditModalOpen(true);
  };

  const handleSaveEdit = () => {
    updateMutation.mutate({ name: editName, email: editEmail });
  };

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
      case 'expired':
        return 'default';
      default:
        return 'default';
    }
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleDateString();
  };

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency?.toUpperCase() || 'USD',
    }).format(amount / 100);
  };

  if (isLoading) {
    return (
      <View className="bg-background flex-1">
        <Stack.Screen options={{ title: 'Customer' }} />
        <ScrollView className="flex-1 px-4 pt-4">
          <Skeleton className="mb-4 h-24 rounded-xl" />
          <Skeleton className="mb-4 h-32 rounded-xl" />
          <Skeleton className="h-48 rounded-xl" />
        </ScrollView>
      </View>
    );
  }

  if (!customer) {
    return (
      <View className="bg-background flex-1">
        <Stack.Screen options={{ title: 'Customer' }} />
        <View className="flex-1 items-center justify-center px-4">
          <Text className="text-default-500">Customer not found</Text>
        </View>
      </View>
    );
  }

  return (
    <View className="bg-background flex-1">
      <Stack.Screen
        options={{
          title: customer.name || 'Customer',
          headerRight: () => (
            <View className="flex-row gap-2">
              <Button size="sm" variant="secondary" onPress={handleEdit}>
                Edit
              </Button>
              <Button size="sm" variant="danger" onPress={handleDelete}>
                Delete
              </Button>
            </View>
          ),
        }}
      />
      <ScrollView className="flex-1 px-4 pt-4">
        <Card className="mb-4" variant="secondary">
          <Card.Body className="flex-row items-center gap-4 py-4">
            <Avatar alt={customer.name || 'Customer'} size="lg" color="accent">
              <Avatar.Fallback>{getInitials(customer.name)}</Avatar.Fallback>
            </Avatar>
            <View className="flex-1">
              <Text className="text-foreground text-lg font-semibold">
                {customer.name || 'Unknown'}
              </Text>
              <Text className="text-default-500 text-sm">{customer.email || 'No email'}</Text>
              <Text className="text-default-400 mt-1 text-xs">ID: {customer.id}</Text>
            </View>
          </Card.Body>
        </Card>

        <View className="mb-4">
          <Text className="text-foreground mb-3 text-lg font-semibold">Products</Text>
          {customer.products && customer.products.length > 0 ? (
            <View className="gap-2">
              {customer.products.map((product: CustomerProduct) => (
                <Card key={product.id} variant="default">
                  <Card.Body className="flex-row items-center justify-between py-3">
                    <View className="flex-1">
                      <Text className="text-foreground text-sm font-medium">
                        {product.name || product.id}
                      </Text>
                      <Text className="text-default-500 text-xs">
                        {product.group || 'No group'}
                      </Text>
                      {product.current_period_end && (
                        <Text className="text-default-400 mt-1 text-xs">
                          Ends: {formatDate(product.current_period_end)}
                        </Text>
                      )}
                    </View>
                    <Chip size="sm" variant="secondary" color={getStatusColor(product.status)}>
                      {product.status}
                    </Chip>
                  </Card.Body>
                </Card>
              ))}
            </View>
          ) : (
            <Card variant="default">
              <Card.Body className="items-center py-6">
                <Text className="text-default-500">No products</Text>
              </Card.Body>
            </Card>
          )}
        </View>

        {customer.entities && customer.entities.length > 0 && (
          <View className="mb-4">
            <Text className="text-foreground mb-3 text-lg font-semibold">Entities</Text>
            <View className="gap-2">
              {customer.entities.map((entity) => (
                <Card key={entity.id} variant="default">
                  <Card.Body className="py-3">
                    <Text className="text-foreground text-sm font-medium">{entity.name}</Text>
                    <Text className="text-default-500 text-xs">{entity.id}</Text>
                  </Card.Body>
                </Card>
              ))}
            </View>
          </View>
        )}

        {customer.invoices && customer.invoices.length > 0 && (
          <View className="mb-4">
            <Text className="text-foreground mb-3 text-lg font-semibold">Recent Invoices</Text>
            <View className="gap-2">
              {customer.invoices.slice(0, 5).map((invoice) => (
                <Card key={invoice.stripe_id || invoice.created_at} variant="default">
                  <Card.Body className="flex-row items-center justify-between py-3">
                    <View>
                      <Text className="text-foreground text-sm font-medium">
                        {formatCurrency(invoice.total, invoice.currency)}
                      </Text>
                      <Text className="text-default-500 text-xs">
                        {formatDate(invoice.created_at)}
                      </Text>
                    </View>
                    <Chip
                      size="sm"
                      variant="secondary"
                      color={invoice.status === 'paid' ? 'success' : 'warning'}>
                      {invoice.status}
                    </Chip>
                  </Card.Body>
                </Card>
              ))}
            </View>
          </View>
        )}
      </ScrollView>

      <Dialog isOpen={editModalOpen} onOpenChange={setEditModalOpen}>
        <Dialog.Portal>
          <Dialog.Overlay />
          <Dialog.Content>
            <View className="gap-4 p-4">
              <Text className="text-foreground text-lg font-semibold">Edit Customer</Text>
              <TextField>
                <Label>Name</Label>
                <Input
                  value={editName}
                  onChangeText={setEditName}
                  placeholder="Customer name"
                />
              </TextField>
              <TextField>
                <Label>Email</Label>
                <Input
                  value={editEmail}
                  onChangeText={setEditEmail}
                  placeholder="Customer email"
                  keyboardType="email-address"
                />
              </TextField>
              <View className="flex-row justify-end gap-2">
                <Button variant="tertiary" onPress={() => setEditModalOpen(false)}>
                  Cancel
                </Button>
                <Button onPress={handleSaveEdit}>
                  Save
                </Button>
              </View>
            </View>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog>
    </View>
  );
}
