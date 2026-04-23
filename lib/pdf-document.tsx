import React from "react";
import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";

const styles = StyleSheet.create({
  page: {
    padding: 36,
    fontSize: 11,
    fontFamily: "Helvetica",
    color: "#111",
  },
  title: {
    fontSize: 22,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 11,
    marginBottom: 24,
    color: "#666",
  },
  section: {
    marginBottom: 18,
    paddingBottom: 12,
    borderBottom: "1 solid #e5e5e5",
  },
  question: {
    fontSize: 12,
    marginBottom: 6,
  },
  answer: {
    fontSize: 11,
    lineHeight: 1.5,
  },
});

export default function OnboardingPdf({
  clientName,
  submittedAt,
  items,
}: {
  clientName: string;
  submittedAt: string;
  items: { question: string; answer: string }[];
}) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.title}>Client Onboarding</Text>
        <Text style={styles.subtitle}>
          {clientName} · {submittedAt}
        </Text>

        {items.map((item, index) => (
          <View key={index} style={styles.section}>
            <Text style={styles.question}>{item.question}</Text>
            <Text style={styles.answer}>{item.answer || "—"}</Text>
          </View>
        ))}
      </Page>
    </Document>
  );
}
