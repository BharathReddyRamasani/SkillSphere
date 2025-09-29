// FILE: src/components/SkillsChart.tsx

import { Card } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export const SkillsChart = ({ skills }) => {
  const chartData = skills.map(skill => ({
    name: skill.skill_name,
    Mastery: Math.round(skill.mastery_score * 100),
  }));

  return (
    <Card className="learning-card p-6">
       <h2 className="text-2xl font-semibold mb-6">Skills Mastery Overview</h2>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={chartData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis unit="%" />
          <Tooltip cursor={{fill: 'rgba(139, 92, 246, 0.1)'}} />
          <Bar dataKey="Mastery" fill="var(--color-primary)" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </Card>
  );
};