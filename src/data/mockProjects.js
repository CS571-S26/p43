export const initialProjects = [
  {
    id: 'studyhub',
    name: 'StudyHub',
    category: 'Education',
    summary: 'A simple student workspace for notes, assignments, and reminders.',
    owner: 'Campus Team',
    tickets: [
      {
        id: 1,
        title: 'Dark mode for study sessions',
        description: 'A softer theme would help during late-night work.',
        votes: 18,
        userVote: 0,
      },
      {
        id: 2,
        title: 'Calendar sync',
        description: 'Connect assignments with Google Calendar or Apple Calendar.',
        votes: 12,
        userVote: 0,
      },
      {
        id: 3,
        title: 'Weekly progress summary',
        description: 'Show a simple overview of completed tasks each week.',
        votes: 9,
        userVote: 0,
      },
    ],
    implementedIdeas: [
      {
        id: 101,
        title: 'Assignment due date reminders',
        description: 'Students now receive simple reminder alerts before deadlines.',
      },
      {
        id: 102,
        title: 'Pinned course notes',
        description: 'Important notes can now stay pinned at the top of a course page.',
      },
    ],
  },
  {
    id: 'greencart',
    name: 'GreenCart',
    category: 'E-commerce',
    summary: 'An online grocery shopping app focused on fast, eco-friendly orders.',
    owner: 'Marketplace Team',
    tickets: [
      {
        id: 1,
        title: 'Order again button',
        description: 'Let customers quickly reorder their recent basket.',
        votes: 21,
        userVote: 0,
      },
      {
        id: 2,
        title: 'Delivery time comparison',
        description: 'Compare the fastest and cheapest delivery windows.',
        votes: 14,
        userVote: 0,
      },
      {
        id: 3,
        title: 'Saved dietary preferences',
        description: 'Remember gluten-free, vegan, or allergy filters.',
        votes: 11,
        userVote: 0,
      },
    ],
    implementedIdeas: [
      {
        id: 101,
        title: 'Reusable bag preference',
        description: 'Customers can now save a reusable bag option during checkout.',
      },
      {
        id: 102,
        title: 'Favorite items list',
        description: 'Shoppers can save common grocery items for quicker browsing.',
      },
    ],
  },
  {
    id: 'fittrack',
    name: 'FitTrack',
    category: 'Health',
    summary: 'A personal fitness tracker for workouts, goals, and daily habits.',
    owner: 'Wellness Lab',
    tickets: [
      {
        id: 1,
        title: 'Stretching routine builder',
        description: 'Allow users to combine warm-up and cool-down exercises.',
        votes: 16,
        userVote: 0,
      },
      {
        id: 2,
        title: 'Water intake reminders',
        description: 'Add friendly reminders to stay hydrated throughout the day.',
        votes: 10,
        userVote: 0,
      },
      {
        id: 3,
        title: 'Progress photo gallery',
        description: 'Save progress images privately in the profile section.',
        votes: 8,
        userVote: 0,
      },
    ],
    implementedIdeas: [
      {
        id: 101,
        title: 'Daily step goal tracker',
        description: 'Users can now set and monitor a personal daily step target.',
      },
      {
        id: 102,
        title: 'Workout streak counter',
        description: 'The app now highlights consecutive active days for motivation.',
      },
    ],
  },
]