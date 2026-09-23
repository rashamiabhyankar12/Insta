import { Feather } from "@expo/vector-icons";
import { StatusBar } from "expo-status-bar";
import { sendPasswordResetEmail } from "firebase/auth";
import { useState } from "react";
import {
    Alert,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { authentication } from "../../Firebaseconfig";

const GREEN_CRATE_COLORS = {
  paper: "#FAF9F4",
  ink: "#1F2B22",
  inkSoft: "#4B5A4C",
  leaf: "#3F7A37",
  tomato: "#E4572E",
  line: "#E4E0D2",
  cream: "#FFFDF8",
};

const ForgotPassword = ({ navigation, route }) => {
  const [email, setEmail] = useState(route?.params?.prefilledEmail || "");
  const [loading, setLoading] = useState(false);

  const handleResetRequest = () => {
    if (!email.trim()) {
      Alert.alert("Missing Email", "Please enter your registered email address.");
      return;
    }
    setLoading(true);
    sendPasswordResetEmail(authentication, email.trim())
      .then(() => {
        setLoading(false);
        Alert.alert(
          "Recovery Email Sent",
          "If an account exists with this email, you will receive password reset instructions.",
          [{ text: "OK", onPress: () => navigation?.goBack() }]
        );
      })
      .catch((err) => {
        setLoading(false);
        Alert.alert("Reset Failed", err.message);
      });
  };

  return (
    <SafeAreaView style={styles.safeContainer}>
      <StatusBar backgroundColor={GREEN_CRATE_COLORS.paper} style="dark" />
      <View style={styles.headerBar}>
        <TouchableOpacity
          onPress={() => navigation?.goBack()}
          style={styles.backButton}
        >
          <Feather name="arrow-left" size={20} color={GREEN_CRATE_COLORS.ink} />
        </TouchableOpacity>
      </View>

      <View style={styles.formContainer}>
        <View style={styles.iconBadge}>
          <Feather name="key" size={24} color="#FFFFFF" />
        </View>

        <Text style={styles.brandTitleHeader}>Reset Password</Text>
        <Text style={styles.brandSubtitle}>
          Enter your email address and we'll send you a link to reset your password.
        </Text>

        <Text style={styles.fieldLabel}>Email Address</Text>
        <View style={styles.inputContainer}>
          <Feather
            name="mail"
            size={18}
            color={GREEN_CRATE_COLORS.inkSoft}
            style={styles.fieldIcon}
          />
          <TextInput
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            placeholder="name@example.com"
            placeholderTextColor="#A3A899"
            style={styles.textInputStyle}
          />
        </View>

        <TouchableOpacity
          activeOpacity={0.8}
          onPress={handleResetRequest}
          disabled={loading}
          style={[styles.submitButton, loading && { opacity: 0.7 }]}
        >
          <Text style={styles.submitButtonText}>
            {loading ? "Sending..." : "Send Reset Link"}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeContainer: {
    flex: 1,
    backgroundColor: GREEN_CRATE_COLORS.paper,
  },
  headerBar: {
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: GREEN_CRATE_COLORS.cream,
    borderWidth: 1.5,
    borderColor: GREEN_CRATE_COLORS.line,
    justifyContent: "center",
    alignItems: "center",
  },
  formContainer: {
    paddingHorizontal: 24,
    marginTop: 24,
  },
  iconBadge: {
    width: 52,
    height: 52,
    backgroundColor: GREEN_CRATE_COLORS.leaf,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  brandTitleHeader: {
    color: GREEN_CRATE_COLORS.ink,
    fontSize: 26,
    fontWeight: "700",
  },
  brandSubtitle: {
    fontSize: 14,
    fontWeight: "500",
    color: GREEN_CRATE_COLORS.inkSoft,
    marginTop: 6,
    marginBottom: 24,
    lineHeight: 20,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: "700",
    color: GREEN_CRATE_COLORS.ink,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  inputContainer: {
    backgroundColor: GREEN_CRATE_COLORS.cream,
    borderColor: GREEN_CRATE_COLORS.line,
    borderWidth: 1.5,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    height: 54,
    paddingHorizontal: 14,
  },
  fieldIcon: {
    marginRight: 10,
  },
  textInputStyle: {
    fontSize: 15,
    color: GREEN_CRATE_COLORS.ink,
    flex: 1,
    height: "100%",
  },
  submitButton: {
    backgroundColor: GREEN_CRATE_COLORS.leaf,
    marginTop: 32,
    height: 56,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    elevation: 2,
  },
  submitButtonText: {
    fontSize: 16,
    color: "#FFFFFF",
    fontWeight: "700",
  },
});

export default ForgotPassword;