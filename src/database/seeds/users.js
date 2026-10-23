/**
 * Demo accounts for local development only.
 * `completedLessons` marks the first N lessons of the path as done, spread over recent days.
 */
module.exports = [
  {
    name: 'Admin FireGuitar',
    email: 'admin@fireguitar.com',
    password: 'Admin1234',
    role: 'admin',
    completedLessons: 0,
    goals: [],
  },
  {
    name: 'Alex Student',
    email: 'student@fireguitar.com',
    password: 'Student1234',
    role: 'student',
    completedLessons: 11,
    goals: [
      { title: 'Complete 5 lessons this week', type: 'lessons', target: 5, period: 'weekly' },
      { title: 'Practise 60 minutes this week', type: 'minutes', target: 60, period: 'weekly' },
      { title: 'Play my first complete song', type: 'custom', target: 1, period: 'all_time' },
    ],
  },
];
