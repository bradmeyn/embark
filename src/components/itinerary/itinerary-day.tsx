import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { type Activity, type Day } from "./itinerary";

function ItineraryActivity({ activity }: { activity: Activity }) {
  const formatTime = (time: string): string => {
    return time.replace(/(\d{1,2}):(\d{2})\s*(AM|PM)/i, "$1:$2 $3");
  };

  return (
    <Card>
      <CardContent>
        <div>
          <div>
            <Badge variant="secondary">{formatTime(activity.time)}</Badge>
            <span>({activity.duration})</span>
          </div>
          {activity.cost && <Badge variant="outline">{activity.cost}</Badge>}
        </div>

        <h6>{activity.title}</h6>
        <p>{activity.description}</p>

        {activity.tips && <div>💡 {activity.tips}</div>}
      </CardContent>
    </Card>
  );
}

export function DayItinerary({ day }: { day: Day }) {
  return (
    <AccordionItem value={`day-${day.day}`}>
      <AccordionTrigger>
        <div>
          <div>
            <h4>
              Day {day.day}: {day.location}
            </h4>
            <p>{day.overview}</p>
          </div>
        </div>
      </AccordionTrigger>

      <AccordionContent>
        <div>
          {/* Activities */}
          <div>
            <h5>🎯 Activities</h5>
            <div>
              {day.activities.map((activity) => (
                <ItineraryActivity key={activity.id} activity={activity} />
              ))}
            </div>
          </div>

          {/* Meals */}
          {day.meals && (
            <div>
              <h5>🍽️ Meals</h5>
              <Card>
                <CardContent>
                  {day.meals.breakfast && (
                    <div>
                      <span>🥞 Breakfast:</span>
                      <span>{day.meals.breakfast}</span>
                    </div>
                  )}
                  {day.meals.lunch && (
                    <div>
                      <span>🥗 Lunch:</span>
                      <span>{day.meals.lunch}</span>
                    </div>
                  )}
                  {day.meals.dinner && (
                    <div>
                      <span>🍽️ Dinner:</span>
                      <span>{day.meals.dinner}</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}

          {/* Transportation & Accommodation */}
          <div>
            {day.transportation && (
              <div>
                <h5>🚗 Transportation</h5>
                <Card>
                  <CardContent>
                    <div>{day.transportation}</div>
                  </CardContent>
                </Card>
              </div>
            )}

            {day.accommodation && (
              <div>
                <h5>🏨 Accommodation</h5>
                <Card>
                  <CardContent>
                    <div>{day.accommodation}</div>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>

          {/* Daily Budget */}
          {day.budget_estimate && (
            <div>
              <Badge variant="outline">
                Daily Budget: {day.budget_estimate}
              </Badge>
            </div>
          )}
        </div>
      </AccordionContent>
    </AccordionItem>
  );
}
