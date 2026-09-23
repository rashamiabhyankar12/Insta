import { Feather } from "@expo/vector-icons";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import { FlatList, Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { responsiveHeight } from "react-native-responsive-dimensions";
import { SafeAreaView } from "react-native-safe-area-context";
import { useDispatch, useSelector } from "react-redux";

import AsyncStorage from "@react-native-async-storage/async-storage";

import { authentication } from "../../Firebaseconfig";
import { decrementQuantity, incrementQuantity, removeFromCart } from "../../Redux/CartSlice";
import { imageMap } from "../Utils/imageMap";

// Exact color palette matching the brand identity of The Green Crate
const GREEN_CRATE_COLORS = {
  paper: "#FAF9F4",    // Page base canvas color context
  cream: "#FFFDF8",    // Supporting text card surfaces
  ink: "#1F2B22",      // Dominant primary headers text
  inkSoft: "#4B5A4C",  // Subtle descriptions & label keys
  leaf: "#3F7A37",     // Primary action callouts ("Go to Checkout")
  tomato: "#E4572E",   // Accent tone matching high-priority operations
  line: "#E4E0D2",     // Structural layout separation rules
};

const Cart = ({ navigation }) => {
  const dispatch = useDispatch();
  const storeData = useSelector((state) => state.CartSlice);
  const [userEmail, setUserEmail] = useState(null);

  // Calculate order metrics reliably on component re-evaluations
  const totalBillAmount = storeData.reduce((sum, item) => sum + item.Price * (item.quantity || 1), 0);

  useEffect(() => {
    const getEmail = async () => {
      const email = await AsyncStorage.getItem("userEmail");
      setUserEmail(email);
    };
    getEmail();
  }, []);

  const currentUserObj = authentication.currentUser;
  const targetUserMail = currentUserObj ? currentUserObj.email : userEmail;

  const handleCheckoutProcess = async () => {
    if (storeData.length === 0) return;

    // Navigate using the passed navigation prop
    navigation.navigate("CheckoutScreen", {
      cartItems: storeData.map((item) => ({
        ProductName: item.ProductName,
        UnitPrice: item.Price,
        Quantity: item.quantity,
        Image: item.Image || "",
        ProductId: item.Id || "",
        userId: targetUserMail,
      })),
      totalAmount: totalBillAmount,
      targetUserMail: targetUserMail,
    });
  };

  return (
    <SafeAreaView style={styles.safeContainer}>
      <StatusBar backgroundColor={GREEN_CRATE_COLORS.paper} style="dark" />

      {/* Structural Branding Page Title */}
      <View style={styles.headerTitleStripBox}>
        <Text style={styles.mainHeaderLabelText}>My Basket</Text>
        <Text style={styles.subHeaderCountLabel}>
          {storeData.length} {storeData.length === 1 ? "Item" : "Items"} Total
        </Text>
      </View>

      {/* Primary Cart Stream Workspace Block */}
      <View style={styles.cartListStreamWrapper}>
        <FlatList
          showsVerticalScrollIndicator={false}
          data={storeData}
          keyExtractor={(item, index) => (item.Id ? String(item.Id) : String(index))}
          contentContainerStyle={styles.listBottomSpacerShim}
          renderItem={({ item }) => {
            let mappedItemImage = require("../assets/mainIcon.png");
            if (item.Image && imageMap[item.Image]) {
              mappedItemImage = imageMap[item.Image];
            } else if (typeof item.Image === "string" && item.Image.startsWith("http")) {
              mappedItemImage = { uri: item.Image };
            }

            return (
              <View style={styles.cartRowCardTile}>
                {/* Product Thumbnail Box Graphic Layout */}
                <View style={styles.itemImageFrameTile}>
                  <Image style={styles.thumbnailGraphic} source={mappedItemImage} />
                </View>

                {/* Core Descriptive Context Meta Details View Panel */}
                <View style={styles.metaProductSpecificationsBlock}>
                  <View style={styles.topRowSummaryGroup}>
                    <Text numberOfLines={1} style={styles.productNameLabelHeading}>
                      {item.ProductName}
                    </Text>
                    <TouchableOpacity
                      activeOpacity={0.6}
                      onPress={() => dispatch(removeFromCart(item))}
                      style={styles.trashActionButtonSquare}
                    >
                      <Feather name="trash-2" size={16} color={GREEN_CRATE_COLORS.tomato} />
                    </TouchableOpacity>
                  </View>

                  <Text style={styles.unitCostTrackingMeta}>
                    ₹{item.Price} / Unit
                  </Text>

                  {/* Core Interactive Stepper Layout Controls */}
                  <View style={styles.stepperInteractionsRowControlBar}>
                    <View style={styles.quantityCounterPillBox}>
                      <TouchableOpacity
                        activeOpacity={0.7}
                        onPress={() => dispatch(decrementQuantity(item))}
                        style={styles.stepperMathActionButton}
                      >
                        <Feather name="minus" size={14} color={GREEN_CRATE_COLORS.ink} />
                      </TouchableOpacity>

                      <Text style={styles.currentQuantityDigitalDisplay}>
                        {item.quantity}
                      </Text>

                      <TouchableOpacity
                        activeOpacity={0.7}
                        onPress={() => {
                          if (item.quantity < 7) {
                            dispatch(incrementQuantity(item));
                          }
                        }}
                        style={styles.stepperMathActionButton}
                      >
                        <Feather name="plus" size={14} color={GREEN_CRATE_COLORS.ink} />
                      </TouchableOpacity>
                    </View>

                    {/* Integrated Total Matrix Compound Evaluation Label */}
                    <Text style={styles.aggregatedRowSumPriceTag}>
                      ₹{(item.quantity || 1) * item.Price}
                    </Text>
                  </View>
                </View>
              </View>
            );
          }}
          ListEmptyComponent={
            <View style={styles.emptyCartPlaceholderViewport}>
              <Feather name="shopping-cart" size={48} color={GREEN_CRATE_COLORS.line} />
              <Text style={styles.emptyCartFeedbackMessage}>Your basket is looking empty</Text>
            </View>
          }
        />
      </View>

      {/* Fixed Footer Total Checkout Hub Panel Base Tray */}
      {storeData.length > 0 && (
        <View style={styles.bottomCallToActionBarContainer}>
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={handleCheckoutProcess}
            style={styles.activeBasketSubmitButton}
          >
            <Text style={styles.activeBasketSubmitButtonText}>Go to Checkout</Text>
            <View style={styles.dividerVerticalBarLine} />
            <Text style={styles.checkoutPriceHighlightLabel}>₹{totalBillAmount}</Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeContainer: {
    flex: 1,
    backgroundColor: GREEN_CRATE_COLORS.paper,
  },
  headerTitleStripBox: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "baseline",
  },
  mainHeaderLabelText: {
    fontSize: 26,
    fontWeight: "800",
    color: GREEN_CRATE_COLORS.ink,
    letterSpacing: -0.5,
  },
  subHeaderCountLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: GREEN_CRATE_COLORS.inkSoft,
  },
  cartListStreamWrapper: {
    flex: 1,
    paddingHorizontal: 16,
  },
  listBottomSpacerShim: {
    paddingBottom: 24,
  },
  cartRowCardTile: {
    backgroundColor: GREEN_CRATE_COLORS.cream,
    borderWidth: 1.5,
    borderColor: GREEN_CRATE_COLORS.line,
    borderRadius: 16,
    height: responsiveHeight(16),
    flexDirection: "row",
    padding: 12,
    marginBottom: 12,
    alignItems: "center",
  },
  itemImageFrameTile: {
    flex: 0.3,
    height: "100%",
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: GREEN_CRATE_COLORS.line,
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  },
  thumbnailGraphic: {
    height: "80%",
    width: "80%",
    resizeMode: "contain",
  },
  metaProductSpecificationsBlock: {
    flex: 0.7,
    paddingLeft: 14,
    height: "100%",
    justifyContent: "space-between",
  },
  topRowSummaryGroup: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  productNameLabelHeading: {
    fontSize: 17,
    fontWeight: "700",
    color: GREEN_CRATE_COLORS.ink,
    flex: 0.85,
  },
  trashActionButtonSquare: {
    padding: 4,
  },
  unitCostTrackingMeta: {
    fontSize: 13,
    fontWeight: "500",
    color: GREEN_CRATE_COLORS.inkSoft,
    marginTop: -2,
  },
  stepperInteractionsRowControlBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 4,
  },
  quantityCounterPillBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: GREEN_CRATE_COLORS.line,
    borderRadius: 8,
    paddingHorizontal: 4,
    height: 32,
  },
  stepperMathActionButton: {
    paddingHorizontal: 8,
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  currentQuantityDigitalDisplay: {
    fontSize: 14,
    fontWeight: "700",
    color: GREEN_CRATE_COLORS.ink,
    paddingHorizontal: 4,
    textAlign: "center",
    minWidth: 20,
  },
  aggregatedRowSumPriceTag: {
    fontSize: 18,
    fontWeight: "800",
    color: GREEN_CRATE_COLORS.ink,
  },
  emptyCartPlaceholderViewport: {
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 80,
    gap: 12,
  },
  emptyCartFeedbackMessage: {
    fontSize: 15,
    fontWeight: "600",
    color: GREEN_CRATE_COLORS.inkSoft,
  },
  bottomCallToActionBarContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: GREEN_CRATE_COLORS.cream,
    borderTopWidth: 1.5,
    borderTopColor: GREEN_CRATE_COLORS.line,
  },
  activeBasketSubmitButton: {
    backgroundColor: GREEN_CRATE_COLORS.leaf,
    borderRadius: 14,
    height: 54,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  },
  activeBasketSubmitButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
    flex: 1,
  },
  dividerVerticalBarLine: {
    width: 1.5,
    height: 20,
    backgroundColor: "rgba(255, 255, 255, 0.3)",
    marginHorizontal: 16,
  },
  checkoutPriceHighlightLabel: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "800",
  },
});

export default Cart;