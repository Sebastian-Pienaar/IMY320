/* Course and instructor data (stands in for a backend). Used by every page. */
const strumlyInstructors = {
  "Marcus Cole": {
    role: "Lead Acoustic Instructor",
    bio: "Former session guitarist with 15 years of touring experience. Marcus specializes in fingerstyle and folk.",
    image:
      "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=400&q=80",
  },
  "Elena Rostova": {
    role: "Music Theory Expert",
    bio: "Classically trained at Berklee, Elena breaks down complex theory into easily digestible, practical guitar lessons.",
    image:
      "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&q=80",
  },
  "Julian Vance": {
    role: "Electric & Blues Coach",
    bio: "Julian lives and breathes the blues. He focuses on improvisation, tone building, and expressive soloing.",
    image:
      "https://images.unsplash.com/photo-1531427186611-ecfd6d936c79?w=400&q=80",
  },
};

const strumlyCourses = [
  {
    id: "acoustic-fingerpicking-101",
    recommended: true,
    title: "Acoustic Beginner",
    genre: "Folk & Acoustic",
    tags: ["Fingerstyle", "Acoustic", "Folk"],
    // Share of ratings at 5, 4, 3, 2 and 1 stars (percent)
    breakdown: [84, 12, 3, 1, 0],
    rating: 4.8,
    reviews: 1240,
    instructor: "Marcus Cole",
    level: "Beginner",
    blurb:
      "Build clean, independent finger patterns from scratch and play your first full fingerstyle arrangement.",
    description:
      "Fingerpicking is where the acoustic guitar starts to sound like a full band, and this course takes you there one pattern at a time. You will start by training your thumb to hold a steady bass line while your fingers work independently above it, then layer in the alternating patterns that underpin most folk and singer-songwriter playing. By the final module you will have a complete arrangement under your fingers, played cleanly and in time. Every technique is introduced slowly, drilled at practice tempo, and then applied to real music rather than isolated exercises.",
    prerequisites: [
      "An acoustic guitar in standard tuning",
      "Comfortable changing between open chords (G, C, D, Em)",
      "No prior fingerstyle experience needed",
    ],
    minutes: 380,
    learners: 8420,
    likes: 612,
    image:
      "https://images.unsplash.com/photo-1510915361894-db8b60106cb1?w=600&q=80",
    modules: [
      { title: "Hand position and thumb independence", minutes: 70 },
      { title: "Travis picking pattern", minutes: 85 },
      { title: "Adding melody notes", minutes: 105 },
      { title: "Playing your first arrangement", minutes: 120 },
    ],
  },
  {
    id: "electric-rock-solos",
    title: "Electric Rock Solos",
    genre: "Rock",
    tags: ["Lead guitar", "Pentatonic", "Electric"],
    // Share of ratings at 5, 4, 3, 2 and 1 stars (percent)
    breakdown: [70, 20, 7, 2, 1],
    rating: 4.6,
    reviews: 870,
    instructor: "Julian Vance",
    level: "Intermediate",
    blurb:
      "Bends, vibrato and phrasing drills that turn scale shapes into solos people actually want to hear.",
    description:
      "Most players learn the pentatonic box and then get stuck, because scale shapes are not the same thing as music. This course treats the scale as raw material and spends its time on what you do with it: bending accurately to pitch, controlling vibrato so it sounds intentional, and phrasing lines that breathe instead of running non-stop. You will work over backing tracks from the first module, building a vocabulary of licks you can actually deploy, and finish by constructing a full solo of your own over a rock progression.",
    prerequisites: [
      "An electric guitar and amp (or amp simulator)",
      "Minor pentatonic scale in at least one position",
      "Around six months of regular playing",
    ],
    minutes: 520,
    learners: 6150,
    likes: 498,
    image:
      "https://images.unsplash.com/photo-1550291652-6ea9114a47b1?w=600&q=80",
    modules: [
      { title: "Pentatonic shapes across the neck", minutes: 120 },
      { title: "Bending in tune", minutes: 110 },
      { title: "Vibrato and sustain control", minutes: 130 },
      { title: "Building a solo over a backing track", minutes: 160 },
    ],
  },
  {
    id: "music-theory-for-guitarists",
    recommended: true,
    title: "Music Theory for Guitarists",
    genre: "Theory",
    tags: ["Fretboard", "CAGED", "Chords"],
    // Share of ratings at 5, 4, 3, 2 and 1 stars (percent)
    breakdown: [91, 7, 2, 0, 0],
    rating: 4.9,
    reviews: 2310,
    instructor: "Elena Rostova",
    level: "Beginner",
    blurb:
      "Keys, intervals and the CAGED system explained on the fretboard, with no sheet music required.",
    description:
      "Theory taught from a piano keyboard rarely survives contact with a guitar neck. This course explains the same ideas where you actually play them: on the fretboard, in shapes and intervals you can see and reach. You will learn to name any note without counting up from the nut, understand why chords are built the way they are, and use the CAGED system to connect shapes into one continuous map. Nothing here requires reading standard notation, and every concept is tied back to something you can play immediately.",
    prerequisites: [
      "Any guitar, acoustic or electric",
      "Knowledge of a handful of open chords",
      "No music-reading ability required",
    ],
    minutes: 290,
    learners: 11230,
    likes: 940,
    image:
      "https://images.unsplash.com/photo-1507838153414-b4b713384a76?w=600&q=80",
    modules: [
      { title: "Notes on the fretboard", minutes: 55 },
      { title: "Intervals and triads", minutes: 70 },
      { title: "The CAGED system", minutes: 95 },
      { title: "Keys and chord families", minutes: 70 },
    ],
  },
  {
    id: "blues-rhythm-mastery",
    title: "Blues Rhythm Mastery",
    genre: "Blues",
    tags: ["Rhythm", "Shuffle", "Band playing"],
    // Share of ratings at 5, 4, 3, 2 and 1 stars (percent)
    breakdown: [78, 15, 5, 1, 1],
    rating: 4.7,
    reviews: 540,
    instructor: "Julian Vance",
    level: "Advanced",
    blurb:
      "Shuffle feels, turnarounds and comping voicings for playing rhythm in a live blues band.",
    description:
      "Rhythm guitar is the job you will actually be hired for, and blues rhythm has a vocabulary all its own. This course covers the 12-bar form until it is automatic, then digs into the feel that separates a stiff shuffle from one that swings. You will build a set of dominant voicings that leave room for a singer, learn the turnarounds that signal the top of the form, and practise comping behind a soloist without treading on them. The emphasis throughout is on playing with other people rather than alone in a room.",
    prerequisites: [
      "Confident barre chords across the neck",
      "Familiarity with the 12-bar blues form",
      "Some experience playing along with others or to a metronome",
    ],
    minutes: 445,
    learners: 3980,
    likes: 356,
    image:
      "https://images.unsplash.com/photo-1541689592655-f5f52825a3b8?w=600&q=80",
    modules: [
      { title: "The 12-bar form and shuffle feel", minutes: 95 },
      { title: "Dominant 7th voicings", minutes: 105 },
      { title: "Turnarounds and stops", minutes: 115 },
      { title: "Comping behind a soloist", minutes: 130 },
    ],
  },
  {
    id: "songwriting-on-six-strings",
    title: "Songwriting on Six Strings",
    genre: "Songwriting",
    tags: ["Chords", "Melody", "Lyrics"],
    // Share of ratings at 5, 4, 3, 2 and 1 stars (percent)
    breakdown: [66, 22, 8, 3, 1],
    rating: 4.5,
    reviews: 690,
    instructor: "Marcus Cole",
    level: "Intermediate",
    blurb:
      "Turn chord progressions into finished songs using structure, melody and lyric-writing exercises.",
    description:
      "Plenty of guitarists can play for hours and still have no finished songs to show for it. This course is about closing that gap. You will start with progressions that carry emotional weight rather than just sounding pleasant, then learn how verse, chorus and bridge do different jobs and why songs stall when those jobs blur. From there it moves into writing melodies that a person can actually sing and lyrics that say something specific. The final module is about finishing and arranging, because an unfinished song teaches you very little.",
    prerequisites: [
      "Comfortable playing common open and barre chords",
      "Ability to keep steady time while strumming",
      "A way to record rough ideas (a phone is fine)",
    ],
    minutes: 215,
    learners: 5240,
    likes: 421,
    image:
      "https://images.unsplash.com/photo-1516280440614-37939bbacd81?w=600&q=80",
    modules: [
      { title: "Progressions that carry a song", minutes: 45 },
      { title: "Verse, chorus and bridge", minutes: 50 },
      { title: "Writing a singable melody", minutes: 55 },
      { title: "Finishing and arranging", minutes: 65 },
    ],
  },
  {
    id: "jazz-chord-voicings",
    title: "Jazz Chord Voicings",
    genre: "Jazz",
    tags: ["Chords", "Comping", "Voice leading"],
    // Share of ratings at 5, 4, 3, 2 and 1 stars (percent)
    breakdown: [83, 13, 3, 1, 0],
    rating: 4.8,
    reviews: 320,
    instructor: "Elena Rostova",
    level: "Advanced",
    blurb:
      "Drop-2 shapes, extensions and voice leading for comping through standards with confidence.",
    description:
      "Jazz comping is less about knowing hundreds of chords than about knowing which notes to leave out. This course starts with shell voicings, the two or three notes that define a chord's quality, and builds outward from there. You will learn drop-2 shapes across string sets, add extensions and alterations without muddying the harmony, and voice-lead between chords so the movement sounds smooth rather than jumpy. The course closes by applying all of it to a standard, played at a realistic tempo with a rhythm section.",
    prerequisites: [
      "Solid barre chords and movable shapes",
      "Ability to read a chord chart",
      "Basic understanding of intervals and chord construction",
    ],
    minutes: 610,
    learners: 2470,
    likes: 289,
    image:
      "https://images.unsplash.com/photo-1524230572899-a752b3835840?w=600&q=80",
    modules: [
      { title: "Shell voicings and guide tones", minutes: 130 },
      { title: "Drop-2 shapes", minutes: 145 },
      { title: "Extensions and alterations", minutes: 160 },
      { title: "Comping through a standard", minutes: 175 },
    ],
  },
];

/* Sample reviews from other learners, newest first. Reviews written on this
   site are stored separately and shown above these. */
const strumlyReviews = {
  "acoustic-fingerpicking-101": [
    { name: "Thandi M.", rating: 5, date: "2026-09-14", text: "The thumb independence drills felt pointless for a week and then suddenly clicked. I can play Travis patterns without thinking now." },
    { name: "Ruan B.", rating: 5, date: "2026-08-30", text: "Marcus explains things slowly without being boring. The slow-tempo click tracks were the most useful part for me." },
    { name: "Priya K.", rating: 4, date: "2026-07-22", text: "Great course. I wish the last arrangement had a slower version for people with small hands." },
  ],
  "electric-rock-solos": [
    { name: "Jason L.", rating: 5, date: "2026-09-02", text: "Finally stopped running up and down the pentatonic box. The phrasing lesson changed how I think about solos." },
    { name: "Megan V.", rating: 4, date: "2026-08-11", text: "Bending in tune was hard but the drills work. Backing tracks are good fun." },
    { name: "Sipho N.", rating: 4, date: "2026-06-19", text: "Solid material. Lesson 4 moves fast, so expect to repeat it a few times." },
  ],
  "music-theory-for-guitarists": [
    { name: "Anika D.", rating: 5, date: "2026-09-20", text: "The first theory course that didn't make me read sheet music. CAGED finally makes sense." },
    { name: "Liam O.", rating: 5, date: "2026-09-05", text: "Elena is brilliant. Every concept comes with something to play straight away." },
    { name: "Kagiso T.", rating: 5, date: "2026-08-17", text: "Learning the notes on the fretboard properly has made every other course easier." },
  ],
  "blues-rhythm-mastery": [
    { name: "Dave P.", rating: 5, date: "2026-09-11", text: "My shuffle actually swings now. The comping lesson is gold if you play in a band." },
    { name: "Lerato S.", rating: 4, date: "2026-08-04", text: "Challenging, as advertised. The turnarounds lesson is worth the price on its own." },
    { name: "Chris W.", rating: 5, date: "2026-07-01", text: "Julian clearly plays live a lot. Practical advice you won't get from tab sites." },
  ],
  "songwriting-on-six-strings": [
    { name: "Naledi R.", rating: 5, date: "2026-09-18", text: "I finished my first song in week three. The 'finishing' module is the push I needed." },
    { name: "Tom H.", rating: 4, date: "2026-08-25", text: "Helpful structure lessons. The lyric exercises were less useful for me, but the rest is great." },
    { name: "Zara A.", rating: 4, date: "2026-07-13", text: "Good mix of theory and creativity. Would love more examples in different genres." },
  ],
  "jazz-chord-voicings": [
    { name: "Michael F.", rating: 5, date: "2026-09-09", text: "Shell voicings first was the right call. I can comp through Autumn Leaves now." },
    { name: "Ayesha G.", rating: 5, date: "2026-08-02", text: "Dense but very clear. The voice-leading diagrams are excellent." },
    { name: "Ben K.", rating: 4, date: "2026-06-28", text: "Not for beginners, but if you have the basics this is the best jazz chord course I've tried." },
  ],
};
