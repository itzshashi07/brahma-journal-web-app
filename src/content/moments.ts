export const moments = [
  {
    slug: "exam-brain",
    label: "Exam brain",
    emoji: "✎",
    headline: "Syllabus bada hai. Next step chhota rakho.",
    short: "When the to-do list has its own to-do list.",
    description:
      "An exam, a deadline, seventeen things to finish. Give the thoughts a place to land, then choose one small thing to do next.",
    feature: "focus",
    suggestion:
      "Try a short deep work session in the Android app. Pick one task, keep the goal small, and leave room for a break.",
    steps: [
      "Write down what is competing for your attention.",
      "Choose one task you can actually begin.",
      "Use a focus session, then take a pause.",
    ],
    prompt: "The one thing I can begin with is…",
    takeaway: "You do not have to finish the whole syllabus in this moment.",
  },
  {
    slug: "late-night-thoughts",
    label: "2 AM thoughts",
    emoji: "☾",
    headline: "Your brain has a group chat. Everyone is typing.",
    short: "For the thoughts that get loud when everything gets quiet.",
    description:
      "Tomorrow’s plans. Yesterday’s conversation. That thing from 2019. Your private journal is a place to put the thoughts into words.",
    feature: "journal",
    suggestion:
      "Open your private journal in the Android app and write one honest sentence. It does not need a title, a lesson, or a happy ending.",
    steps: [
      "Name the thought that keeps coming back.",
      "Write what you want to remember for tomorrow.",
      "Let the entry end without solving everything.",
    ],
    prompt: "The thought taking up the most space right now is…",
    takeaway: "Some thoughts need a page, not a public post.",
  },
  {
    slug: "social-battery",
    label: "Battery: low",
    emoji: "◔",
    headline: "Offline hona bhi allowed hai.",
    short: "When even replying “haha” feels like a task.",
    description:
      "Classes, work, plans, notifications. A full day can leave very little space for yourself. A quiet moment is something you can choose.",
    feature: "meditation",
    suggestion:
      "Explore a breathing practice or set a short meditation timer in the Android app. There is no performance to share afterwards.",
    steps: [
      "Find a comfortable place to pause.",
      "Choose a breathing practice or a short timer.",
      "Notice how the moment feels, without grading it.",
    ],
    prompt:
      "A little less of ___ and a little more of ___ would feel good today.",
    takeaway: "You can make room for yourself in a very connected day.",
  },
  {
    slug: "starting-again",
    label: "Starting again",
    emoji: "↺",
    headline: "Missed a day? The plot continues.",
    short: "No dramatic comeback montage required.",
    description:
      "Routines get interrupted. You do not need to wait for Monday, next month, or a more organised version of yourself to make another entry.",
    feature: "small-wins",
    suggestion:
      "Use the Android app to record one small win or a moment of gratitude. Something ordinary counts: beginning a task, a kind message, a walk.",
    steps: [
      "Choose one ordinary thing worth remembering.",
      "Write it in your own words.",
      "Come back when you want to. A missed day can stay a missed day.",
    ],
    prompt: "One small thing I am glad happened today is…",
    takeaway: "Small counts. Especially on the days that do not feel big.",
  },
] as const;
