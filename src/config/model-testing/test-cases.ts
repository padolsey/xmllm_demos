export interface TestCase {
  id: string
  name: string
  description: string
  schema: string
  hints: string
  prompt: string
  system?: string
  expectedStructure?: string
  validate?: (result: any) => true | string
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
      if (!result?.name) {
        return 'Missing required "name" field'
      }
      if (typeof result.name !== 'string') {
        return 'Field "name" must be a string'
      }
      if (result.name.length === 0) {
        return 'Field "name" cannot be empty'
      }
      return true
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
      $$text: String
    }]
  }
}`,
    hints: `{
      items: {
        item: [{
          $category: "A category like 'work', 'personal', or 'shopping'",
          $priority: "A number from 1-5 indicating importance",
          $$text: "E.g. 'Buy groceries' or 'Finish report'"
        }]
      }
    }`,
    prompt: 'List 3 tasks with their categories and priority levels (1-5)',
    validate: (result) => {
      if (!result?.items?.item) {
        return 'Missing required path: items.item'
      }
      if (!Array.isArray(result.items.item)) {
        return 'Field "items.item" must be an array'
      }
      if (result.items.item.length !== 3) {
        return `Expected exactly 3 items, got ${result.items.item.length}`
      }

      for (let i = 0; i < result.items.item.length; i++) {
        const item = result.items.item[i]
        if (typeof item.$category !== 'string') {
          return `Item ${i + 1}: $category must be a string`
        }
        if (typeof item.$priority !== 'number') {
          return `Item ${i + 1}: $priority must be a number`
        }
        if (typeof item.$$text !== 'string') {
          return `Item ${i + 1}: $text must be a string`
        }
        if (item.$priority < 1 || item.$priority > 5) {
          return `Item ${i + 1}: $priority must be between 1 and 5`
        }
      }
      return true
    }
  },
  {
    id: 'nested-analysis',
    name: 'Nested Content Analysis',
    description: 'Complex nested structure with multiple data types',
    schema: `{
  analysis: {
    sentiment: types.enum('sentiment', ['positive', 'negative', 'neutral', 'mixed']),
    topics: {
      topic: Array(String)
    },
    key_points: {
      point: Array({
        content: String,
        relevance: types.number('relevance between 0 and 1'),
        category: types.enum('category', ['main point', 'supporting detail', 'counterargument'])
      })
    },
    metadata: {
      confidence: types.number('confidence between 0 and 1'),
      word_count: types.number('word count')
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
      if (!analysis) {
        return 'Missing required "analysis" object'
      }

      if (!analysis.sentiment) {
        return 'Missing required field: analysis.sentiment'
      }
      if (!['positive', 'negative', 'neutral', 'mixed'].includes(analysis.sentiment)) {
        return 'Invalid sentiment value. Must be one of: positive, negative, neutral, mixed'
      }

      if (!analysis.topics?.topic) {
        return 'Missing required field: analysis.topics.topic'
      }
      if (!Array.isArray(analysis.topics.topic)) {
        return 'Field analysis.topics.topic must be an array'
      }

      if (!analysis.key_points?.point) {
        return 'Missing required field: analysis.key_points.point'
      }
      if (!Array.isArray(analysis.key_points.point)) {
        return 'Field analysis.key_points.point must be an array'
      }

      for (let i = 0; i < analysis.key_points.point.length; i++) {
        const point = analysis.key_points.point[i]
        if (!point) {
          return `Point ${i + 1}: Missing completely`
        }
        if (!point.content) {
          return `Point ${i + 1}: Missing required field 'content'`
        }
        if (typeof point.relevance !== 'number' || point.relevance < 0 || point.relevance > 1) {
          return `Point ${i + 1}: Field 'relevance' must be a number between 0 and 1. Current: ${point.relevance}`
        }
        if (!['main point', 'supporting detail', 'counterargument'].includes(point.category)) {
          return `Point ${i + 1}: Invalid category. Must be one of: main point, supporting detail, counterargument. Current category: ${point.category}`
        }
      }

      if (typeof analysis.metadata?.confidence !== 'number' || 
          analysis.metadata.confidence < 0 || 
          analysis.metadata.confidence > 1) {
        return 'Field analysis.metadata.confidence must be a number between 0 and 1'
      }

      return true
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
        $$text: String
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
            $$text: "Specific interest like 'Machine Learning' or 'Rock Climbing'"
          }]
        }
      }
    }`,
    prompt: 'Create a professional profile for a tech industry worker. Max possible levels for skills are 5.',
    system: 'Generate realistic profiles with consistent internal logic. Skills should be relevant to the occupation.',
    validate: (result) => {
      const profile = result?.profile
      if (!profile) {
        return 'Missing required "profile" object'
      }

      if (!profile.name) {
        return 'Missing required field: profile.name'
      }
      if (typeof profile.name !== 'string') {
        return 'Field profile.name must be a string'
      }

      if (typeof profile.age !== 'number') {
        return 'Field profile.age must be a number'
      }

      // Validate occupation
      if (!profile.occupation) {
        return 'Missing required field: profile.occupation'
      }
      if (!profile.occupation.title || typeof profile.occupation.title !== 'string') {
        return 'Field profile.occupation.title must be a string'
      }
      if (typeof profile.occupation.years_experience !== 'number') {
        return 'Field profile.occupation.years_experience must be a number'
      }

      // Validate skills
      if (!profile.occupation.skills?.skill || !Array.isArray(profile.occupation.skills.skill)) {
        return 'Field profile.occupation.skills.skill must be an array'
      }

      for (let i = 0; i < profile.occupation.skills.skill.length; i++) {
        const skill = profile.occupation.skills.skill[i]
        if (!skill.name || typeof skill.name !== 'string') {
          return `Skill ${i + 1}: name must be a string`
        }
        if (!skill.level?.$value || typeof skill.level.$value !== 'number') {
          return `Skill ${i + 1}: level.$value must be a number`
        }
        if (!skill.level?.$max || typeof skill.level.$max !== 'number') {
          return `Skill ${i + 1}: level.$max must be a number`
        }
        if (skill.level.$value > skill.level.$max) {
          return `Skill ${i + 1}: level.$value (${skill.level.$value}) cannot exceed $max (${skill.level.$max})`
        }
        if (skill.level.$max !== 5) {
          return `Skill ${i + 1}: level.$max must be 5`
        }
      }

      // Validate interests
      if (!profile.interests?.interest || !Array.isArray(profile.interests.interest)) {
        return 'Field profile.interests.interest must be an array'
      }

      for (let i = 0; i < profile.interests.interest.length; i++) {
        const interest = profile.interests.interest[i]
        if (!interest.$category || typeof interest.$category !== 'string') {
          return `Interest ${i + 1}: $category must be a string`
        }
        if (!interest.$$text || typeof interest.$$text !== 'string') {
          return `Interest ${i + 1}: $text must be a string`
        }
      }

      return true
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
      if (!result?.timeline?.event) {
        return 'Missing required path: timeline.event'
      }
      if (!Array.isArray(result.timeline.event)) {
        return 'Field timeline.event must be an array'
      }

      for (let i = 0; i < result.timeline.event.length; i++) {
        const event = result.timeline.event[i]

        if (!event.title || typeof event.title !== 'string') {
          return `Event ${i + 1}: title must be a string`
        }

        // Validate timestamp
        if (!event.timestamp?.$date) {
          return `Event ${i + 1}: Missing timestamp.$date`
        }
        if (!/^\d{4}-\d{2}-\d{2}$/.test(event.timestamp.$date)) {
          return `Event ${i + 1}: Invalid date format. Must be YYYY-MM-DD`
        }
        if (!event.timestamp?.$time) {
          return `Event ${i + 1}: Missing timestamp.$time`
        }
        if (!/^\d{2}:\d{2}$/.test(event.timestamp.$time)) {
          return `Event ${i + 1}: Invalid time format. Must be HH:MM`
        }

        if (!event.details || typeof event.details !== 'string') {
          return `Event ${i + 1}: details must be a string`
        }

        // Validate participants
        if (!event.participants?.participant || !Array.isArray(event.participants.participant)) {
          return `Event ${i + 1}: participants.participant must be an array`
        }
        for (let j = 0; j < event.participants.participant.length; j++) {
          if (typeof event.participants.participant[j] !== 'string') {
            return `Event ${i + 1}, Participant ${j + 1}: must be a string`
          }
        }

        // Validate impact
        if (typeof event.impact?.severity !== 'number' || event.impact.severity < 1 || event.impact.severity > 5) {
          return `Event ${i + 1}: impact.severity must be a number between 1 and 5`
        }

        if (!event.impact?.areas?.area || !Array.isArray(event.impact.areas.area)) {
          return `Event ${i + 1}: impact.areas.area must be an array`
        }
        for (let j = 0; j < event.impact.areas.area.length; j++) {
          if (typeof event.impact.areas.area[j] !== 'string') {
            return `Event ${i + 1}, Impact Area ${j + 1}: must be a string`
          }
        }
      }

      return true
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
      const items = result?.menu?.item
      if (!items) {
        return 'Missing required path: menu.item'
      }
      if (!Array.isArray(items)) {
        return 'Field menu.item must be an array'
      }
      if (items.length === 0) {
        return 'Menu must contain at least one item'
      }

      for (let i = 0; i < items.length; i++) {
        const item = items[i]
        if (typeof item.price !== 'number') {
          return `Category ${i + 1} (${item.name}): price must be a number`
        }

        const subcats = item.subcategories?.category
        if (!Array.isArray(subcats)) {
          return `Category ${i + 1} (${item.name}): subcategories.category must be an array`
        }
        if (subcats.length === 0) {
          return `Category ${i + 1} (${item.name}): must have at least one subcategory`
        }

        for (let j = 0; j < subcats.length; j++) {
          const subcat = subcats[j]

          const subitems = subcat?.items?.item
          if (!Array.isArray(subitems)) {
            return `Category ${i + 1}, Subcategory ${j + 1}: items.item must be an array`
          }

          for (let k = 0; k < subitems.length; k++) {
            const subitem = subitems[k]
            if (typeof subitem?.price !== 'number') {
              return `Category ${i + 1}, Subcategory ${j + 1}, Item ${k + 1}: price must be a number`
            }
            if (subitem?.price < item.price) {
              return `Category ${i + 1}, Subcategory ${j + 1}, Item ${k + 1}: price (${subitem?.price}) must be >= category base price (${item.price})`
            }
          }
        }
      }
      return true
    }
  },
  {
    id: 'conditional-fields',
    name: 'Conditional Field Requirements',
    description: 'Generate data where certain fields are required based on other field values',
    schema: `{
      transactions: {
        transaction: Array({
          type: types.enum('type', ['payment', 'refund', 'void']),
          amount: types.number('transaction amount'),
          status: types.enum('status', ['success', 'failed', 'pending']),
          error_code: types.string('error code'),
          error_description: types.string('error description'),
          success_timestamp: types.string('success timestamp ISO format (YYYY-MM-DDTHH:mm:ss)'),
          refund_reason: types.string('refund reason'),
          refund_amount: types.number('refund amount')
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
      const transactions = result?.transactions?.transaction
      if (!transactions) {
        return 'Missing required path: transactions.transaction'
      }
      if (!Array.isArray(transactions)) {
        return 'Field transactions.transaction must be an array'
      }
      if (transactions.length < 2) {
        return 'Must have at least 2 transactions'
      }

      for (let i = 0; i < transactions.length; i++) {
        const t = transactions[i]
        
        // Validate type
        if (!['payment', 'refund', 'void'].includes(t.type)) {
          return `Transaction ${i + 1}: Invalid type. Must be one of: payment, refund, void`
        }

        // Validate amount
        if (typeof t.amount !== 'number') {
          return `Transaction ${i + 1}: amount must be a number`
        }

        // Validate status
        if (!['success', 'failed', 'pending'].includes(t.status)) {
          return `Transaction ${i + 1}: Invalid status (${t.status}). Must be one of: success, failed, pending`
        }

        // Validate failed status requirements
        if (t.status === 'failed') {
          if (!t.error_code) {
            return `Transaction ${i + 1}: error_code is required when status is 'failed'`
          }
          if (!t.error_description) {
            return `Transaction ${i + 1}: error_description is required when status is 'failed'`
          }
        }

        // Validate success status requirements
        if (t.status === 'success') {
          if (!t.success_timestamp) {
            return `Transaction ${i + 1}: success_timestamp is required when status is 'success'`
          }
          // Dont require seconds. its a bit harsh
          if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/.test(t.success_timestamp)) {
            return `Transaction ${i + 1}: Invalid success_timestamp format. Must be ISO format (YYYY-MM-DDTHH:mm:ss...)`
          }
        }

        // Validate refund type requirements
        if (t.type === 'refund') {
          if (!t.refund_reason) {
            return `Transaction ${i + 1}: refund_reason is required for refund transactions`
          }
          if (typeof t.refund_amount !== 'number') {
            return `Transaction ${i + 1}: refund_amount must be a number for refund transactions`
          }
          if (t.refund_amount > t.amount) {
            return `Transaction ${i + 1}: refund_amount (${t.refund_amount}) cannot exceed original amount (${t.amount})`
          }
        }
      }
      return true
    }
  },
  {
    id: 'blog-posts',
    name: 'Blog Post Generation',
    description: 'Generate three short blog posts about apples with different tones (professional, casual, humorous)',
    schema: `{
      posts: {
        post: Array({
          title: String,
          tone: types.enum('tone', ['professional', 'casual', 'humorous']),
          content: types.string('blog post content'),
          metadata: {
            word_count: types.number('word count'),
            reading_time: types.number('estimated reading time in minutes'),
            keywords: {
              keyword: Array(String)
            }
          }
        })
      }
    }`,
    hints: `{
      posts: {
        post: [{
          title: "An engaging title related to apples",
          tone: "One of: 'professional', 'casual', 'humorous'",
          content: "A 100-200 word blog post about apples",
          metadata: {
            word_count: "Number of words in the content",
            reading_time: "Estimated reading time in minutes (assume 200 words per minute)",
            keywords: {
              keyword: ["3-5 relevant keywords for the post"]
            }
          }
        }]
      }
    }`,
    prompt: 'Write three distinct blog posts about apples. Each post should have a different tone: one professional, one casual, and one humorous. Keep each post between 100-200 words.',
    validate: (result) => {
      const posts = result?.posts?.post
      if (!posts) {
        return 'Missing required path: posts.post'
      }
      if (!Array.isArray(posts)) {
        return 'Field posts.post must be an array'
      }
      if (posts.length !== 3) {
        return `Expected exactly 3 posts, got ${posts.length}`
      }

      // Track used tones to ensure we have one of each
      const usedTones = new Set()

      for (let i = 0; i < posts.length; i++) {
        const post = posts[i]
        
        // Check title
        if (!post.title?.trim()) {
          return `Post ${i + 1}: Missing or empty title`
        }

        // Check tone
        if (!['professional', 'casual', 'humorous'].includes(post.tone)) {
          return `Post ${i + 1}: Invalid tone. Must be one of: professional, casual, humorous`
        }
        if (usedTones.has(post.tone)) {
          return `Post ${i + 1}: Duplicate tone '${post.tone}'. Each post must have a different tone`
        }
        usedTones.add(post.tone)

        // Check content
        if (!post.content?.trim()) {
          return `Post ${i + 1}: Missing or empty content`
        }
        const wordCount = post.content.split(/\s+/).length
        if (wordCount < 30 || wordCount > 500) {
          return `Post ${i + 1}: Content should be between 50-250 words (roughly!!!), got ${wordCount} words`
        }

        // Check metadata
        if (!post.metadata) {
          return `Post ${i + 1}: Missing metadata`
        }
        if (typeof post.metadata.word_count !== 'number') {
          return `Post ${i + 1}: metadata.word_count must be a number`
        }
        if (typeof post.metadata.reading_time !== 'number') {
          return `Post ${i + 1}: metadata.reading_time must be a number`
        }
        if (!Array.isArray(post.metadata.keywords?.keyword)) {
          return `Post ${i + 1}: metadata.keywords.keyword must be an array`
        }
        if (post.metadata.keywords.keyword.length < 2 || post.metadata.keywords.keyword.length > 7) {
          return `Post ${i + 1}: Must have 3-5 keywords ROUGHLy!, got ${post.metadata.keywords.keyword.length}`
        }
      }

      return true
    }
  },
  {
    id: 'array-operations',
    name: 'Array Operations',
    description: 'Test array-level transformations and validation with types.items()',
    schema: `{
    numbers: types.items(
      types.number("A number between 1-10")
        .withTransform(n => {
          // Validation + transformation
          if (typeof n !== 'number' || isNaN(n)) return null;
          return Math.min(10, Math.max(1, n));
        })
    )
    .withTransform(arr => {
      // Array-level validation + transformation
      if (!Array.isArray(arr) || arr.length < 3 || arr.length > 5) return null;
      return arr.filter(n => n !== null).sort((a, b) => a - b);
    }),
    
    tags: types.items(
      types.string("A tag name")
        .withTransform(s => {
          if (typeof s !== 'string') return null;
          return s.toLowerCase().trim();
        })
    )
    .withDefault(['general'])
    .withTransform(arr => {
      if (!Array.isArray(arr)) return ['general'];
      return [...new Set(arr.filter(t => t !== null))];
    })
  }`,
    hints: `{
    numbers: "3-5 numbers that will be sorted ascending",
    tags: "1-3 unique category tags in lowercase"
  }`,
    prompt: 'Generate a list of 4 numbers between 1-10 and 2 tags for categorization.',
    validate: (result) => {
      if (!result?.numbers || !Array.isArray(result.numbers)) {
        return 'Missing or invalid numbers array'
      }
      if (result.numbers.length < 3 || result.numbers.length > 5) {
        return 'Numbers array must have 3-5 elements'
      }
      if (!result.numbers.every((n: number) => n >= 1 && n <= 10)) {
        return 'All numbers must be between 1 and 10'
      }
      // Check if array is sorted
      if (!result.numbers.every((n: number, i: number) => i === 0 || n >= result.numbers[i - 1])) {
        return 'Numbers array must be sorted'
      }
      
      if (!result?.tags || !Array.isArray(result.tags)) {
        return 'Missing or invalid tags array'
      }
      if (result.tags.length === 0) {
        return 'Tags array cannot be empty (should have default)'
      }
      if (!result.tags.every((t: string) => typeof t === 'string' && t === t.toLowerCase())) {
        return 'All tags must be lowercase strings'
      }
      // Check for duplicates
      if (new Set(result.tags).size !== result.tags.length) {
        return 'Tags must be unique'
      }
      return true
    }
  },
  {
    id: 'nested-items',
    name: 'Nested Items Structure',
    description: 'Test deeply nested types.items() with complex transformations',
    schema: `{
      organization: {
        departments: types.items({
          name: types.string("Department name"),
          budget: types.number("Budget in USD")
            .withTransform(n => {
              if (typeof n !== 'number' || isNaN(n)) return null;
              return Math.round(n);
            }),
          teams: types.items({
            name: types.string("Team name"),
            members: types.items({
              name: types.string("Member name"),
              role: types.enum("Role", ["LEAD", "SENIOR", "JUNIOR"]),
              skills: types.items(
                types.string("Skill name")
                  .withTransform(s => {
                    if (typeof s !== 'string') return null;
                    return s.toLowerCase();
                  })
              )
            })
            .withTransform(arr => {
              // Limit to 3 members
              if (!Array.isArray(arr)) return [];
              return arr.slice(0, 3);
            })
          })
        })
      }
    }`,
    hints: `{
      organization: {
        departments: [{
          name: "Department name like 'Engineering' or 'Marketing'",
          budget: "Annual budget in USD",
          teams: [{
            name: "Team name like 'Frontend' or 'Growth'",
            members: [{
              name: "Full name of team member",
              role: "One of: LEAD, SENIOR, or JUNIOR",
              skills: ["Relevant technical or soft skills"]
            }]
          }]
        }]
      }
    }`,
    prompt: 'Create an organization structure with 2 departments, each with 1-2 teams and 2-3 team members.',
    validate: (result) => {
      // Add validation logic here
      return true
    }
  },
  {
    id: 'cdata-content',
    name: 'CDATA Content Handling',
    description: 'Test raw type with CDATA content preservation',
    schema: `{
      document: {
        metadata: {
          format: types.enum("Format", ["HTML", "MARKDOWN", "CODE"]),
          language: types.string("Programming language if format is CODE")
            .withTransform(s => {
              return typeof s === 'string' ? s : null;
            })
        },
        content: types.raw("Content in specified format")
          .withTransform(content => {
            if (!content || typeof content !== 'string') return null;
            return content.trim();
          })
      }
    }`,
    hints: `{
      document: {
        metadata: {
          format: "Content format type",
          language: "Required if format is CODE"
        },
        content: "Content in the specified format, will be preserved exactly as written"
      }
    }`,
    prompt: 'Generate a code snippet showing a simple React component with TypeScript props interface.',
    validate: (result) => {
      console.log('CDATA RESULT', result, {
        missingFormat: !result?.document?.metadata?.format,
        missingContent: !result?.document?.content,
        missingLanguage: result.document.metadata.format === 'CODE' && !result.document.metadata.language
      })
      if (!result?.document?.metadata?.format) {
        return 'Missing format specification'
      }
      if (!result?.document?.content) {
        return 'Missing content'
      }
      if (result.document.metadata.format === 'CODE' && !result.document.metadata.language) {
        return 'Missing language specification for CODE format'
      }
      return true
    }
  }
] 