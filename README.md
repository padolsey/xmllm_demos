# XMLLM Demos

Interactive demos showcasing [XMLLM](https://github.com/padolsey/xmllm)'s streaming capabilities.

## Setup

1. Create a `.env` file with your API keys:

<pre>
OPENAI_API_KEY=your_key_here
TOGETHER_AI_API_KEY=your_key_here
ANTHROPIC_API_KEY=your_key_here
ANYSCALE_API_KEY=your_key_here
PERPLEXITY_API_KEY=your_key_here
</pre>

2. Start the XMLLM proxy (must use port 3124 as it's hardcoded in demos):

<pre>
npx xmllm-proxy --port=3124 --corsOrigins="http://localhost:3002"
</pre>

3. Install dependencies and run the dev server:

<pre>
npm install
npm run dev
</pre>

The demos should now be accessible at `http://localhost:3000`. (Or whatever nextjs assigns; adapt proxy corsOrigins if necessary.)

> **Note:** All demos are configured to connect to the XMLLM proxy at `http://localhost:3124`. If you need to use a different port, you'll need to modify the `ClientProvider` initialization in each demo file.

## What's Inside

- Streaming mode comparisons
- Fluid UI updates
- Interactive scenarios
- Schema validation examples

## License

MIT
