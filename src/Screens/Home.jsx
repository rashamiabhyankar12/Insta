import { Feather } from "@expo/vector-icons";
import notifee, { AndroidImportance } from "@notifee/react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { signOut } from "firebase/auth";
import { onValue, ref, set } from "firebase/database";
import { useEffect, useRef, useState } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useSelector } from "react-redux";

import { authentication, db } from "../../Firebaseconfig";
import HomeBanner from "../components/HomeBanner";
import HomeSearch from "../components/HomeSearch";
import ProductsCarousel from "../components/ProductsCarousel";
import ProductsTitle from "../components/ProductsTitle";
import { myColors } from "../Utils/MyColors";

const GREEN_CRATE_COLORS = {
  paper: "#FAF9F4",
  ink: "#1F2B22",
  inkSoft: "#4B5A4C",
  leaf: "#3F7A37",
  tomato: "#E4572E",
  line: "#E4E0D2",
  cream: "#FFFDF8",
};

const CATEGORIES = [
  { id: null, label: "All" },
  { id: 1, label: "Fruits" },
  { id: 2, label: "Vegetables" },
  { id: 3, label: "Dairy & Eggs" },
  { id: 7, label: "Drinks" },
  { id: 8, label: "Meat & Fish" },
];

const LAST_SEEN_KEY = "gc_lastSeenOrderStatuses";
const UNREAD_PATH = "Notifications/unreadCount";

const Home = ({ navigation }) => {
  const [products, setProducts] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [changedOrders, setChangedOrders] = useState([]);

  // orderId -> last status we saw, so we can detect status changes
  const seenStatuses = useRef({});

  // Redux Cart State
  const cartItems = useSelector((state) => state.CartSlice);
  const cartCount = cartItems.reduce(
    (total, item) => total + (item.quantity || 1),
    0
  );

  // Helper: Trigger Notifee notification on order status change
  const showOrderStatusNotification = async (orderId, newStatus) => {
    try {
      await notifee.requestPermission();

      const channelId = await notifee.createChannel({
        id: "order_status",
        name: "Order Status Updates",
        importance: AndroidImportance.HIGH,
      });

      await notifee.displayNotification({
        title: "Order Status Updated",
        body: `Order #${orderId} status changed to "${newStatus}"`,
        android: {
          channelId,
          smallIcon: "ic_launcher",
          pressAction: {
            id: "default",
          },
        },
      });
    } catch (err) {
      console.log("Notifee order status error:", err);
    }
  };

  // 1. Fetch Products & Firebase Notifications status
  useEffect(() => {
    const itemsRef = ref(db, "Products");
    const unsubscribeProducts = onValue(itemsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const productsArray = Object.entries(data).map(([id, value]) => ({
          id,
          ...value,
        }));
        setProducts(productsArray);
      }
    });

    const unreadRef = ref(db, UNREAD_PATH);
    const unsubscribeUnread = onValue(unreadRef, (snapshot) => {
      const val = snapshot.val();
      setUnreadCount(typeof val === "number" ? val : 0);
    });

    return () => {
      unsubscribeProducts();
      unsubscribeUnread();
    };
  }, []);

  // 2. Watch the Orders table — bump bell badge, update state, and dispatch Notifee
  useEffect(() => {
    const ordersRef = ref(db, "Orders");
    let ready = false;

    const unsubscribeOrders = onValue(ordersRef, async (snapshot) => {
      const data = snapshot.val();
      if (!data) return;

      const orders = Object.entries(data).map(([id, value]) => ({
        id,
        ...value,
      }));

      let stored = {};
      try {
        stored = JSON.parse((await AsyncStorage.getItem(LAST_SEEN_KEY)) || "{}");
      } catch (err) {
        stored = {};
      }

      if (!ready) {
        seenStatuses.current = stored;
        ready = true;
      }

      let newChanges = 0;
      const updated = { ...seenStatuses.current };

      orders.forEach((order) => {
        const status =
          order.OrderStatus ?? order.orderStatus ?? order.status ?? "";
        const prev = updated[order.id];

        if (prev !== undefined && prev !== status) {
          newChanges += 1;
          setChangedOrders((c) =>
            c.some((x) => x.id === order.id)
              ? c.map((x) => (x.id === order.id ? { ...x, status } : x))
              : [...c, { id: order.id, status }]
          );
          // Trigger local Notifee alert for status change
          showOrderStatusNotification(order.id, status);
        }
        updated[order.id] = status;
      });

      seenStatuses.current = updated;

      try {
        await AsyncStorage.setItem(LAST_SEEN_KEY, JSON.stringify(updated));
      } catch (err) {
        // storage fallback
      }

      if (newChanges > 0) {
        set(ref(db, UNREAD_PATH), newChanges).catch(() => {});
      }
    });

    return () => unsubscribeOrders();
  }, []);

  const handleLogout = () => {
    Alert.alert(
      "Log Out",
      "Are you sure you want to log out of The Green Crate?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Log Out",
          style: "destructive",
          onPress: async () => {
            try {
              await signOut(authentication);
              await AsyncStorage.removeItem("id");
              await AsyncStorage.removeItem("userEmail");
              if (navigation && typeof navigation.reset === "function") {
                navigation.reset({
                  index: 0,
                  routes: [{ name: "Login" }],
                });
              } else if (
                navigation &&
                typeof navigation.navigate === "function"
              ) {
                navigation.navigate("Login");
              }
            } catch (err) {
              Alert.alert("Logout Error", err.message);
            }
          },
        },
      ]
    );
  };

  const handleNotificationsPress = () => {
    set(ref(db, UNREAD_PATH), 0).catch(() => {});

    if (changedOrders.length > 0) {
      const msg = changedOrders
        .map((o) => `Order #${o.id} — status changed to "${o.status}"`)
        .join("\n");
      Alert.alert("Order Status Changed", msg);
    }

    setChangedOrders([]);
    navigation.navigate("Notifications");
  };

  const getFilteredCategoryItems = (categoryId) => {
    return products.filter((p) => {
      const matchesCategory =
        categoryId === null ? true : Number(p.CategoryId) === categoryId;
      const matchesSearch = p.ProductName
        ? p.ProductName.toLowerCase().includes(searchQuery.toLowerCase())
        : false;

      return searchQuery ? matchesCategory && matchesSearch : matchesCategory;
    });
  };

  const sectionConfig = [
    { id: 1, title: "Fruits" },
    { id: 2, title: "Vegetables" },
    { id: 7, title: "Cold Drinks & Juices" },
    { id: 8, title: "Chicken, Meat & Fish" },
    { id: 3, title: "Dairy, Bread & Eggs" },
  ];

  const filteredSections = sectionConfig
    .map((sec) => ({
      ...sec,
      items: getFilteredCategoryItems(sec.id),
    }))
    .filter((sec) => activeCategory === null || activeCategory === sec.id);

  const hasResults = filteredSections.some((sec) => sec.items.length > 0);

  return (
    <SafeAreaView style={styles.safeContainer}>
      <View style={styles.topHeaderBar}>
        <View style={styles.appNameContainer}>
          <View style={styles.brandRow}>
            <View style={styles.leafDot} />
            <Text style={styles.brandSubtitleText}>GreenCrate</Text>
          </View>
        </View>

        <View style={styles.headerRightActions}>
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={handleNotificationsPress}
            style={styles.actionButtonBadge}
            accessibilityLabel="Notifications"
          >
            <Feather
              name="bell"
              size={18}
              color={
                unreadCount > 0
                  ? GREEN_CRATE_COLORS.tomato
                  : GREEN_CRATE_COLORS.ink
              }
            />
            {unreadCount > 0 && (
              <View style={styles.notificationBadge}>
                <Text style={styles.notificationBadgeText}>
                  {unreadCount > 9 ? "9+" : unreadCount}
                </Text>
              </View>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.7}
            onPress={handleLogout}
            style={styles.actionButtonBadge}
            accessibilityLabel="Log out"
          >
            <Feather name="log-out" size={18} color={GREEN_CRATE_COLORS.tomato} />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.searchSection}>
        <HomeSearch value={searchQuery} onChangeText={setSearchQuery} />
      </View>

      <View style={styles.categoryRow}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryTabsList}
        >
          {CATEGORIES.map((cat) => {
            const isActive = activeCategory === cat.id;
            return (
              <TouchableOpacity
                key={String(cat.id)}
                activeOpacity={0.75}
                onPress={() => setActiveCategory(cat.id)}
                style={[
                  styles.categoryPill,
                  isActive && styles.categoryPillActive,
                ]}
              >
                <Text
                  style={[
                    styles.categoryPillText,
                    isActive && styles.categoryPillTextActive,
                  ]}
                >
                  {cat.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        style={{ flex: 1, paddingHorizontal: 16 }}
      >
        <View style={{ gap: 20, paddingBottom: 130, paddingTop: 6 }}>
          {!searchQuery && activeCategory === null && <HomeBanner />}

          {hasResults ? (
            filteredSections.map(
              (section) =>
                section.items.length > 0 && (
                  <View key={section.id} style={styles.sectionBlock}>
                    <ProductsTitle
                      title={section.title}
                      categoryId={section.id}
                      excludeIds={section.items.slice(0, 4).map((i) => i.id)}
                      navigation={navigation}
                    />
                    <ProductsCarousel
                      data={section.items}
                      navigation={navigation}
                    />
                  </View>
                )
            )
          ) : (
            <View style={styles.emptyStateContainer}>
              <View style={styles.emptyIconBadge}>
                <Feather
                  name="search"
                  size={24}
                  color={GREEN_CRATE_COLORS.leaf}
                />
              </View>
              <Text style={styles.emptyTitle}>No matching products</Text>
              <Text style={styles.emptySubtitle}>
                Try adjusting your search query or switching category filters.
              </Text>
            </View>
          )}
        </View>
      </ScrollView>

      <TouchableOpacity
        activeOpacity={0.88}
        onPress={() => navigation.navigate("Cart")}
        style={styles.floatingCartButton}
      >
        <Feather name="shopping-bag" size={22} color="#FFFFFF" />
        {cartCount > 0 && (
          <View style={styles.floatingCartBadge}>
            <Text style={styles.floatingCartBadgeText}>
              {cartCount > 99 ? "99+" : cartCount}
            </Text>
          </View>
        )}
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeContainer: {
    flex: 1,
    backgroundColor: GREEN_CRATE_COLORS.paper,
  },
  topHeaderBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 8,
  },
  appNameContainer: {
    flex: 1,
  },
  brandRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 2,
  },
  leafDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: GREEN_CRATE_COLORS.leaf,
  },
  brandSubtitleText: {
    fontSize: 16,
    fontWeight: "700",
    color: GREEN_CRATE_COLORS.ink,
    letterSpacing: 0.3,
  },
  headerRightActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  actionButtonBadge: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: GREEN_CRATE_COLORS.cream,
    borderWidth: 1,
    borderColor: GREEN_CRATE_COLORS.line,
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  notificationBadge: {
    position: "absolute",
    top: -3,
    right: -3,
    backgroundColor: GREEN_CRATE_COLORS.tomato,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 4,
    borderWidth: 2,
    borderColor: GREEN_CRATE_COLORS.cream,
  },
  notificationBadgeText: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "700",
  },
  searchSection: {
    paddingHorizontal: 16,
    paddingBottom: 10,
  },
  categoryRow: {
    paddingLeft: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(228, 224, 210, 0.4)",
  },
  categoryTabsList: {
    gap: 8,
    alignItems: "center",
    paddingRight: 16,
  },
  categoryPill: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: GREEN_CRATE_COLORS.cream,
    borderWidth: 1,
    borderColor: GREEN_CRATE_COLORS.line,
  },
  categoryPillActive: {
    backgroundColor: GREEN_CRATE_COLORS.ink,
    borderColor: GREEN_CRATE_COLORS.ink,
  },
  categoryPillText: {
    fontSize: 13,
    fontWeight: "600",
    color: GREEN_CRATE_COLORS.inkSoft,
  },
  categoryPillTextActive: {
    color: "#FFFFFF",
  },
  sectionBlock: {
    gap: 12,
  },
  emptyStateContainer: {
    alignItems: "center",
    justifyContent: "center",
    marginTop: 50,
    paddingHorizontal: 24,
    gap: 8,
  },
  emptyIconBadge: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: GREEN_CRATE_COLORS.cream,
    borderWidth: 1,
    borderColor: GREEN_CRATE_COLORS.line,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 4,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: GREEN_CRATE_COLORS.ink,
  },
  emptySubtitle: {
    fontSize: 13,
    color: GREEN_CRATE_COLORS.inkSoft,
    textAlign: "center",
    lineHeight: 18,
  },
  floatingCartButton: {
    position: "absolute",
    bottom: 24,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: myColors?.primary || GREEN_CRATE_COLORS.leaf,
    justifyContent: "center",
    alignItems: "center",
    elevation: 8,
    shadowColor: GREEN_CRATE_COLORS.ink,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.28,
    shadowRadius: 6,
    zIndex: 99,
  },
  floatingCartBadge: {
    position: "absolute",
    top: -4,
    right: -4,
    backgroundColor: GREEN_CRATE_COLORS.tomato,
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 4,
    borderWidth: 2,
    borderColor: "#FFFFFF",
  },
  floatingCartBadgeText: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "700",
  },
});

export default Home;