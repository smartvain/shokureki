import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
} from "@react-pdf/renderer";
import type { ShokumukeirekishoContent } from "@/types/document";

const styles = StyleSheet.create({
  page: {
    fontFamily: "NotoSansJP",
    fontSize: 9,
    padding: 40,
    lineHeight: 1.6,
  },
  title: {
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 4,
  },
  dateRight: {
    fontSize: 9,
    textAlign: "right",
    marginBottom: 2,
  },
  nameRight: {
    fontSize: 11,
    textAlign: "right",
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: "bold",
    marginBottom: 6,
    marginTop: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#333",
    paddingBottom: 2,
  },
  text: {
    fontSize: 9,
    marginBottom: 4,
  },
  skillRow: {
    flexDirection: "row",
    marginBottom: 2,
  },
  skillCategory: {
    fontSize: 9,
    fontWeight: "bold",
    width: 100,
  },
  skillItems: {
    fontSize: 9,
    flex: 1,
  },
  companyHeader: {
    fontSize: 10,
    fontWeight: "bold",
    marginTop: 8,
    marginBottom: 2,
  },
  companyMeta: {
    fontSize: 8,
    color: "#555",
    marginBottom: 4,
  },
  projectHeader: {
    fontSize: 9,
    fontWeight: "bold",
    marginTop: 6,
    marginBottom: 2,
    backgroundColor: "#f5f5f5",
    padding: 4,
  },
  projectMeta: {
    fontSize: 8,
    color: "#555",
    marginBottom: 2,
    paddingLeft: 4,
  },
  projectDesc: {
    fontSize: 9,
    marginBottom: 2,
    paddingLeft: 4,
  },
  bullet: {
    fontSize: 9,
    paddingLeft: 12,
    marginBottom: 1,
  },
  techRow: {
    fontSize: 8,
    color: "#444",
    paddingLeft: 4,
    marginTop: 2,
    marginBottom: 4,
  },
});

interface Props {
  content: ShokumukeirekishoContent;
  fontUrl: string;
}

export function ShokumukeirekishoPDF({ content, fontUrl }: Props) {
  Font.register({
    family: "NotoSansJP",
    src: fontUrl,
  });

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Title and header */}
        <Text style={styles.title}>{content.title}</Text>
        <Text style={styles.dateRight}>{content.date}</Text>
        <Text style={styles.nameRight}>{content.name}</Text>

        {/* Summary */}
        <Text style={styles.sectionTitle}>職務要約</Text>
        <Text style={styles.text}>{content.summary}</Text>

        {/* Skills */}
        <Text style={styles.sectionTitle}>スキル</Text>
        {content.skills.map((skillGroup, i) => (
          <View key={i} style={styles.skillRow}>
            <Text style={styles.skillCategory}>{skillGroup.category}:</Text>
            <Text style={styles.skillItems}>
              {skillGroup.items.join(", ")}
            </Text>
          </View>
        ))}

        {/* Work Histories */}
        <Text style={styles.sectionTitle}>職務経歴</Text>
        {content.workHistories.map((wh, i) => (
          <View key={i}>
            <Text style={styles.companyHeader}>{wh.companyName}</Text>
            <Text style={styles.companyMeta}>
              {[wh.period, wh.employmentType, wh.position, wh.department]
                .filter(Boolean)
                .join(" | ")}
            </Text>
            {wh.companyDescription && (
              <Text style={styles.projectDesc}>{wh.companyDescription}</Text>
            )}

            {wh.projects.map((proj, j) => (
              <View key={j}>
                <Text style={styles.projectHeader}>{proj.name}</Text>
                <Text style={styles.projectMeta}>
                  {[
                    proj.period,
                    proj.role && `担当: ${proj.role}`,
                    proj.teamSize && `規模: ${proj.teamSize}`,
                  ]
                    .filter(Boolean)
                    .join(" | ")}
                </Text>
                <Text style={styles.projectDesc}>{proj.description}</Text>
                {proj.achievements.map((ach, k) => (
                  <Text key={k} style={styles.bullet}>
                    ・{ach}
                  </Text>
                ))}
                {proj.technologies.length > 0 && (
                  <Text style={styles.techRow}>
                    技術: {proj.technologies.join(", ")}
                  </Text>
                )}
              </View>
            ))}
          </View>
        ))}

        {/* Self PR */}
        <Text style={styles.sectionTitle}>自己PR</Text>
        <Text style={styles.text}>{content.selfPR}</Text>
      </Page>
    </Document>
  );
}
