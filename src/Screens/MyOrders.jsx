import { View, Text, FlatList, Image, StyleSheet, TouchableOpacity, SafeAreaView } from "react-native";
import React, { useEffect, useState } from "react";
import { ref, get,onValue, off } from "firebase/database";
import { Feather } from "@expo/vector-icons";
import { StatusBar } from "expo-status-bar";
import { db, authentication } from "../../Firebaseconfig";
import { getImageSource } from "../Utils/imageMap"; 

// Exact color palette matching the brand identity of grocery-homepage-1.html
const GREEN_CRATE_COLORS = {
  paper: "#FAF9F4",    // Page canvas background context
  ink: "#1F2B22",      // Dominant bold text color
  inkSoft: "#4B5A4C",  // Descriptive body labels
  leaf: "#3F7A37",     // Delivered status / Success branding hue
  tomato: "#E4572E",   // Interactive toggle elements / Actions
  kraft: "#D8B98A",    // Pending status badge fill
  line: "#E4E0D2",     // Structural border guidelines
  cream: "#FFFDF8",    // Order detail component cards background
};

const MyOrders = () => {
  const [orders, setOrders] = useState([]);
  const [expandedOrderId, setExpandedOrderId] = useState(null);

 useEffect(() => {
     const userEmail = authentication.currentUser?.email;
     if (!userEmail) return;
 
     const ordersRef = ref(db, "Orders");
 
    // 2. Fetch the data exactly once
  get(ordersRef).then((snapshot) => {
    if (snapshot.exists()) {
      const data = snapshot.val();
      const orderData = Object.entries(data)
        .filter(([id, order]) => order.userId === userEmail)
        .map(([id, order]) => ({ id, ...order }))
        .reverse();
      
      setOrders(orderData);
    } else {
      setOrders([]);
    }
  }).catch((error) => {
    console.error("Error fetching orders:", error);
  });

}, []);

  const formatDate = (timestamp) => {
    if (!timestamp) return "";
    const date = new Date(timestamp);
    return date.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' }) + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const toggleExpand = (orderId) => {
    setExpandedOrderId(expandedOrderId === orderId ? null : orderId);
  };

  const renderOrderItem = ({ item }) => {
    const cartItems = item.CartDetails ? Object.values(item.CartDetails) : [];
    const isExpanded = expandedOrderId === item.id;

    const grandTotal = cartItems.reduce((sum, cartItem) => {
      const price = parseFloat(cartItem.UnitPrice) || 0;
      const qty = parseInt(cartItem.Quantity, 10) || 0;
      return sum + price * qty;
    }, 0).toFixed(2);

    return (
      <View style={styles.orderCard}>
        {/* Card Top Information */}
        <View style={styles.cardHeader}>
          <View style={styles.idGroup}>
            <Text style={styles.brandSubtitle}>GREEN CRATE ORDER</Text>
            <Text style={styles.orderId} numberOfLines={1}>#{item.id}</Text>
          </View>
          <Text style={[
            styles.statusBadge,
            item.OrderStatus === "Delivered" ? styles.statusDelivered : styles.statusPending
          ]}>
            {item.OrderStatus || "Pending"}
          </Text>
        </View>

        {/* Card Creation Details */}
        <View style={styles.cardBody}>
          <Text style={styles.dateLabel}>Placed on {formatDate(item.createdAt)}</Text>
        </View>

        {/* Action and Pricing Row */}
        <View style={[styles.cardFooter, isExpanded && styles.cardFooterExpanded]}>
          <View style={styles.priceContainer}>
            <Text style={styles.totalLabel}>Total Amount</Text>
            <Text style={styles.totalPrice}>₹{item.total || grandTotal}</Text>
          </View>
          
          <TouchableOpacity 
            activeOpacity={0.7} 
            onPress={() => toggleExpand(item.id)}
            style={styles.detailsToggleBtn}
          >
            <Text style={styles.viewDetailsText}>
              {isExpanded ? "Hide Details" : "View Details"}
            </Text>
            <Feather 
              name={isExpanded ? "chevron-up" : "chevron-down"} 
              size={16} 
              color={GREEN_CRATE_COLORS.tomato} 
            />
          </TouchableOpacity>
        </View>

        {/* Collapsible Ordered Item Table */}
        {isExpanded && (
          <View style={styles.detailsSection}>
            <View style={styles.tableHeader}>
              <Text style={[styles.thCell, { flex: 2.5 }]}>Product</Text>
              <Text style={[styles.thCell, styles.textCenter]}>Qty</Text>
              <Text style={[styles.thCell, styles.textRight]}>Rate</Text>
              <Text style={[styles.thCell, styles.textRight]}>Total</Text>
            </View>

            {cartItems.map((cartItem, index) => {
              const lineTotal = cartItem.UnitPrice
                ? (cartItem.UnitPrice * cartItem.Quantity).toFixed(2)
                : "0.00";

              return (
                <View key={index} style={styles.tableRow}>
                  <View style={[styles.tdCell, { flex: 2.5, flexDirection: "row", alignItems: "center" }]}>
                    {cartItem.Image && (
                      <Image
                        source={getImageSource(cartItem.Image)}
                        style={styles.cartItemImage}
                        resizeMode="contain"
                      />
                    )}
                    <Text style={styles.cartItemText} numberOfLines={1}>
                      {cartItem.ProductName}
                    </Text>
                  </View>
                  <Text style={[styles.tdCell, styles.textCenter, styles.darkText]}>{cartItem.Quantity}</Text>
                  <Text style={[styles.tdCell, styles.textRight, styles.darkText]}>₹{cartItem.UnitPrice}</Text>
                  <Text style={[styles.tdCell, styles.textRight, styles.rowTotalText]}>₹{lineTotal}</Text>
                </View>
              );
            })}

            <View style={styles.tableFooter}>
              <Text style={styles.footerSummaryLabel}>Summary Cost</Text>
              <Text style={styles.footerSummaryValue}>₹{grandTotal}</Text>
            </View>
          </View>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeContainer}>
      <StatusBar backgroundColor={GREEN_CRATE_COLORS.cream} style="dark" />
      <View style={styles.headerBar}>
        <Text style={styles.headerTitle}>My Orders</Text>
      </View>
      <FlatList
        data={orders}
        renderItem={renderOrderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeContainer: {
    flex: 1,
    backgroundColor: GREEN_CRATE_COLORS.paper, // Cozy off-white brand tone canvas layout[cite: 1]
  },
  headerBar: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: GREEN_CRATE_COLORS.cream,
    borderBottomWidth: 2,
    borderBottomColor: GREEN_CRATE_COLORS.ink, // Bold structural dividing theme setup[cite: 1]
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: GREEN_CRATE_COLORS.ink,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 32,
  },
  orderCard: {
    backgroundColor: GREEN_CRATE_COLORS.cream,
    borderWidth: 1.5,
    borderColor: GREEN_CRATE_COLORS.line, // Uniform solid outer bounds border framing[cite: 1]
    borderRadius: 16,
    marginBottom: 16,
    overflow: "hidden",
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    padding: 16,
    paddingBottom: 8,
  },
  idGroup: {
    flex: 1,
    marginRight: 8,
  },
  brandSubtitle: {
    fontSize: 8,
    fontWeight: "700",
    color: "#8A8F7F",
    letterSpacing: 1,
    marginBottom: 2,
  },
  orderId: {
    fontSize: 15,
    fontWeight: "700",
    color: GREEN_CRATE_COLORS.ink,
  },
  statusBadge: {
    fontSize: 11,
    fontWeight: "700",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    textTransform: "uppercase",
  },
  statusDelivered: {
    color: "#FFFFFF",
    backgroundColor: GREEN_CRATE_COLORS.leaf, // Completed color matches main brand green identity[cite: 1]
  },
  statusPending: {
    color: GREEN_CRATE_COLORS.ink,
    backgroundColor: GREEN_CRATE_COLORS.kraft, // Warning label utilizes vintage warm kraft palette color[cite: 1]
  },
  cardBody: {
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  dateLabel: {
    fontSize: 13,
    color: GREEN_CRATE_COLORS.inkSoft,
  },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderTopWidth: 1.5,
    borderTopColor: GREEN_CRATE_COLORS.line,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#FAF9F5",
  },
  cardFooterExpanded: {
    borderBottomWidth: 1.5,
    borderBottomColor: GREEN_CRATE_COLORS.line,
  },
  priceContainer: {
    flexDirection: "column",
  },
  totalLabel: {
    fontSize: 10,
    color: GREEN_CRATE_COLORS.inkSoft,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  totalPrice: {
    fontSize: 17,
    fontWeight: "700",
    color: GREEN_CRATE_COLORS.ink,
  },
  detailsToggleBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingVertical: 6,
    paddingHorizontal: 10,
  },
  viewDetailsText: {
    color: GREEN_CRATE_COLORS.tomato, // Actionable elements use signature bright orange-red[cite: 1]
    fontWeight: "700",
    fontSize: 13,
  },
  detailsSection: {
    backgroundColor: GREEN_CRATE_COLORS.cream,
    padding: 16,
  },
  tableHeader: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: GREEN_CRATE_COLORS.line,
    paddingBottom: 6,
    marginBottom: 10,
  },
  thCell: {
    flex: 1,
    fontSize: 11,
    fontWeight: "700",
    color: "#8A8F7F",
    textTransform: "uppercase",
  },
  tableRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  tdCell: {
    flex: 1,
    fontSize: 13,
  },
  darkText: {
    color: GREEN_CRATE_COLORS.inkSoft,
  },
  textCenter: { textAlign: "center" },
  textRight: { textAlign: "right" },
  cartItemImage: {
    width: 32,
    height: 32,
    marginRight: 8,
    borderRadius: 6,
    backgroundColor: GREEN_CRATE_COLORS.paper,
  },
  cartItemText: {
    fontSize: 13,
    fontWeight: "600",
    color: GREEN_CRATE_COLORS.ink,
    flex: 1,
  },
  rowTotalText: {
    fontWeight: "600",
    color: GREEN_CRATE_COLORS.ink,
  },
  tableFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: GREEN_CRATE_COLORS.line,
    paddingTop: 10,
    marginTop: 4,
  },
  footerSummaryLabel: {
    fontSize: 13,
    fontWeight: "700",
    color: GREEN_CRATE_COLORS.ink,
  },
  footerSummaryValue: {
    fontSize: 15,
    fontWeight: "700",
    color: GREEN_CRATE_COLORS.leaf,
  },
});

export default MyOrders;