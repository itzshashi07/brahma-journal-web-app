import { site } from "@/lib/site";
export const appFeatures = [
  {
    id: "journal",
    name: "Your private journal",
    category: "Let it out",
    icon: "journal",
    description:
      "A sentence, a longer reflection, or a quick mood check-in. There is room for the version of today you do not put on social media.",
    points: [
      "Mood and energy check-ins",
      "Short prompts when words are hard to find",
      "Optional voice input on supported devices",
    ],
  },
  {
    id: "meditation",
    name: "A moment to slow down",
    category: "Take a pause",
    icon: "wind",
    description:
      "Step away from the noise with a meditation timer, breathing practice and a library of techniques. Choose a pace that fits the day.",
    points: [
      "Short and longer timed sessions",
      "A technique library to explore",
      "Your meditation time, kept together",
    ],
  },
  {
    id: "analytics",
    name: "See your own patterns",
    category: "Look back",
    icon: "chart",
    description:
      "Look at your mood, the days you checked in and the habits you recorded. Build a picture of your own days over time.",
    points: [
      "Mood history and activity records",
      "Habit and craft consistency",
      "A personal record to reflect on",
    ],
  },
  {
    id: "small-wins",
    name: "Notice the small wins",
    category: "Keep the good",
    icon: "spark",
    description:
      "A kind conversation. Finishing a task. Getting out for a walk. Make a little space for the ordinary things worth remembering.",
    points: [
      "A simple gratitude practice",
      "Your own words, at your own pace",
      "A place for the moments you might forget",
    ],
  },
  {
    id: "anonymous-reflections",
    name: "Say it without your name",
    category: "Feel connected",
    icon: "message",
    description:
      "The Open Board is separate from your private journal. Choose what to share anonymously, and read reflections from other people.",
    points: [
      "Optional anonymous posts and replies",
      "Report and block controls",
      "Board posts expire after 30 days",
    ],
  },
  {
    id: "focus",
    name: "Find a different kind of focus",
    category: "Change the pace",
    icon: "focus",
    description:
      "Explore memory, attention, reflex and puzzle games, or use deep work tools to break a personal goal into smaller steps.",
    points: [
      "A collection of short focus games",
      "Personal milestones and small tasks",
      "Focus time tracked separately from meditation",
    ],
  },
  {
    id: "library",
    name: "Something worth sitting with",
    category: "Read & reflect",
    icon: "book",
    description:
      "Explore practical wisdom, articles and a reading library. Find an idea to reflect on, rather than another feed to keep up with.",
    points: [
      "Wisdom organised around real-life situations",
      "Articles from the community",
      "Books and longer reads in the app",
    ],
  },
] as const;
export const screenPreviews = [
  {
    src: "/images/app/2-reset.png",
    title: "Name what is on your mind",
    body: "A mood and a topic. A small place to start.",
  },
  {
    src: "/images/app/3-next-step.png",
    title: "Leave with one next step",
    body: "Choose something that feels manageable to you.",
  },
  {
    src: "/images/app/4-weekly-reflection.png",
    title: "Look back at your week",
    body: "Your own check-ins, brought together.",
  },
  {
    src: "/images/app/5-profile-pictures.png",
    title: "Keep your profile simple",
    body: "Six ready-made pictures. Just pick one.",
  },
] as const;
export const faqs = [
  {
    q: "What is InnenFlow for?",
    a: "InnenFlow is an Android app for personal reflection: write a private journal, record a quick check-in, take a meditation break, and look back at your habits and mood over time.",
  },
  {
    q: "Is it free to use?",
    a: "The currently available Android features are free to use. Payments are switched off, and there is no trial countdown.",
  },
  {
    q: "Can I use the app on this website?",
    a: "This is the app’s promotional website. Journaling, check-ins, meditation and account features are available in the Android app, which you can download from Google Play.",
  },
  {
    q: "Are the preview screens available in my download?",
    a: site.resetReleased
      ? "The two-minute reset and weekly reflection are part of the latest Android release. Check Google Play for the version available for your device."
      : "The screenshots show a preview of the next Android update, including the two-minute reset and weekly reflection. That update is not yet published on Google Play. You can download the current app for journaling, meditation and its other existing features.",
  },
  {
    q: "Do I have to write a lot?",
    a: "No. A mood check-in or one honest sentence can be enough. Longer reflections and optional voice input are there when you want them.",
  },
  {
    q: "Will other people see my journal?",
    a: "Your personal journal is separate from the public parts of the app. Posting to the anonymous board or publishing an article is an optional action you choose yourself.",
  },
  {
    q: "Is there an iPhone version?",
    a: "An iPhone App Store release is not available at present. The app is currently available on Android. This website is informational and does not replace the Android app.",
  },
  {
    q: "Is InnenFlow a medical or therapy service?",
    a: "No. InnenFlow is for everyday reflection and wellbeing. It does not provide medical advice, diagnosis, treatment or emergency care.",
  },
];
