import ReactDOM from 'react-dom/client'
import { RouterProvider } from '@tanstack/react-router'
import { QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools'
import { HelmetProvider } from 'react-helmet-async'
import { queryClient } from '@/lib/query-client'
import { router } from '@/router'
import '@/lib/i18n'

const rootElement = document.getElementById('app')!

if (!rootElement.innerHTML) {
  const root = ReactDOM.createRoot(rootElement)
  root.render(
    <HelmetProvider>
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={router} />
        {import.meta.env.VITE_ENABLE_QUERY_DEVTOOLS === 'true' && (
          <ReactQueryDevtools initialIsOpen={false} />
        )}
        {import.meta.env.VITE_ENABLE_ROUTER_DEVTOOLS === 'true' && (
          <TanStackRouterDevtools router={router} position="bottom-left" />
        )}
      </QueryClientProvider>
    </HelmetProvider>
  )
}
