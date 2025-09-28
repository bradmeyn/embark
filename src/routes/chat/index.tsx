import { useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { Itinerary } from '@/components/itinerary/itinerary'
import { Textarea } from '@/components/ui/textarea'

export const Route = createFileRoute('/chat/')({
  component: ChatPage,
})

function ChatPage() {
  const [messages, setMessages] = useState<Array<string>>([])
  return (
    <main className="min-h-screen">
      <div className="container mx-auto">
        {messages.length === 0 ? (
          <div className="mx-auto my-16 max-w-3xl">
            <p className="text-center font-serif text-4xl mb-7 font-light block">
              Describe your next trip.
            </p>

            <div className="max-w-lg">
              <Textarea placeholder="A relaxing 2 weeks in Italy" rows={2} />
            </div>
          </div>
        ) : null}

        <Itinerary />
      </div>
    </main>
  )
}
