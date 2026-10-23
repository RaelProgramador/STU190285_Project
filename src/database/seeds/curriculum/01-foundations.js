module.exports = {
  slug: 'foundations',
  title: 'Foundations',
  subtitle: 'Your first days with the guitar',
  level: 'Absolute Beginner',
  icon: '🌱',
  estimatedWeeks: 2,
  description:
    'Start from absolute zero. Get to know your instrument, tune it, hold it comfortably and play your first clean notes in time. No experience needed.',
  outcomes: [
    'Name every part of the guitar and pick the right gear',
    'Tune your guitar in under two minutes',
    'Read guitar tablature (TAB)',
    'Play clean single notes with correct posture',
    'Keep a steady pulse with a metronome',
  ],
  modules: [
    {
      title: 'Meet Your Guitar',
      description: 'Everything you need before playing a single note.',
      lessons: [
        {
          title: 'Parts of the Guitar & Your First Gear',
          summary: 'Body, neck, frets, pickups and tuners — what each part does and what gear you really need.',
          content:
            'The guitar has three main areas: the headstock (where the tuners live), the neck (with the fretboard and frets) and the body (where you strum and where electric pickups sit). Strings are numbered 1 to 6 from the thinnest (high E) to the thickest (low E). To start you only need a guitar, a tuner app, a few medium picks and a metronome app — nothing else.',
          practice: [
            'Point to the headstock, nut, frets, body and bridge on your own guitar.',
            'Say the string names out loud from thickest to thinnest: E A D G B E.',
            'Install a free tuner and a metronome app on your phone.',
          ],
          tab: 'String numbers (thinnest to thickest)\n1 = e (high E)\n2 = B\n3 = G\n4 = D\n5 = A\n6 = E (low E)',
          durationMin: 8,
        },
        {
          title: 'Tuning Your Guitar',
          summary: 'Use a tuner to get every string to standard tuning: E A D G B E.',
          content:
            'An out-of-tune guitar makes even perfect technique sound wrong, so tune every single time you pick it up. Pluck one string, read the tuner, and turn the peg until the needle is centred. Always tune UP to the note: if you are sharp, go below the note and come back up — the string holds its tension better that way.',
          practice: [
            'Tune all six strings with your tuner app, from low E to high E.',
            'Do a second pass — adjusting one string slightly affects the others.',
            'Detune one string on purpose and retune it without looking at the peg.',
          ],
          tab: 'Standard tuning\ne|--- E4\nB|--- B3\nG|--- G3\nD|--- D3\nA|--- A2\nE|--- E2',
          videoId: 'a-SXdLzl-kM',
          durationMin: 10,
        },
        {
          title: 'Posture & Holding the Pick',
          summary: 'Sit comfortably, keep your wrists relaxed and hold the pick between thumb and index finger.',
          content:
            'Good posture prevents pain and makes everything easier. Sit up straight, rest the guitar on your leg and keep the neck slightly angled upwards. Hold the pick between the pad of your thumb and the side of your index finger, with only a small tip showing. Grip it just firmly enough not to drop it — tension is the enemy of good playing.',
          practice: [
            'Sit with the guitar for 2 minutes and check: shoulders relaxed, wrist straight.',
            'Hold the pick and strum the open strings slowly, 20 times.',
            'Film yourself for 10 seconds and compare your grip to the video.',
          ],
          videoId: '-04Et5qIoa4',
          durationMin: 10,
        },
      ],
    },
    {
      title: 'Your First Notes',
      description: 'Read tabs and play clean notes with the fretting hand.',
      lessons: [
        {
          title: 'How to Read Guitar TAB',
          summary: 'Six lines = six strings, numbers = frets. The fastest way to learn songs.',
          content:
            'Tablature shows the guitar neck as six horizontal lines. The top line is the thinnest string (high e) and the bottom line is the thickest (low E). A number tells you which fret to press; 0 means play the string open. Numbers stacked vertically are played together. TAB does not show rhythm, so always listen to the song or lesson as well.',
          practice: [
            'Read the example below out loud: string and fret for each number.',
            'Play the example slowly, one note per second.',
            'Write a TAB of your own with 4 notes and play it back.',
          ],
          tab: 'e|-----------------0---|\nB|-----------1---3-----|\nG|-------0-2-----------|\nD|---2-3---------------|\nA|-3-------------------|\nE|---------------------|',
          videoId: 'kiUxlQnG5b8',
          durationMin: 10,
        },
        {
          title: 'Fretting Cleanly: Strings 1 and 2',
          summary: 'Press right behind the fret with your fingertip to get a clean, buzz-free note.',
          content:
            'A buzzing note usually means your finger is too far from the fret or not pressing firmly enough. Place the tip of your finger just behind the metal fret wire, keep your thumb behind the neck, and press only as hard as needed. Use one finger per fret: index for fret 1, middle for fret 2, ring for fret 3.',
          practice: [
            'Play frets 0-1-3 on string 1 and listen for buzzing.',
            'Repeat on string 2 (B string), then combine both strings.',
            'Find the minimum pressure that still gives a clean note.',
          ],
          tab: 'e|-0-1-3-----------3-1-0-|\nB|-------0-1-3-3-1-0------|',
          durationMin: 12,
        },
        {
          title: 'Finger Independence: The 1-2-3-4 Exercise',
          summary: 'The classic chromatic warm-up that builds strength, stretch and coordination.',
          content:
            'Place one finger on each fret (1 to 4) and play them in order on every string. This “spider” exercise trains every finger equally, especially the weak pinky. Keep fingers close to the fretboard and only lift each one when needed. Slow and clean always beats fast and sloppy.',
          practice: [
            'Play the exercise at 60 BPM, one note per click.',
            'Keep fingers down until the next string (anchor them).',
            'Increase 5 BPM only when three runs in a row are clean.',
          ],
          tab: 'e|-----------------------1-2-3-4-|\nB|-------------------1-2-3-4-----|\nG|---------------1-2-3-4---------|\nD|-----------1-2-3-4-------------|\nA|-------1-2-3-4-----------------|\nE|-1-2-3-4-----------------------|',
          durationMin: 12,
        },
      ],
    },
    {
      title: 'Rhythm Basics',
      description: 'Feel the pulse and make your picking hand reliable.',
      lessons: [
        {
          title: 'Pulse, Beats and the Metronome',
          summary: 'Music lives on a steady beat. Learn to count 1-2-3-4 and lock in with a click.',
          content:
            'Most popular music is in 4/4: four beats per bar, counted “1 2 3 4”. The metronome is your personal drummer — it shows you instantly when you rush or drag. Start by tapping your foot and counting out loud with the click before playing anything.',
          practice: [
            'Set the metronome to 70 BPM and count out loud for one minute.',
            'Tap your foot on every click while counting.',
            'Play the open low E string once on every beat for one minute.',
          ],
          tab: 'Count:  1   2   3   4 | 1   2   3   4\nPlay:   E   E   E   E | E   E   E   E',
          durationMin: 8,
        },
        {
          title: 'Downstrokes & Your First Strumming',
          summary: 'Strum all strings with even downstrokes while keeping the hand moving.',
          content:
            'Strumming comes from a loose wrist and forearm, like shaking water off your hand. Strum down on each beat and let the hand travel back up without hitting the strings. This constant pendulum motion is the secret behind every strumming pattern you will learn later.',
          practice: [
            'Mute the strings with your fretting hand and strum downstrokes at 70 BPM.',
            'Keep the “ghost” up motion even when you do not hit the strings.',
            'Strum open strings with 4 downstrokes per bar for two minutes.',
          ],
          tab: 'Count:  1   &   2   &   3   &   4   &\nStrum:  D   (u) D   (u) D   (u) D   (u)',
          videoId: 'hCLp1g8KilA',
          durationMin: 12,
        },
        {
          title: 'Alternate Picking Basics',
          summary: 'Down-up-down-up on single notes: efficient picking for melodies and riffs.',
          content:
            'Alternate picking means strictly alternating downstrokes and upstrokes. Angle the pick slightly so it glides over the string and keep the movement small. This technique doubles your speed potential and keeps your timing even.',
          practice: [
            'Pick the open high e string: D U D U, 4 notes per beat at 60 BPM.',
            'Move to the B string, then alternate between the two.',
            'Apply it to the 1-2-3-4 exercise from the previous module.',
          ],
          tab: 'e|-0-0-0-0-1-1-1-1-3-3-3-3-|\n  D U D U D U D U D U D U',
          videoId: 'q8SHmo1-dac',
          durationMin: 12,
        },
      ],
    },
  ],
};
