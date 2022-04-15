import Constants from "expo-constants";
import * as Notifications from "expo-notifications";
import React, { useState, useEffect, useRef } from "react";
import {
  Text,
  View,
  Button,
  Platform,
  SafeAreaView,
  StyleSheet,
  KeyboardAvoidingView,
  TouchableOpacity,
} from "react-native";
import { Input } from "react-native-elements";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export default function App() {
  const [expoPushToken, setExpoPushToken] = useState("");
  const [notification, setNotification] = useState(false);
  const notificationListener = useRef();
  const responseListener = useRef();

  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [time, setTime] = useState(1);

  useEffect(() => {
    registerForPushNotificationsAsync().then((token) =>
      setExpoPushToken(token)
    );

    notificationListener.current =
      Notifications.addNotificationReceivedListener((notification) => {
        setNotification(notification);
      });

    responseListener.current =
      Notifications.addNotificationResponseReceivedListener((response) => {
        console.log(response);
      });

    return () => {
      Notifications.removeNotificationSubscription(
        notificationListener.current
      );
      Notifications.removeNotificationSubscription(responseListener.current);
    };
  }, []);

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <KeyboardAvoidingView style={styles.screenContainer}>
        <View style={styles.container}>
          <View style={styles.titleContainer}>
            <Text style={styles.title}>Notification Faker</Text>
          </View>
          <View style={styles.formContainer}>
            <View style={styles.fieldContainer}>
              <Input
                type="text"
                // ref={arrivalRef}
                value={title}
                // onChange={e => setDeparture(e.target.value)}
                onChangeText={setTitle}
                placeholder="title"
                label="Title"
                autoCompleteType={undefined}
                leftIconContainerStyle={{
                  padding: 10,
                }}
              />
            </View>

            <View style={styles.fieldContainer}>
              <Input
                type="text"
                // ref={arrivalRef}
                value={body}
                // onChange={e => setDeparture(e.target.value)}
                onChangeText={setBody}
                placeholder="Body"
                label="Body"
                autoCompleteType={undefined}
                leftIconContainerStyle={{
                  padding: 10,
                }}
              />
            </View>
            <View style={styles.fieldContainer}>
              <Input
                type="text"
                // ref={arrivalRef}
                value={time}
                // onChange={e => setDeparture(e.target.value)}
                onChangeText={setTime}
                placeholder="1"
                label="Time Delay in seconds (time > 0)"
                autoCompleteType={undefined}
                leftIconContainerStyle={{
                  padding: 10,
                }}
              />
            </View>

            <TouchableOpacity
              title="Create Notification"
              style={styles.button}
              onPress={async () => {
                await schedulePushNotification(title, body, time);
              }}
            >
              <Text style={styles.textButton}>Create Notification</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#21325E",
    height: "100%",
  },
  titleContainer: {
    justifyContent: "center",
    alignItems: "center",
    marginTop: 70,
  },
  title: {
    fontSize: 30,
    color: "#fff",
    fontWeight: "bold",
  },
  screenContainer: {
    justifyContent: "space-between",
    flex: 1,
  },
  formContainer: {
    backgroundColor: "white",
    margin: 20,
    marginTop: 30,
    padding: 10,
    paddingTop: 30,
    borderRadius: 15,
    // height: '150%',
  },
  fieldContainer: {
    marginHorizontal: 10,
    marginVertical: 10,
    paddingTop: 2,
  },
  button: {
    backgroundColor: "#F58840",
    color: "orange",
    borderRadius: 15,
    height: 40,
    alignItems: "center",
    padding: 10,
  },
  textButton: {
    color: "white",
    textAlign: "center",
    alignItems: "center",
    fontWeight: "bold",
    fontSize: 15,
  },
});

const schedulePushNotification = async (title, body, time) => {
  console.log(title, body, time);
  await Notifications.scheduleNotificationAsync({
    content: {
      title: title,
      body: body,
    },
    trigger: { seconds: parseInt(time) },
  });
};

async function registerForPushNotificationsAsync() {
  let token;
  if (Constants.isDevice) {
    const { status: existingStatus } =
      await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== "granted") {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    if (finalStatus !== "granted") {
      alert("Failed to get push token for push notification!");
      return;
    }
    token = (await Notifications.getExpoPushTokenAsync()).data;
    console.log(token);
  } else {
    alert("Must use physical device for Push Notifications");
  }

  if (Platform.OS === "android") {
    Notifications.setNotificationChannelAsync("default", {
      name: "default",
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: "#FF231F7C",
    });
  }

  return token;
}
