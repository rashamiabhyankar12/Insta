import { Feather, Ionicons, MaterialIcons } from "@expo/vector-icons";
import { StatusBar } from "expo-status-bar";
import { useEffect, useMemo, useState } from "react";
import { Image, ScrollView, Share, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Fredoka_500Medium, Fredoka_600SemiBold, useFonts } from "@expo-google-fonts/fredoka";
import { JetBrainsMono_500Medium, JetBrainsMono_700Bold } from "@expo-google-fonts/jetbrains-mono";
import { WorkSans_400Regular, WorkSans_500Medium, WorkSans_600SemiBold } from "@expo-google-fonts/work-sans";
import { onValue, ref, remove, set } from "firebase/database";
import { useDispatch, useSelector } from "react-redux";

import { authentication, db } from "../../Firebaseconfig";
import { addToCart, incrementQuantity } from "../../Redux/CartSlice";
import DropBox from "../components/DropBox";
import { imageMap } from "../Utils/imageMap";
import { myColors } from "../Utils/MyColors";

// ---- Design Tokens ----
const colors = {
  paper: "#F7F6F0",
  bg: "#FFFFFF",
  surface: "#F9FAF7",
  border: "#E5E3D8",
  borderLight: "#EEEDE4",
  textPrimary: "#1C281E",
  textSecondary: "#5C6E5E",
  textMuted: "#8C9A8E",
  strike: "#A0AAB0",
  leaf: "#387031",
  leafDark: "#264D22",
  leafPale: "#EBF3E8",
  tomato: "#E04E26",
  tomatoPale: "#FDEEE9",
  accent: myColors?.primary || "#387031",
};

// ---- Font Helpers ----
const F = {
  display: "Fredoka_600SemiBold",
  displayMed: "Fredoka_500Medium",
  body: "WorkSans_400Regular",
  bodyMed: "WorkSans_500Medium",
  bodySemi: "WorkSans_600SemiBold",
  mono: "JetBrainsMono_700Bold",
  monoMed: "JetBrainsMono_500Medium",
};

const circleButtonBase = {
  width: 40,
  height: 40,
  borderRadius: 20,
  backgroundColor: colors.paper,
  borderWidth: 1,
  borderColor: colors.border,
  alignItems: "center",
  justifyContent: "center",
};

const Details = ({ route, navigation }) => {
  const [fontsLoaded] = useFonts({
    Fredoka_600SemiBold,
    Fredoka_500Medium,
    WorkSans_400Regular,
    WorkSans_500Medium,
    WorkSans_600SemiBold,
    JetBrainsMono_700Bold,
    JetBrainsMono_500Medium,
  });

  const dispatch = useDispatch();
  const { Id } = route.params || {};

  const storeData = useSelector((state) => state.CartSlice);
  const [products, setProducts] = useState([]);
  const [quantity, setQuantity] = useState(1);
  const [isFavorite, setIsFavorite] = useState(false);

  const user = authentication.currentUser;
  const userEmail = user?.email || null;
  const encodedEmail = userEmail ? userEmail.replace(/\./g, ",") : null;

  // Sync products from Firebase
  useEffect(() => {
    const itemsRef = ref(db, "Products");
    const unsubscribe = onValue(itemsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const productsData = Object.entries(data).map(([id, value]) => ({
          id,
          ...value,
        }));
        setProducts(productsData);
      }
    });
    return () => unsubscribe();
  }, []);

  // Sync wishlist status for this product
  useEffect(() => {
    if (!encodedEmail || !Id) return;
    const wishlistRef = ref(db, `WishListDetail/${encodedEmail}/${Id}`);
    const unsubscribe = onValue(wishlistRef, (snapshot) => {
      setIsFavorite(!!snapshot.val());
    });
    return () => unsubscribe();
  }, [encodedEmail, Id]);

  const productData = useMemo(() => products.find((p) => p.Id === Id) || {}, [products, Id]);

  const {
    ProductName = "",
    Price = 0,
    Description = productData?.Desription || "",
    Origin = "",
    Brand = "",
    Image: ImageFile = "",
  } = productData;

  // Resolve image source safely
  const imageSource = useMemo(() => {
    if (ImageFile) {
      if (imageMap[ImageFile]) return imageMap[ImageFile];
      if (typeof ImageFile === "string") return { uri: ImageFile };
    }
    return null;
  }, [ImageFile]);

  const inCart = useMemo(
    () => storeData.some((value) => value.ProductName === ProductName),
    [storeData, ProductName]
  );

  const toggleFavorite = async () => {
    if (!encodedEmail || !Id) return;
    const wishlistRef = ref(db, `WishListDetail/${encodedEmail}/${Id}`);

    if (isFavorite) {
      await remove(wishlistRef);
    } else {
      await set(wishlistRef, {
        userId: userEmail,
        productId: Id,
        ProductName,
        Price,
        ImageFile,
      });
    }
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Check out ${ProductName || "this product"} on Greenstalk Fresh for ₹${Price}!`,
      });
    } catch (error) {
      console.log(error);
    }
  };

  if (!fontsLoaded) {
    return <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }} />;
  }

  const formattedProductName = ProductName
    ? ProductName.charAt(0).toUpperCase() + ProductName.slice(1)
    : "";

  const originalPrice = Math.round(Number(Price || 0) * 1.2);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }}>
      <StatusBar style="dark" backgroundColor={colors.bg} />

      {/* ---- Header Navigation ---- */}
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          paddingHorizontal: 16,
          paddingVertical: 12,
          backgroundColor: colors.bg,
        }}
      >
        <TouchableOpacity
          onPress={() => navigation?.goBack?.()}
          activeOpacity={0.7}
          style={circleButtonBase}
        >
          <Ionicons name="chevron-back" size={22} color={colors.textPrimary} />
        </TouchableOpacity>

        <Text
          style={{
            fontFamily: F.display,
            fontSize: 17,
            color: colors.textPrimary,
            letterSpacing: 0.2,
          }}
        >
          Product Details
        </Text>

        <View style={{ flexDirection: "row", gap: 8 }}>
          <TouchableOpacity
            onPress={toggleFavorite}
            activeOpacity={0.7}
            style={[
              circleButtonBase,
              {
                backgroundColor: isFavorite ? colors.tomatoPale : colors.paper,
                borderColor: isFavorite ? colors.tomato : colors.border,
              },
            ]}
          >
            <MaterialIcons
              name={isFavorite ? "favorite" : "favorite-border"}
              size={20}
              color={isFavorite ? colors.tomato : colors.textPrimary}
            />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleShare}
            activeOpacity={0.7}
            style={circleButtonBase}
          >
            <Feather name="share-2" size={18} color={colors.textPrimary} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: 32 }}
        showsVerticalScrollIndicator={false}
      >
        {/* ---- Product Image Hero Section ---- */}
        <View style={{ paddingHorizontal: 16, paddingTop: 6 }}>
          <View
            style={{
              backgroundColor: colors.paper,
              alignItems: "center",
              justifyContent: "center",
              borderRadius: 24,
              borderWidth: 1,
              borderColor: colors.border,
              overflow: "hidden",
              position: "relative",
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.04,
              shadowRadius: 10,
              elevation: 2,
            }}
          >
            {/* Discount Ribbon */}
            <View
              style={{
                position: "absolute",
                top: 14,
                left: 14,
                backgroundColor: colors.tomato,
                paddingHorizontal: 10,
                paddingVertical: 4,
                borderRadius: 8,
                zIndex: 2,
              }}
            >
              <Text
                style={{
                  fontFamily: F.bodySemi,
                  fontSize: 11,
                  color: "#FFFFFF",
                  letterSpacing: 0.4,
                }}
              >
                17% OFF
              </Text>
            </View>

            {/* In-Stock Badge */}
            <View
              style={{
                position: "absolute",
                top: 14,
                right: 14,
                backgroundColor: colors.leafPale,
                paddingHorizontal: 8,
                paddingVertical: 4,
                borderRadius: 8,
                zIndex: 2,
                flexDirection: "row",
                alignItems: "center",
                gap: 4,
              }}
            >
              <View
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: 3,
                  backgroundColor: colors.leaf,
                }}
              />
              <Text
                style={{
                  fontFamily: F.bodySemi,
                  fontSize: 10,
                  color: colors.leafDark,
                }}
              >
                In Stock
              </Text>
            </View>

            {imageSource && (
              <Image
                resizeMode="contain"
                style={{ height: 260, width: "85%", marginVertical: 20 }}
                source={imageSource}
              />
            )}

            {/* Carousel Dots */}
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
                gap: 6,
                paddingBottom: 14,
              }}
            >
              <View
                style={{
                  width: 20,
                  height: 5,
                  borderRadius: 3,
                  backgroundColor: colors.leaf,
                }}
              />
              {[...Array(2)].map((_, i) => (
                <View
                  key={i}
                  style={{
                    width: 6,
                    height: 5,
                    borderRadius: 3,
                    backgroundColor: colors.border,
                  }}
                />
              ))}
            </View>
          </View>
        </View>

        {/* ---- Product Main Details ---- */}
        <View style={{ paddingHorizontal: 16, paddingTop: 20 }}>
          {!!Brand && (
            <Text
              style={{
                fontFamily: F.mono,
                fontSize: 12,
                color: colors.leaf,
                textTransform: "uppercase",
                letterSpacing: 0.8,
                marginBottom: 4,
              }}
            >
              {Brand}
            </Text>
          )}

          <Text
            style={{
              fontFamily: F.display,
              fontSize: 22,
              color: colors.textPrimary,
              lineHeight: 28,
            }}
          >
            {formattedProductName}
          </Text>

          {/* Rating & Origin Row */}
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              marginTop: 10,
              gap: 10,
            }}
          >
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                backgroundColor: colors.leaf,
                paddingHorizontal: 8,
                paddingVertical: 4,
                borderRadius: 6,
                gap: 4,
              }}
            >
              <Text style={{ color: "#FFFFFF", fontFamily: F.monoMed, fontSize: 12 }}>
                4.3
              </Text>
              <Ionicons name="star" size={12} color="#FFFFFF" />
            </View>

            <Text style={{ fontFamily: F.body, fontSize: 13, color: colors.textSecondary }}>
              1,240 ratings
            </Text>

            {!!Origin && (
              <>
                <View
                  style={{
                    width: 4,
                    height: 4,
                    borderRadius: 2,
                    backgroundColor: colors.textMuted,
                  }}
                />
                <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
                  <Ionicons name="location-outline" size={13} color={colors.textSecondary} />
                  <Text style={{ fontFamily: F.body, fontSize: 13, color: colors.textSecondary }}>
                    {Origin}
                  </Text>
                </View>
              </>
            )}
          </View>

          {/* Price Block & Quantity Selector */}
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              marginTop: 20,
              paddingTop: 16,
              borderTopWidth: 1,
              borderTopColor: colors.borderLight,
            }}
          >
            <View>
              <View style={{ flexDirection: "row", alignItems: "baseline", gap: 8 }}>
                <Text style={{ fontFamily: F.mono, fontSize: 28, color: colors.textPrimary }}>
                  ₹{Price}
                </Text>
                <Text
                  style={{
                    fontFamily: F.monoMed,
                    fontSize: 15,
                    color: colors.strike,
                    textDecorationLine: "line-through",
                  }}
                >
                  ₹{originalPrice}
                </Text>
              </View>
              <Text style={{ fontFamily: F.body, fontSize: 12, color: colors.textMuted, marginTop: 2 }}>
                Inclusive of all taxes
              </Text>
            </View>

            {/* Interactive Quantity Control */}
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                backgroundColor: colors.paper,
                borderRadius: 12,
                borderWidth: 1,
                borderColor: colors.border,
                padding: 4,
              }}
            >
              <TouchableOpacity
                onPress={() => setQuantity((q) => Math.max(1, q - 1))}
                disabled={quantity <= 1}
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 8,
                  backgroundColor: colors.bg,
                  alignItems: "center",
                  justifyContent: "center",
                  opacity: quantity <= 1 ? 0.4 : 1,
                }}
              >
                <Feather name="minus" size={16} color={colors.textPrimary} />
              </TouchableOpacity>

              <Text
                style={{
                  fontFamily: F.mono,
                  fontSize: 15,
                  color: colors.textPrimary,
                  paddingHorizontal: 12,
                }}
              >
                {quantity}
              </Text>

              <TouchableOpacity
                onPress={() => setQuantity((q) => q + 1)}
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 8,
                  backgroundColor: colors.bg,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Feather name="plus" size={16} color={colors.textPrimary} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Delivery Promise Card */}
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              backgroundColor: colors.surface,
              borderRadius: 14,
              borderWidth: 1,
              borderColor: colors.border,
              padding: 14,
              marginTop: 18,
              gap: 12,
            }}
          >
            <View
              style={{
                width: 38,
                height: 38,
                borderRadius: 19,
                backgroundColor: colors.leafPale,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <MaterialIcons name="local-shipping" size={20} color={colors.leafDark} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontFamily: F.bodySemi, fontSize: 13, color: colors.textPrimary }}>
                Free Express Delivery
              </Text>
              <Text style={{ fontFamily: F.body, fontSize: 12, color: colors.textSecondary, marginTop: 1 }}>
                Delivered by tomorrow • Order within 4 hrs 12 mins
              </Text>
            </View>
          </View>

          {/* Options Dropdown Section */}
          <View
            style={{
              marginTop: 18,
              backgroundColor: colors.bg,
              borderRadius: 16,
              borderWidth: 1,
              borderColor: colors.border,
              padding: 14,
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.03,
              shadowRadius: 6,
              elevation: 1,
            }}
          >
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 8,
                marginBottom: 10,
              }}
            >
              <MaterialIcons name="tune" size={18} color={colors.leaf} />
              <Text style={{ fontFamily: F.displayMed, fontSize: 15, color: colors.textPrimary }}>
                Product Options
              </Text>
            </View>
            <DropBox Id={Id} />
          </View>

          {/* Description Section */}
          
        </View>
      </ScrollView>

      {/* ---- Sticky Bottom CTA Bar ---- */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          paddingHorizontal: 16,
          paddingTop: 12,
          paddingBottom: 16,
          borderTopWidth: 1,
          borderTopColor: colors.border,
          backgroundColor: colors.bg,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: -4 },
          shadowOpacity: 0.03,
          shadowRadius: 8,
          elevation: 5,
          gap: 12,
        }}
      >
        <View style={{ justifyContent: "center" }}>
          <Text style={{ fontFamily: F.body, fontSize: 11, color: colors.textMuted }}>
            Total Price
          </Text>
          <Text style={{ fontFamily: F.mono, fontSize: 20, color: colors.textPrimary }}>
            ₹{Price * quantity}
          </Text>
        </View>

        {inCart ? (
          <View
            style={{
              flex: 1,
              backgroundColor: colors.paper,
              borderRadius: 14,
              height: 52,
              justifyContent: "center",
              alignItems: "center",
              borderWidth: 1,
              borderColor: colors.border,
            }}
          >
            <Text style={{ fontFamily: F.bodySemi, color: colors.textSecondary, fontSize: 15 }}>
              Added to Basket
            </Text>
          </View>
        ) : (
          <TouchableOpacity
            onPress={() => {
              dispatch(addToCart(productData));
              
              // Increment sequentially to match the desired quantity 
              // this bypasses hardcoded slice behaviors
              for (let i = 1; i < quantity; i++) {
                dispatch(incrementQuantity(productData));
              }

              navigation?.navigate?.("Cart");
            }}
            activeOpacity={0.85}
            style={{
              flex: 1,
              backgroundColor: colors.leaf,
              borderRadius: 14,
              height: 52,
              flexDirection: "row",
              justifyContent: "center",
              alignItems: "center",
              gap: 8,
              shadowColor: colors.leaf,
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.2,
              shadowRadius: 8,
              elevation: 3,
            }}
          >
            <Feather name="shopping-bag" size={18} color="#FFFFFF" />
            <Text style={{ fontFamily: F.bodySemi, color: "#FFFFFF", fontSize: 15 }}>
              Add to Basket
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
};

export default Details;