import type { ReactNode } from 'react'
import { QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter } from 'react-router-dom'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { queryClient } from './queryClient'

/** Composición de todos los providers globales de la app. */
export default function Providers({ children }: { children: ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        {children}
        <ToastContainer position="bottom-right" theme="dark" autoClose={3000} />
      </BrowserRouter>
    </QueryClientProvider>
  )
}
