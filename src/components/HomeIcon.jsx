import { Feather } from "@expo/vector-icons";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useSelector } from "react-redux";

// Exact color palette matching the brand identity of The Green Crate
const GREEN_CRATE_COLORS = {
  paper: "#FAF9F4",    // Page canvas background context
  ink: "#1F2B22",      // Dominant primary typography text
  inkSoft: "#4B5A4C",  // Subtitles / tagline tracking labels
  line: "#E4E0D2",     // Structural separation outlines
  cream: "#FFFDF8",    // Header panel surface base fill
  leaf: "#3F7A37",     // Notification bubble accent color
};

const HomeIcon = ({ navigation }) => {
  const storeData = useSelector((state) => state.CartSlice) || [];
  
  // Dynamic counter for item badge
  const totalItemsCount = storeData.reduce((acc, item) => acc + (item.quantity || 1), 0);

  return (
    <View style={styles.headerRowBar}>
      {/* Structural left branding text grouping */}
      <View style={styles.textGroup}>
        <Text style={styles.brandMainTitle}>The Green Crate</Text>
        <Text style={styles.brandTaglineSub}>Organic Market Space</Text>
      </View>

      {/* Right Side Actions Frame */}
      <View style={styles.actionsRightFrame}>
        {/* Interactive Shopping Basket Launcher */}
        <TouchableOpacity 
          activeOpacity={0.7} 
          onPress={() => navigation?.navigate("Cart")}
          style={styles.iconContainerFrame}
        >
          <Feather name="shopping-bag" size={20} color={GREEN_CRATE_COLORS.ink} />
          
          {/* Reactive Notification Counter Badge */}
          {totalItemsCount > 0 && (
            <View style={styles.badgeNotificationBubble}>
              <Text style={styles.badgeCountText}>
                {totalItemsCount > 9 ? "9+" : totalItemsCount}
              </Text>
            </View>
          )}
        </TouchableOpacity>

        {/* Brand App Identity Logo */}
        <View style={styles.iconContainerFrame}>
          <Image
            style={styles.brandIconGraphic}
            source={require("../assets/mainIcon.png")}
            resizeMode="contain"
          />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  headerRowBar: {
    flexDirection: "row",
    justify: "space-between",
    alignItems: "center",
    backgroundColor: GREEN_CRATE_COLORS.paper,
    paddingVertical: 12,
    borderBottomWidth: 1.5,
    borderBottomColor: GREEN_CRATE_COLORS.line,
    marginBottom: 4,
  },
  textGroup: {
    flexDirection: "column",
    gap: 1,
  },
  brandMainTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: GREEN_CRATE_COLORS.ink,
    letterSpacing: -0.5,
  },
  brandTaglineSub: {
    fontSize: 12,
    fontWeight: "600",
    color: GREEN_CRATE_COLORS.inkSoft,
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  actionsRightFrame: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  iconContainerFrame: {
    width: 44,
    height: 44,
    backgroundColor: GREEN_CRATE_COLORS.cream,
    borderWidth: 1.5,
    borderColor: GREEN_CRATE_COLORS.line,
    borderRadius: 12,
    alignItems: "center",
    justify: "center",
    position: "relative",
  },
  brandIconGraphic: {
    width: "65%",
    height: "65%",
  },
  badgeNotificationBubble: {
    position: "absolute",
    top: -5,
    right: -5,
    backgroundColor: GREEN_CRATE_COLORS.leaf,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    paddingHorizontal: 4,
    alignItems: "center",
    justify: "center",
    borderWidth: 1.5,
    borderColor: GREEN_CRATE_COLORS.cream,
  },
  badgeCountText: {
    color: "#FFFFFF",
    fontSize: 9,
    fontWeight: "900",
    textAlign: "center",
  },
});

export default HomeIcon;