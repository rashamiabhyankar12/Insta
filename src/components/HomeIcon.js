import { Feather } from "@expo/vector-icons";
import { StyleSheet, Text, View } from "react-native";

const GREEN_CRATE_COLORS = {
  ink: "#1F2B22",
  leaf: "#3F7A37",
};

const HomeIcon = () => {
  return (
    <View style={styles.headerRow}>
      <View style={styles.logoGroup}>
        <Feather name="home" size={24} color={GREEN_CRATE_COLORS.leaf} />
        <Text style={styles.headerTitle}>Green Crate</Text>
      </View>
      
    </View>
  );
};

const styles = StyleSheet.create({
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justify: "space-between",
  },
  logoGroup: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: GREEN_CRATE_COLORS.ink,
  },
});

export default HomeIcon;