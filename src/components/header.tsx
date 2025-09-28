import { Link } from '@tanstack/react-router'

export default function Header() {
  return (
    <header className="flex items-center justify-between p-4 container mx-auto">
      <div className="flex items-center space-x-2">
        <span className="font-serif text-xl">Embark</span>
      </div>
      <nav className="flex items-center space-x-6">
        <Link to="/login" className="rounded px-3 py-1 text-sm">
          Log In
        </Link>
        <Link to="/register" className="rounded px-3 py-1 text-sm">
          Sign Up
        </Link>
      </nav>
    </header>
  )
}
