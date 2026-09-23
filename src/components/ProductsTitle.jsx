import { memo } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

// Exact color palette matching grocery-homepage-1.html
const GREEN_CRATE_COLORS = {
  ink: "#1F2B22",
  leaf: "#3F7A37",
  tomato: "#E4572E",
};

const ProductsTitle = ({ title, categoryId, excludeIds = [], navigation }) => {
  const handleSeeAllPress = () => {
    navigation?.navigate("ProductsList", {
      CategoryId: categoryId,
      excludeIds: excludeIds,
    });
  };

  return (
    <View style={styles.container}>
      {/* Title & Eyebrow Layout */}
      <View style={styles.titleGroup}>
        <View style={styles.eyebrowContainer}>
          <View style={styles.eyebrowLine} />
          <Text style={styles.eyebrowText}>CUSTOMER FAVORITES</Text>
        </View>
        <Text style={styles.sectionTitle}>{title}</Text>
      </View>

      {/* Modernized Interactive See All Trigger */}
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={handleSeeAllPress}
        style={styles.seeAllBtn}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }} // Expands touch target area
      >
        <Text style={styles.seeAllText}>See All</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end", // Aligns cleanly with the baseline of the main title text
    paddingHorizontal: 16,
    marginTop: 20,
    marginBottom: 10,
  },
  titleGroup: {
    flexDirection: "column",
    gap: 2,
    flex: 1,
  },
  eyebrowContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  eyebrowLine: {
    width: 16,
    height: 2,
    backgroundColor: GREEN_CRATE_COLORS.tomato,
  },
  eyebrowText: {
    fontSize: 10,
    fontWeight: "700",
    color: GREEN_CRATE_COLORS.leaf,
    letterSpacing: 1.2,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: GREEN_CRATE_COLORS.ink,
  },
  seeAllBtn: {
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  seeAllText: {
    fontSize: 14,
    fontWeight: "600",
    color: GREEN_CRATE_COLORS.leaf,
  },
});

export default memo(ProductsTitle);