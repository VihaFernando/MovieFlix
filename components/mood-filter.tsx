"use client"
import { Button } from "@/components/ui/button"

interface MoodFilterProps {
  onMoodSelect: (mood: string | null) => void
  selectedMood: string | null
}

const moods = [
  { id: "happy", label: "Happy", emoji: "😊" },
  { id: "sad", label: "Sad", emoji: "😢" },
  { id: "scary", label: "Scary", emoji: "😱" },
  { id: "inspired", label: "Inspired", emoji: "✨" },
]

export default function MoodFilter({ onMoodSelect, selectedMood }: MoodFilterProps) {
  return (
    <div className="flex flex-wrap gap-2 mb-8">
      <Button
        variant={selectedMood === null ? "default" : "outline"}
        onClick={() => onMoodSelect(null)}
        className="rounded-full"
      >
        All Movies
      </Button>

      {moods.map((mood) => (
        <Button
          key={mood.id}
          variant={selectedMood === mood.id ? "default" : "outline"}
          onClick={() => onMoodSelect(mood.id)}
          className="rounded-full"
        >
          {mood.emoji} {mood.label}
        </Button>
      ))}
    </div>
  )
}
