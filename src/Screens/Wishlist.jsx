import { Feather, Ionicons } from "@expo/vector-icons";
import notifee, { AndroidImportance } from "@notifee/react-native";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import { FlatList, Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { onValue, ref, remove } from "firebase/database";
import { authentication, db } from "../../Firebaseconfig";
import { imageMap } from "../Utils/imageMap";

// Exact color palette matching grocery-homepage-1.html
const GREEN_CRATE_COLORS = {
  paper: "#FAF9F4",    // Page background
  ink: "#1F2B22",      // Main text
  inkSoft: "#4B5A4C",  // Soft descriptions
  leaf: "#3F7A37",     // Primary accents
  tomato: "#E4572E",   // Alert / Remove actions
  kraft: "#D8B98A",    // Price tag fill
  line: "#E4E0D2",     // Structural outlines
  cream: "#FFFDF8",    // Card background
};

const Wishlist = ({ navigation }) => {
  const [wishlist, setWishlist] = useState([]);
  const user = authentication.currentUser;
  const userEmail = user ? user.email : null;
  const encodedEmail = userEmail ? userEmail.replace(/\./g, ",") : null;

  // Helper: Display notification via Notifee
  const showWishlistNotification = async (count) => {
    try {
      // Request permission (iOS/Android 13+)
      await notifee.requestPermission();

      // Create Android channel
      const channelId = await notifee.createChannel({
        id: 'wishlist',
        name: 'Wishlist Updates',
        importance: AndroidImportance.DEFAULT,
      });

      // Display notification
      await notifee.displayNotification({
        title: 'Green Crate Wishlist',
        body: `You currently have ${count} item(s) saved in your wishlist.`,
        android: {
          channelId,
          smallIcon: 'ic_launcher', // Ensure icon exists or fallback to default
          pressAction: {
            id: 'default',
          },
        },
      });
    } catch (e) {
      console.log('Notifee error:', e);
    }
  };

  // Load wishlist from Firebase & trigger notification if items exist
  useEffect(() => {
    if (!encodedEmail) return;
    const wishlistRef = ref(db, `WishListDetail/${encodedEmail}`);
    const unsubscribe = onValue(wishlistRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const wishlistData = Object.entries(data).map(([id, value]) => ({
          id,
          ...value,
        }));
        setWishlist(wishlistData);
        
        // Trigger notification when wishlist has items
        if (wishlistData.length > 0) {
          showWishlistNotification(wishlistData.length);
        }
      } else {
        setWishlist([]);
      }
    });
    return () => unsubscribe();
  }, [encodedEmail]);

  // Remove item from wishlist
  const removeFromWishlist = async (productId) => {
    if (!encodedEmail) return;
    
    try {
      const itemRef = ref(db, `WishListDetail/${encodedEmail}/${productId}`);
      await remove(itemRef);
    } catch (error) {
      console.error("Error removing item from wishlist: ", error);
    }
  };

  // Render each wishlist item
  const renderItem = ({ item }) => {
    const { ProductName = "", Price = 0, ImageFile = "", brand = "GREEN CRATE" } = item;
    let imageSource = null;
    if (ImageFile && imageMap[ImageFile]) {
      imageSource = imageMap[ImageFile];
    } else if (typeof ImageFile === "string" && ImageFile.trim() !== "") {
      imageSource = { uri: ImageFile };
    }

    return (
      <View style={styles.card}>
        {/* Product Image Wrap with Paper Background */}
        <View style={styles.imageWrap}>
          {imageSource ? (
            <Image resizeMode="contain" style={styles.productImg} source={imageSource} />
          ) : (
            <View style={styles.imgPlaceholder} />
          )}
        </View>

        {/* Product Details Block */}
        <View style={styles.productBody}>
          <Text style={styles.productBrand}>{brand.toUpperCase()}</Text>
          <Text style={styles.productName} numberOfLines={1}>
            {String(ProductName)}
          </Text>
          
          <View style={styles.priceRow}>
            {/* Signature Angled Kraft Price Tag */}
            <View style={styles.priceTag}>
              <View style={styles.priceHole} />
              <Text style={styles.priceText}>₹{String(Price)}</Text>
              <Text style={styles.unitText}>/ pack</Text>
            </View>
          </View>
        </View>

        {/* Theme-Consistent Delete Action */}
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => removeFromWishlist(item.id)}
          style={styles.removeBtn}
        >
          <Feather name="trash-2" size={18} color={GREEN_CRATE_COLORS.tomato} />
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeContainer}>
      <StatusBar backgroundColor={GREEN_CRATE_COLORS.cream} style="dark" />
      
      {/* Header View */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.iconBtn} onPress={() => navigation?.goBack()} activeOpacity={0.7}>
          <Ionicons name="chevron-back" size={22} color={GREEN_CRATE_COLORS.ink} />
        </TouchableOpacity>
        
        <Text style={styles.headerTitle}>My Wishlist</Text>
        <View style={{ width: 38 }} /> {/* Balanced spacer layout */}
      </View>

      {/* Conditional Layout Body */}
      {wishlist.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Feather name="heart" size={50} color={GREEN_CRATE_COLORS.line} style={{ marginBottom: 12 }} />
          <Text style={styles.emptyText}>No items in your wishlist yet</Text>
        </View>
      ) : (
        <FlatList
          data={wishlist}
          keyExtractor={(item) => String(item.id)}
          renderItem={renderItem}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeContainer: {
    flex: 1,
    backgroundColor: GREEN_CRATE_COLORS.paper,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: GREEN_CRATE_COLORS.cream,
    borderBottomWidth: 2,
    borderBottomColor: GREEN_CRATE_COLORS.ink,
  },
  iconBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: GREEN_CRATE_COLORS.paper,
    borderWidth: 1.5,
    borderColor: GREEN_CRATE_COLORS.line,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: GREEN_CRATE_COLORS.ink,
  },
  listContainer: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 24,
  },
  card: {
    flexDirection: "row",
    backgroundColor: GREEN_CRATE_COLORS.cream,
    marginVertical: 6,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: GREEN_CRATE_COLORS.line,
    padding: 12,
    alignItems: "center",
  },
  imageWrap: {
    width: 80,
    height: 80,
    backgroundColor: GREEN_CRATE_COLORS.paper,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  },
  productImg: {
    width: "90%",
    height: "90%",
  },
  imgPlaceholder: {
    width: "100%",
    height: "100%",
    backgroundColor: GREEN_CRATE_COLORS.line,
  },
  productBody: {
    flex: 1,
    marginLeft: 14,
    justifyContent: "center",
  },
  productBrand: {
    fontSize: 9,
    color: "#8A8F7F",
    fontWeight: "600",
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  productName: {
    fontSize: 16,
    fontWeight: "600",
    color: GREEN_CRATE_COLORS.ink,
    marginBottom: 6,
  },
  priceRow: {
    flexDirection: "row",
  },
  priceTag: {
    backgroundColor: GREEN_CRATE_COLORS.kraft,
    paddingVertical: 3,
    paddingLeft: 12,
    paddingRight: 8,
    borderRadius: 4,
    borderTopRightRadius: 10,
    borderBottomRightRadius: 10,
    transform: [{ rotate: "-1.5deg" }],
    position: "relative",
  },
  priceHole: {
    position: "absolute",
    left: 4,
    top: "50%",
    marginTop: -3,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: GREEN_CRATE_COLORS.cream,
  },
  priceText: {
    fontSize: 13,
    fontWeight: "700",
    color: GREEN_CRATE_COLORS.ink,
  },
  unitText: {
    fontSize: 8,
    color: GREEN_CRATE_COLORS.inkSoft,
    marginTop: -2,
  },
  removeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: GREEN_CRATE_COLS.paper || GREEN_CRATE_COLORS.paper,
    borderWidth: 1,
    borderColor: GREEN_CRATE_COLORS.line,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 10,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  emptyText: {
    fontSize: 16,
    color: GREEN_CRATE_COLORS.inkSoft,
    fontWeight: "500",
  },
});

export default Wishlist;