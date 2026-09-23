import { Feather } from "@expo/vector-icons";
import notifee, { AndroidImportance } from "@notifee/react-native"; // <-- Import Notifee
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { StyleSheet, Text, View } from "react-native";

// Exact color palette matching the brand identity
const GREEN_CRATE_COLORS = {
  paper: "#FAF9F4",    
  ink: "#1F2B22",      
  inkSoft: "_4B5A4C",  
  leaf: "#3F7A37",     
  line: "#E4E0D2",     
  cream: "#FFFDF8",    
};

const Orderplaced = ({ navigation, route }) => {
  const orderId = route?.params?.orderId || "GC-" + Math.floor(1000 + Math.random() * 9000);

  useEffect(() => {
    // Trigger notification upon order placement display
    async function triggerOrderNotification() {
      try {
        const channelId = await notifee.createChannel({
          id: 'orders',
          name: 'Order Updates',
          importance: AndroidImportance.HIGH,
        });

        await notifee.displayNotification({
          title: 'Order Confirmed! 🌿',
          body: `Your Green Crate (${orderId}) is being prepared.`,
          android: {
            channelId,
            pressAction: { id: 'default' },
            smallIcon: 'ic_launcher', // ensure icon exists in android res
          },
          ios: {
            sound: 'default',
          },
        });
      } catch (err) {
        console.warn('Notification display failed:', err);
      }
    }

    triggerOrderNotification();

    const timer = setTimeout(() => {
      if (navigation) {
        const targetScreen = "Home"; 
        if (typeof navigation.replace === "function") {
          navigation.replace(targetScreen);
        } else if (typeof navigation.navigate === "function") {
          navigation.navigate(targetScreen);
        } else {
          console.warn("Navigation object exists, but missing standard methods.");
        }
      } else {
        console.warn("Navigation prop is completely missing from this screen.");
      }
    }, 3500); // Extended slightly to 3.5s so user sees card + gets alert

    return () => clearTimeout(timer);
  }, [navigation, orderId]);

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor={GREEN_CRATE_COLORS.paper} style="dark" />
      
      {/* Visual Success Center Card */}
      <View style={styles.successCard}>
        
        {/* Signature Tilted Success Badge Wrapper */}
        <View style={styles.iconBadge}>
          <Feather name="check-circle" size={44} color="#FFFFFF" />
        </View>

        {/* Text Blocks */}
        <Text style={styles.brandSubtitle}>THE GREEN CRATE</Text>
        <Text style={styles.mainTitle}>Order Placed Successfully!</Text>
        <Text style={styles.orderIdText}>ID: {orderId}</Text>
        
        <Text style={styles.descriptionText}>
          Thank you for choosing fresh. We are preparing your grocery crate now.
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: GREEN_CRATE_COLORS.paper, 
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  },
  successCard: {
    backgroundColor: GREEN_CRATE_COLORS.cream,
    borderWidth: 1.5,
    borderColor: GREEN_CRATE_COLORS.line, 
    borderRadius: 24,
    paddingVertical: 40,
    paddingHorizontal: 24,
    alignItems: "center",
    width: "100%",
    shadowColor: GREEN_CRATE_COLORS.ink,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  iconBadge: {
    width: 80,
    height: 80,
    backgroundColor: GREEN_CRATE_COLORS.leaf, 
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    transform: [{ rotate: "-4deg" }], 
    marginBottom: 24,
  },
  brandSubtitle: {
    fontSize: 10,
    fontWeight: "700",
    color: "#8A8F7F",
    letterSpacing: 2,
    marginBottom: 8,
  },
  mainTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: GREEN_CRATE_COLORS.ink,
    textAlign: "center",
    marginBottom: 4,
  },
  orderIdText: {
    fontSize: 12,
    fontWeight: "600",
    color: GREEN_CRATE_COLORS.leaf,
    marginBottom: 12,
  },
  descriptionText: {
    fontSize: 14,
    color: GREEN_CRATE_COLORS.inkSoft,
    textAlign: "center",
    lineHeight: 20,
    paddingHorizontal: 10,
  },
});

export default Orderplaced;