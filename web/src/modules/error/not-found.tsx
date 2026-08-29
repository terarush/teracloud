import { Link } from "@tanstack/react-router"

export default function NotFound() {
  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-background px-6">
      <div className="max-w-md w-full text-center space-y-5">
        <div className="space-y-2">
          <p className="text-sm font-bold tracking-widest text-muted-foreground uppercase">
            404 Error
          </p>
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
            Page not found
          </h1>
          <p className="text-sm text-muted-foreground max-w-xs mx-auto leading-relaxed">
            Sorry, we couldn't find the page you're looking for. It might have been moved or deleted.
          </p>
        </div>

        <div className="pt-2">
          <Link
            to="/"
            className="inline-flex items-center justify-center bg-primary hover:bg-primary/80 text-primary-foreground rounded-lg h-10 px-6 text-sm font-semibold transition-colors focus:outline-hidden focus:ring-3 focus:ring-ring/50"
          >
            Go back home
          </Link>
        </div>
      </div>
    </div>
  )
}
