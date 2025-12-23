import { Feather } from "@expo/vector-icons";
import { useEffect, useRef, useState } from "react";
import {
  Animated,
  FlatList,
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

const ReminderCard = ({ item, onDelete }) => {
  const SWIPE_LIMIT = -80;
  const [timeLeft, setTimeLeft] = useState(secondsUntil(item));

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
            },
          ]}
        >
          <View style={styles.leftSection}>
            <Text style={styles.reminderTitle}>{item.reminder}</Text>
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

export default function Reminders() {
  const dispatch = useDispatch();
  const { reminders, loading, error } = useSelector((state) => state.reminders);
  const listRef = useRef(null);
  const {user} = useSelector((state) => state.user);

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

  if (loading) {
    return <Text>Loading...</Text>;
  }

  if (error) {
    return <Text>Error: {error}</Text>;
  }

  return (
    <View style={styles.container}>
      <FlatList
        ref={listRef}
        data={reminders}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <ReminderCard item={item} onDelete={handleDeleteReminder} />
        )}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingTop: 210,
          paddingBottom: 200,
          gap: 12,
        }}
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
    paddingHorizontal: 10,
  },

  swipeWrapper: {
    width: "100%",
    overflow: "hidden",
  },

  deleteBehind: {
    position: "absolute",
    right: 0,
    width: 80,
    height: "95%",
    backgroundColor: "#0A8C6D",
    borderRadius: 35,
    alignItems: "center",
    justifyContent: "center",
  },

  cardContainer: {
    width: "100%",
    backgroundColor: "#121d12",
    borderRadius: 25,
    minHeight: 100,
    maxHeight: 180,
    flexDirection: "row",
    alignItems: "center",
  },

  leftSection: {
    paddingHorizontal: 15,
    paddingVertical: 20,
  },

  reminderTitle: {
    color: "#f2f2f2",
    fontSize: 14,
    lineHeight: 18,
    marginBottom: 6,
  },

  timerValue: {
    color: "#DDDDDD",
    fontSize: 12,
  },
});