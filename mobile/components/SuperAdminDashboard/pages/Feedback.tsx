import React, { useState } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { router } from "expo-router";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const PURPLE = "#7040D5";

export default function FeedbackPage() {
  const insets = useSafeAreaInsets();

  const [rating, setRating] = useState(0);
  const [feedback, setFeedback] = useState("");

  const submitFeedback = () => {
    if (rating === 0) {
      Alert.alert("Rating Required", "Please select a rating.");
      return;
    }

    if (!feedback.trim()) {
      Alert.alert("Feedback Required", "Please enter your feedback.");
      return;
    }

    Alert.alert(
      "Feedback Submitted",
      "Thank you for your feedback!",
      [
        {
          text: "OK",
          onPress: () => {
            setRating(0);
            setFeedback("");
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View
        style={[
          styles.header,
          {
            paddingTop: insets.top,
          },
        ]}
      >
        <View style={styles.headerContent}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
            activeOpacity={0.8}
          >
            <MaterialCommunityIcons
              name="arrow-left"
              size={22}
              color="#FFFFFF"
            />
          </TouchableOpacity>

          <Text
            style={styles.headerTitle}
            numberOfLines={1}
          >
            Feedback
          </Text>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Page Heading */}
        <View style={styles.titleSection}>
          <Text style={styles.pageTitle}>Feedback</Text>

          <Text style={styles.pageSubtitle}>
            Share your feedback and help us improve
          </Text>
        </View>

        {/* Feedback Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={styles.iconContainer}>
              <MaterialCommunityIcons
                name="message-star-outline"
                size={25}
                color={PURPLE}
              />
            </View>

            <View style={styles.cardHeaderText}>
              <Text style={styles.cardTitle}>
                Share Your Feedback
              </Text>

              <Text style={styles.cardSubtitle}>
                Tell us about your experience
              </Text>
            </View>
          </View>

          {/* Rating */}
          <Text style={styles.label}>
            How would you rate your experience?
          </Text>

          <View style={styles.ratingContainer}>
            {[1, 2, 3, 4, 5].map((item) => (
              <TouchableOpacity
                key={item}
                style={styles.starButton}
                onPress={() => setRating(item)}
                activeOpacity={0.7}
              >
                <MaterialCommunityIcons
                  name={
                    item <= rating
                      ? "star"
                      : "star-outline"
                  }
                  size={34}
                  color={
                    item <= rating
                      ? "#F5B301"
                      : "#B8B8B8"
                  }
                />
              </TouchableOpacity>
            ))}
          </View>

          {rating > 0 && (
            <Text style={styles.ratingText}>
              {rating === 1 && "Very Poor"}
              {rating === 2 && "Poor"}
              {rating === 3 && "Average"}
              {rating === 4 && "Good"}
              {rating === 5 && "Excellent"}
            </Text>
          )}

          {/* Feedback */}
          <Text style={styles.label}>
            Your Feedback
          </Text>

          <TextInput
            style={styles.textInput}
            placeholder="Write your feedback here..."
            placeholderTextColor="#9A9A9A"
            value={feedback}
            onChangeText={setFeedback}
            multiline
            textAlignVertical="top"
          />

          {/* Submit */}
          <TouchableOpacity
            style={styles.submitButton}
            onPress={submitFeedback}
            activeOpacity={0.85}
          >
            <MaterialCommunityIcons
              name="send-outline"
              size={19}
              color="#FFFFFF"
            />

            <Text style={styles.submitButtonText}>
              Submit Feedback
            </Text>
          </TouchableOpacity>
        </View>

        {/* Information */}
        <View style={styles.infoCard}>
          <MaterialCommunityIcons
            name="information-outline"
            size={21}
            color={PURPLE}
          />

          <Text style={styles.infoText}>
            Your feedback helps improve the overall
            learning and management experience.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F7F7FB",
  },

  /* Safe-area-aware purple header */
  header: {
    backgroundColor: PURPLE,
  },

  headerContent: {
    height: 64,
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
  },

  backButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.15)",
  },

  headerTitle: {
    flex: 1,
    marginLeft: 12,
    color: "#FFFFFF",
    fontFamily: "PoppinsSemiBold",
    fontSize: 19,
  },

  content: {
    padding: 18,
    paddingBottom: 35,
  },

  titleSection: {
    marginBottom: 18,
  },

  pageTitle: {
    fontFamily: "PoppinsBold",
    fontSize: 23,
    color: "#222222",
  },

  pageSubtitle: {
    marginTop: 3,
    fontFamily: "PoppinsRegular",
    fontSize: 12,
    color: "#777777",
  },

  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: "#E9E6F2",
  },

  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
  },

  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 13,
    backgroundColor: "#F0EAFE",
    alignItems: "center",
    justifyContent: "center",
  },

  cardHeaderText: {
    flex: 1,
    marginLeft: 12,
  },

  cardTitle: {
    fontFamily: "PoppinsSemiBold",
    fontSize: 16,
    color: "#242424",
  },

  cardSubtitle: {
    marginTop: 2,
    fontFamily: "PoppinsRegular",
    fontSize: 11,
    color: "#858585",
  },

  label: {
    fontFamily: "PoppinsSemiBold",
    fontSize: 12,
    color: "#333333",
    marginBottom: 9,
  },

  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 5,
  },

  starButton: {
    marginRight: 6,
  },

  ratingText: {
    fontFamily: "PoppinsMedium",
    fontSize: 11,
    color: PURPLE,
    marginBottom: 20,
  },

  textInput: {
    minHeight: 140,
    borderWidth: 1,
    borderColor: "#DDD9E8",
    borderRadius: 11,
    paddingHorizontal: 13,
    paddingVertical: 12,
    fontFamily: "PoppinsRegular",
    fontSize: 12,
    color: "#333333",
    backgroundColor: "#FCFCFE",
    marginBottom: 18,
  },

  submitButton: {
    minHeight: 44,
    borderRadius: 11,
    backgroundColor: PURPLE,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },

  submitButtonText: {
    marginLeft: 7,
    color: "#FFFFFF",
    fontFamily: "PoppinsSemiBold",
    fontSize: 12,
  },

  infoCard: {
    marginTop: 16,
    padding: 15,
    borderRadius: 13,
    backgroundColor: "#F0EAFE",
    flexDirection: "row",
    alignItems: "flex-start",
  },

  infoText: {
    flex: 1,
    marginLeft: 9,
    fontFamily: "PoppinsRegular",
    fontSize: 11,
    lineHeight: 18,
    color: "#5E4A8A",
  },
});