// FILE: src/components/SkillsRadarChart.tsx

import { Card } from "@/components/ui/card";
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, ResponsiveContainer, Tooltip, TooltipProps } from 'recharts';
import { NameType, ValueType } from 'recharts/types/component/DefaultTooltipContent';

// Custom Tooltip with proper TypeScript types
const CustomTooltip = ({ active, payload }: TooltipProps<ValueType, NameType>) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-background border rounded-lg p-2 shadow-lg">
        {/* The 'payload' property on the inner payload object holds the original data item */}
        <p className="font-bold">{`${payload[0].payload.category}`}</p>
        {/* The 'value' property holds the value for the dataKey being displayed */}
        <p className="text-primary">{`Mastery: ${payload[0].value}%`}</p>
      </div>
    );
  }
  return null;
};

export const SkillsRadarChart = ({ skills }) => {
  // Process data: group skills by category and find the average mastery
  const categoryData = skills.reduce((acc, skill) => {
    const category = skill.category || 'General';
    if (!acc[category]) {
      acc[category] = { scores: [], count: 0 };
    }
    acc[category].scores.push(skill.mastery_score * 100);
    acc[category].count++;
    return acc;
  }, {});

  const chartData = Object.keys(categoryData).map(category => ({
    category: category,
    mastery: Math.round(categoryData[category].scores.reduce((a, b) => a + b, 0) / categoryData[category].count),
    fullMark: 100,
  }));

  if (chartData.length === 0) {
    return null;
  }

  return (
    <Card className="learning-card p-4">
      <h2 className="text-xl font-semibold mb-4 text-center">Skill Category Overview</h2>
      <ResponsiveContainer width="100%" height={350}>
        <RadarChart cx="50%" cy="50%" outerRadius="80%" data={chartData}>
          <defs>
            <radialGradient id="colorMastery">
              <stop offset="5%" stopColor="var(--color-primary)" stopOpacity={0.8}/>
              <stop offset="95%" stopColor="var(--color-primary)" stopOpacity={0.1}/>
            </radialGradient>
          </defs>
          <PolarGrid />
          <PolarAngleAxis dataKey="category" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} />
          <Radar 
            name="Mastery" 
            dataKey="mastery" 
            stroke="var(--color-primary)" 
            fill="url(#colorMastery)"
            strokeWidth={2}
          />
          {/* This line is now correct because CustomTooltip has the right types */}
          <Tooltip content={<CustomTooltip />} />
        </RadarChart>
      </ResponsiveContainer>
    </Card>
  );
};