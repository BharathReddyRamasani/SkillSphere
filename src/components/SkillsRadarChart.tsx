// FILE: src/components/SkillsRadarChart.tsx

import { Card } from "@/components/ui/card";
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Legend, Tooltip } from 'recharts';

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
    // Calculate the average score for the category
    mastery: Math.round(categoryData[category].scores.reduce((a, b) => a + b, 0) / categoryData[category].count),
    // This is required by the RadarChart component
    fullMark: 100,
  }));

  return (
    <Card className="learning-card p-4">
      <h2 className="text-2xl font-semibold mb-4 text-center">Skill Category Overview</h2>
      <ResponsiveContainer width="100%" height={350}>
        <RadarChart cx="50%" cy="50%" outerRadius="80%" data={chartData}>
          <PolarGrid />
          <PolarAngleAxis dataKey="category" />
          {/* This is the corrected line */}
          <PolarRadiusAxis angle={30} domain={[0, 100]} tickFormatter={(tick) => `${tick}%`} />
          <Radar name="Mastery" dataKey="mastery" stroke="var(--color-primary)" fill="var(--color-primary)" fillOpacity={0.6} />
          <Tooltip />
          <Legend />
        </RadarChart>
      </ResponsiveContainer>
    </Card>
  );
};