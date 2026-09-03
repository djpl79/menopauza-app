import { Feather } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';
import { useColors } from '@/hooks/useColors';

export function BrandMark({ inverse = false }: { inverse?: boolean }) {
  const colors = useColors();
  const ink = inverse ? colors.secondary : colors.primary;
  const text = inverse ? colors.primaryForeground : colors.foreground;

  return (
    <View style={styles.row}>
      <View style={[styles.mark, { backgroundColor: ink }]}>
        <Feather name="feather" size={18} color={inverse ? colors.foreground : colors.primaryForeground} />
      </View>
      <Text style={[styles.name, { color: text }]}>Menopauza</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { alignItems: 'center', flexDirection: 'row', gap: 10 },
  mark: { alignItems: 'center', borderRadius: 13, height: 38, justifyContent: 'center', width: 38 },
  name: { fontFamily: 'Georgia', fontSize: 22, fontWeight: '600', letterSpacing: -0.6 },
});