// Single-user app configuration. A settings UI/table can replace
// this later; for now profile and habit definitions live in code.

/** Fixed user_id stamped on every row (single-user instance). */
export const USER_ID = "00000000-0000-0000-0000-000000000001";

/** Timezone used to decide what "today" and "this week" mean. */
export const TIMEZONE = process.env.USER_TIMEZONE || "Europe/Vilnius";

export const PROFILE = {
  name: "Jonas",
  role: "OPERATOR · VILNIUS",
  focus: "Make the dashboard real",
};

/** Daily habits shown on the Home habits card. */
export const HABITS = ["MOVE", "READ", "STUDY", "WAKE", "WATER", "WALK"];
