// src/screens/OrderTracking.js
import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { ref, onValue, off } from "firebase/database";
import { Feather } from "@expo/vector-icons";
import { db, authentication } from "../../Firebaseconfig"; 

// Exact color palette matching the brand identity of grocery-homepage-1.html
const GREEN_CRATE_COLORS = {
  paper: "#FAF9F4",    // Page canvas background context
  ink: "#1F2B22",      // Dominant primary typography
  inkSoft: "#4B5A4C",  // Text subtitles and step text labels
  leaf: "#3F7A37",     // Status Indicator: Completed / Done
  tomato: "#E4572E",   // Status Indicator: Live Active Step
  line: "#E4E0D2",     // Component outlines and unreached states
  cream: "#FFFDF8",    // Order tracking card card background panels
};

const stepsTemplate = [
  { label: "Pending", status: "Pending" },
  { label: "Shipped", status: "Shipped" },
  { label: "Delivered", status: "Delivered" },
];

export default function OrderTracking() {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    const userEmail = authentication.currentUser?.email;
    if (!userEmail) return;

    const ordersRef = ref(db, "Orders");

    const listener = onValue(ordersRef, (snapshot) => {
      const data = snapshot.val();

      const ordersData = data
        ? Object.entries(data)
            .filter(([id, order]) => order.userId === userEmail)
            .map(([id, order]) => {
              const OrderStatus = order.OrderStatus;

              const steps = stepsTemplate.map((step) => {
                if (step.label === OrderStatus) {
                  return { ...step, status: "active" }; 
                }

                if (OrderStatus === "Shipped" && step.label === "Pending") {
                  return { ...step, status: "done" };
                }

                if (OrderStatus === "Delivered" && (step.label === "Pending" || step.label === "Shipped")) {
                  return { ...step, status: "done" };
                }

                return { ...step, status: "Pending" };
              });

              return { orderId: id, steps };
            })
        : [];

      setOrders(ordersData);
    });

    return () => off(ordersRef); 
  }, []);

  return (
    <SafeAreaView style={styles.safeContainer}>
      <StatusBar backgroundColor={GREEN_CRATE_COLORS.cream} style="dark" />
      
      {/* Structural Header Section */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Track Your Orders</Text>
      </View>

      <ScrollView style={styles.contentScroll} showsVerticalScrollIndicator={false}>
        {orders.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Feather name="package" size={48} color={GREEN_CRATE_COLORS.line} style={{ marginBottom: 12 }} />
            <Text style={styles.emptyText}>No orders found under this account</Text>
          </View>
        ) : (
          orders.map((order) => (
            <View key={order.orderId} style={styles.orderCard}>
              {/* Order Info Header Tag */}
              <View style={styles.cardHeader}>
                <View style={styles.badgeWrapper}>
                  <Text style={styles.brandSubtitle}>GREEN CRATE DELIVERIES</Text>
                  <Text style={styles.orderIdText}>ID: #{order.orderId}</Text>
                </View>
                <Feather name="truck" size={18} color={GREEN_CRATE_COLORS.inkSoft} />
              </View>

              {/* Progress Container Layout */}
              <View style={styles.progressRow}>
                {order.steps.map((step, index) => {
                  const isDone = step.status === "done";
                  const isActive = step.status === "active";

                  return (
                    <View key={index} style={styles.stepItem}>
                      <View style={styles.nodeWrapper}>
                        {/* Connecting Line Segments */}
                        {index > 0 && (
                          <View 
                            style={[
                              styles.leftLine, 
                              (isDone || isActive) && { backgroundColor: GREEN_CRATE_COLORS.leaf }
                            ]} 
                          />
                        )}
                        {index < order.steps.length - 1 && (
                          <View 
                            style={[
                              styles.rightLine, 
                              isDone && { backgroundColor: GREEN_CRATE_COLORS.leaf }
                            ]} 
                          />
                        )}

                        {/* Step Circle Indicator Node */}
                        <View
                          style={[
                            styles.circle,
                            isDone && styles.circleDone,
                            isActive && styles.circleActive,
                          ]}
                        >
                          {isDone ? (
                            <Feather name="check" size={14} color="#FFFFFF" />
                          ) : (
                            <Text style={[styles.circleText, isActive && styles.textActive]}>
                              {index + 1}
                            </Text>
                          )}
                        </View>
                      </View>
                      
                      <Text style={[styles.label, isActive && styles.labelActive]}>
                        {step.label}
                      </Text>
                    </View>
                  );
                })}
              </View>
            </View>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeContainer: { 
    flex: 1, 
    backgroundColor: GREEN_CRATE_COLORS.paper, // Organic canvas backdrop tone[cite: 1]
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: GREEN_CRATE_COLORS.cream,
    borderBottomWidth: 2,
    borderBottomColor: GREEN_CRATE_COLORS.ink, // Bold structural rule header accentuation[cite: 1]
  },
  headerTitle: { 
    fontSize: 20, 
    fontWeight: "700", 
    color: GREEN_CRATE_COLORS.ink 
  },
  contentScroll: { 
    flex: 1, 
    paddingHorizontal: 16,
    paddingTop: 12 
  },
  orderCard: { 
    backgroundColor: GREEN_CRATE_COLORS.cream,
    borderWidth: 1.5,
    borderColor: GREEN_CRATE_COLORS.line, // Uniform solid structural bounds style[cite: 1]
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    borderBottomWidth: 1,
    borderBottomColor: GREEN_CRATE_COLORS.line,
    paddingBottom: 10,
    marginBottom: 16,
  },
  badgeWrapper: {
    gap: 2,
  },
  brandSubtitle: {
    fontSize: 9,
    fontWeight: "700",
    color: "#8A8F7F",
    letterSpacing: 0.5,
  },
  orderIdText: { 
    fontSize: 15, 
    fontWeight: "700", 
    color: GREEN_CRATE_COLORS.ink 
  },
  progressRow: { 
    flexDirection: "row", 
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 4,
  },
  stepItem: { 
    flex: 1,
    alignItems: "center" 
  },
  nodeWrapper: {
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    height: 32,
  },
  leftLine: {
    position: "absolute",
    left: 0,
    right: "50%",
    height: 3,
    backgroundColor: GREEN_CRATE_COLORS.line,
    zIndex: 1,
  },
  rightLine: {
    position: "absolute",
    left: "50%",
    right: 0,
    height: 3,
    backgroundColor: GREEN_CRATE_COLORS.line,
    zIndex: 1,
  },
  circle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: GREEN_CRATE_COLORS.cream,
    borderWidth: 2,
    borderColor: GREEN_CRATE_COLORS.line,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 2,
  },
  circleText: { 
    color: GREEN_CRATE_COLORS.inkSoft, 
    fontSize: 12,
    fontWeight: "700" 
  },
  circleDone: { 
    backgroundColor: GREEN_CRATE_COLORS.leaf, // Done step accent[cite: 1]
    borderColor: GREEN_CRATE_COLORS.leaf,
  },
  circleActive: { 
    backgroundColor: GREEN_CRATE_COLORS.tomato, // Live target signature rotation emphasis colors[cite: 1]
    borderColor: GREEN_CRATE_COLORS.tomato,
  },
  textActive: {
    color: "#FFFFFF",
  },
  label: { 
    marginTop: 6, 
    fontSize: 12, 
    fontWeight: "500",
    color: GREEN_CRATE_COLORS.inkSoft,
    textAlign: "center" 
  },
  labelActive: {
    color: GREEN_CRATE_COLORS.tomato,
    fontWeight: "700",
  },
  emptyContainer: {
    flex: 1,
    paddingTop: 80,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyText: {
    fontSize: 15,
    color: GREEN_CRATE_COLORS.inkSoft,
    fontWeight: "500",
  },
});