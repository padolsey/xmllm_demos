export interface TestCase {
  id: string
  name: string
  description: string
  schema: string
  hints: string
  prompt: string
  system?: string
  expectedStructure?: string
  validate?: (result: any) => boolean
}

export const TEST_CASES: TestCase[] = [
  {
    id: 'simple-list',
    name: 'Simple List Generation',
    description: 'Generate a basic list of items with attributes',
    schema: `{
  items: {
    item: [{
      $category: String,
      $priority: Number,
      $text: String
    }]
  }
}`,
    hints: `{
      items: {
        item: [{
          $category: "A category like 'work', 'personal', or 'shopping'",
          $priority: "A number from 1-5 indicating importance",
          $text: "E.g. 'Buy groceries' or 'Finish report'"
        }]
      }
    }`,
    prompt: 'List 3 tasks with their categories and priority levels (1-5)',
    validate: (result) => {
      return result?.items?.item?.length === 3 &&
             result.items.item.every((i: any) => 
               typeof i.$category === 'string' &&
               typeof i.$priority === 'number' &&
               typeof i.$text === 'string'
             )
    }
  },
  {
    id: 'nested-analysis',
    name: 'Nested Content Analysis',
    description: 'Complex nested structure with multiple data types',
    schema: `{
  analysis: {
    sentiment: String,
    topics: {
      topic: Array(String)
    },
    key_points: {
      point: Array({
        content: String,
        relevance: Number,
        category: String
      })
    },
    metadata: {
      confidence: Number,
      word_count: Number
    }
  }
}`,
    hints: `{
      analysis: {
        sentiment: "One of: 'positive', 'negative', 'neutral', or 'mixed'",
        topics: {
          topic: ["Each topic should be a single word or short phrase, e.g. 'AI regulation', 'safety'"]
        },
        key_points: {
          point: [{
            content: "A clear statement like 'New regulations focus on safety'",
            relevance: "A score from 0-1, e.g. 0.8",
            category: "One of: 'main point', 'supporting detail', or 'counterargument'"
          }]
        },
        metadata: {
          confidence: "A score from 0-1, e.g. 0.95",
          word_count: "Total number of words in analyzed text, e.g. 25"
        }
      }
    }`,
    prompt: 'Analyze this text: "The new AI regulations focus on safety and innovation, striking a balance between progress and protection. Critics argue it may slow development."',
    system: 'You are an expert content analyzer. Extract key points, sentiment, and topics from the given text.',
    validate: (result) => {
      const analysis = result?.analysis
      return analysis?.sentiment &&
             Array.isArray(analysis?.topics?.topic) &&
             Array.isArray(analysis?.key_points?.point) &&
             typeof analysis?.metadata?.confidence === 'number'
    }
  },
  {
    id: 'structured-profile',
    name: 'Structured Profile Generation',
    description: 'Generate detailed profile with specific constraints',
    schema: `{
  profile: {
    name: String,
    age: Number,
    occupation: {
      title: String,
      years_experience: Number,
      skills: {
        skill: Array({
          name: String,
          level: {
            $value: Number,
            $max: Number
          }
        })
      }
    },
    interests: {
      interest: Array({
        $category: String,
        $text: String
      })
    }
  }
}`,
    hints: `{
      profile: {
        name: "A full name like 'Sarah Johnson'",
        age: "Age in years, e.g. 32",
        occupation: {
          title: "Job title like 'Senior Software Engineer'",
          years_experience: "Years of experience, e.g. 8",
          skills: {
            skill: [{
              name: "Skill name like 'Python' or 'Project Management'",
              level: {
                $value: "Current skill level, e.g. 4",
                $max: "Maximum possible level, always 5"
              }
            }]
          }
        },
        interests: {
          interest: [{
            $category: "Category like 'Technology', 'Sports', 'Arts'",
            $text: "Specific interest like 'Machine Learning' or 'Rock Climbing'"
          }]
        }
      }
    }`,
    prompt: 'Create a professional profile for a tech industry worker.',
    system: 'Generate realistic profiles with consistent internal logic. Skills should be relevant to the occupation.',
    validate: (result) => {
      const profile = result?.profile
      return profile?.name &&
             typeof profile?.age === 'number' &&
             profile?.occupation?.skills?.skill?.every((s: any) => 
               s.level.$value <= s.level.$max
             )
    }
  },
  {
    id: 'event-timeline',
    name: 'Event Timeline',
    description: 'Generate a sequence of events with temporal relationships',
    schema: `{
  timeline: {
    event: Array({
      title: String,
      timestamp: {
        $date: String,
        $time: String
      },
      details: String,
      participants: {
        participant: Array(String)
      },
      impact: {
        severity: Number,
        areas: {
          area: Array(String)
        }
      }
    })
  }
}`,
    hints: `{
      timeline: {
        event: [{
          title: "Brief event title like 'Initial Merger Announcement'",
          timestamp: {
            $date: "Date in YYYY-MM-DD format, e.g. '2024-03-15'",
            $time: "Time in HH:MM format, e.g. '09:30'"
          },
          details: "Detailed description of the event",
          participants: {
            participant: ["Names of people involved, e.g. 'John Smith, CEO'"]
          },
          impact: {
            severity: "Impact level from 1-5, e.g. 4",
            areas: {
              area: ["Affected areas like 'Finance', 'Operations', 'HR'"]
            }
          }
        }]
      }
    }`,
    prompt: 'Create a timeline of significant events in a fictional corporate merger.',
    system: 'You are a business analyst documenting key events. Ensure events are logically connected and timestamps are properly formatted.',
    validate: (result) => {
      const events = result?.timeline?.event
      return Array.isArray(events) &&
             events.every((e: any) => 
               e.timestamp.$date.match(/^\d{4}-\d{2}-\d{2}$/) &&
               e.timestamp.$time.match(/^\d{2}:\d{2}$/) &&
               Array.isArray(e.participants.participant) &&
               typeof e.impact.severity === 'number'
             )
    }
  }
] 