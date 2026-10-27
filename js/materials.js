/* Lesson materials: chapters, transcripts and downloadable files. The files
   are generated in the browser and stand in for files served by a backend. */
const Materials = (() => {
  // Practice tempo (bpm) for each level; slow practice runs 20 bpm under it
  const TEMPO = { Beginner: 70, Intermediate: 90, Advanced: 110 };
  const tempo = (course) => TEMPO[course.level];

  // Break a lesson into chapters with start times in minutes
  function chapters(module) {
    const parts = [
      ["Warm-up and tuning", 0.1],
      [`Walkthrough: ${module.title.toLowerCase()}`, 0.35],
      ["Slow practice with the metronome", 0.3],
      ["Play-along at full tempo", 0.25],
    ];
    let t = 0;
    return parts.map(([name, share]) => {
      const start = t;
      t += Math.round(module.minutes * share);
      return { name, start };
    });
  }

  // What the instructor says in each chapter
  function transcript(course, index) {
    const module = course.modules[index];
    const first = course.instructor.split(" ")[0];
    const topic = module.title.toLowerCase();
    const bpm = tempo(course);
    const lines = [
      [
        `Hi, I'm ${first}, and welcome to lesson ${index + 1} of ${course.title}.`,
        `Before we get into ${topic}, let's tune up. Check each string against your tuner, from the low E up to the high E.`,
        "Now loosen up your hands with a slow chromatic run: one finger per fret, up and back down each string.",
      ],
      [
        `Here's what we're working on today: ${topic}.`,
        "I'll play it through once at full speed so you can hear where we're heading, then we'll break it into small pieces.",
        "Keep your fretting hand relaxed and your thumb behind the neck. If you feel tension creeping in, stop, shake it out and start again.",
      ],
      [
        `Set your metronome to ${bpm - 20} bpm. That will feel slow, and it should.`,
        "Play each phrase four times cleanly before you move on. If you make a mistake, drop the tempo by five and try again.",
        "Clean and slow beats fast and messy every time. Speed comes from repetition, not from forcing it.",
      ],
      [
        `Now let's put it all together at ${bpm} bpm. Play along with me.`,
        "Don't stop if you miss a note. Keep the rhythm going and catch the next beat, just like you would on stage.",
        "When this feels comfortable, mark the lesson complete and I'll see you in the next one.",
      ],
    ];
    return chapters(module).map((c, i) => ({ ...c, lines: lines[i] }));
  }

  // A short exercise in tab or chord-chart form for each genre
  const EXERCISES = {
    "Folk & Acoustic": `Travis pattern on C (thumb plays the bass notes)
e|-----0-------0-----|-----0-------0-----|
B|---1-------1-------|---1-------1-------|
G|-------0-------0---|-------0-------0---|
D|-------2-------2---|-------2-------2---|
A|-3-------3---------|-3-------3---------|
E|-------------------|-------------------|`,
    Rock: `A minor pentatonic lick with a full-tone bend
e|-----------------5-8-5-----------|
B|---------5-8b10------------8-5---|
G|---5-7-----------------------7---|
D|-7-------------------------------|
A|---------------------------------|
E|---------------------------------|`,
    Theory: `C major scale, one octave, with the note names
e|---------------------------------|
B|-----------------------0-1-------|
G|-----------------0-2-------------|
D|-----------0-2-3-----------------|
A|-----3---------------------------|
E|---------------------------------|
   C   D  E F  G  A  B  C`,
    Blues: `Shuffle in A (swing the eighth notes)
e|---------------------------------|
B|---------------------------------|
G|---------------------------------|
D|-2-2-4-4-2-2-4-4-|-2-2-4-4-2-2-4-4-|
A|-0-0-0-0-0-0-0-0-|-0-0-0-0-0-0-0-0-|
E|---------------------------------|`,
    Songwriting: `Progression to write over (four beats per chord)
| C    | G    | Am   | F    |
| C    | G    | F    | F    |
Try: hum a melody over bars 1-4, then repeat it with one change in bars 5-8.`,
    Jazz: `ii-V-I in C with shell voicings (root, 3rd, 7th)
       Dm7     G7      Cmaj7
e|-----------------------------|
B|-----------------------------|
G|----5-------4-------4--------|
D|----3-------3-------2--------|
A|-----------------------------|
E|----5-------3-------8--------|`,
  };

  const header = (course, index, label) =>
    [
      `STRUMLY - ${label}`,
      `${course.title} - Lesson ${index + 1}: ${course.modules[index].title}`,
      `Instructor: ${course.instructor} | Level: ${course.level}`,
      "-".repeat(60),
      "",
    ].join("\n");

  function tabSheet(course, index) {
    const bpm = tempo(course);
    return (
      header(course, index, "Tab and chord sheet") +
      `${EXERCISES[course.genre]}\n\n` +
      `Practice tempo: start at ${bpm - 20} bpm, then work up to ${bpm} bpm.\n` +
      "Play each bar four times cleanly before moving on.\n"
    );
  }

  function transcriptText(course, index) {
    return (
      header(course, index, "Lesson transcript") +
      transcript(course, index)
        .map((c) => `[${c.start}:00] ${c.name}\n${c.lines.join(" ")}\n`)
        .join("\n")
    );
  }

  function practicePlan(course, index) {
    const module = course.modules[index];
    const bpm = tempo(course);
    const daily = Math.max(10, Math.round(module.minutes / 7 / 5) * 5);
    const days = [
      `Watch the walkthrough, then slow practice at ${bpm - 20} bpm`,
      `Slow practice at ${bpm - 20} bpm, focus on clean notes`,
      `Practice at ${bpm - 15} bpm, record yourself once`,
      `Practice at ${bpm - 10} bpm, fix one problem spot`,
      `Practice at ${bpm - 5} bpm, play it three times without stopping`,
      `Play-along at ${bpm} bpm`,
      "Rest day, or play it for a friend",
    ];
    return (
      header(course, index, "7-day practice plan") +
      `About ${daily} minutes a day.\n\n` +
      days.map((d, i) => `Day ${i + 1}: [ ] ${d}`).join("\n") +
      "\n"
    );
  }

  // Metronome click track as a real WAV file (accent on beat 1 of each bar)
  function clickTrack(bpm, seconds = 32) {
    const rate = 22050;
    const length = rate * seconds;
    const view = new DataView(new ArrayBuffer(44 + length * 2));
    const text = (offset, s) =>
      [...s].forEach((c, i) => view.setUint8(offset + i, c.charCodeAt(0)));

    text(0, "RIFF");
    view.setUint32(4, 36 + length * 2, true);
    text(8, "WAVE");
    text(12, "fmt ");
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true); // PCM
    view.setUint16(22, 1, true); // mono
    view.setUint32(24, rate, true);
    view.setUint32(28, rate * 2, true);
    view.setUint16(32, 2, true);
    view.setUint16(34, 16, true);
    text(36, "data");
    view.setUint32(40, length * 2, true);

    const beat = Math.round((rate * 60) / bpm);
    const click = Math.round(rate * 0.03);
    for (let i = 0; i < length; i++) {
      const t = i % beat;
      let sample = 0;
      if (t < click) {
        const freq = Math.floor(i / beat) % 4 === 0 ? 1500 : 1000;
        sample = Math.sin((2 * Math.PI * freq * t) / rate) * (1 - t / click) * 0.6;
      }
      view.setInt16(44 + i * 2, sample * 32767, true);
    }
    return new Blob([view.buffer], { type: "audio/wav" });
  }

  // The downloads offered for a lesson
  function files(course, index) {
    const bpm = tempo(course);
    const base = `strumly-${course.id}-lesson-${index + 1}`;
    return [
      {
        id: "tab",
        icon: "file",
        title: "Tab and chord sheet",
        detail: "Printable exercise for this lesson (TXT)",
        filename: `${base}-tab-sheet.txt`,
        make: () => tabSheet(course, index),
      },
      {
        id: "click",
        icon: "music",
        title: `Click track at ${bpm - 20} bpm`,
        detail: "32-second metronome for slow practice (WAV)",
        filename: `${base}-click-${bpm - 20}bpm.wav`,
        make: () => clickTrack(bpm - 20),
      },
      {
        id: "click-full",
        icon: "music",
        title: `Click track at ${bpm} bpm`,
        detail: "32-second metronome for full tempo (WAV)",
        filename: `${base}-click-${bpm}bpm.wav`,
        make: () => clickTrack(bpm),
      },
      {
        id: "transcript",
        icon: "text",
        title: "Lesson transcript",
        detail: "Everything said in the video, with timestamps (TXT)",
        filename: `${base}-transcript.txt`,
        make: () => transcriptText(course, index),
      },
      {
        id: "plan",
        icon: "calendar",
        title: "7-day practice plan",
        detail: "A tick-box plan to get this lesson up to speed (TXT)",
        filename: `${base}-practice-plan.txt`,
        make: () => practicePlan(course, index),
      },
    ];
  }

  return { chapters, transcript, files, tabSheet };
})();
