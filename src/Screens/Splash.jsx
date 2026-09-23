import AsyncStorage from "@react-native-async-storage/async-storage";
import { StatusBar } from "expo-status-bar";
import { useEffect, useRef } from "react";
import { Animated, Image, StyleSheet, Text, View } from "react-native";

// Exact color palette matching brand identity
const GREEN_CRATE_COLORS = {
  ink: "#1F2B22",     // Main background tone
  leaf: "#3F7A37",    // Tilted icon crate fill
  cream: "#FFFDF8",   // High-contrast brand typography
  subtext: "#AEC0A9", // Muted secondary text
};

const Splash = ({ navigation }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // 1. Fade-in entry animation
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();

    // 2. Safely check user authentication state and navigate
    const checkUserSession = async () => {
      try {
        const userId = await AsyncStorage.getItem("id");
        const targetScreen = userId ? "Home" : "Login";

        // Use navigation.reset to reset the stack (prevents back-button returning to Splash)
        if (navigation && typeof navigation.reset === "function") {
          navigation.reset({
            index: 0,
            routes: [{ name: targetScreen }],
          });
        } else if (navigation && typeof navigation.navigate === "function") {
          navigation.navigate(targetScreen);
        }
      } catch (error) {
        console.error("AsyncStorage error in Splash screen:", error);
        // Fallback to Login screen on error
        if (navigation && typeof navigation.navigate === "function") {
          navigation.navigate("Login");
        }
      }
    };

    // Hold the splash screen for 2 seconds before routing
    const timer = setTimeout(() => {
      checkUserSession();
    }, 2000);

    return () => clearTimeout(timer);
  }, [navigation, fadeAnim]);

  return (
    <View style={styles.container}>
      <StatusBar style="light" backgroundColor={GREEN_CRATE_COLORS.ink} />

      <Animated.View style={[styles.brandGroup, { opacity: fadeAnim }]}>
        {/* Tilted Green Crate Icon Badge */}
        <View style={styles.crateIconBadge}>
          <Image
            style={styles.logoIcon}
            source={require("../assets/mainIcon.png")}
          />
        </View>

        {/* Brand Typography */}
        <View style={styles.textGroup}>
          <Text style={styles.brandTitle}>The Green Crate</Text>
          <Text style={styles.brandSubtitle}>FRESH GROCERIES DELIVERED</Text>
        </View>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: GREEN_CRATE_COLORS.ink,
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  brandGroup: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 16,
  },
  crateIconBadge: {
    width: 64,
    height: 64,
    backgroundColor: GREEN_CRATE_COLORS.leaf,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    transform: [{ rotate: "-4deg" }],
  },
  logoIcon: {
    height: 36,
    width: 36,
    tintColor: "#FFFFFF",
    resizeMode: "contain",
  },
  textGroup: {
    flexDirection: "column",
    justifyContent: "center",
  },
  brandTitle: {
    fontSize: 32,
    fontWeight: "700",
    color: GREEN_CRATE_COLORS.cream,
    lineHeight: 36,
  },
  brandSubtitle: {
    color: GREEN_CRATE_COLORS.subtext,
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 2,
    marginTop: 4,
  },
});

export default Splash;