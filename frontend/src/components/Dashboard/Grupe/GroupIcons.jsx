import {
  MdOutlineAutoStories,
  MdOutlineCode,
  MdOutlineBarChart,
  MdOutlineStorage,
  MdCalculate,
  MdScience,
  MdArchitecture,
  MdLanguage,
  MdPsychology,
  MdEngineering,
  MdSchool,
  MdMenuBook,
  MdComputer,
} from "react-icons/md";

export const GROUP_ICON_MAP = {
  stories: MdOutlineAutoStories,
  code: MdOutlineCode,
  chart: MdOutlineBarChart,
  storage: MdOutlineStorage,
  math: MdCalculate,
  science: MdScience,
  architecture: MdArchitecture,
  language: MdLanguage,
  psychology: MdPsychology,
  engineering: MdEngineering,
  school: MdSchool,
  book: MdMenuBook,
  computer: MdComputer,
};

export const GROUP_ICON_OPTIONS = [
  { key: "stories", icon: MdOutlineAutoStories },
  { key: "code", icon: MdOutlineCode },
  { key: "chart", icon: MdOutlineBarChart },
  { key: "storage", icon: MdOutlineStorage },
  { key: "math", icon: MdCalculate },
  { key: "science", icon: MdScience },
  { key: "architecture", icon: MdArchitecture },
  { key: "language", icon: MdLanguage },
  { key: "psychology", icon: MdPsychology },
  { key: "engineering", icon: MdEngineering },
  { key: "school", icon: MdSchool },
  { key: "book", icon: MdMenuBook },
  { key: "computer", icon: MdComputer },
];

export const DEFAULT_GROUP_ICON = MdSchool;
export const DEFAULT_GROUP_ICON_KEY = "school";
