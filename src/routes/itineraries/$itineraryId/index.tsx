import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/itineraries/$itineraryId/')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/itineraries/$itineraryId/"!</div>
}
