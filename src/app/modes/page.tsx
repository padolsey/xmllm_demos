'use client'

import { useState, useRef, useEffect } from 'react'
import { stream } from '@/utils/xmllm'

// Simulated chunks that will be fed to all streams
const SIMULATED_CHUNKS = [
  '<title>The M',
  'agic Que',
  'st</title>',
  '<character>A brave ',
  'wizard named ',
  'Merlin</character>',
  '<character>A mysteri',
  'ous dragon called ',
  'Fafnir</character>',
  '<event>They meet at ',
  'the ancient ',
  'tower</event>',
  '<event>Together they ',
  'solve the ',
  'riddle</event>'
];

// Create a mock stream provider
const mockStreamProvider = {
  createStream: async () => {
    return new ReadableStream({
      async start(controller) {
        for (const chunk of SIMULATED_CHUNKS) {
          controller.enqueue(new TextEncoder().encode(chunk));
          // Add a small delay to make it visible
          await new Promise(resolve => setTimeout(resolve, 500));
        }
        controller.close();
      }
    });
  }
};

// Modify schema to use separate root elements
const schema = {
  title: [String],      // Each is its own root element
  character: [String],  // This means they'll be processed independently
  event: [String]
};

// Update prompt to match new schema
const prompt = `
Tell a story piece by piece. Format each piece separately:
<title>First introduce the title...</title>
<character>Then introduce a character...</character>
<character>Then another character...</character>
<event>Then something happens...</event>
<event>Then something else happens...</event>
`;

const TIME_SLICE = 100;  // 100ms per slice
const OCCUPIED_SLICE_HEIGHT = 240; // Height when slice has content
const EMPTY_SLICE_HEIGHT = 20;    // Minimal height for empty slices

interface TimedUpdate {
  data: any
  timestamp: number
}

interface StreamTiming {
  startTime: number
  endTime: number
}

// Add this interface to track occupied time slices
interface TimeSliceMap {
  [timeIndex: number]: boolean  // true if any mode has content at this time
}

// Add this prop to TimeSlicedUpdates
interface TimeSlicedUpdatesProps {
  updates: TimedUpdate[]
  startTimeRef: React.RefObject<number>
  timing: StreamTiming
  occupiedSlices: TimeSliceMap  // New prop
}

function TimeSlicedUpdates({ updates, startTimeRef, timing, occupiedSlices }: TimeSlicedUpdatesProps) {
  if (updates.length === 0) return null;

  const endTime = timing?.endTime || Date.now();
  const startTime = timing?.startTime || startTimeRef.current || 0
  
  const totalSlices = Math.ceil((endTime - startTime) / TIME_SLICE);
  const slices = Array(totalSlices).fill(null);

  updates.forEach(update => {
    const sliceIndex = Math.floor((update.timestamp - startTime) / TIME_SLICE);
    slices[sliceIndex] = update;
  });

  return (
    <>
      {slices.map((slice, i) => (
        <div 
          key={i} 
          className={`
            relative border-b border-border/20
            ${occupiedSlices[i] 
              ? 'bg-emerald-50/30 dark:bg-emerald-900/10' // Subtle green for occupied
              : 'bg-amber-50/20 dark:bg-amber-900/5'      // Very subtle amber for empty
            }
          `}
          style={{ 
            height: occupiedSlices[i] ? `${OCCUPIED_SLICE_HEIGHT}px` : `${EMPTY_SLICE_HEIGHT}px`,
            transition: 'height 0.2s, background-color 0.2s'  // Smooth transitions
          }}
        >
          {/* Time marker - always visible but smaller in empty slices */}
          <div className={`
            absolute top-0 right-0 text-muted-foreground/30 text-xs px-1
            ${!slice && 'py-0.5'}  // Less padding for empty slices
          `}>
            {((i * TIME_SLICE) / 1000).toFixed(1)}s
          </div>

          {slice && (
            <div className="absolute inset-0 flex flex-col">
              <div className="sticky top-0 bg-background/80 backdrop-blur-sm p-1 z-10">
                <div className="text-muted-foreground text-xs flex justify-between">
                  <span>Update {updates.indexOf(slice) + 1}</span>
                  <span>{((slice.timestamp - startTime) / 1000).toFixed(1)}s</span>
                </div>
              </div>
              <div className="flex-1 overflow-auto p-2">
                <pre className="whitespace-pre-wrap break-all">
                  {JSON.stringify(slice.data, null, 2)}
                </pre>
              </div>
            </div>
          )}
        </div>
      ))}
    </>
  );
}

export default function ModesDemo() {
  const [isStreaming, setIsStreaming] = useState(false)
  const [outputs, setOutputs] = useState<{
    state_open: TimedUpdate[]
    state_closed: TimedUpdate[]
    root_open: TimedUpdate[]
    root_closed: TimedUpdate[]
  }>({
    state_open: [],
    state_closed: [],
    root_open: [],
    root_closed: []
  })

  const startTimeRef = useRef<number>(0)
  const [timing, setTiming] = useState<StreamTiming | null>(null)

  // Add refs for each output container
  const outputRefs = {
    state_open: useRef<HTMLDivElement>(null),
    state_closed: useRef<HTMLDivElement>(null),
    root_open: useRef<HTMLDivElement>(null),
    root_closed: useRef<HTMLDivElement>(null)
  }

  // Add scroll sync handler
  const handleScroll = (scrolledMode: keyof typeof outputRefs) => {
    const scrolledElement = outputRefs[scrolledMode].current
    if (!scrolledElement) return

    const { scrollTop } = scrolledElement
    
    // Sync all other containers to this scroll position
    Object.entries(outputRefs).forEach(([mode, ref]) => {
      if (mode !== scrolledMode && ref.current) {
        ref.current.scrollTop = scrollTop
      }
    })
  }

  async function startStreaming() {
    if (isStreaming) return
    setIsStreaming(true)
    setOutputs({
      state_open: [],
      state_closed: [],
      root_open: [],
      root_closed: []
    })
    
    const startTime = Date.now()
    startTimeRef.current = startTime
    
    // Create streams for each mode using mock provider
    const modes = [
      'state_open',
      'state_closed',
      'root_open',
      'root_closed'
    ] as const;

    const streams = modes.map(mode => 
      stream(prompt, {
        schema,
        clientProvider: mockStreamProvider,
        mode
      })
    );

    try {
      await Promise.all(streams.map(async (s, i) => {
        const mode = modes[i]
        for await (const update of s) {
          setOutputs(prev => ({
            ...prev,
            [mode]: [...prev[mode], {
              data: update,
              timestamp: Date.now()
            }]
          }))
        }
      }))
    } catch (error) {
      console.error('Streaming error:', error)
    } finally {
      setTiming({
        startTime,
        endTime: Date.now()
      })
      setIsStreaming(false)
    }
  }

  // Helper to format elapsed time
  const formatElapsed = (timestamp: number) => {
    const elapsed = (timestamp - startTimeRef.current) / 1000
    return `${elapsed.toFixed(1)}s`
  }

  // Calculate occupied slices based on all modes
  const calculateOccupiedSlices = () => {
    const occupiedSlices: TimeSliceMap = {};
    
    if (!timing) return occupiedSlices;

    const totalSlices = Math.ceil((timing.endTime - timing.startTime) / TIME_SLICE);
    
    // Check each time slice across all modes
    for (let i = 0; i < totalSlices; i++) {
      occupiedSlices[i] = Object.values(outputs).some(modeUpdates => 
        modeUpdates.some(update => {
          const sliceIndex = Math.floor((update.timestamp - timing.startTime) / TIME_SLICE);
          return sliceIndex === i;
        })
      );
    }

    return occupiedSlices;
  };

  // Pass occupiedSlices to each TimeSlicedUpdates
  const occupiedSlices = calculateOccupiedSlices();

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-[1800px] mx-auto space-y-8">
        {/* Header */}
        <header className="text-center space-y-4">
          <h1 className="text-3xl font-bold">XMLLM Streaming Modes</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            See how different streaming modes handle the same XML stream differently.
            Each mode provides a different way of viewing updates as they arrive.
          </p>
          
          <button
            onClick={startStreaming}
            disabled={isStreaming}
            className="px-6 py-2 bg-primary text-primary-foreground rounded-lg
                     disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isStreaming ? 'Streaming...' : 'Start Stream'}
          </button>
        </header>

        {/* Modified Mode Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          {/* State Open Mode */}
          <div className="space-y-2">
            <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <h2 className="font-bold">State (Open)</h2>
              <p className="text-sm text-muted-foreground">
                Shows growing state including partial elements
              </p>
            </div>
            <div 
              ref={outputRefs.state_open}
              onScroll={() => handleScroll('state_open')}
              className="h-[600px] overflow-auto border border-border rounded-lg p-4 font-mono text-sm"
            >
              <TimeSlicedUpdates 
                updates={outputs.state_open} 
                startTimeRef={startTimeRef}
                timing={timing || { startTime: 0, endTime: 0 }}
                occupiedSlices={occupiedSlices}
              />
            </div>
          </div>

          {/* State Closed Mode */}
          <div className="space-y-2">
            <div className="p-3 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg">
              <h2 className="font-bold">State (Closed)</h2>
              <p className="text-sm text-muted-foreground">
                Shows complete state at each update
              </p>
            </div>
            <div 
              ref={outputRefs.state_closed}
              onScroll={() => handleScroll('state_closed')}
              className="h-[600px] overflow-auto border border-border rounded-lg p-4 font-mono text-sm"
            >
              <TimeSlicedUpdates 
                updates={outputs.state_closed} 
                startTimeRef={startTimeRef}
                timing={timing || { startTime: 0, endTime: 0 }}
                occupiedSlices={occupiedSlices}
              />
            </div>
          </div>

          {/* Root Open Mode */}
          <div className="space-y-2">
            <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
              <h2 className="font-bold">Root (Open)</h2>
              <p className="text-sm text-muted-foreground">
                Shows each root element's progress once
              </p>
            </div>
            <div 
              ref={outputRefs.root_open}
              onScroll={() => handleScroll('root_open')}
              className="h-[600px] overflow-auto border border-border rounded-lg p-4 font-mono text-sm"
            >
              <TimeSlicedUpdates 
                updates={outputs.root_open} 
                startTimeRef={startTimeRef}
                timing={timing || { startTime: 0, endTime: 0 }}
                occupiedSlices={occupiedSlices}
              />
            </div>
          </div>

          {/* Root Closed Mode */}
          <div className="space-y-2">
            <div className="p-3 bg-amber-100 dark:bg-amber-900/30 rounded-lg">
              <h2 className="font-bold">Root (Closed)</h2>
              <p className="text-sm text-muted-foreground">
                Shows each complete root element once
              </p>
            </div>
            <div 
              ref={outputRefs.root_closed}
              onScroll={() => handleScroll('root_closed')}
              className="h-[600px] overflow-auto border border-border rounded-lg p-4 font-mono text-sm"
            >
              <TimeSlicedUpdates 
                updates={outputs.root_closed} 
                startTimeRef={startTimeRef}
                timing={timing || { startTime: 0, endTime: 0 }}
                occupiedSlices={occupiedSlices}
              />
            </div>
          </div>
        </div>

        {/* Mode Explanations */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 text-sm">
          <div className="p-4 bg-card rounded-lg">
            <h3 className="font-medium mb-2">State (Open)</h3>
            <p className="text-muted-foreground">
              Best for live UI updates. Shows all content as it grows,
              including partial elements.
            </p>
          </div>

          <div className="p-4 bg-card rounded-lg">
            <h3 className="font-medium mb-2">State (Closed)</h3>
            <p className="text-muted-foreground">
              Best for clean state updates. Shows the complete state
              at each point, ignoring partial elements.
            </p>
          </div>

          <div className="p-4 bg-card rounded-lg">
            <h3 className="font-medium mb-2">Root (Open)</h3>
            <p className="text-muted-foreground">
              Shows each root element's progress exactly once,
              including partial content.
            </p>
          </div>

          <div className="p-4 bg-card rounded-lg">
            <h3 className="font-medium mb-2">Root (Closed)</h3>
            <p className="text-muted-foreground">
              Shows each complete root element exactly once.
              Best for processing complete elements.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
} 