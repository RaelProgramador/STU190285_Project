module.exports = {
  slug: 'advanced',
  title: 'Fretboard Mastery & Theory',
  subtitle: 'Understand the music you play',
  level: 'Advanced',
  icon: '🧠',
  estimatedWeeks: 10,
  description:
    'See the whole fretboard as a map. The CAGED system, the major scale, harmony and modes turn memorised shapes into real musical understanding — plus fingerstyle technique for solo guitar.',
  outcomes: [
    'Visualise any chord in five places with the CAGED system',
    'Build the major scale and its diatonic chords in any key',
    'Understand and use the Dorian and Mixolydian modes',
    'Play Travis-style fingerpicking patterns',
    'Connect chords, scales and arpeggios across the neck',
  ],
  modules: [
    {
      title: 'The CAGED System',
      description: 'Five shapes that unlock the entire fretboard.',
      lessons: [
        {
          title: 'Introduction to CAGED',
          summary: 'C, A, G, E and D shapes repeat along the neck in a fixed order.',
          content:
            'Every major chord can be played using the shapes of the open C, A, G, E and D chords, moved up the neck. The shapes always connect in the order C-A-G-E-D. CAGED links chords, scales and arpeggios in the same area of the fretboard, clearing away “fretboard fog”.',
          practice: [
            'Play open C, A, G, E and D and study each root note position.',
            'Find the root notes of each shape on the neck.',
            'Say the order C-A-G-E-D while moving up the neck.',
          ],
          videoId: 'kQMdrJ8U-9I',
          durationMin: 15,
        },
        {
          title: 'Playing One Chord in Five Places',
          summary: 'Play C major using all five CAGED shapes up the neck.',
          content:
            'Pick one chord — C major — and play it with every shape: the open C shape, the A shape at fret 3, the G shape at fret 5, the E shape at fret 8 and the D shape at fret 10. Focus on where the roots are; they link each shape to the next.',
          practice: [
            'Play C with all five shapes, ascending and descending.',
            'Repeat with G major.',
            'Pick one shape and play a I–IV–V progression within it.',
          ],
          tab: 'C major through CAGED\nC shape (open)  : x32010\nA shape (fret 3): x35553\nG shape (fret 5): 8-7-5-5-5-8\nE shape (fret 8): 8-10-10-9-8-8\nD shape (fret10): x-x-10-12-13-12',
          videoId: 'vnqJzrZsMwc',
          durationMin: 18,
        },
        {
          title: 'CAGED & Pentatonic: The Complete Map',
          summary: 'Match each pentatonic position to its CAGED chord shape.',
          content:
            'Each of the five pentatonic positions sits around one CAGED shape. When you see the chord shape, you can see the scale around it — and target chord tones while soloing. This avoids the “jumpy effect” of shifting randomly between positions.',
          practice: [
            'Play the E-shape chord at fret 5 and the pentatonic box around it.',
            'Repeat for the D shape and position 2.',
            'Solo over A while staying within one CAGED area.',
          ],
          videoId: 'Aq5LcmftMXI',
          durationMin: 16,
        },
      ],
    },
    {
      title: 'Scales, Harmony & Modes',
      description: 'The theory that explains why music works.',
      lessons: [
        {
          title: 'The Major Scale & Intervals',
          summary: 'The W-W-H-W-W-W-H formula that builds every key.',
          content:
            'The major scale follows a pattern of whole (W = 2 frets) and half (H = 1 fret) steps: W-W-H-W-W-W-H. Every interval — thirds, fifths, sevenths — is measured from the root. Once you know the formula, you can build any major scale on a single string.',
          practice: [
            'Play C major on the A string only, using the formula.',
            'Play G major on the low E string the same way.',
            'Name the interval of each note (1, 2, 3, 4, 5, 6, 7).',
          ],
          tab: 'C major on one string\nA|-3-5-7-8-10-12-14-15-|\n   C D E F G  A  B  C\n    W W H W  W  W  H',
          durationMin: 15,
        },
        {
          title: 'Harmonising the Major Scale',
          summary: 'The seven chords of every key: I ii iii IV V vi vii°.',
          content:
            'Stacking thirds on each note of the major scale produces seven chords: major on I, IV and V; minor on ii, iii and vi; diminished on vii. In C: C, Dm, Em, F, G, Am, B°. This is why certain chords always sound “right” together and how you can write your own progressions.',
          practice: [
            'Write the seven chords of G major.',
            'Play I–vi–IV–V in C, G and D.',
            'Write a 4-chord progression of your own using only diatonic chords.',
          ],
          tab: 'Key of C\n I    ii   iii  IV   V    vi   vii°\n C    Dm   Em   F    G    Am   B°',
          durationMin: 16,
        },
        {
          title: 'Modes: Dorian & Mixolydian',
          summary: 'Same notes, different home — and a completely different mood.',
          content:
            'Modes are the major scale started from a different degree. Dorian (from the 2nd degree) is minor with a bright major 6th — the sound of funk and Santana. Mixolydian (from the 5th degree) is major with a flat 7th — the sound of rock and blues. Hear the mood by playing each over a drone of its root note.',
          practice: [
            'Play D Dorian (all white notes from D to D) over a D drone.',
            'Play G Mixolydian (G to G, no sharps) over a G drone.',
            'Improvise over Am7–D7 using A Dorian.',
          ],
          tab: 'A Dorian (position 5)\ne|-5-7-8-----|\nB|-5-7-8-----|\nG|-4-5-7-----|\nD|-4-5-7-----|\nA|-5-7-------|\nE|-5-7-8-----|',
          durationMin: 18,
        },
      ],
    },
    {
      title: 'Fingerstyle Guitar',
      description: 'Play bass, chords and melody at the same time.',
      lessons: [
        {
          title: 'Travis Picking: A Beginner’s Guide',
          summary: 'An independent alternating thumb with melody notes on top.',
          content:
            'Travis picking is named after Merle Travis. The thumb alternates steadily between bass strings on every beat while the fingers pluck melody notes on the off-beats. The thumb must become automatic — practise it alone until you can talk while playing it.',
          practice: [
            'Hold a C chord and alternate the thumb between strings 5 and 4 for 2 minutes.',
            'Add the index finger on string 3 on the “and” of beat 2.',
            'Keep the thumb steady while adding one finger at a time.',
          ],
          tab: 'C chord - Travis pattern\ne|---------------------|\nB|-----1-------1-------|\nG|---------0-------0---|\nD|---2-------2-------2-|\nA|-3-------3-------3---|',
          videoId: 'XQiaCSabQaE',
          durationMin: 18,
        },
        {
          title: 'Travis Picking Step by Step',
          summary: 'Build the full pattern in stages and apply it to chord progressions.',
          content:
            'Layer the pattern in stages: thumb only, then index on the off-beat of 2, then middle on the off-beat of 3, then index on the off-beat of 4. Once solid, apply it to C–Am–G progressions. The picking hand pattern stays the same even when chords change.',
          practice: [
            'Work through the four stages at 60 BPM.',
            'Apply the pattern to C – Am7 – G.',
            'Increase speed only when the thumb stays perfectly even.',
          ],
          videoId: 'sWQ0uSlGNfg',
          durationMin: 20,
        },
        {
          title: 'Travis-Style Blues',
          summary: 'Apply fingerpicking to a complete blues piece.',
          content:
            'Combine the alternating bass with blues licks, hammer-ons and pull-offs in the melody. This is where fingerstyle stops being an exercise and becomes a solo guitar performance that sounds like two players at once.',
          practice: [
            'Learn the first bar of the lesson until it loops smoothly.',
            'Add one new bar per practice session.',
            'Play the complete piece slowly without stopping.',
          ],
          videoId: '5FSAWUgWeTw',
          durationMin: 22,
        },
      ],
    },
  ],
};
