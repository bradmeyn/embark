import { Card, CardContent } from "@/components/ui/card";
import { type Itinerary } from "./itinerary";

export function ItineraryJourney({ itinerary }: { itinerary: Itinerary }) {
  // Aggregate destinations with country and days
  const destinations = itinerary.days.map((day) => {
    const currentLocation = day.location;
    const currentCountry = day.country;
    const currentDays = 1;

    return {
      key: `${currentLocation}|${currentCountry}`,
      location: currentLocation,
      country: currentCountry,
      days: currentDays,
    };
  });

  return (
    <div className="mb-6">
      <h3 className="mb-3 text-lg font-semibold ">Your Journey</h3>
      <div className="flex flex-wrap gap-2">
        {destinations.map(({ key, location, country, days }) => (
          <Card key={key}>
            <CardContent>
              <div>{location}</div>
              <div>{country}</div>
              <div>{days} days</div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
