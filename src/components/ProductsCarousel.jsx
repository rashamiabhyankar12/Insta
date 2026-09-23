import { FontAwesome } from "@expo/vector-icons";
import { FlatList, Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { responsiveHeight, responsiveWidth } from "react-native-responsive-dimensions";
import { useDispatch, useSelector } from "react-redux";
import { addToCart, removeFromCart } from "../../Redux/CartSlice";
import { imageMap } from "../Utils/imageMap";

const GREEN_CRATE_COLORS = {
  paper: "#FAF9F4",
  ink: "#1F2B22",
  inkSoft: "#4B5A4C",
  leaf: "#3F7A37",
  leafPale: "#E7F1E3",
  tomato: "#E4572E",
  kraft: "#D8B98A",
  line: "#E4E0D2",
  cream: "#FFFDF8",
};

const ProductsCarousel = ({ data = [], navigation }) => {
  const dispatch = useDispatch();
  const storeData = useSelector((state) => state.CartSlice) || [];

  const firstFourItems = data.slice(0, 4);

  return (
    <View style={styles.carouselContainer}>
      <FlatList
        horizontal
        showsHorizontalScrollIndicator={false}
        data={firstFourItems}
        keyExtractor={(item) => item.Id.toString()}
        contentContainerStyle={styles.listPadding}
        renderItem={({ item }) => {
          let imageSource = (item && item.Image && imageMap[item.Image]) ? imageMap[item.Image] : null;
          const isInCart = storeData.some((value) => value.ProductName === item.ProductName);

          return (
            <TouchableOpacity
              onPress={() => navigation?.navigate("Details", { Id: item.Id, main: item })}
              activeOpacity={0.85}
              style={styles.card}
            >
              {/* pointerEvents="none" allows taps on the image wrap to register on the outer TouchableOpacity */}
              <View style={styles.imageWrap} pointerEvents="none">
                {imageSource ? (
                  <Image style={styles.productImg} source={imageSource} />
                ) : (
                  <View style={styles.imgPlaceholder} />
                )}

                {item.tag === "Organic" && (
                  <View style={[styles.badgeCorner, styles.badgeOrganic]}>
                    <Text style={styles.badgeText}>Organic</Text>
                  </View>
                )}
              </View>

              <View style={styles.productBody}>
                <View pointerEvents="none">
                  <Text style={styles.productBrand} numberOfLines={1}>
                    {item.brand || "GREEN VALLEY"}
                  </Text>
                  
                  <Text style={styles.productName} numberOfLines={1}>
                    {item.ProductName 
                      ? item.ProductName.charAt(0).toUpperCase() + item.ProductName.slice(1)
                      : ""}
                  </Text>

                  <View style={styles.starsRow}>
                    <Text style={styles.starsText}>★★★★★</Text>
                    <Text style={styles.reviewsText}>
                      {item.rating || "4.5"} ({item.pieces || "50"})
                    </Text>
                  </View>
                </View>

                <View style={styles.tagPriceRow}>
                  <View style={styles.priceTag} pointerEvents="none">
                    <View style={styles.priceHole} />
                    <Text style={styles.priceText}>₹{item.Price}</Text>
                    <Text style={styles.unitText}>/ pack</Text>
                  </View>

                  {/* Add to cart stays independently clickable */}
                  <TouchableOpacity
                    activeOpacity={0.8}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    style={[styles.addBtn, isInCart && styles.removeBtn]}
                    onPress={() => dispatch(isInCart ? removeFromCart(item) : addToCart(item))}
                  >
                    <FontAwesome 
                      name={isInCart ? "minus" : "plus"} 
                      size={11} 
                      color="#FFF" 
                    />
                  </TouchableOpacity>
                </View>
              </View>
            </TouchableOpacity>
          );
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  carouselContainer: {
    marginVertical: 8,
  },
  listPadding: {
    paddingLeft: 15,
    paddingBottom: 4,
  },
  card: {
    backgroundColor: GREEN_CRATE_COLORS.cream,
    borderWidth: 1.5,
    borderColor: GREEN_CRATE_COLORS.line,
    width: responsiveWidth(38),
    marginRight: 12,
    borderRadius: 12,
    overflow: "hidden",
    elevation: 2,
    shadowColor: GREEN_CRATE_COLORS.ink,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    height: responsiveHeight(24),
  },
  imageWrap: {
    backgroundColor: GREEN_CRATE_COLORS.paper,
    height: "45%",
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  productImg: {
    height: "85%",
    width: "85%",
    resizeMode: "contain",
  },
  imgPlaceholder: {
    height: "85%",
    width: "85%",
    backgroundColor: GREEN_CRATE_COLORS.line,
    borderRadius: 6,
  },
  badgeCorner: {
    position: "absolute",
    top: 4,
    left: 4,
    paddingVertical: 1,
    paddingHorizontal: 4,
    borderRadius: 999,
  },
  badgeOrganic: {
    backgroundColor: GREEN_CRATE_COLORS.leaf,
  },
  badgeText: {
    color: "#FFF",
    fontSize: 8,
    fontWeight: "600",
  },
  productBody: {
    padding: 6,
    flex: 1,
    justifyContent: "space-between",
  },
  productBrand: {
    fontSize: 8,
    color: "#8A8F7F",
    fontWeight: "600",
    letterSpacing: 0.3,
  },
  productName: {
    fontSize: 12,
    fontWeight: "600",
    color: GREEN_CRATE_COLORS.ink,
    lineHeight: 14,
  },
  starsRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 2,
  },
  starsText: {
    color: "#E4A72E",
    fontSize: 9,
  },
  reviewsText: {
    color: GREEN_CRATE_COLORS.inkSoft,
    fontSize: 8,
    marginLeft: 3,
  },
  tagPriceRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: "auto",
  },
  priceTag: {
    backgroundColor: GREEN_CRATE_COLORS.kraft,
    paddingVertical: 2,
    paddingLeft: 10,
    paddingRight: 6,
    borderRadius: 3,
    borderTopRightRadius: 8,
    borderBottomRightRadius: 8,
    transform: [{ rotate: "-1.5deg" }],
    position: "relative",
    flexDirection: "row",
    alignItems: "baseline",
    gap: 2,
  },
  priceHole: {
    position: "absolute",
    left: 3,
    top: "50%",
    marginTop: -2,
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: GREEN_CRATE_COLORS.cream,
  },
  priceText: {
    fontSize: 11,
    fontWeight: "700",
    color: GREEN_CRATE_COLORS.ink,
  },
  unitText: {
    fontSize: 7,
    color: GREEN_CRATE_COLORS.inkSoft,
  },
  addBtn: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: GREEN_CRATE_COLORS.ink,
    alignItems: "center",
    justifyContent: "center",
  },
  removeBtn: {
    backgroundColor: GREEN_CRATE_COLORS.tomato,
  },
});

export const getExcludeIds = (data = []) => {
  return data.slice(0, 4).map((item) => item.Id);
};

export default ProductsCarousel;