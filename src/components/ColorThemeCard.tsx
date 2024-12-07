import { motion } from 'framer-motion'

function hexToRgb(hex: string) {
  // Remove # if present
  hex = hex.replace('#', '')
  
  // Handle shorthand hex
  if (hex.length === 3) {
    hex = hex.split('').map(char => char + char).join('')
  }
  
  const r = parseInt(hex.substring(0, 2), 16)
  const g = parseInt(hex.substring(2, 4), 16)
  const b = parseInt(hex.substring(4, 6), 16)
  
  return { r, g, b }
}

function calculateRelativeLuminance(r: number, g: number, b: number) {
  // Convert RGB to sRGB
  const sR = r / 255
  const sG = g / 255
  const sB = b / 255
  
  // Convert to linear RGB
  const R = sR <= 0.03928 ? sR / 12.92 : Math.pow((sR + 0.055) / 1.055, 2.4)
  const G = sG <= 0.03928 ? sG / 12.92 : Math.pow((sG + 0.055) / 1.055, 2.4)
  const B = sB <= 0.03928 ? sB / 12.92 : Math.pow((sB + 0.055) / 1.055, 2.4)
  
  // Calculate luminance
  return 0.2126 * R + 0.7152 * G + 0.0722 * B
}

function shouldUseWhiteText(backgroundColor: string) {
  try {
    const rgb = hexToRgb(backgroundColor)
    const luminance = calculateRelativeLuminance(rgb.r, rgb.g, rgb.b)
    return luminance < 0.5
  } catch {
    return true // Default to white text if color parsing fails
  }
}

type ColorTheme = {
  name: string;
  description: string;
  colors: {
    primary: {
      hex: string;
      name: string;
    };
    complementary: Array<{
      hex: string;
      name: string;
    }>;
  };
  mood: {
    description: string;
    keywords: string[];
  };
  usage: {
    suggestion: string[];
  };
  timeContext: {
    season: string;
    timeOfDay: string;
  };
  texture: {
    pattern: string;
    description: string;
  };
};

interface ColorThemeCardProps {
  theme: ColorTheme;
  delay?: number;
}

export function ColorThemeCard({ theme, delay = 0 }: ColorThemeCardProps) {
  const primaryColor = theme?.colors?.primary?.hex || '#666'
  
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: delay * 0.001 }}
      className="bg-white rounded-lg overflow-hidden shadow-xl"
      style={{
        borderWidth: '6px',
        borderStyle: 'solid',
        borderColor: primaryColor || 'black',
        outline: '6px solid black'
      }}
    >
      {/* SVG Filter Definition */}
      <svg className="absolute" style={{ width: 0, height: 0 }}>
        <defs>
          <filter id="stroke">
            <feMorphology
              operator="dilate"
              radius="2"
              in="SourceAlpha"
              result="thicken"
            />
            <feFlood floodColor="black"/>
            <feComposite
              in2="thicken"
              operator="in"
            />
            <feComposite
              in="SourceGraphic"
              operator="over"
            />
          </filter>
        </defs>
      </svg>

      {/* Color Preview Bar */}
      <div className="h-24 relative">
        {/* Primary Color */}
        <div 
          className="absolute inset-0"
          style={{ backgroundColor: primaryColor }}
        />
        
        {/* Complementary Colors Strip */}
        <div className="absolute bottom-0 left-0 right-0 h-8 flex">
          {theme?.colors?.complementary?.map((color, i) => (
            <motion.div 
              key={i}
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ delay: (delay + i * 100) * 0.001 }}
              className="flex-1 h-full"
              style={{ backgroundColor: color?.hex }}
            />
          ))}
        </div>

        {/* Theme Name */}
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.h3 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: delay * 0.001 + 0.2 }}
            className="text-4xl font-bold text-center px-4 text-white"
            style={{ filter: 'url(#stroke)' }}
          >
            {theme?.name || 'Loading...'}
          </motion.h3>
        </div>
      </div>

      {/* Content */}
      <div className="p-6 space-y-6">
        {/* Color Names */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <div 
              className="w-4 h-4 rounded-full ring-2 ring-zinc-200"
              style={{ backgroundColor: primaryColor }}
            />
            <span className="text-sm font-medium text-zinc-900">
              {theme?.colors?.primary?.name || 'Loading...'}
            </span>
          </div>
          {theme?.colors?.complementary?.map((color, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: (delay + i * 100) * 0.001 }}
              className="flex items-center gap-2"
            >
              <div 
                className="w-4 h-4 rounded-full ring-2 ring-zinc-200"
                style={{ backgroundColor: color?.hex }}
              />
              <span className="text-sm text-zinc-600">
                {color?.name}
              </span>
            </motion.div>
          ))}
        </div>

        {/* Description */}
        {theme?.description && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: delay * 0.001 + 0.3 }}
            className="text-zinc-600"
          >
            {theme.description}
          </motion.div>
        )}

        {/* Mood Keywords */}
        {theme?.mood?.keywords && (
          <div className="flex flex-wrap gap-2">
            {theme.mood.keywords.map((keyword, i) => (
              <motion.span
                key={i}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: (delay + i * 100) * 0.001 }}
                className="px-3 py-1 bg-zinc-100 rounded-full text-sm text-zinc-700"
              >
                {keyword}
              </motion.span>
            ))}
          </div>
        )}

        {/* Usage Suggestions */}
        {theme?.usage?.suggestion && (
          <div className="space-y-1">
            {theme.usage.suggestion.map((use, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: (delay + i * 100) * 0.001 }}
                className="text-sm text-zinc-600 flex items-center gap-2"
              >
                <div className="w-1.5 h-1.5 rounded-full"
                     style={{ backgroundColor: primaryColor }} />
                {use}
              </motion.div>
            ))}
          </div>
        )}

        {/* Context & Texture */}
        <div className="pt-4 border-t border-zinc-200">
          <div className="flex justify-between text-sm text-zinc-500">
            <div className="space-x-4">
              {theme?.timeContext?.season && (
                <span>{theme.timeContext.season}</span>
              )}
              {theme?.timeContext?.timeOfDay && (
                <span>{theme.timeContext.timeOfDay}</span>
              )}
            </div>
            {theme?.texture?.pattern && (
              <span>{theme.texture.pattern}</span>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  )
}

export type { ColorTheme } 