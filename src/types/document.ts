export interface ShokumukeirekishoContent {
  title: string; // "職務経歴書"
  date: string; // YYYY年MM月DD日
  name: string;

  summary: string; // 職務要約

  skills: {
    category: string;
    items: string[];
  }[];

  workHistories: {
    companyName: string;
    period: string; // "YYYY年MM月 ～ YYYY年MM月" or "現在"
    employmentType: string;
    position: string;
    department: string;
    companyDescription: string;
    projects: {
      name: string;
      period: string;
      role: string;
      teamSize: string;
      description: string;
      achievements: string[];
      technologies: string[];
    }[];
  }[];

  selfPR: string;
}
