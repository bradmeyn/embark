import { DayItinerary } from './itinerary-day'
import { ItineraryJourney } from './itinerary-journey'
import { Card } from '@/components/ui/card'
import { Accordion } from '@/components/ui/accordion'

export type Activity = {
  id: string
  time: string
  duration: string
  title: string
  description: string
  cost?: string
  tips?: string
}

export type Day = {
  day: number
  overview: string
  location: string
  country?: string
  activities: Activity[]
  meals: {
    breakfast: string
    lunch: string
    dinner: string
  }
  transportation: string
  accommodation: string
  budget_estimate: string
}

export type Itinerary = {
  id: string
  name: string
  days: Day[]
}

const testItinerary: Itinerary = {
  id: '1',
  name: 'Test Itinerary',
  days: [
    {
      day: 1,
      location: 'Paris',
      country: 'France',
      overview: 'Arrival & Check-in',
      activities: [
        {
          id: '1',
          time: '09:00 AM',
          duration: '2 hours',
          title: 'Visit the Louvre',
          description: 'Explore the world-famous art museum.',
          cost: '$15',
          tips: 'Book tickets in advance.',
        },
        {
          id: '2',
          time: '12:00 PM',
          duration: '1 hour',
          title: 'Lunch at Café de Flore',
          description: 'Enjoy a classic French lunch.',
          cost: '$30',
        },
      ],
      meals: {
        breakfast: 'Croissants at local bakery',
        lunch: 'Lunch at Café de Flore',
        dinner: 'Dinner at Le Meurice',
      },
      transportation: 'Metro',
      accommodation: 'Hotel Le Meurice',
      budget_estimate: '$200',
    },
    {
      day: 2,
      location: 'Versailles',
      country: 'France',
      overview: 'Day trip to the Palace of Versailles',
      activities: [
        {
          id: '3',
          time: '09:00 AM',
          duration: '3 hours',
          title: 'Explore the Palace',
          description: 'Visit the stunning palace and gardens.',
          cost: '$20',
        },
        {
          id: '4',
          time: '12:00 PM',
          duration: '1 hour',
          title: 'Lunch at La Petite Venise',
          description: 'Enjoy lunch in the gardens of Versailles.',
          cost: '$25',
        },
      ],
      meals: {
        breakfast: 'Breakfast at hotel',
        lunch: 'Lunch at La Petite Venise',
        dinner: 'Dinner at local bistro',
      },
      transportation: 'RER Train',
      accommodation: 'Hotel Le Meurice',
      budget_estimate: '$250',
    },
    {
      day: 3,
      location: 'Mont Saint-Michel',
      country: 'France',
      overview: 'Visit the iconic island commune.',
      activities: [
        {
          id: '5',
          time: '09:00 AM',
          duration: '2 hours',
          title: 'Explore Mont Saint-Michel',
          description: 'Visit the abbey and enjoy the views.',
          cost: '$15',
        },
        {
          id: '6',
          time: '12:00 PM',
          duration: '1 hour',
          title: 'Lunch at La Mère Poulard',
          description: 'Try the famous omelette.',
          cost: '$30',
        },
      ],
      meals: {
        breakfast: 'Breakfast at hotel',
        lunch: 'Lunch at La Mère Poulard',
        dinner: 'Dinner at local restaurant',
      },
      transportation: 'Rental Car',
      accommodation: 'Hotel Le Mouton Blanc',
      budget_estimate: '$200',
    },
  ],
}

export function Itinerary() {
  return (
    <Card className="p-4 bg-neutral-100">
      <h1>{testItinerary.name}</h1>
      <ItineraryJourney itinerary={testItinerary} />
      <div>
        <h2>Daily Itinerary</h2>
        <Accordion type="multiple" className="bg-white p-2 border px-4">
          {testItinerary.days.map((d) => (
            <DayItinerary key={d.day} day={d} />
          ))}
        </Accordion>
      </div>
    </Card>
  )
}
