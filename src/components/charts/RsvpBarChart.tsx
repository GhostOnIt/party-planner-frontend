import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import type { RsvpChartData } from '@/hooks/useChartData';

interface RsvpBarChartProps {
  data: RsvpChartData[];
  isLoading?: boolean;
}

export function RsvpBarChart({ data, isLoading = false }: RsvpBarChartProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Confirmations par evenement</CardTitle>
          <CardDescription>Statut des RSVP de vos evenements</CardDescription>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[300px] w-full" />
        </CardContent>
      </Card>
    );
  }

  if (!data || data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Confirmations par evenement</CardTitle>
          <CardDescription>Statut des RSVP de vos evenements</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex h-[300px] items-center justify-center text-muted-foreground">
            Aucune donnee disponible
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Confirmations par evenement</CardTitle>
        <CardDescription>Statut des RSVP de vos evenements</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart
            data={data}
            margin={{
              top: 20,
              right: 30,
              left: 20,
              bottom: 5,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis
              dataKey="event_title"
              tick={{ fontSize: 12 }}
              tickLine={false}
              axisLine={false}
            />
            <YAxis tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px',
              }}
            />
            <Legend />
            <Bar
              dataKey="accepted"
              name="Confirmes"
              fill="hsl(var(--success))"
              radius={[4, 4, 0, 0]}
            />
            <Bar
              dataKey="declined"
              name="Declines"
              fill="hsl(var(--destructive))"
              radius={[4, 4, 0, 0]}
            />
            <Bar
              dataKey="maybe"
              name="Peut-etre"
              fill="hsl(var(--warning))"
              radius={[4, 4, 0, 0]}
            />
            <Bar
              dataKey="pending"
              name="En attente"
              fill="hsl(var(--muted-foreground))"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
