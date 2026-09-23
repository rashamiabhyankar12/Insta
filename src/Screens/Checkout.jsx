import { Feather } from "@expo/vector-icons";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { StatusBar } from "expo-status-bar";
import { ref, runTransaction, set } from "firebase/database";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { authentication, db } from "../../Firebaseconfig";

const GREEN_CRATE_COLORS = {
  paper: "#FAF9F4",    
  cream: "#FFFDF8",    
  ink: "#1F2B22",      
  inkSoft: "#4B5A4C",  
  leaf: "#3F7A37",     
  leafLight: "rgba(63, 122, 55, 0.12)",
  line: "#E4E0D2",     
  white: "#FFFFFF",
  error: "#C93B2B"
};

const AccordionGroup = ({ options, selected, setSelected }) => {
  return (
    <View style={styles.accordionContainerStack}>
      {options.map((opt, idx) => {
        const isCurrentSelected = selected === opt.value;
        return (
          <View 
            key={idx} 
            style={[styles.optionCard, isCurrentSelected && styles.optionCardActive]}
          >
            <TouchableOpacity
              activeOpacity={0.8}
              style={styles.radioRow}
              onPress={() => setSelected(opt.value)}
            >
              <View style={[styles.radioCircle, isCurrentSelected && styles.radioCircleSelected]}>
                {isCurrentSelected && <View style={styles.radioInnerDot} />}
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.label, isCurrentSelected && styles.labelSelected]}>
                  {opt.label}
                </Text>
                {opt.subLabel && <Text style={styles.subLabelText}>{opt.subLabel}</Text>}
              </View>
            </TouchableOpacity>

            {isCurrentSelected && (
              <View style={styles.accordionContent}>
                {opt.content}
              </View>
            )}
          </View>
        );
      })}
    </View>
  );
};

export default function CheckoutScreen(props) {
  const navParams = props.route?.params || {};
  const navigation = props.navigation;
  
  const cartItems = navParams.cartItems || props.cartItems || [];
  const totalAmount = navParams.totalAmount !== undefined ? navParams.totalAmount : (props.totalAmount || 0);
  const targetUserMail = navParams.targetUserMail || props.targetUserMail || authentication.currentUser?.email || null;
  const onOrderSuccess = navParams.onOrderSuccess || props.onOrderSuccess;

  const safeTotalAmount = Number(totalAmount) || 0;

  const [selected, setSelected] = useState("Credit Card");
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const totalSteps = 2;

  const [form, setForm] = useState({
    Name: "", lastName: "", Address: "", country: "",
    state: "", zip: "", Email: targetUserMail || "", MobileNumber: "",
    cardNumber: "", expiry: "", cvv: "", userId: targetUserMail || ""
  });

  const [focusedField, setFocusedField] = useState(null);

  const handleChange = (field, value) => {
    if (field === "zip") {
      const numericVal = value.replace(/[^0-9]/g, "");
      setForm({ ...form, [field]: numericVal });
    } else {
      setForm({ ...form, [field]: value });
    }
  };

  const validateShipping = () => {
    const { Name, lastName, Address, country, state, zip, Email, MobileNumber } = form;
    if (!Name || !lastName || !Address || !country || !state || !zip || !Email || !MobileNumber) {
      Alert.alert("Missing Details", "Please fill in all shipping fields to continue.");
      return false;
    }
    const emailRegex = /\S+@\S+\.\S+/;
    if (!emailRegex.test(Email)) {
      Alert.alert("Invalid Email", "Please enter a valid email address.");
      return false;
    }
    return true;
  };

  const handleNextStep = () => {
    if (step === 1 && validateShipping()) {
      setStep(2);
    }
  };

  const validatePayment = () => {
    if (selected === "Credit Card") {
      const { cardNumber, expiry, cvv } = form;
      if (!cardNumber || !expiry || !cvv) {
        Alert.alert("Card Required", "Please complete your card details.");
        return false;
      }
      if (cardNumber.replace(/\s+/g, '').length < 12) {
        Alert.alert("Invalid Card", "Card number looks too short.");
        return false;
      }
      if (cvv.length < 3) {
        Alert.alert("Invalid CVV", "CVV must be 3 or 4 digits.");
        return false;
      }
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validatePayment()) return;

    setIsSubmitting(true);
    try {
      const counterRef = ref(db, "orderCounter");
      const transactionResult = await runTransaction(counterRef, (currentValue) => {
        return (currentValue === null) ? 1 : currentValue + 1;
      });

      const generatedId = transactionResult.snapshot.val();

      await set(ref(db, "Orders/" + generatedId), {
        Id: generatedId,
        userId: targetUserMail,
        createdAt: Date.now(),
        OrderStatus: "Pending",
        total: safeTotalAmount.toFixed(2),
        CartDetails: cartItems
      });

      await set(ref(db, `checkout/${generatedId}`), {
        ...form,
        Id: generatedId,
        PaymentMethod: selected,
        createdAt: new Date().toISOString()
      });

      await AsyncStorage.setItem("lastOrderId", String(generatedId));

      if (typeof onOrderSuccess === "function") {
        onOrderSuccess(generatedId);
      }

      if (navigation) {
        if (typeof navigation.replace === "function") {
          navigation.replace("Orderplaced", { orderId: generatedId, totalAmount: safeTotalAmount });
        } else if (typeof navigation.navigate === "function") {
          navigation.navigate("Orderplaced", { orderId: generatedId, totalAmount: safeTotalAmount });
        } else {
          Alert.alert("Success", "Order recorded successfully!");
        }
      } else {
        Alert.alert("Success", "Order recorded successfully!");
      }
    } catch (error) {
      Alert.alert("Submission Error", error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getInputStyle = (fieldName) => [
    styles.input,
    focusedField === fieldName && styles.inputFocused
  ];

  const paymentOptions = [
    {
      label: "Credit / Debit Card",
      value: "Credit Card",
      subLabel: "Visa, Mastercard, Amex",
      content: (
        <View style={styles.creditCardFormContainer}>
          <TextInput 
            style={getInputStyle("cardNumber")} 
            placeholder="Card Number" 
            placeholderTextColor="#9BA195" 
            keyboardType="numeric" 
            value={form.cardNumber} 
            onFocus={() => setFocusedField("cardNumber")}
            onBlur={() => setFocusedField(null)}
            onChangeText={(v) => handleChange("cardNumber", v)} 
          />
          <View style={styles.inputSplitRow}>
            <TextInput 
              style={[getInputStyle("expiry"), { flex: 1, marginRight: 8 }]} 
              placeholder="MM/YY" 
              placeholderTextColor="#9BA195" 
              value={form.expiry} 
              onFocus={() => setFocusedField("expiry")}
              onBlur={() => setFocusedField(null)}
              onChangeText={(v) => handleChange("expiry", v)} 
            />
            <TextInput 
              style={[getInputStyle("cvv"), { flex: 1, marginLeft: 8 }]} 
              placeholder="CVV" 
              placeholderTextColor="#9BA195" 
              keyboardType="numeric" 
              secureTextEntry 
              value={form.cvv} 
              onFocus={() => setFocusedField("cvv")}
              onBlur={() => setFocusedField(null)}
              onChangeText={(v) => handleChange("cvv", v)} 
            />
          </View>
          <TouchableOpacity 
            activeOpacity={0.85} 
            disabled={isSubmitting}
            style={[styles.submitButton, isSubmitting && { opacity: 0.7 }]} 
            onPress={handleSubmit}
          >
            {isSubmitting ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.submitText}>Pay ${safeTotalAmount.toFixed(2)}</Text>
            )}
          </TouchableOpacity>
        </View>
      )
    },
    {
      label: "Cash on Delivery",
      value: "Cash on Delivery",
      subLabel: "Pay directly upon courier arrival",
      content: (
        <View style={styles.codSummaryFormContainer}>
          <Text style={styles.codNoticeText}>
            Please keep exact change ready if possible. Your order status will update to pending fulfillment.
          </Text>
          <TouchableOpacity 
            activeOpacity={0.85} 
            disabled={isSubmitting}
            style={[styles.submitButton, isSubmitting && { opacity: 0.7 }]} 
            onPress={handleSubmit}
          >
            {isSubmitting ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.submitText}>Confirm COD Order</Text>
            )}
          </TouchableOpacity>
        </View>
      )
    }
  ];

  return (
    <View style={styles.screenWrapper}>
      <StatusBar backgroundColor={GREEN_CRATE_COLORS.paper} style="dark" />
      
      {/* Header Stepper Banner */}
      <View style={styles.topStepperBar}>
        <View style={styles.stepperHeaderRow}>
          <View style={styles.stepIndicatorBadge}>
            <Text style={styles.stepBadgeText}>STEP {step}</Text>
          </View>
          <Text style={styles.stepTitleMeta}>
            {step === 1 ? "Shipping Destination" : "Payment & Review"}
          </Text>
          <Text style={styles.totalPillText}>${safeTotalAmount.toFixed(2)}</Text>
        </View>
        <View style={styles.progressContainer}>
          <View style={[styles.progressBar, { width: `${(step / totalSteps) * 100}%` }]} />
        </View>
      </View>

      <ScrollView 
        showsVerticalScrollIndicator={false} 
        style={styles.mainScrollContainer}
        contentContainerStyle={styles.scrollContent}
      >
        {step === 1 && (
          <View style={styles.stepSection}>
            <View style={styles.sectionHeaderBox}>
              <Text style={styles.headerTitleLabel}>Shipping Address</Text>
              <Text style={styles.headerSubtitleText}>Where should we deliver your green crate?</Text>
            </View>
            
            <View style={styles.inputSplitRow}>
              <TextInput style={[getInputStyle("Name"), { flex: 1, marginRight: 6 }]} placeholder="First Name" placeholderTextColor="#9BA195" value={form.Name} onFocus={() => setFocusedField("Name")} onBlur={() => setFocusedField(null)} onChangeText={(v) => handleChange("Name", v)} />
              <TextInput style={[getInputStyle("lastName"), { flex: 1, marginLeft: 6 }]} placeholder="Last Name" placeholderTextColor="#9BA195" value={form.lastName} onFocus={() => setFocusedField("lastName")} onBlur={() => setFocusedField(null)} onChangeText={(v) => handleChange("lastName", v)} />
            </View>

            <TextInput style={getInputStyle("Address")} placeholder="Street Address" placeholderTextColor="#9BA195" value={form.Address} onFocus={() => setFocusedField("Address")} onBlur={() => setFocusedField(null)} onChangeText={(v) => handleChange("Address", v)} />
            <TextInput style={getInputStyle("country")} placeholder="Country" placeholderTextColor="#9BA195" value={form.country} onFocus={() => setFocusedField("country")} onBlur={() => setFocusedField(null)} onChangeText={(v) => handleChange("country", v)} />
            
            <View style={styles.inputSplitRow}>
              <TextInput style={[getInputStyle("state"), { flex: 1, marginRight: 6 }]} placeholder="State / Province" placeholderTextColor="#9BA195" value={form.state} onFocus={() => setFocusedField("state")} onBlur={() => setFocusedField(null)} onChangeText={(v) => handleChange("state", v)} />
              <TextInput style={[getInputStyle("zip"), { flex: 1, marginLeft: 6 }]} placeholder="Postal Code" placeholderTextColor="#9BA195" keyboardType="numeric" maxLength={10} value={form.zip} onFocus={() => setFocusedField("zip")} onBlur={() => setFocusedField(null)} onChangeText={(v) => handleChange("zip", v)} />
            </View>

            <TextInput style={getInputStyle("Email")} placeholder="Email Address" placeholderTextColor="#9BA195" keyboardType="email-address" autoCapitalize="none" value={form.Email} onFocus={() => setFocusedField("Email")} onBlur={() => setFocusedField(null)} onChangeText={(v) => handleChange("Email", v)} />
            <TextInput style={getInputStyle("MobileNumber")} placeholder="Mobile Phone" placeholderTextColor="#9BA195" keyboardType="phone-pad" value={form.MobileNumber} onFocus={() => setFocusedField("MobileNumber")} onBlur={() => setFocusedField(null)} onChangeText={(v) => handleChange("MobileNumber", v)} />

            <TouchableOpacity activeOpacity={0.85} style={styles.submitButton} onPress={handleNextStep}>
              <Text style={styles.submitText}>Continue to Payment</Text>
            </TouchableOpacity>
          </View>
        )}

        {step === 2 && (
          <View style={styles.stepSection}>
            {/* Order Mini Summary Card */}
            <View style={styles.summaryBannerCard}>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Items in Order</Text>
                <Text style={styles.summaryValue}>{cartItems.length} item(s)</Text>
              </View>
              <View style={styles.summaryDivider} />
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabelBold}>Total Due</Text>
                <Text style={styles.summaryValueBold}>${safeTotalAmount.toFixed(2)}</Text>
              </View>
            </View>

            <Text style={styles.headerTitleLabel}>Select Payment Method</Text>
            
            <AccordionGroup 
              options={paymentOptions} 
              selected={selected} 
              setSelected={setSelected} 
            />
            
            <TouchableOpacity 
              activeOpacity={0.7} 
              style={styles.backNavigationRowButton} 
              onPress={() => setStep(1)}
            >
              <Feather name="arrow-left" size={16} color={GREEN_CRATE_COLORS.inkSoft} />
              <Text style={styles.backButtonInlineText}>Return to Shipping Details</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screenWrapper: { 
    flex: 1, 
    backgroundColor: GREEN_CRATE_COLORS.paper 
  },
  topStepperBar: { 
    paddingHorizontal: 20, 
    paddingTop: 16, 
    paddingBottom: 10,
    backgroundColor: GREEN_CRATE_COLORS.paper,
    borderBottomWidth: 1,
    borderBottomColor: GREEN_CRATE_COLORS.line
  },
  stepperHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10
  },
  stepIndicatorBadge: {
    backgroundColor: GREEN_CRATE_COLORS.leafLight,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6
  },
  stepBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: GREEN_CRATE_COLORS.leaf,
    letterSpacing: 0.5
  },
  stepTitleMeta: {
    flex: 1,
    fontSize: 13,
    fontWeight: '700',
    color: GREEN_CRATE_COLORS.ink,
    marginLeft: 10
  },
  totalPillText: {
    fontSize: 13,
    fontWeight: '800',
    color: GREEN_CRATE_COLORS.leaf
  },
  progressContainer: { 
    height: 5, 
    backgroundColor: "#E2DFD4", 
    borderRadius: 3, 
    overflow: 'hidden' 
  },
  progressBar: { 
    height: '100%', 
    backgroundColor: GREEN_CRATE_COLORS.leaf, 
    borderRadius: 3 
  },
  mainScrollContainer: { flex: 1 },
  scrollContent: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 48 },
  stepSection: { gap: 4 },
  sectionHeaderBox: { marginBottom: 16 },
  headerTitleLabel: { 
    fontSize: 22, 
    fontWeight: "800", 
    color: GREEN_CRATE_COLORS.ink, 
    letterSpacing: -0.4 
  },
  headerSubtitleText: {
    fontSize: 13,
    color: GREEN_CRATE_COLORS.inkSoft,
    marginTop: 2
  },
  inputSplitRow: { flexDirection: "row", justifyContent: "space-between" },
  input: { 
    backgroundColor: GREEN_CRATE_COLORS.cream, 
    borderWidth: 1.5, 
    borderColor: GREEN_CRATE_COLORS.line, 
    paddingHorizontal: 14, 
    height: 50, 
    borderRadius: 12, 
    marginBottom: 12, 
    fontSize: 15, 
    fontWeight: "500", 
    color: GREEN_CRATE_COLORS.ink 
  },
  inputFocused: {
    borderColor: GREEN_CRATE_COLORS.leaf,
    backgroundColor: GREEN_CRATE_COLORS.white
  },
  accordionContainerStack: { gap: 12, marginTop: 12 },
  optionCard: { 
    borderRadius: 14, 
    backgroundColor: GREEN_CRATE_COLORS.cream, 
    borderWidth: 1.5, 
    borderColor: GREEN_CRATE_COLORS.line, 
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1
  },
  optionCardActive: { 
    borderColor: GREEN_CRATE_COLORS.leaf,
    backgroundColor: GREEN_CRATE_COLORS.white
  },
  radioRow: { flexDirection: "row", alignItems: "center" },
  radioCircle: { 
    height: 20, 
    width: 20, 
    borderRadius: 10, 
    borderWidth: 2, 
    borderColor: GREEN_CRATE_COLORS.line, 
    alignItems: "center", 
    justifyContent: "center", 
    marginRight: 12 
  },
  radioCircleSelected: { borderColor: GREEN_CRATE_COLORS.leaf },
  radioInnerDot: { height: 10, width: 10, borderRadius: 5, backgroundColor: GREEN_CRATE_COLORS.leaf },
  label: { fontSize: 16, fontWeight: "600", color: GREEN_CRATE_COLORS.inkSoft },
  labelSelected: { color: GREEN_CRATE_COLORS.ink, fontWeight: "700" },
  subLabelText: { fontSize: 12, color: GREEN_CRATE_COLORS.inkSoft, marginTop: 2 },
  accordionContent: { marginTop: 16, paddingTop: 16, borderTopWidth: 1, borderTopColor: GREEN_CRATE_COLORS.line },
  creditCardFormContainer: { paddingTop: 2 },
  codSummaryFormContainer: { paddingVertical: 4 },
  codNoticeText: { fontSize: 14, color: GREEN_CRATE_COLORS.inkSoft, lineHeight: 20, marginBottom: 16, fontWeight: "500" },
  submitButton: { 
    backgroundColor: GREEN_CRATE_COLORS.leaf, 
    height: 52, 
    borderRadius: 12, 
    alignItems: 'center', 
    justifyContent: 'center',
    marginTop: 12,
    shadowColor: GREEN_CRATE_COLORS.leaf,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 3
  },
  submitText: { color: '#FFFFFF', fontWeight: '700', fontSize: 16 },
  backNavigationRowButton: { flexDirection: "row", alignItems: "center", justifyContent: "center", marginTop: 20, gap: 8, padding: 8 },
  backButtonInlineText: { fontSize: 14, fontWeight: "600", color: GREEN_CRATE_COLORS.inkSoft },
  summaryBannerCard: {
    backgroundColor: GREEN_CRATE_COLORS.cream,
    borderWidth: 1.5,
    borderColor: GREEN_CRATE_COLORS.line,
    borderRadius: 14,
    padding: 16,
    marginBottom: 20
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  summaryDivider: {
    height: 1,
    backgroundColor: GREEN_CRATE_COLORS.line,
    marginVertical: 10
  },
  summaryLabel: { fontSize: 14, color: GREEN_CRATE_COLORS.inkSoft, fontWeight: '500' },
  summaryValue: { fontSize: 14, color: GREEN_CRATE_COLORS.ink, fontWeight: '600' },
  summaryLabelBold: { fontSize: 16, color: GREEN_CRATE_COLORS.ink, fontWeight: '800' },
  summaryValueBold: { fontSize: 18, color: GREEN_CRATE_COLORS.leaf, fontWeight: '800' }
});