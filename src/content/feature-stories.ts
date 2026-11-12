export const featureStories = {
  journal: {
    headline: "For the thoughts that don’t fit in a caption.",
    line: "Dear diary, but make it your actual life.",
    prompt: "The honest version of today is…",
    steps: [
      "Open your journal in the Android app.",
      "Check in with your mood and energy, then write as much or as little as you want.",
      "Return to your entries when you want to reflect.",
    ],
    note: "Your journal entries are separate from the Open Board. Writing a personal entry does not publish a public post.",
  },
  meditation: {
    headline: "A pause button for a very full day.",
    line: "Your notifications can wait a moment.",
    prompt: "For the next few minutes, I can just be here.",
    steps: [
      "Explore the meditation techniques in the Android app.",
      "Choose a breathing practice or set a meditation timer.",
      "Keep a record of your practice without turning every moment into a performance.",
    ],
    note: "Meditation here is an everyday practice you choose. The app does not provide medical care or promise a particular outcome.",
  },
  analytics: {
    headline: "Your days have a story. Notice the patterns.",
    line: "A little context for the “how have I been?” question.",
    prompt: "Looking back, something I notice about my days is…",
    steps: [
      "Record your moods and activities in the Android app.",
      "Visit your history and personal patterns as your entries build up.",
      "Reflect on what you recorded, in the context of your own life.",
    ],
    note: "These are descriptive records of the information you enter, not a diagnosis, a prediction, or a measure of your worth. The new weekly reflection screen is part of the next update preview.",
  },
  "small-wins": {
    headline: "Not every win needs a trophy.",
    line: "Replied to the email? Went for a walk? That counts.",
    prompt: "One ordinary thing I want to remember is…",
    steps: [
      "Find a small moment that mattered to you.",
      "Record a win or something you are grateful for in the Android app.",
      "Keep a personal collection to revisit on an ordinary day.",
    ],
    note: "You get to decide what counts as a win. There is no need to make a hard day sound better than it was.",
  },
  "anonymous-reflections": {
    headline: "A thought to share. A name to leave out.",
    line: "Sometimes, “same here” is a little bit of company.",
    prompt: "Something I would like to put into words is…",
    steps: [
      "Visit the Open Board in the Android app.",
      "Choose whether to post or reply anonymously. Your private journal stays separate.",
      "Use report or block controls when you need them.",
    ],
    note: "Board posts and replies are visible to other people. Anonymous does not mean confidential: avoid sharing contact details or identifying information. Posts expire after 30 days. The board is not an emergency support service.",
  },
  focus: {
    headline: "One task. Fewer side quests.",
    line: "The entire to-do list can take a seat.",
    prompt: "For this session, I am choosing just…",
    steps: [
      "Choose a small task or milestone in the Android app’s deep work tools.",
      "Give that task a focus session, then leave room for a break.",
      "For a change of pace, explore the short memory, puzzle, attention and reflex games.",
    ],
    note: "Focus tools and games offer different ways to spend a moment. They do not claim to improve IQ, diagnose attention conditions, or guarantee productivity.",
  },
  library: {
    headline: "A little food for thought. No endless scroll required.",
    line: "Read something. Sit with it. Keep what resonates.",
    prompt: "An idea I want to carry into my day is…",
    steps: [
      "Explore wisdom organised around everyday situations in the Android app.",
      "Find an article or a longer read in the library.",
      "Take an idea back to your own journal, if you want to.",
    ],
    note: "Reading and community articles are for personal reflection. They do not replace professional advice.",
  },
} as const;
