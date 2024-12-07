export const colorThemeSchema = {
  themes: {
    theme: [{
      name: String,
      description: String,
      colors: {
        primary: {
          hex: String,
          name: String
        },
        complementary: [{
          hex: String,
          name: String
        }]
      },
      mood: {
        description: String,
        keywords: [String]
      },
      usage: {
        suggestion: [String]
      },
      timeContext: {
        season: String,
        timeOfDay: String
      },
      texture: {
        pattern: String,
        description: String
      }
    }]
  }
} 