import { SafeAreaView } from 'react-native-safe-area-context';

export const Container = ({ children }: { children: React.ReactNode }) => {
  return <SafeAreaView className="bg-background text-foreground flex-1">{children}</SafeAreaView>;
};
