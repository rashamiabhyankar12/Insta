import { Feather } from "@expo/vector-icons";
import { onValue, ref } from "firebase/database";
import { useEffect, useState } from "react";
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { db } from "../../Firebaseconfig";

// Exact color palette matching the brand identity of The Green Crate[cite: 1]
const GREEN_CRATE_COLORS = {
  paper: "#FAF9F4",    // Overall canvas background[cite: 1]
  ink: "#1F2B22",      // Dominant primary headers text[cite: 1]
  inkSoft: "#4B5A4C",  // Supporting body content and details[cite: 1]
  leaf: "#3F7A37",     // Accent used for the open-state indicator[cite: 1]
  leafDark: "#2E5A29", // Chevron color while a section is expanded[cite: 1]
  leafPale: "#E7F1E3", // Soft green tint for the expanded drawer body[cite: 1]
  line: "#E4E0D2",     // Structural border guidelines[cite: 1]
  cream: "#FFFDF8",    // Inner expanded content background context[cite: 1]
};

const DropBox = ({ Id }) => {
  const [products, setProducts] = useState([]);
  const [myIndex, setMyIndex] = useState(null);
  const [toggle, setToggle] = useState(false);

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

  // Find targeted product details safely
  const productData = products.find((p) => p.Id === Id) || {};

  const detailsArray = [
    { title: "Brand", icon: "tag", content: productData.Brand || "Not Specified" },
    { title: "Origin", icon: "map-pin", content: productData.Origin || "Local Source" },
    { title: "Description", icon: "file-text", content: productData.Description || "No description provided." }
  ];

  const handleToggle = (index) => {
    const isCurrentActive = myIndex === index;
    if (isCurrentActive) {
      setToggle(!toggle);
    } else {
      setMyIndex(index);
      setToggle(true);
    }
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={detailsArray}
        scrollEnabled={false} // Clean embedded integration without viewport conflicts
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item, index }) => {
          const isOpen = myIndex === index && toggle;
          
          const isLast = index === detailsArray.length - 1;

          return (
            <View
              style={[
                styles.accordionRowBlock,
                isLast && !isOpen && styles.accordionRowBlockLast,
              ]}
            >
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => handleToggle(index)}
                style={[
                  styles.headerButton,
                  isOpen && styles.headerActiveBorder
                ]}
              >
                <View style={styles.headerLeft}>
                  <View
                    style={[
                      styles.iconBadge,
                      isOpen && styles.iconBadgeActive,
                    ]}
                  >
                    <Feather
                      name={item.icon}
                      size={14}
                      color={isOpen ? "#fff" : GREEN_CRATE_COLORS.leafDark}
                    />
                  </View>
                  <Text style={styles.headerTitleText}>{item.title}</Text>
                </View>
                <Feather
                  name={isOpen ? "chevron-down" : "chevron-right"}
                  size={19}
                  color={isOpen ? GREEN_CRATE_COLORS.leafDark : GREEN_CRATE_COLORS.inkSoft}
                />
              </TouchableOpacity>
              
              {isOpen && (
                <View style={styles.contentDrawerBody}>
                  <Text style={styles.contentBodyText}>{item.content}</Text>
                </View>
              )}
            </View>
          );
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
  },
  accordionRowBlock: {
    borderBottomWidth: 1.5,
    borderStyle: "dashed", // Echoes the site's dashed "cut line" / verified-stamp motif
    borderBottomColor: GREEN_CRATE_COLORS.line, // Soft organic dividers[cite: 1]
  },
  accordionRowBlockLast: {
    borderBottomWidth: 0, // sits flush against the bottom of its parent card
  },
  headerButton: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 13,
    paddingHorizontal: 2,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  iconBadge: {
    width: 26,
    height: 26,
    borderRadius: 8,
    backgroundColor: GREEN_CRATE_COLORS.leafPale,
    alignItems: "center",
    justifyContent: "center",
  },
  iconBadgeActive: {
    backgroundColor: GREEN_CRATE_COLORS.leaf, // filled solid once its drawer is open
  },
  headerActiveBorder: {
    borderBottomWidth: 2,
    borderBottomColor: GREEN_CRATE_COLORS.leaf, // Leaf accent underline while expanded, matching site accents
  },
  headerTitleText: {
    fontSize: 14.5,
    fontWeight: "700",
    color: GREEN_CRATE_COLORS.ink, // Bold signature brand headings[cite: 1]
    letterSpacing: -0.2,
  },
  contentDrawerBody: {
    backgroundColor: GREEN_CRATE_COLORS.leafPale, // Soft green callout tint, matching site's .megamenu-promo
    padding: 14,
    borderRadius: 10,
    marginTop: 2,
    marginBottom: 14,
    borderLeftWidth: 3,
    borderLeftColor: GREEN_CRATE_COLORS.leaf, // Left accent border, echoing site's active menu items
  },
  contentBodyText: {
    fontSize: 13.5,
    lineHeight: 20,
    color: GREEN_CRATE_COLORS.inkSoft, // Readable dark gray/green text mix for content text elements[cite: 1]
  },
});

export default DropBox;