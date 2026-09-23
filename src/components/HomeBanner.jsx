import { View, Image, StyleSheet, ActivityIndicator } from "react-native";
import React, { useState } from "react";
import { responsiveHeight } from "react-native-responsive-dimensions";

// Exact color palette matching the brand identity of grocery-homepage-1.html
const GREEN_CRATE_COLORS = {
  cream: "#FFFDF8",    // Subtle grid canvas block panel background
  line: "#E4E0D2",     // Framework border accent outlines
  leaf: "#3F7A37",     // Brand secondary loader tracker accent
};

const HomeBanner = () => {
  const [isAssetLoading, setIsAssetLoading] = useState(true);

  return (
    <View style={styles.bannerContainerCard}>
      <Image 
        style={styles.heroBannerImage} 
        // Swapped out local file require mapping for an ultra-crisp web-based asset
        source={{ 
          uri: "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=800&q=80" 
        }} 
        resizeMode="cover"
        onLoadStart={() => setIsAssetLoading(true)}
        onLoadEnd={() => setIsAssetLoading(false)}
      />

      {/* Inline framework asset loading placeholder indicator */}
      {isAssetLoading && (
        <View style={styles.loaderLayerShim}>
          <ActivityIndicator size="small" color={GREEN_CRATE_COLORS.leaf} />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  bannerContainerCard: {
    height: responsiveHeight(12),
    width: "100%",
    backgroundColor: GREEN_CRATE_COLORS.cream,
    borderWidth: 1.5,
    borderColor: GREEN_CRATE_COLORS.line,
    borderRadius: 16,
    overflow: "hidden", // Keeps the remote web asset clipped safely to your border framework corners
    position: "relative",
  },
  heroBannerImage: {
    width: "100%",
    height: "100%",
  },
  loaderLayerShim: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: GREEN_CRATE_COLORS.cream,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default HomeBanner;