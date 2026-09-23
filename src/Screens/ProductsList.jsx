import { Feather } from "@expo/vector-icons";
import { onValue, ref } from "firebase/database";
import { useCallback, useEffect, useMemo, useState } from "react";
import { FlatList, Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { responsiveHeight, responsiveWidth } from "react-native-responsive-dimensions";
import { db } from "../../Firebaseconfig";

import { useDispatch, useSelector } from "react-redux";
import { addToCart, removeFromCart } from "../../Redux/CartSlice";
import { imageMap } from "../Utils/imageMap";

const GREEN_CRATE_COLORS = {
  paper: "#FAF9F4",
  ink: "#1F2B22",
  inkSoft: "#4B5A4C",
  leaf: "#3F7A37",
  tomato: "#E4572E",
  kraft: "#D8B98A",
  line: "#E4E0D2",
  cream: "#FFFDF8",
  badgeBg: "#F0EFE6",
};

const ProductsList = ({ navigation, route }) => {
  const [productsArray, setProductsArray] = useState([]);
  const [loading, setLoading] = useState(true);
  const { CategoryId } = route?.params || {};
  const dispatch = useDispatch();
  const storeData = useSelector((state) => state.CartSlice);

  useEffect(() => {
    const itemsRef = ref(db, "Products");
    const unsubscribe = onValue(
      itemsRef,
      (snapshot) => {
        const data = snapshot.val();
        if (data) {
          const parsedProducts = Object.entries(data).map(([id, value]) => ({
            id,
            ...value,
          }));
          setProductsArray(parsedProducts);
        } else {
          setProductsArray([]);
        }
        setLoading(false);
      },
      (error) => {
        console.error("Error fetching products:", error);
        setLoading(false);
      }
    );
    return () => unsubscribe();
  }, []);

  // Memoized filtering logic
  const filteredProducts = useMemo(() => {
    let list = CategoryId
      ? productsArray.filter((p) => Number(p.CategoryId) === Number(CategoryId))
      : productsArray;

    const excludeIds = CategoryId
      ? productsArray
          .filter((p) => Number(p.CategoryId) === Number(CategoryId))
          .slice(0, 4)
          .map((item) => item.Id)
      : [];

    return list.filter((p) => !excludeIds.includes(p.Id));
  }, [productsArray, CategoryId]);

  const handleAddToCart = useCallback((item) => {
    dispatch(addToCart(item));
  }, [dispatch]);

  const handleRemoveFromCart = useCallback((item) => {
    dispatch(removeFromCart(item));
  }, [dispatch]);

  const renderItem = useCallback(({ item }) => {
    const imageSource = item.Image && imageMap[item.Image] ? imageMap[item.Image] : null;
    const cartItem = storeData.find((value) => value.id === item.id || value.Id === item.Id);
    const quantity = cartItem?.quantity || (cartItem ? 1 : 0);

    const productNameClean = item.ProductName
      ? item.ProductName.charAt(0).toUpperCase() + item.ProductName.slice(1)
      : "Product";

    return (
      <TouchableOpacity
        onPress={() => navigation?.navigate("Details", { Id: item.Id, main: item })}
        activeOpacity={0.85}
        style={styles.gridCard}
      >
        <View style={styles.imageContainer}>
          {imageSource ? (
            <Image style={styles.productImage} source={imageSource} />
          ) : (
            <View style={styles.imagePlaceholder} />
          )}
        </View>

        <View style={styles.cardDetails}>
          <Text style={styles.brandSubtitle}>GREEN CRATE</Text>
          <Text style={styles.productTitle} numberOfLines={1}>
            {productNameClean}
          </Text>
          <Text style={styles.piecesText}>{item.pieces || "1 unit"} · Fresh</Text>

          <View style={styles.actionRow}>
            <View style={styles.priceTagSticker}>
              <View style={styles.tagHoleDot} />
              <Text style={styles.priceValueText}>₹{item.Price || 0}</Text>
            </View>

            {quantity > 0 ? (
              <View style={styles.quantityStepper}>
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={() => handleRemoveFromCart(item)}
                  style={styles.stepperButton}
                >
                  <Feather name="minus" size={12} color="#FFFFFF" />
                </TouchableOpacity>
                <Text style={styles.stepperQuantityText}>{quantity}</Text>
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={() => handleAddToCart(item)}
                  style={styles.stepperButton}
                >
                  <Feather name="plus" size={12} color="#FFFFFF" />
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => handleAddToCart(item)}
                style={styles.cartActionButton}
              >
                <Feather name="plus" size={16} color="#FFFFFF" />
              </TouchableOpacity>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  }, [storeData, navigation, handleAddToCart, handleRemoveFromCart]);

  if (loading) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>Harvesting crate items...</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={filteredProducts}
      keyExtractor={(item) => item.id}
      renderItem={renderItem}
      numColumns={2}
      showsVerticalScrollIndicator={false}
      columnWrapperStyle={styles.rowWrapper}
      contentContainerStyle={styles.listContainer}
      style={{ backgroundColor: GREEN_CRATE_COLORS.paper }}
      ListEmptyComponent={
        <View style={styles.emptyContainer}>
          <Feather name="package" size={32} color={GREEN_CRATE_COLORS.inkSoft} />
          <Text style={styles.emptyText}>No fresh items found in this section.</Text>
        </View>
      }
    />
  );
};

const styles = StyleSheet.create({
  listContainer: {
    paddingHorizontal: 8,
    paddingTop: 8,
    paddingBottom: 24,
    flexGrow: 1,
  },
  rowWrapper: {
    justifyContent: "space-between",
  },
  gridCard: {
    backgroundColor: GREEN_CRATE_COLORS.cream,
    borderWidth: 1.5,
    borderColor: GREEN_CRATE_COLORS.line,
    width: responsiveWidth(44.5),
    marginVertical: 6,
    marginHorizontal: 4,
    borderRadius: 16,
    overflow: "hidden",
    padding: 10,
    elevation: 1,
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  imageContainer: {
    backgroundColor: GREEN_CRATE_COLORS.paper,
    borderRadius: 12,
    height: responsiveHeight(15),
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: GREEN_CRATE_COLORS.line + "60",
  },
  productImage: {
    height: "85%",
    width: "85%",
    resizeMode: "contain",
  },
  imagePlaceholder: {
    backgroundColor: GREEN_CRATE_COLORS.line,
    width: "100%",
    height: "100%",
  },
  cardDetails: {
    marginTop: 8,
    gap: 2,
  },
  brandSubtitle: {
    fontSize: 9,
    fontWeight: "700",
    color: "#8A8F7F",
    letterSpacing: 0.5,
  },
  productTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: GREEN_CRATE_COLORS.ink,
  },
  piecesText: {
    fontSize: 11.5,
    color: GREEN_CRATE_COLORS.inkSoft,
    marginBottom: 4,
  },
  actionRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 6,
  },
  priceTagSticker: {
    backgroundColor: GREEN_CRATE_COLORS.kraft,
    paddingVertical: 2.5,
    paddingLeft: 10,
    paddingRight: 6,
    borderRadius: 4,
    borderTopRightRadius: 8,
    borderBottomRightRadius: 8,
    transform: [{ rotate: "-2deg" }],
    position: "relative",
  },
  tagHoleDot: {
    position: "absolute",
    left: 3,
    top: "50%",
    marginTop: -2,
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: GREEN_CRATE_COLORS.cream,
  },
  priceValueText: {
    fontSize: 12.5,
    fontWeight: "700",
    color: GREEN_CRATE_COLORS.ink,
  },
  cartActionButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: GREEN_CRATE_COLORS.leaf,
    justifyContent: "center",
    alignItems: "center",
    elevation: 1,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 2,
    shadowOffset: { width: 0, height: 1 },
  },
  quantityStepper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: GREEN_CRATE_COLORS.leaf,
    borderRadius: 16,
    paddingHorizontal: 2,
    paddingVertical: 2,
    gap: 4,
  },
  stepperButton: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
  },
  stepperQuantityText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "700",
    minWidth: 14,
    textAlign: "center",
  },
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
    gap: 10,
  },
  emptyText: {
    fontSize: 14,
    color: GREEN_CRATE_COLORS.inkSoft,
    fontWeight: "600",
  },
});

export default ProductsList;