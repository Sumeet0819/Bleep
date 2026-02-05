import { Feather } from "@expo/vector-icons";
import { useEffect, useRef, useState } from "react";
import {
  Animated,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { PanGestureHandler } from "react-native-gesture-handler";
import { useDispatch, useSelector } from "react-redux";
import {
  deleteReminder,
  loadReminders,
} from "../store/actions/reminderActions";

///////////////////////////////////////////////////////////////////////////////////
// HELPERS
///////////////////////////////////////////////////////////////////////////////////

/**
 * Seconds remaining until target date
 */
/**
 * Seconds remaining until target date
 */
const secondsUntil = (item) => {
  let target = new Date(item.date);

  // Fallback: try building from day/time if date is invalid
  if (isNaN(target.getTime()) && item.day && item.time) {
    const built = buildDateFromDayTime({ day: item.day, time: item.time });
    if (built) target = built;
  }

  if (isNaN(target.getTime())) return 0;

  return Math.max(0, Math.floor((target - new Date()) / 1000));
};

const formatTime = (totalSeconds) => {
  if (totalSeconds <= 0) return "0s";

  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  let result = "";
  if (hours > 0) result += `${hours}h `;
  if (minutes > 0) result += `${minutes}m `;
  result += `${seconds}s`;

  return result.trim();
};

/**
 * Convert { day, time } → Date
 * Supports flexible input:
 * day: "Sunday" | "sunday"
 * time: "07:30 PM" | "7:30PM"
 */
const buildDateFromDayTime = ({ day, time }) => {
  if (typeof day !== "string" || typeof time !== "string") return null;

  const dayMap = {
    sunday: 0,
    monday: 1,
    tuesday: 2,
    wednesday: 3,
    thursday: 4,
    friday: 5,
    saturday: 6,
  };

  const targetDay = dayMap[day.toLowerCase()];
  if (targetDay === undefined) return null;

  const match = time.match(/^(\d{1,2}):(\d{2})\s?(AM|PM)$/i);
  if (!match) return null;

  let [, h, m, mod] = match;
  let hours = Number(h);
  let minutes = Number(m);

  if (mod.toUpperCase() === "PM" && hours !== 12) hours += 12;
  if (mod.toUpperCase() === "AM" && hours === 12) hours = 0;

  const date = new Date();
  const diff = (targetDay - date.getDay() + 7) % 7;

  date.setDate(date.getDate() + diff);
  date.setHours(hours, minutes, 0, 0);

  if (date < new Date()) {
    date.setDate(date.getDate() + 7);
  }

  return date;
};

///////////////////////////////////////////////////////////////////////////////////
// REMINDER CARD
///////////////////////////////////////////////////////////////////////////////////

const ReminderCard = ({ item, onDelete, isDark }) => {
  const SWIPE_LIMIT = -80;
  const [timeLeft, setTimeLeft] = useState(secondsUntil(item));

  const theme = {
    cardBg: isDark ? "#1F1F1F" : "#FFFFFF", // Matched Home Header
    cardBorder: "transparent",
    text: isDark ? "#ffffff" : "#0A8C6D",
    shadowOpacity: 0,
    elevation: 0,
    borderWidth: 0,
  };

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(secondsUntil(item));
    }, 1000);

    return () => clearInterval(timer);
  }, [item]);

  // Swipe animation
  const translateX = useRef(new Animated.Value(0)).current;

  // ⬇️ Enter animation (ONLY for new reminder)
  const enterY = useRef(new Animated.Value(item.isNew ? -24 : 0)).current;

  const enterOpacity = useRef(new Animated.Value(item.isNew ? 0 : 1)).current;

  useEffect(() => {
    if (!item.isNew) return;

    Animated.parallel([
      Animated.timing(enterY, {
        toValue: 0,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.timing(enterOpacity, {
        toValue: 1,
        duration: 260,
        useNativeDriver: true,
      }),
    ]).start();
  }, [item.isNew]);

  const onGestureEvent = Animated.event(
    [{ nativeEvent: { translationX: translateX } }],
    { useNativeDriver: true }
  );

  const onEnd = ({ nativeEvent }) => {
    Animated.timing(translateX, {
      toValue: nativeEvent.translationX < SWIPE_LIMIT ? SWIPE_LIMIT : 0,
      duration: 180,
      useNativeDriver: true,
    }).start();
  };
  return (
    <View style={styles.swipeWrapper}>
      {/* Delete background */}
    
        <TouchableOpacity style={styles.deleteBehind} onPress={() => onDelete(item._id)}>
          <Feather name="trash" size={18} color="#fff" />
        </TouchableOpacity>
      

      <PanGestureHandler
        onGestureEvent={onGestureEvent}
        onEnded={onEnd}
        activeOffsetX={[-20, 20]}
        failOffsetY={[-10, 10]}
      >
        <Animated.View
          style={[
            styles.cardContainer,
            {
              opacity: enterOpacity,
              transform: [{ translateX }, { translateY: enterY }],
              backgroundColor: theme.cardBg,
              borderColor: theme.cardBorder,
              borderWidth: theme.borderWidth,
              shadowOpacity: theme.shadowOpacity,
              elevation: theme.elevation,
            },
          ]}
        >
          <View style={styles.leftSection}>
            <View style={styles.titleRow}>
              <Text style={[styles.reminderTitle, { color: theme.text }]}>{item.reminder}</Text>
              {item.tag && (
                <View style={styles.tagBadge}>
                  <Text style={styles.tagBadgeText}>{item.tag}</Text>
                </View>
              )}
            </View>
            <Text style={styles.timerValue}>{formatTime(timeLeft)}</Text>
          </View>
        </Animated.View>
      </PanGestureHandler>
    </View>
  );
};

///////////////////////////////////////////////////////////////////////////////////
// LIST
///////////////////////////////////////////////////////////////////////////////////

export default function Reminders({ isDark }) {
  const dispatch = useDispatch();
  const { reminders, loading, error } = useSelector((state) => state.reminders);
  const listRef = useRef(null);
  const {user} = useSelector((state) => state.user);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
     if (!user?.id) return;
    dispatch(loadReminders(user.id));
   
  }, [dispatch]);

  // ⬇️ Shift screen DOWN when new reminder is added
  useEffect(() => {
    if (reminders.some((r) => r.isNew)) {
      listRef.current?.scrollToOffset({
        offset: -60, // correct direction for inverted list
        animated: true,
      });
    }
  }, [reminders]);

  const handleDeleteReminder = (_id) => {
    dispatch(deleteReminder(_id));
  };

  const onRefresh = async () => {
    if (!user?.id) return;
    setRefreshing(true);
    await dispatch(loadReminders(user.id));
    setRefreshing(false);
  };

  if (loading && !refreshing) {
    return <Text style={{ color: isDark ? '#fff' : '#000' }}>Loading...</Text>;
  }

  if (error) {
    return <Text style={{ color: isDark ? '#ff4d4d' : 'red' }}>Error: {error}</Text>;
  }

  return (
    <View style={styles.container}>
      <FlatList
        ref={listRef}
        data={reminders}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <ReminderCard item={item} onDelete={handleDeleteReminder} isDark={isDark} />
        )}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingTop: 0,
          paddingBottom: 200,
          gap: 0,
        }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#0A8C6D"
            colors={["#0A8C6D"]}
          />
        }
      />
    </View>
  );
}

///////////////////////////////////////////////////////////////////////////////////
// STYLES
///////////////////////////////////////////////////////////////////////////////////

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 15,
    paddingVertical: 10,
  },

  swipeWrapper: {
    width: "100%",
    overflow: "hidden",
    marginBottom: 12,
  },

  deleteBehind: {
    position: "absolute",
    right: 0,
    width: 80,
    height: "95%",
    backgroundColor: "#0A8C6D",
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#0A8C6D",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 4,
  },

  cardContainer: {
    width: "100%",
    backgroundColor: "#E8F5E9",
    borderRadius: 20,
    minHeight: 100,
    maxHeight: 180,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#3a3a3a",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },

  leftSection: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    flex: 1,
  },

  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 8,
    flexWrap: "wrap",
  },

  reminderTitle: {
    color: "#0A8C6D",
    fontSize: 15,
    lineHeight: 20,
    fontWeight: "500",
    flex: 1,
  },

  tagBadge: {
    backgroundColor: "#0A8C6D",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },

  tagBadgeText: {
    color: "#ffffff",
    fontSize: 11,
    fontWeight: "600",
  },

  timerValue: {
    color: "#0A8C6D",
    fontSize: 13,
    fontWeight: "600",
  },
});