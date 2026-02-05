import { useEffect, useRef, useState } from "react";
import {
  Animated,
  Keyboard,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ScrollView,
} from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";
import { useSelector } from "react-redux";
import { asyncLogoutUser } from "../store/actions/userActions";
import { useDispatch } from "react-redux";
import Reminders from "../components/Reminders";
import { Ionicons } from "@expo/vector-icons";

export default function Home({ navigation }) {
  const bottomOffset = useRef(new Animated.Value(0)).current;
  const dispatch = useDispatch();

  useEffect(() => {
    // Listen to multiple keyboard events for better cross-device compatibility
    const listeners = [];

    // iOS uses 'Will' events, Android uses 'Did' events
    // Some devices may fire both, so we listen to all
    const showEvents = ['keyboardWillShow', 'keyboardDidShow'];
    const hideEvents = ['keyboardWillHide', 'keyboardDidHide'];

    showEvents.forEach(event => {
      const listener = Keyboard.addListener(event, (e) => {
        // Only animate if we have valid keyboard height
        if (e.endCoordinates && e.endCoordinates.height > 0) {
          Animated.timing(bottomOffset, {
            toValue: e.endCoordinates.height,
            duration: Platform.OS === 'ios' ? 250 : 100,
            useNativeDriver: false,
          }).start();
        }
      });
      listeners.push(listener);
    });

    hideEvents.forEach(event => {
      const listener = Keyboard.addListener(event, () => {
        Animated.timing(bottomOffset, {
          toValue: 0,
          duration: Platform.OS === 'ios' ? 250 : 100,
          useNativeDriver: false,
        }).start();
      });
      listeners.push(listener);
    });

    return () => {
      listeners.forEach(listener => listener.remove());
    };
  }, [bottomOffset]);
  
  const { user } = useSelector((state) => state.user);
  
  if(!user) return null;
  
  const today = new Date();

  const week = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date(today);
    const diff = d.getDay() === 0 ? -6 : 1 - d.getDay(); // week starts Mon
    d.setDate(d.getDate() + diff + i);

    return {
      day: d.toLocaleDateString("en-US", { weekday: "short" }),
      date: d.getDate(),
      isToday: d.toDateString() === new Date().toDateString(),
    };
  });

  return (
    <>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
          {/* Improved Header */}
          <View style={styles.infoContainer}>
            <View style={styles.headerTop}>
              <View style={styles.greetingSection}>
                <Text style={styles.greeting}>Good {new Date().getHours() < 12 ? 'Morning' : new Date().getHours() < 18 ? 'Afternoon' : 'Evening'}</Text>
                <Text style={styles.userName}>
                  {user.email.charAt(0).toUpperCase() + user.email.slice(1).split("@")[0]}
                </Text>
                <Text style={styles.headerDate}>
                  {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
                </Text>
              </View>
              
              <TouchableOpacity
                onPress={() => {
                  dispatch(asyncLogoutUser())
                }}
                style={styles.logoutButton}
              >
                <Text style={styles.logoutText}>Logout</Text>
              </TouchableOpacity>
            </View>

            {/* Week Calendar */}
            <View style={styles.weekContainer}>
              {week.map((item, idx) => (
                <View
                  key={idx}
                  style={[styles.dayItem, item.isToday && styles.activeDay]}
                >
                  <Text
                    style={[
                      styles.dayText,
                      item.isToday && styles.activeDayText,
                    ]}
                  >
                    {item.day}
                  </Text>
                  <Text
                    style={[
                      styles.weekDateText,
                      item.isToday && styles.activeDayText,
                    ]}
                  >
                    {item.date}
                  </Text>
                </View>
              ))}
            </View>
          </View>

          {/* Set Reminder Card */}
          <View style={styles.reminderCard}>
            <View style={styles.reminderContent}>
              <Text style={styles.reminderTitle}>Set a reminder</Text>
              <Text style={styles.reminderSubtitle}>
                Never forget important tasks!{'\n'}Create a reminder to stay organized
              </Text>
              <TouchableOpacity 
                style={styles.setNowButton}
                onPress={() => navigation.navigate('AddReminder')}
              >
                <Text style={styles.setNowText}>Create Now</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.bellIconContainer}>
              <Ionicons name="notifications" size={60} color="#0A8C6D" />
            </View>
          </View>

          {/* Reminders Section */}
          <View style={styles.remindersSection}>
            <Text style={styles.sectionTitle}>Upcoming Reminders</Text>
            <Reminders />
          </View>
        </View>

        {/* Floating Add Button */}
        <TouchableOpacity 
          style={styles.floatingButton}
          onPress={() => navigation.navigate('AddReminder')}
        >
          <Ionicons name="add" size={32} color="#ffffff" />
        </TouchableOpacity>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#1a1a1a",
  },
  container: {
    flex: 1,
    backgroundColor: "#1a1a1a",
  },
  
  // Improved Header Styles
  infoContainer: {
    position: "absolute",
    top: -60,
    height: 280,
    width: "100%",
    gap: 20,
    paddingHorizontal: 20,
    backgroundColor: "#0d7a5e",
    borderBottomLeftRadius: 45,
    borderBottomRightRadius: 45,
    zIndex: 1,
  },
  headerTop: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    marginTop: 70,
  },
  greetingSection: {
    flex: 1,
    gap: 4,
  },
  greeting: {
    fontSize: 16,
    color: "#ffffff",
    fontWeight: "500",
  },
  userName: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#ffffff",
    marginTop: 4,
  },
  headerDate: {
    fontSize: 13,
    color: "#ffffff",
    marginTop: 4,
  },
  
  // Week Calendar
  weekContainer: {
    height: 80,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    paddingHorizontal: 10,
    width: "100%",
    marginTop: 10,
  },
  dayItem: {
    width: 44,
    height: 64,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
  },
  activeDay: {
    backgroundColor: "#ffffff",
  },
  dayText: {
    color: "#ffffff",
    fontSize: 12,
  },
  weekDateText: {
    color: "#e0e0e0",
    fontSize: 16,
    fontWeight: "600",
  },
  activeDayText: {
    color: "#4a4a4a",
  },

  // Logout Button
  logoutButton: {
    borderWidth: 1,
    borderColor: "#ffffff",
    backgroundColor: "#ffffff",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
  },
  logoutText: {
    color: "#0A8C6D",
    fontSize: 14,
    fontWeight: "600",
  },

  // Set Reminder Card Styles
  reminderCard: {
    marginTop: 250,
    marginHorizontal: 20,
    backgroundColor: "#E8F5E9",
    borderRadius: 24,
    padding: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 32,
  },
  reminderContent: {
    flex: 1,
  },
  reminderTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#0A8C6D",
    marginBottom: 8,
  },
  reminderSubtitle: {
    fontSize: 13,
    color: "#0A8C6D",
    marginBottom: 16,
    lineHeight: 18,
  },
  setNowButton: {
    backgroundColor: "#0A8C6D",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    alignSelf: "flex-start",
  },
  setNowText: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "600",
  },
  bellIconContainer: {
    marginLeft: 16,
  },

  // Reminders Section
  remindersSection: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#ffffff",
    marginHorizontal: 20,
    marginBottom: 16,
  },

  // Floating Button
  floatingButton: {
    position: "absolute",
    bottom: 30,
    right: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#0A8C6D",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
  },
});
