import { Feather } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import {
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import AsyncStorage from "@react-native-async-storage/async-storage";
import { StatusBar } from "expo-status-bar";
import {
  onAuthStateChanged,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { authentication } from "../../Firebaseconfig";

// Exact color palette matching the brand identity of grocery-homepage-1.html
const GREEN_CRATE_COLORS = {
  paper: "#FAF9F4",     // List canvas background context
  ink: "#1F2B22",       // Dominant headers and primary typography text
  inkSoft: "#4B5A4C",   // Supporting descriptions and inputs helper context
  leaf: "#3F7A37",      // Primary actionable background callouts
  tomato: "#E4572E",    // Secondary highlighted links/actions
  line: "#E4E0D2",      // Structural border guidelines frame
  cream: "#FFFDF8",     // Input container field backings
};

const Login = ({ navigation }) => {
  const [loginCredentials, setloginCredentials] = useState({
    email: "",
    password: "",
  });
  const [isVisible, setIsVisible] = useState(true);
  const [resetLoading, setResetLoading] = useState(false);

  const { email, password } = loginCredentials;

  // Check existing session on mount
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(authentication, async (user) => {
      const storedId = await AsyncStorage.getItem("id");
      if (user && storedId === "success") {
        navigateMain();
      }
    });
    return unsubscribe;
  }, []);

  const navigateMain = () => {
    if (navigation && typeof navigation.reset === "function") {
      navigation.reset({
        index: 0,
        routes: [{ name: "MainTabs" }],
      });
    } else if (navigation && typeof navigation.navigate === "function") {
      navigation.navigate("MainTabs");
    }
  };

  const loginUser = () => {
    if (!email || !password) {
      Alert.alert("Missing Fields", "Please enter both your email and password.");
      return;
    }

    signInWithEmailAndPassword(authentication, email.trim(), password)
      .then(async (value) => {
        if (value) {
          const userEmail = value.user.email;
          await AsyncStorage.setItem("userEmail", userEmail || "");
          await AsyncStorage.setItem("id", "success");
          navigateMain();
        }
      })
      .catch((err) => {
        Alert.alert("Login Failed", err.message);
      });
  };

  // Handle Forgot Password navigation or inline email reset fallback
  const handleForgotPassword = () => {
    if (navigation && typeof navigation.navigate === "function") {
      navigation.navigate("ForgotPassword", { prefilledEmail: email });
    } else {
      if (!email.trim()) {
        Alert.alert("Enter Email", "Please type your email address in the field above first.");
        return;
      }
      setResetLoading(true);
      sendPasswordResetEmail(authentication, email.trim())
        .then(() => {
          setResetLoading(false);
          Alert.alert("Recovery Email Sent", "Check your inbox for password reset instructions.");
        })
        .catch((err) => {
          setResetLoading(false);
          Alert.alert("Reset Error", err.message);
        });
    }
  };

  return (
    <SafeAreaView style={styles.safeContainer}>
      <StatusBar backgroundColor={GREEN_CRATE_COLORS.paper} style="dark" />
      <ScrollView 
        style={styles.scrollContainer} 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Brand Main Structural Icon Frame */}
        <View style={styles.logoWrapper}>
          <View style={styles.crateIconBadge}>
            <Image
              style={styles.logoIcon}
              source={require("../assets/mainIcon.png")}
            />
          </View>
        </View>

        {/* Form Container Panel */}
        <View style={styles.formContainer}>
          <Text style={styles.brandTitleHeader}>Welcome Back</Text>
          <Text style={styles.brandSubtitle}>Enter your email and password to log in</Text>

          {/* Email Form Field Context */}
          <Text style={styles.fieldLabel}>Email Address</Text>
          <View style={styles.inputContainer}>
            <Feather name="mail" size={18} color={GREEN_CRATE_COLORS.inkSoft} style={styles.fieldIcon} />
            <TextInput
              value={email}
              onChangeText={(val) => setloginCredentials({ ...loginCredentials, email: val })}
              keyboardType="email-address"
              autoCapitalize="none"
              placeholder="name@example.com"
              placeholderTextColor="#A3A899"
              style={styles.textInputStyle}
            />
          </View>

          {/* Password Form Field Context */}
          <Text style={styles.fieldLabel}>Password</Text>
          <View style={styles.inputContainer}>
            <Feather name="lock" size={18} color={GREEN_CRATE_COLORS.inkSoft} style={styles.fieldIcon} />
            <TextInput
              value={password}
              onChangeText={(val) => setloginCredentials({ ...loginCredentials, password: val })}
              secureTextEntry={isVisible}
              autoCapitalize="none"
              placeholder="••••••••"
              placeholderTextColor="#A3A899"
              keyboardType="ascii-capable"
              style={styles.textInputStyle}
            />
            <TouchableOpacity 
              activeOpacity={0.7} 
              onPress={() => setIsVisible(!isVisible)}
              style={styles.toggleVisibilityBtn}
            >
              <Feather 
                name={isVisible ? "eye-off" : "eye"} 
                size={18} 
                color={GREEN_CRATE_COLORS.inkSoft} 
              />
            </TouchableOpacity>
          </View>

          {/* Account recovery options */}
          <TouchableOpacity 
            activeOpacity={0.7} 
            onPress={handleForgotPassword}
            disabled={resetLoading}
          >
            <Text style={styles.forgotPasswordText}>
              {resetLoading ? "Sending Reset..." : "Forgot Password?"}
            </Text>
          </TouchableOpacity>

          {/* Form Action Submissions */}
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={loginUser}
            style={styles.loginButton}
          >
            <Text style={styles.loginButtonText}>Log In</Text>
          </TouchableOpacity>

          {/* Visual Divider / Navigation Routing to registration */}
          <View style={styles.footerRowNavigation}>
            <Text style={styles.footerInlineLabel}>Don't have an account?</Text>
            <TouchableOpacity 
              activeOpacity={0.7} 
              onPress={() => navigation && navigation.navigate("Signup")}
            >
              <Text style={styles.signupHyperlinkText}>Signup</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeContainer: {
    flex: 1,
    backgroundColor: GREEN_CRATE_COLORS.paper,
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  logoWrapper: {
    alignItems: "center",
    marginTop: 30,
    marginBottom: 20,
  },
  crateIconBadge: {
    width: 60,
    height: 60,
    backgroundColor: GREEN_CRATE_COLORS.leaf,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    transform: [{ rotate: "-4deg" }],
  },
  logoIcon: {
    height: 32,
    width: 32,
    tintColor: "#FFFFFF",
    resizeMode: "contain",
  },
  formContainer: {
    paddingHorizontal: 24,
    marginTop: 32,
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
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: "700",
    color: GREEN_CRATE_COLORS.ink,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginTop: 20,
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
  toggleVisibilityBtn: {
    padding: 6,
  },
  forgotPasswordText: {
    fontSize: 13,
    fontWeight: "600",
    color: GREEN_CRATE_COLORS.tomato,
    marginTop: 12,
    textAlign: "right",
  },
  loginButton: {
    backgroundColor: GREEN_CRATE_COLORS.leaf,
    marginTop: 32,
    height: 56,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: GREEN_CRATE_COLORS.ink,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  loginButtonText: {
    fontSize: 16,
    color: "#FFFFFF",
    fontWeight: "700",
  },
  footerRowNavigation: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 24,
    gap: 6,
  },
  footerInlineLabel: {
    fontSize: 14,
    color: GREEN_CRATE_COLORS.inkSoft,
  },
  signupHyperlinkText: {
    fontSize: 14,
    color: GREEN_CRATE_COLORS.leaf,
    fontWeight: "700",
  },
});

export default Login;