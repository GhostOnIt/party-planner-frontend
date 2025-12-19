import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { categoryConfig } from './CategoryBadge';
import type { BudgetStats, BudgetCategory } from '@/types';

interface BudgetChartProps {
  stats: BudgetStats | undefined;
  isLoading?: boolean;
}

const CATEGORY_COLORS: Record<BudgetCategory, string> = {
  location: '#3b82f6',
  catering: '#f97316',
  decoration: '#ec4899',
  entertainment: '#eab308',
  photography: '#8b5cf6',
  transportation: '#22c55e',
  other: '#6b7280',
};

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'XAF',
    maximumFractionDigits: 0,
  }).format(value);
}

export function BudgetChart({ stats, isLoading = false }: BudgetChartProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Repartition par categorie</CardTitle>
          <CardDescription>Visualisation des depenses</CardDescription>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[300px] w-full" />
        </CardContent>
      </Card>
    );
  }

  const byCategory = stats?.by_category || [];

  if (byCategory.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Repartition par categorie</CardTitle>
          <CardDescription>Visualisation des depenses</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex h-[300px] items-center justify-center text-muted-foreground">
            Aucune depense enregistree
          </div>
        </CardContent>
      </Card>
    );
  }

  const chartData = byCategory
    .filter((item) => item.estimated > 0)
    .map((item) => ({
      name: categoryConfig[item.category]?.label || item.category,
      value: item.estimated,
      actual: item.actual,
      color: CATEGORY_COLORS[item.category] || CATEGORY_COLORS.other,
    }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Repartition par categorie</CardTitle>
        <CardDescription>
          Budget estime: {formatCurrency(stats?.total_estimated ?? 0)}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              labelLine={false}
              outerRadius={100}
              fill="#8884d8"
              dataKey="value"
              label={({ name, percent }) =>
                `${name} (${((percent || 0) * 100).toFixed(0)}%)`
              }
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              formatter={(value) => [formatCurrency(Number(value) || 0), 'Estime']}
              contentStyle={{
                backgroundColor: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px',
              }}
            />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
