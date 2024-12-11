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
    id: 'simple-name',
    name: 'Simple Name Generation',
    description: 'Generate a single dog name - testing basic string output',
    schema: `{
  name: String
}`,
    hints: `{
  name: "A creative dog name like 'Luna' or 'Ziggy'"
}`,
    prompt: 'Generate a unique name for a dog',
    validate: (result) => {
      return typeof result?.name === 'string' && result.name.length > 0
    }
  },
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
               s?.level?.$value <= s?.level?.$max
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
    prompt: 'Create a timeline of significant events in a fictional corporate merger. Severity should be between 1 and 5. Date in form of YYYY-MM-DD and time in form of HH:MM.',
    system: 'You are a business analyst documenting key events. Ensure events are logically connected and timestamps are properly formatted.',
    validate: (result) => {
      const events = result?.timeline?.event
      console.log('Validating events', events)
      return Array.isArray(events) &&
             events.every((e: any) => {
               console.log('Validating event', e, {
                timestamp: e?.timestamp,
                participants: e?.participants,
                impact: e?.impact
               })
               return e?.timestamp?.$date.match(/^\d{4}-\d{2}-\d{2}$/) &&
                      e?.timestamp?.$time.match(/^\d{2}:\d{2}$/) &&
                      Array.isArray(e?.participants?.participant) &&
                      typeof e?.impact?.severity === 'number' && !isNaN(e?.impact?.severity)
             })
    }
  },
  {
    id: 'recursive-menu',
    name: 'Recursive Menu Structure',
    description: 'Generate a nested menu structure with recursive items - tests handling of self-referential schemas and price hierarchy (items in subcategories must cost at least as much as their parent category base price)',
    schema: `{
      menu: {
        item: Array({
          name: String,
          price: Number,
          subcategories: {
            category: Array({
              name: String,
              items: {
                item: Array({
                  name: String,
                  price: Number
                })
              }
            })
          }
        })
      }
    }`,
    hints: `{
      menu: {
        item: [{
          name: "A main category item like 'Pizza' or 'Pasta'",
          price: "Minimum/base price for this category - all items in subcategories must cost at least this much",
          subcategories: {
            category: [{
              name: "A subcategory like 'Vegetarian' or 'Seafood'",
              items: {
                item: [{
                  name: "Specific item name like 'Margherita' or 'Marinara'",
                  price: "Must be greater than or equal to the parent category's base price"
                }]
              }
            }]
          }
        }]
      }
    }`,
    prompt: 'Create a restaurant menu structure with main categories and their minimum prices, followed by subcategories containing specific items that must cost at least as much as their parent category base price.',
    validate: (result) => {
      const items = result?.menu?.item || [];

      return items.length > 0 && items.every((item: any) => 
        typeof item.price === 'number' &&
        item.subcategories?.category.length > 0 &&
        item.subcategories?.category?.every((cat: any) =>
          cat.items?.item?.every((subItem: any) => 
            typeof subItem.price === 'number' &&
            subItem.price >= item.price
          )
        )
      )
    }
  },
  {
    id: 'conditional-fields',
    name: 'Conditional Field Requirements',
    description: 'Generate data where certain fields are required based on other field values',
    schema: `{
      transactions: {
        transaction: Array({
          type: String,
          amount: Number,
          status: String,
          error_code: String,
          error_description: String,
          success_timestamp: String,
          refund_reason: String,
          refund_amount: Number
        })
      }
    }`,
    hints: `{
      transactions: {
        transaction: [{
          type: "One of: 'payment', 'refund', or 'void'",
          amount: "Transaction amount, e.g. 99.99",
          status: "One of: 'success', 'failed', 'pending'",
          error_code: "Required if status is 'failed', e.g. 'INSUFFICIENT_FUNDS'",
          error_description: "Required if status is 'failed'",
          success_timestamp: "Required if status is 'success', ISO format",
          refund_reason: "Required if type is 'refund'",
          refund_amount: "Required if type is 'refund', must be <= original amount"
        }]
      }
    }`,
    prompt: 'Generate a list of 5 financial transactions with different types and statuses.',
    validate: (result) => {
      const transactions = result?.transactions?.transaction || [];
      return transactions.length > 1 && transactions.every((t: any) => {
        if (t.status === 'failed') {
          return t.error_code && t.error_description
        }
        if (t.status === 'success') {
          return t.success_timestamp && 
                 /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(t.success_timestamp)
        }
        if (t.type === 'refund') {
          return t.refund_reason && 
                 typeof t.refund_amount === 'number' && 
                 t.refund_amount <= t.amount
        }
        return true
      })
    }
  }
] 