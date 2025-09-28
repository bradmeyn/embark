import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/itineraries/')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/itineraries/"!</div>
}
