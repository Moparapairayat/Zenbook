export const GROUP_CATEGORIES = [
  "General",
  "Sports",
  "Technology",
  "Music",
  "Art & Design",
  "Gaming",
  "Education",
  "Business",
  "Health & Fitness",
  "Food & Cooking",
  "Travel",
  "Science",
  "Books & Reading",
  "Movies & TV",
  "Photography",
] as const;

export type GroupCategory = (typeof GROUP_CATEGORIES)[number];
