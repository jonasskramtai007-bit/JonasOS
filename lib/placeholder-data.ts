// Static placeholder data for the foundation build.
// No fetching yet — every card renders from these constants.

import type { PillTone } from "@/components/dashboard/Pill";

export const operator = {
  name: "Your Name",
  role: "YOUR ROLE · YOUR CITY",
  focus: "One focus that matters this week",
  streak: 5,
};

export const financePulse = {
  savings: "€2,450",
  delta: "+€150",
  rangeLabel: "FEB — JUN · MANUAL ENTRY",
  // sparkline points in a 200×44 viewBox, most recent last
  points: [
    [0, 40],
    [50, 33],
    [100, 26],
    [150, 18],
    [200, 9],
  ] as [number, number][],
};

export const routeChips: { label: string; tone: PillTone }[] = [
  { label: "TASK", tone: "accent" },
  { label: "NOTE", tone: "muted" },
  { label: "JOURNAL", tone: "muted" },
];

export type TodayTask = {
  title: string;
  est: string;
  pill: string;
  tone: PillTone;
  done: boolean;
};

export const todayTasks: TodayTask[] = [
  { title: "Plan the week ahead", est: "25m", pill: "KEY", tone: "accent", done: false },
  { title: "Workout — 30 minutes", est: "30m", pill: "TODAY", tone: "warn", done: false },
  { title: "Read 20 pages", est: "20m", pill: "TODAY", tone: "warn", done: true },
];

export const habits = [
  { name: "MOVE", done: true },
  { name: "READ", done: true },
  { name: "STUDY", done: false },
  { name: "WAKE", done: true },
  { name: "WATER", done: true },
  { name: "WALK", done: false },
];

export const goalsWeek = [
  { text: "Ship one meaningful piece of work", done: true },
  { text: "Three training sessions", done: false },
  { text: "Inbox to zero by Friday", done: false },
];

export const goalsMonth = [
  { text: "Finish the current course module", done: false },
  { text: "Save €150 toward the buffer", done: true },
  { text: "Publish one long-form note", done: false },
];

export const goalsArchive = [
  { text: "Set up the weekly review ritual", when: "JUN" },
  { text: "Run a full 10k without stopping", when: "MAY" },
  { text: "Migrate notes into one system", when: "MAY" },
];

export const journal = {
  todayHasEntry: false,
  yesterdayPreview:
    "Slow start, strong finish. The afternoon deep-work block is clearly where the real progress happens — protect it.",
  entries: [
    {
      date: "THU 03 JUL",
      mood: "good",
      body: "Slow start, strong finish. The afternoon deep-work block is clearly where the real progress happens — protect it.",
    },
    {
      date: "WED 02 JUL",
      mood: "flat",
      body: "Meetings ate the morning. Managed one solid hour on the main project before energy dipped. Earlier bedtime tonight.",
    },
    {
      date: "TUE 01 JUL",
      mood: "good",
      body: "New month. Wrote down the three things that would make July a win and taped them above the desk.",
    },
  ],
};

export type BoardCard = {
  title: string;
  cat: string;
  pill: string;
  tone: PillTone;
  est: string;
};

export const taskColumns: { name: string; cards: BoardCard[] }[] = [
  {
    name: "BACKLOG",
    cards: [
      { title: "Outline the side-project landing page", cat: "PROJECT", pill: "SOMEDAY", tone: "muted", est: "2h" },
      { title: "Research a better note-taking flow", cat: "ADMIN", pill: "MONTH", tone: "muted", est: "1h" },
    ],
  },
  {
    name: "THIS WEEK",
    cards: [
      { title: "Draft the monthly budget review", cat: "FINANCE", pill: "WEEK", tone: "warn", est: "45m" },
      { title: "Book the dentist appointment", cat: "ADMIN", pill: "WEEK", tone: "warn", est: "10m" },
    ],
  },
  {
    name: "TODAY",
    cards: [
      { title: "Plan the week ahead", cat: "PLANNING", pill: "KEY", tone: "accent", est: "25m" },
      { title: "Workout — 30 minutes", cat: "HEALTH", pill: "TODAY", tone: "warn", est: "30m" },
    ],
  },
  {
    name: "DONE",
    cards: [
      { title: "Read 20 pages", cat: "LEARNING", pill: "DONE", tone: "muted", est: "20m" },
      { title: "Clear the email backlog", cat: "ADMIN", pill: "DONE", tone: "muted", est: "35m" },
    ],
  },
];

export const finance = {
  total: "€2,450",
  deltaLine: "▲ +€150 this month",
  income: "€1,200",
  spend: "€950",
  saveRate: "21%",
  snapshots: [
    { month: "JUN 2026", total: "€2,450", delta: "+€150", up: true },
    { month: "MAY 2026", total: "€2,300", delta: "+€180", up: true },
    { month: "APR 2026", total: "€2,120", delta: "-€40", up: false },
    { month: "MAR 2026", total: "€2,160", delta: "+€210", up: true },
    { month: "FEB 2026", total: "€1,950", delta: "+€120", up: true },
  ],
};

export const review = {
  weekRange: "JUN 29 — JUL 05",
  sealed: false,
};
