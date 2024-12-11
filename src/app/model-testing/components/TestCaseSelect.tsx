import { TEST_CASES } from '@/config/model-testing/test-cases'

interface TestCaseSelectProps {
  selected: string[]
  onChange: (selected: string[]) => void
}

export function TestCaseSelect({ selected, onChange }: TestCaseSelectProps) {
  return (
    <div className="relative">
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <span className="text-xs text-muted-foreground">
          {selected.length}/{TEST_CASES.length}
        </span>
      </div>
      <select
        multiple
        value={selected}
        onChange={(e) => {
          const selected = Array.from(e.target.selectedOptions).map(opt => opt.value)
          onChange(selected)
        }}
        className="w-12 h-8 appearance-none bg-transparent cursor-pointer hover:bg-muted rounded-md"
        title="Select test cases"
      >
        {TEST_CASES.map(testCase => (
          <option key={testCase.id} value={testCase.id}>
            {testCase.name}
          </option>
        ))}
      </select>
    </div>
  )
}