import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
const supabaseUrl = Deno.env.get('SUPABASE_URL');
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { userId, action, data } = await req.json();
    
    if (!userId) {
      return new Response(JSON.stringify({ error: 'User ID required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const supabase = createClient(supabaseUrl!, supabaseServiceKey!);
    
    console.log(`AI Personalization request: ${action} for user ${userId}`);

    switch (action) {
      case 'generate_roadmap':
        return await generatePersonalizedRoadmap(supabase, userId, data);
      case 'generate_job_matches':
        return await generateJobMatches(supabase, userId, data);
      case 'generate_ai_insights':
        return await generateAIInsights(supabase, userId, data);
      case 'initialize_user':
        return await initializeUserData(supabase, userId, data);
      case 'generate_quiz':
        return await generateQuiz(supabase, userId, data);
      default:
        return new Response(JSON.stringify({ error: 'Invalid action' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }
  } catch (error) {
    console.error('AI Personalization Error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});

async function generateQuiz(supabase: any, userId: string, data: { moduleId: string }) {
  const { moduleId } = data;

  // This calls the special database function we created to efficiently get 5 random questions.
  const { data: questions, error } = await supabase
    .rpc('get_random_questions_for_module', {
      target_module_id: moduleId,
      question_limit: 5
    });

  if (error) {
    console.error('Error fetching random questions:', error);
    throw error;
  }

  if (!questions || questions.length === 0) {
     return new Response(JSON.stringify({ 
        success: true, 
        quizId: `fallback-for-${moduleId}`,
        questions: [{
            question_text: "No questions have been added for this module yet. Please check back later.",
            options: {"a": "Okay", "b": "Got it", "c": "Understood", "d": "Will do"},
            correct_answer: "a"
        }]
    }), { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
  
  // The database function returns the questions directly.
  return new Response(JSON.stringify({
    success: true,
    quizId: `quiz-for-${moduleId}`, 
    questions: questions
  }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
}

async function generatePersonalizedRoadmap(supabase: any, userId: string, data: any) {
  const { data: profile } = await supabase.from('profiles').select('*').eq('id', userId).single();
  const { data: rawSkills } = await supabase.from('user_skills').select('*').eq('user_id', userId);
  const { data: goals } = await supabase.from('user_goals').select('*').eq('user_id', userId);
  const { data: activities } = await supabase.from('learning_activities').select('*').eq('user_id', userId).order('completed_at', { ascending: false }).limit(20);
  const { data: preferences } = await supabase.from('user_preferences').select('*').eq('user_id', userId).single();

  const updatedSkills = await applyForgettingCurve(supabase, rawSkills || [], userId);

  const prompt = `You are the personalization engine for LearnSphere. Generate a highly personalized 12-week learning roadmap.

User Profile: ${JSON.stringify(profile)}
Skills (with decay-adjusted mastery): ${JSON.stringify(updatedSkills)}
Career Goals: ${JSON.stringify(goals)}
Recent Activities: ${JSON.stringify(activities)}
Learning Preferences: ${JSON.stringify(preferences)}

Apply Data Science principles:
1. Use forgetting curve decay patterns to identify skills needing reinforcement
2. Prioritize based on career alignment and skill gaps
3. Consider learning velocity and engagement patterns
4. Include probabilistic variation to ensure uniqueness

Return JSON array of 12 weeks with:
- week_number, title, description, topics (array)
- estimated_hours, status, skills_focus (array)
- difficulty_progression, prerequisites
- personalized_notes based on user behavior

Make each roadmap unique even for similar users.`;

  const aiResponse = await callOpenAI(prompt);
  const roadmapWeeks = JSON.parse(aiResponse);

  await supabase.from('roadmap_weeks').delete().eq('user_id', userId);

  const weeksWithUserId = roadmapWeeks.map((week: any, index: number) => ({
    ...week,
    user_id: userId,
    week_number: index + 1,
    status: index === 0 ? 'current' : 'not_started',
    completion_percentage: 0
  }));

  await supabase.from('roadmap_weeks').insert(weeksWithUserId);

  return new Response(JSON.stringify({ success: true, roadmap: weeksWithUserId }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
}

async function generateJobMatches(supabase: any, userId: string, data: any) {
  const { data: rawSkills } = await supabase.from('user_skills').select('*').eq('user_id', userId);
  const { data: goals } = await supabase.from('user_goals').select('*').eq('user_id', userId);
  const { data: preferences } = await supabase.from('user_preferences').select('*').eq('user_id', userId).single();
  const { data: activities } = await supabase.from('learning_activities').select('*').eq('user_id', userId).order('completed_at', { ascending: false }).limit(10);

  const skills = await applyForgettingCurve(supabase, rawSkills || [], userId);
  const userSkillVector = calculateSkillVector(skills);
  const jobMarketVectors = getJobMarketVectors();

  const jobMatches = jobMarketVectors.map(job => {
    const matchScore = calculateCosineSimilarity(userSkillVector, job.skillVector);
    const missingSkills = job.required_skills.filter(skill => 
      !skills.find(userSkill => userSkill.skill_name.toLowerCase() === skill.toLowerCase() && userSkill.mastery_score > 0.6)
    );
    
    return {
      ...job,
      match_score: Math.round(matchScore * 100),
      missing_skills: missingSkills,
      placement_readiness: calculatePlacementReadiness(skills, job.required_skills)
    };
  }).sort((a, b) => b.match_score - a.match_score);

  const prompt = `Enhance these job matches with personalized insights:
  User Skills: ${JSON.stringify(skills)}
  Goals: ${JSON.stringify(goals)}
  Preferences: ${JSON.stringify(preferences)}
  Calculated Matches: ${JSON.stringify(jobMatches.slice(0, 8))}
  
  Add personalized description and growth_potential for each job based on user profile.
  Ensure variety and uniqueness for this specific user.`;

  const aiResponse = await callOpenAI(prompt);
  const enhancedMatches = JSON.parse(aiResponse);

  return new Response(JSON.stringify({ jobMatches: enhancedMatches }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
}

async function generateAIInsights(supabase: any, userId: string, data: any) {
  const { data: activities } = await supabase.from('learning_activities')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(10);

  const { data: skills } = await supabase.from('user_skills').select('*').eq('user_id', userId);

  const prompt = `Based on learning activities: ${JSON.stringify(activities)} and skills: ${JSON.stringify(skills)}, generate AI insights with:
  - learning_velocity: number (hours per week)
  - strength_areas: array of strings
  - improvement_areas: array of strings
  - recommendations: array of recommendation objects with {title, description, priority}
  - next_milestone: string
  - estimated_placement_readiness: number (0-100)`;

  const aiResponse = await callOpenAI(prompt);
  const insights = JSON.parse(aiResponse);

  await supabase.from('user_stats').upsert({
    user_id: userId,
    placement_readiness: insights.estimated_placement_readiness,
    learning_velocity: insights.learning_velocity,
    updated_at: new Date().toISOString()
  });

  return new Response(JSON.stringify(insights), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
}

async function initializeUserData(supabase: any, userId: string, data: any) {
  const { preferences = {} } = data || {};
  
  await supabase.from('user_preferences').upsert({
    user_id: userId,
    learning_style: preferences.learning_style || 'visual',
    preferred_schedule: preferences.preferred_schedule || 'flexible',
    career_focus: preferences.career_focus || 'full-stack-development',
    experience_level: preferences.experience_level || 'intermediate'
  });

  await supabase.from('user_goals').upsert({
    user_id: userId,
    goal_type: 'career',
    title: 'Become a Full-Stack Developer',
    description: 'Master both frontend and backend technologies',
    target_date: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'in_progress'
  });

  await supabase.from('user_stats').upsert({
    user_id: userId,
    placement_readiness: 35,
    learning_velocity: 8,
    total_learning_hours: 0,
    courses_completed: 0,
    skills_mastered: 0
  });

  return new Response(JSON.stringify({ success: true }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
}

async function applyForgettingCurve(supabase: any, skills: any[], userId: string) {
  const updatedSkills = [];
  
  for (const skill of skills) {
    const daysSincePractice = Math.floor((Date.now() - new Date(skill.last_practiced).getTime()) / (1000 * 60 * 60 * 24));
    
    const retentionRate = Math.exp(-daysSincePractice * (skill.decay_rate || 0.01));
    const decayedMastery = skill.mastery_score * retentionRate;
    
    const newMastery = Math.max(0.1, Math.min(1, decayedMastery));
    await supabase.from('user_skills').update({ 
      mastery_score: newMastery,
      updated_at: new Date().toISOString()
    }).eq('id', skill.id);
    
    updatedSkills.push({ ...skill, mastery_score: newMastery });
  }
  
  return updatedSkills;
}

function calculateSkillVector(skills: any[]) {
  const skillCategories = ['Programming', 'Frontend', 'Backend', 'Database', 'AI/ML', 'DevOps', 'Mobile', 'Design'];
  return skillCategories.map(category => {
    const categorySkills = skills.filter(s => s.category === category);
    return categorySkills.length > 0 
      ? categorySkills.reduce((sum, s) => sum + s.mastery_score, 0) / categorySkills.length 
      : 0;
  });
}

function calculateCosineSimilarity(vectorA: number[], vectorB: number[]) {
  const dotProduct = vectorA.reduce((sum, a, i) => sum + a * vectorB[i], 0);
  const magnitudeA = Math.sqrt(vectorA.reduce((sum, a) => sum + a * a, 0));
  const magnitudeB = Math.sqrt(vectorB.reduce((sum, b) => sum + b * b, 0));
  return magnitudeA && magnitudeB ? dotProduct / (magnitudeA * magnitudeB) : 0;
}

function getJobMarketVectors() {
  return [
    {
      title: "Full Stack Developer",
      company: "TechCorp",
      location: "San Francisco, CA",
      salary_range: "$90k - $130k",
      experience_level: "Mid-level",
      job_type: "Full-time",
      applicants_count: 45,
      posted_days_ago: 3,
      required_skills: ["JavaScript", "React", "Node.js", "SQL", "Git"],
      skillVector: [0.9, 0.8, 0.8, 0.6, 0.2, 0.3, 0.1, 0.2],
      description: "Build scalable web applications"
    },
    {
      title: "Machine Learning Engineer",
      company: "AI Innovations",
      location: "Seattle, WA",
      salary_range: "$110k - $160k",
      experience_level: "Senior",
      job_type: "Full-time",
      applicants_count: 23,
      posted_days_ago: 1,
      required_skills: ["Python", "TensorFlow", "Machine Learning", "Statistics", "SQL"],
      skillVector: [0.8, 0.2, 0.4, 0.7, 0.9, 0.3, 0.1, 0.1],
      description: "Develop ML models for production"
    },
    {
      title: "Frontend Developer",
      company: "Design Studio",
      location: "Austin, TX",
      salary_range: "$70k - $95k",
      experience_level: "Junior",
      job_type: "Full-time",
      applicants_count: 67,
      posted_days_ago: 5,
      required_skills: ["React", "CSS", "JavaScript", "UI/UX"],
      skillVector: [0.7, 0.9, 0.2, 0.1, 0.0, 0.1, 0.2, 0.8],
      description: "Create beautiful user interfaces"
    }
  ];
}

function calculatePlacementReadiness(userSkills: any[], jobRequiredSkills: string[]) {
  const matchedSkills = jobRequiredSkills.filter(required => 
    userSkills.some(userSkill => 
      userSkill.skill_name.toLowerCase() === required.toLowerCase() && 
      userSkill.mastery_score > 0.5
    )
  );
  return Math.round((matchedSkills.length / jobRequiredSkills.length) * 100);
}

async function callOpenAI(prompt: string): Promise<string> {
  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          { 
            role: 'system', 
            content: 'You are an advanced AI career advisor and quiz creator specializing in personalized learning and career guidance. Apply data science principles and machine learning concepts. Always return valid, minified JSON responses only.' 
          },
          { role: 'user', content: prompt }
        ],
        max_completion_tokens: 2500,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenAI API error response:', errorText);
      if (response.status === 429) {
        console.log('Rate limited, returning fallback data');
        return generateFallbackResponse(prompt);
      }
      throw new Error(`OpenAI API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    return data.choices[0].message.content;
  } catch (error) {
    console.error('OpenAI call failed:', error);
    return generateFallbackResponse(prompt);
  }
}

function generateFallbackResponse(prompt: string): string {
  if (prompt.includes('generate_roadmap')) {
    return JSON.stringify([
      {
        week_number: 1,
        title: "Foundation Building",
        description: "Start with core programming concepts and tools",
        topics: ["Programming Basics", "Version Control", "Development Environment"],
        estimated_hours: 10,
        status: "not_started",
        skills_focus: ["JavaScript", "Git", "VS Code"],
        difficulty_progression: "Beginner",
        prerequisites: "Basic computer knowledge",
        personalized_notes: "Focus on hands-on practice to build confidence"
      },
      {
        week_number: 2,
        title: "Web Development Fundamentals",
        description: "Learn HTML, CSS, and JavaScript basics",
        topics: ["HTML Structure", "CSS Styling", "JavaScript Basics"],
        estimated_hours: 12,
        status: "not_started",
        skills_focus: ["HTML", "CSS", "JavaScript"],
        difficulty_progression: "Beginner",
        prerequisites: "Week 1 completion",
        personalized_notes: "Practice building small projects to reinforce learning"
      }
    ]);
  } else if (prompt.includes('generate_job_matches')) {
    return JSON.stringify([
      {
        title: "Junior Frontend Developer",
        company: "Tech Startup",
        location: "Remote",
        salary_range: "$50k - $70k",
        experience_level: "Entry-level",
        job_type: "Full-time",
        applicants_count: 45,
        posted_days_ago: 2,
        required_skills: ["HTML", "CSS", "JavaScript", "React"],
        match_score: 65,
        missing_skills: ["React", "Git"],
        placement_readiness: 60,
        personalized_description: "Great entry-level opportunity to start your career",
        growth_potential: "High potential for learning and advancement"
      }
    ]);
  } else if (prompt.includes('generate_quiz')) {
    return JSON.stringify([
      {
        question_text: "What is a fundamental concept in this module?",
        options: {
          a: "Option A",
          b: "Option B",
          c: "Option C",
          d: "Option D"
        },
        correct_answer: "c"
      }
    ]);
  } else {
    return JSON.stringify({
      learning_velocity: 8,
      strength_areas: ["Problem Solving", "Quick Learner"],
      improvement_areas: ["Advanced Concepts", "Project Experience"],
      recommendations: [
        {
          title: "Start with Fundamentals",
          description: "Focus on building a strong foundation in programming basics",
          priority: "High"
        }
      ],
      next_milestone: "Complete first coding project",
      estimated_placement_readiness: 35
    });
  }
}