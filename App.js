import { Feather } from "@expo/vector-icons";
import { useCallback, useEffect, useState } from "react";
import { BackHandler, Platform, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { initialWindowMetrics, SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { Provider } from "react-redux";

import { Store } from "./Redux/Store";
import Cart from "./src/Screens/Cart";
import CheckoutScreen from "./src/Screens/Checkout";
import Details from "./src/Screens/Details";
import ForgotPassword from "./src/Screens/ForgetPassword";
import Home from "./src/Screens/Home";
import Login from "./src/Screens/Login";
import MyOrders from "./src/Screens/MyOrders";
import Orderplaced from "./src/Screens/Orderplaced";
import OrderTracking from "./src/Screens/OrderTracking";
import ProductsList from "./src/Screens/ProductsList";
import Signup from "./src/Screens/Signup";
import Splash from "./src/Screens/Splash";
import Wishlist from "./src/Screens/Wishlist";

const GREEN_CRATE_COLORS = {
  paper: "#FAF9F4",
  cream: "#FFFDF8",
  ink: "#1F2B22",
  inkSoft: "#A3A899",
  leaf: "#3F7A37",
  line: "#E4E0D2",
};

const TAB_SCREENS = ["Home", "MyOrders", "Wishlist", "OrderTracking"];

export default function App() {
  const [history, setHistory] = useState([{ screen: "Splash", params: {} }]);

  const currentEntry = history[history.length - 1] || { screen: "Home", params: {} };
  const currentScreen = currentEntry.screen;
  const screenParams = currentEntry.params;

  const navigate = useCallback((screenName, params = {}) => {
    setHistory((prev) => {
      if (TAB_SCREENS.includes(screenName)) {
        return [{ screen: screenName, params }];
      }
      return [...prev, { screen: screenName, params }];
    });
  }, []);

  const replace = useCallback((screenName, params = {}) => {
    setHistory((prev) => {
      const next = prev.slice(0, prev.length - 1);
      return [...next, { screen: screenName, params }];
    });
  }, []);

  const reset = useCallback((config) => {
    const route = config?.routes?.[0] || { name: "Home" };
    setHistory([{ screen: route.name, params: route.params || {} }]);
  }, []);

  const goBack = useCallback(() => {
    setHistory((prev) => {
      if (prev.length > 1) {
        return prev.slice(0, prev.length - 1);
      }
      if (currentScreen !== "Home" && !TAB_SCREENS.includes(currentScreen)) {
        return [{ screen: "Home", params: {} }];
      }
      return prev;
    });
  }, [currentScreen]);

  const navigation = {
    navigate,
    replace,
    reset,
    goBack,
    canGoBack: () => history.length > 1 || (!TAB_SCREENS.includes(currentScreen) && currentScreen !== "Home"),
  };

  useEffect(() => {
    const onBackPress = () => {
      if (history.length > 1) {
        goBack();
        return true;
      }
      if (currentScreen === "Home") {
        return false;
      }
      navigate("Home");
      return true;
    };

    const subscription = BackHandler.addEventListener("hardwareBackPress", onBackPress);
    return () => subscription.remove();
  }, [history.length, currentScreen, goBack, navigate]);

  const renderScreen = () => {
    const route = { params: screenParams };

    switch (currentScreen) {
      case "Splash":
        return <Splash navigation={navigation} route={route} />;
      case "Login":
        return <Login navigation={navigation} route={route} />;
      case "Signup":
        return <Signup navigation={navigation} route={route} />;
      case "Home":
        return <Home navigation={navigation} route={route} />;
      case "MyOrders":
        return <MyOrders navigation={navigation} route={route} />;
      case "Wishlist":
        return <Wishlist navigation={navigation} route={route} />;
      case "OrderTracking":
        return <OrderTracking navigation={navigation} route={route} />;
      case "Details":
        return <Details navigation={navigation} route={route} />;
      case "Cart":
        return <Cart navigation={navigation} route={route} />;
      case "CheckoutScreen":
        return <CheckoutScreen navigation={navigation} route={route} />;
      case "Orderplaced":
        return <Orderplaced navigation={navigation} route={route} />;
      case "ProductsList":
        return <ProductsList navigation={navigation} route={route} />;
      case "ForgotPassword":
        return <ForgotPassword navigation={navigation} route={route} />;
      default:
        return <Home navigation={navigation} route={route} />;
    }
  };

  const isTabScreen = TAB_SCREENS.includes(currentScreen);

  const tabs = [
    { name: "Home", label: "Shop", icon: "home" },
    { name: "MyOrders", label: "Orders", icon: "package" },
    { name: "Wishlist", label: "Favorites", icon: "heart" },
    { name: "OrderTracking", label: "Track", icon: "truck" },
  ];

  return (
    <Provider store={Store}>
      <SafeAreaProvider initialMetrics={initialWindowMetrics}>
        <View style={styles.container}>
          <View style={styles.screenContainer}>{renderScreen()}</View>

          {isTabScreen && (
            <SafeAreaView edges={["bottom"]} style={styles.bottomTabBarContainer}>
              {tabs.map((tab) => {
                const isFocused = currentScreen === tab.name;
                return (
                  <TouchableOpacity
                    key={tab.name}
                    style={styles.tabItem}
                    activeOpacity={0.7}
                    onPress={() => navigate(tab.name)}
                  >
                    <Feather
                      name={tab.icon}
                      size={isFocused ? 23 : 22}
                      color={isFocused ? GREEN_CRATE_COLORS.leaf : GREEN_CRATE_COLORS.inkSoft}
                    />
                    <Text
                      style={[
                        styles.tabBarLabelElement,
                        { color: isFocused ? GREEN_CRATE_COLORS.leaf : GREEN_CRATE_COLORS.inkSoft },
                      ]}
                    >
                      {tab.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </SafeAreaView>
          )}
        </View>
      </SafeAreaProvider>
    </Provider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: GREEN_CRATE_COLORS.cream,
  },
  screenContainer: {
    flex: 1,
  },
  bottomTabBarContainer: {
    flexDirection: "row",
    backgroundColor: GREEN_CRATE_COLORS.cream,
    borderTopWidth: 1.5,
    borderTopColor: GREEN_CRATE_COLORS.line,
    minHeight: 56, // Changed from fixed height to minHeight
    paddingTop: 6,
    paddingBottom: 6,
    elevation: 10,
    zIndex: 999,
  },
  tabItem: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 2,
  },
  tabBarLabelElement: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.2,
    marginTop: 2,
  },
});