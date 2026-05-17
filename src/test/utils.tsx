import { ReactNode } from 'react';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, renderHook, RenderHookOptions, RenderOptions } from '@testing-library/react';

/**
 * Build a fresh QueryClient with retries disabled — every test gets isolation
 * and a predictable failure path (no automatic retries hiding mock setup bugs).
 */
export function makeTestQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: 0, staleTime: 0 },
      mutations: { retry: false },
    },
  });
}

interface ProvidersProps {
  children: ReactNode;
  queryClient?: QueryClient;
  initialRoute?: string;
}

export function AllProviders({ children, queryClient, initialRoute = '/' }: ProvidersProps) {
  const client = queryClient ?? makeTestQueryClient();
  return (
    <QueryClientProvider client={client}>
      <MemoryRouter initialEntries={[initialRoute]}>{children}</MemoryRouter>
    </QueryClientProvider>
  );
}

export function renderWithProviders(
  ui: ReactNode,
  options: Omit<RenderOptions, 'wrapper'> & { queryClient?: QueryClient; initialRoute?: string } = {}
) {
  const { queryClient, initialRoute, ...rest } = options;
  return render(
    <AllProviders queryClient={queryClient} initialRoute={initialRoute}>
      {ui}
    </AllProviders>,
    rest
  );
}

export function renderHookWithProviders<TProps, TResult>(
  callback: (props: TProps) => TResult,
  options: Omit<RenderHookOptions<TProps>, 'wrapper'> & {
    queryClient?: QueryClient;
    initialRoute?: string;
  } = {}
) {
  const { queryClient, initialRoute, ...rest } = options;
  return renderHook(callback, {
    wrapper: ({ children }) => (
      <AllProviders queryClient={queryClient} initialRoute={initialRoute}>
        {children}
      </AllProviders>
    ),
    ...rest,
  });
}
