import { createFileRoute, Link } from '@tanstack/react-router'
import { ArrowRight } from 'lucide-react'
import Header from '@/components/Header'
export const Route = createFileRoute('/')({
  component: App,
})

function App() {
  return (
    <main className="min-h-screen">
      <div className="container mx-auto">
        <div className="mx-auto my-16 max-w-3xl">
          <h1 className="mb-4 text-center font-serif text-8xl font-light">
            Plan your next adventure
          </h1>
          <p className="text-center font-serif text-lg font-light">
            Embark on a journey of a lifetime with our AI-powered travel
            planner.
          </p>

          <div>
            <div className="mt-8 flex items-center justify-center gap-4">
              <Link
                to="/chat"
                className="flex items-center gap-2 rounded-full bg-violet-800 px-4 py-2 text-lg  font-semibold text-white transition duration-200 hover:bg-emerald-700"
              >
                <span>Agent</span>
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
              <Link
                to="/itneraries"
                className="flex items-center gap-2 rounded-full bg-violet-800 px-4 py-2 text-lg  font-semibold text-white transition duration-200 hover:bg-emerald-700"
              >
                <span>Planner</span>
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
