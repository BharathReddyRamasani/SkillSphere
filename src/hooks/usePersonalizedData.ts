// // FILE: src/hooks/usePersonalizedData.ts
// import { useState, useEffect } from 'react';
// import { supabase } from '@/integrations/supabase/client';
// import { useToast } from '@/hooks/use-toast';

// export interface UserStats {
//   placement_readiness: number;
//   learning_velocity: number;
//   total_learning_hours: number;
//   courses_completed: number;
//   skills_mastered: number;
//   consistency_score: number;
//   dropout_risk: string;
//   engagement_trend: string;
//   id?: string;
//   user_id?: string;
//   last_activity?: string;
//   created_at?: string;
//   updated_at?: string;
// }

// export interface UserSkill {
//   id: string;
//   skill_name: string;
//   level: number;
//   category: string;
//   mastery_score: number;
//   last_practiced: string;
//   decay_rate: number;
//   reinforcement_count: number;
// }

// export interface UserGoal {
//   id: string;
//   goal_type: string;
//   title: string;
//   description: string;
//   target_date: string;
//   status: string;
//   priority: number;
// }

// export interface LearningActivity {
//   id: string;
//   activity_type: string;
//   title: string;
//   duration_minutes: number;
//   accuracy_score: number;
//   difficulty_level: string;
//   skills_practiced: string[];
//   engagement_score: number;
//   completed_at: string;
// }

// export interface AIRecommendation {
//   id: string;
//   recommendation_type: string;
//   title: string;
//   description: string;
//   priority: number;
//   is_active: boolean;
//   metadata: any;
// }

// export interface RoadmapWeek {
//   id: string;
//   week_number: number;
//   title: string;
//   description: string;
//   topics: string[];
//   estimated_hours: number;
//   status: string;
//   skills_focus: string[];
//   completion_percentage: number;
// }

// export interface InterviewSession {
//   id: string;
//   interview_type: string;
//   questions: any;
//   responses: any;
//   overall_score: number;
//   feedback: string;
//   strengths: string[];
//   improvements: string[];
//   duration_minutes: number;
//   completed_at: string;
// }

// export interface UserCourseProgress {
//   user_id: string;
//   course_id: string;
//   course_title: string;
//   course_description: string;
//   total_lessons: number;
//   completed_lessons: number;
//   progress_percentage: number;
//   status: 'in_progress' | 'completed'; // ADD THIS LINE
// }

// export const usePersonalizedData = () => {
//   const [user, setUser] = useState<any>(null);
//   const [profile, setProfile] = useState<any>(null);
//   const [preferences, setPreferences] = useState<any>(null);
//   const [userStats, setUserStats] = useState<UserStats | null>(null);
//   const [skills, setSkills] = useState<UserSkill[]>([]);
//   const [goals, setGoals] = useState<UserGoal[]>([]);
//   const [activities, setActivities] = useState<LearningActivity[]>([]);
//   const [recommendations, setRecommendations] = useState<AIRecommendation[]>([]);
//   const [roadmapWeeks, setRoadmapWeeks] = useState<RoadmapWeek[]>([]);
//   const [interviewSessions, setInterviewSessions] = useState<InterviewSession[]>([]);
//   const [enrollments, setEnrollments] = useState<UserCourseProgress[]>([]);
//   const [loading, setLoading] = useState(true);
//   const { toast } = useToast();

//   useEffect(() => {
//     initializeUser();
//   }, []);

//   const initializeUser = async () => {
//     try {
//       const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();
//       if (authError || !authUser) {
//         setLoading(false);
//         return;
//       }
//       setUser(authUser);
//       const { data: existingStats } = await supabase
//         .from('user_stats')
//         .select('*')
//         .eq('user_id', authUser.id)
//         .single();
//       if (!existingStats) {
//         await initializeNewUser(authUser.id);
//       }
//       await fetchAllUserData(authUser.id);
//     } catch (error) {
//       console.error('Error initializing user:', error);
//       toast({ title: "Error", description: "Failed to load user data", variant: "destructive" });
//     } finally {
//       setLoading(false);
//     }
//   };

//   const initializeNewUser = async (userId: string) => {
//     try {
//       await supabase.functions.invoke('ai-personalization', {
//         body: {
//           userId,
//           action: 'initialize_user',
//           data: {
//             preferences: {
//               learning_style: 'visual',
//               career_focus: 'full-stack-development',
//               experience_level: 'intermediate'
//             }
//           }
//         }
//       });
//     } catch (error) {
//       console.error('Error initializing new user:', error);
//     }
//   };

//   const fetchAllUserData = async (userId: string) => {
//     try {
//       const [
//         profileResponse,
//         preferencesResponse,
//         statsResponse,
//         skillsResponse,
//         goalsResponse,
//         activitiesResponse,
//         recommendationsResponse,
//         roadmapResponse,
//         interviewsResponse,
//         enrollmentsResponse
//       ] = await Promise.all([
//         supabase.from('profiles').select('*').eq('id', userId).single(),
//         supabase.from('user_preferences').select('*').eq('user_id', userId).single(),
//         supabase.from('user_stats').select('*').eq('user_id', userId).single(),
//         supabase.from('user_skills').select('*').eq('user_id', userId),
//         supabase.from('user_goals').select('*').eq('user_id', userId),
//         supabase.from('learning_activities').select('*').eq('user_id', userId).order('completed_at', { ascending: false }).limit(10),
//         supabase.from('ai_recommendations').select('*').eq('user_id', userId).eq('is_active', true),
//         supabase.from('roadmap_weeks').select('*').eq('user_id', userId).order('week_number'),
//         supabase.from('interview_sessions').select('*').eq('user_id', userId).order('completed_at', { ascending: false }).limit(5),
//         supabase.from('user_course_progress').select('*').eq('user_id', userId)
//       ]);

//       setProfile(profileResponse.data);
//       setPreferences(preferencesResponse.data);
//       setUserStats(statsResponse.data);
//       setSkills(skillsResponse.data || []);
//       setGoals(goalsResponse.data || []);
//       setActivities(activitiesResponse.data || []);
//       setRecommendations(recommendationsResponse.data || []);
//       setRoadmapWeeks(roadmapResponse.data || []);
//       setInterviewSessions(interviewsResponse.data || []);
//       setEnrollments(enrollmentsResponse.data || []);
//     } catch (error) {
//       console.error('Error fetching user data:', error);
//     }
//   };

//   const enrollInCourse = async (courseId: string, courseTitle: string) => {
//     if (!user) {
//       toast({ title: "Error", description: "You must be logged in to enroll.", variant: "destructive" });
//       return;
//     }
//     try {
//       const isAlreadyEnrolled = enrollments.some(e => e.course_id === courseId);
//       if (isAlreadyEnrolled) {
//         toast({ title: "Already Enrolled", description: "You are already enrolled in this course." });
//         return;
//       }
//       const { error } = await supabase.from('enrollments').insert({ user_id: user.id, course_id: courseId });
//       if (error) throw error;
//       toast({ title: "Success!", description: "You have successfully enrolled." });
//       await trackLearningActivity({
//         activity_type: 'enrollment',
//         title: `Enrolled in: ${courseTitle}`,
//       });
//       await fetchAllUserData(user.id);
//     } catch (error) {
//       console.error('Error enrolling in course:', error);
//       toast({ title: "Error", description: (error as Error).message || "Could not enroll in the course.", variant: "destructive" });
//     }
//   };

//   const markCourseAsComplete = async (courseId: string) => {
//     if (!user) {
//       toast({ title: "Error", description: "You must be logged in to mark a course as complete.", variant: "destructive" });
//       return;
//     }
//     try {
//       const { error: enrollError } = await supabase
//         .from('enrollments')
//         .update({ status: 'completed' })
//         .eq('user_id', user.id)
//         .eq('course_id', courseId);
//       if (enrollError) throw enrollError;

//       const { error: statsError } = await supabase.rpc('increment_courses_completed', { user_id_param: user.id });
//       if (statsError) throw statsError;

//       toast({ title: "Course Completed!", description: "Congratulations! This will now be reflected on your dashboard." });
//       await fetchAllUserData(user.id);
//     } catch (error) {
//       console.error("Error marking course as complete:", error);
//       toast({ title: "Error", description: "Could not update course status.", variant: "destructive" });
//     }
//   };

//   const generatePersonalizedRoadmap = async () => {
//     if (!user) return;
    
//     try {
//       const { data, error } = await supabase.functions.invoke('ai-personalization', {
//         body: {
//           userId: user.id,
//           action: 'generate_roadmap',
//           data: {}
//         }
//       });

//       if (error) throw error;
      
//       await fetchAllUserData(user.id);
//       toast({
//         title: "Success",
//         description: "Personalized roadmap generated!",
//       });
//     } catch (error) {
//       console.error('Error generating roadmap:', error);
//       toast({
//         title: "Error",
//         description: "Failed to generate roadmap",
//         variant: "destructive",
//       });
//     }
//   };

//   const generateJobMatches = async () => {
//     if (!user) return null;
    
//     try {
//       const { data, error } = await supabase.functions.invoke('ai-personalization', {
//         body: {
//           userId: user.id,
//           action: 'generate_job_matches',
//           data: {}
//         }
//       });

//       if (error) throw error;
//       return data.jobMatches;
//     } catch (error) {
//       console.error('Error generating job matches:', error);
//       return [];
//     }
//   };

//   const generateAIInsights = async () => {
//     if (!user) return null;
    
//     try {
//       const { data, error } = await supabase.functions.invoke('ai-personalization', {
//         body: {
//           userId: user.id,
//           action: 'generate_ai_insights',
//           data: {}
//         }
//       });

//       if (error) throw error;
      
//       await fetchAllUserData(user.id);
//       return data;
//     } catch (error) {
//       console.error('Error generating AI insights:', error);
//       return null;
//     }
//   };

//   const trackLearningActivity = async (activityData: Partial<LearningActivity>) => {
//     if (!user || !activityData.activity_type || !activityData.title) return;

//     try {
//       await supabase.from('learning_activities').insert({
//         user_id: user.id,
//         activity_type: activityData.activity_type,
//         title: activityData.title,
//         duration_minutes: activityData.duration_minutes,
//         accuracy_score: activityData.accuracy_score,
//         difficulty_level: activityData.difficulty_level || 'medium',
//         skills_practiced: activityData.skills_practiced || [],
//         engagement_score: activityData.engagement_score || 50
//       });

//       await supabase.from('user_stats').update({
//         total_learning_hours: (userStats?.total_learning_hours || 0) + (activityData.duration_minutes || 0) / 60,
//         last_activity: new Date().toISOString()
//       }).eq('user_id', user.id);

//       await fetchAllUserData(user.id);
//     } catch (error) {
//       console.error('Error tracking activity:', error);
//     }
//   };

//   const updateProfile = async (updates: {
//     fullName: string;
//     avatarUrl: string;
//     bio: string;
//     careerFocuses: string[]; // Changed from careerFocus
//     interests: string[];
//     skillsToLearn: string[];
//     goals: string[]; // Now accepts an array of goal titles
//   }) => {
//     if (!user) return false;
//     try {
//       // Perform all updates in parallel
//       const [profileResult, prefsResult] = await Promise.all([
//         // 1. Update the 'profiles' table
//         supabase.from('profiles').update({
//           full_name: updates.fullName,
//           avatar_url: updates.avatarUrl,
//           bio: updates.bio,
//         }).eq('id', user.id),

//         // 2. Update the 'user_preferences' table
//         supabase.from('user_preferences').update({
//           career_focuses: updates.careerFocuses, // Changed from careerFocus
//           interests: updates.interests,
//           skills_to_learn: updates.skillsToLearn
//         }).eq('user_id', user.id)
//       ]);

//       if (profileResult.error) throw profileResult.error;
//       if (prefsResult.error) throw prefsResult.error;

//       // 3. Synchronize the 'user_goals' table (delete old, insert new)
//       // This is a robust way to handle lists
//       const { error: deleteError } = await supabase.from('user_goals').delete().eq('user_id', user.id);
//       if (deleteError) throw deleteError;

//       if (updates.goals.length > 0) {
//         const goalsToInsert = updates.goals.map(goalTitle => ({
//           user_id: user.id,
//           title: goalTitle,
//           goal_type: 'career', // Or derive this as needed
//         }));
//         const { error: insertError } = await supabase.from('user_goals').insert(goalsToInsert);
//         if (insertError) throw insertError;
//       }
      
//       // Refresh all user data to show changes immediately
//       await fetchAllUserData(user.id);
//       return true;

//     } catch (error) {
//       console.error("Error updating profile:", error);
//       return false;
//     }
//   };

//   const updateUserPassword = async (newPassword: string) => {
//     const { error } = await supabase.auth.updateUser({ password: newPassword });
//     if (error) {
//       toast({ title: "Error Updating Password", description: error.message, variant: "destructive" });
//       return false;
//     }
//     toast({ title: "Success!", description: "Your password has been updated." });
//     return true;
//   };

//   const addUserSkill = async (skill: { name: string, category: string }) => {
//     if (!user) return false;
//     try {
//       const { error } = await supabase.from('user_skills').insert({
//         user_id: user.id,
//         skill_name: skill.name,
//         level: 1,
//         category: skill.category,
//         mastery_score: 0.1,
//         last_practiced: new Date().toISOString(),
//         decay_rate: 0.01,
//         reinforcement_count: 0
//       });
//       if (error) throw error;
//       toast({ title: "Success!", description: `Added skill: ${skill.name}` });
//       await fetchAllUserData(user.id); // Refresh data
//       return true;
//     } catch (error) {
//       console.error("Error adding skill:", error);
//       toast({ title: "Error", description: "Could not add skill.", variant: "destructive" });
//       return false;
//     }
//   };

//   return {
//     user,
//     profile,
//     preferences,
//     userStats,
//     skills,
//     goals,
//     activities,
//     recommendations,
//     roadmapWeeks,
//     interviewSessions,
//     enrollments,
//     loading,
//     generatePersonalizedRoadmap,
//     generateJobMatches,
//     generateAIInsights,
//     trackLearningActivity,
//     enrollInCourse,
//     markCourseAsComplete,
//     updateProfile,
//     updateUserPassword,
//     addUserSkill,
//     refreshData: () => user && fetchAllUserData(user.id)
//   };
// };

// FILE: src/hooks/usePersonalizedData.ts
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface UserStats {
  placement_readiness: number;
  learning_velocity: number;
  total_learning_hours: number;
  courses_completed: number;
  skills_mastered: number;
  consistency_score: number;
  dropout_risk: string;
  engagement_trend: string;
  id?: string;
  user_id?: string;
  last_activity?: string;
  created_at?: string;
  updated_at?: string;
}

export interface UserSkill {
  id: string;
  skill_name: string;
  level: number;
  category: string;
  mastery_score: number;
  last_practiced: string;
  decay_rate: number;
  reinforcement_count: number;
}

export interface UserGoal {
  id: string;
  goal_type: string;
  title: string;
  description: string;
  target_date: string;
  status: string;
  priority: number;
}

export interface LearningActivity {
  id: string;
  activity_type: string;
  title: string;
  duration_minutes: number;
  accuracy_score: number;
  difficulty_level: string;
  skills_practiced: string[];
  engagement_score: number;
  completed_at: string;
}

export interface AIRecommendation {
  id: string;
  recommendation_type: string;
  title: string;
  description: string;
  priority: number;
  is_active: boolean;
  metadata: any;
}

export interface RoadmapWeek {
  id: string;
  week_number: number;
  title: string;
  description: string;
  topics: string[];
  estimated_hours: number;
  status: string;
  skills_focus: string[];
  completion_percentage: number;
}

export interface InterviewSession {
  id: string;
  interview_type: string;
  questions: any;
  responses: any;
  overall_score: number;
  feedback: string;
  strengths: string[];
  improvements: string[];
  duration_minutes: number;
  completed_at: string;
}

export interface UserCourseProgress {
  user_id: string;
  course_id: string;
  course_title: string;
  course_description: string;
  total_lessons: number;
  completed_lessons: number;
  progress_percentage: number;
  status: 'in_progress' | 'completed'; // ADD THIS LINE
}

export const usePersonalizedData = () => {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [preferences, setPreferences] = useState<any>(null);
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [skills, setSkills] = useState<UserSkill[]>([]);
  const [goals, setGoals] = useState<UserGoal[]>([]);
  const [activities, setActivities] = useState<LearningActivity[]>([]);
  const [recommendations, setRecommendations] = useState<AIRecommendation[]>([]);
  const [roadmapWeeks, setRoadmapWeeks] = useState<RoadmapWeek[]>([]);
  const [interviewSessions, setInterviewSessions] = useState<InterviewSession[]>([]);
  const [enrollments, setEnrollments] = useState<UserCourseProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    initializeUser();
  }, []);

  const initializeUser = async () => {
    try {
      const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();
      if (authError || !authUser) {
        setLoading(false);
        return;
      }
      setUser(authUser);
      const { data: existingStats } = await supabase
        .from('user_stats')
        .select('*')
        .eq('user_id', authUser.id)
        .single();
      if (!existingStats) {
        await initializeNewUser(authUser.id);
      }
      await fetchAllUserData(authUser.id);
    } catch (error) {
      console.error('Error initializing user:', error);
      toast({ title: "Error", description: "Failed to load user data", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const initializeNewUser = async (userId: string) => {
    try {
      await supabase.functions.invoke('ai-personalization', {
        body: {
          userId,
          action: 'initialize_user',
          data: {
            preferences: {
              learning_style: 'visual',
              career_focus: 'full-stack-development',
              experience_level: 'intermediate'
            }
          }
        }
      });
    } catch (error) {
      console.error('Error initializing new user:', error);
    }
  };

  const fetchAllUserData = async (userId: string) => {
    try {
      const [
        profileResponse,
        preferencesResponse,
        statsResponse,
        skillsResponse,
        goalsResponse,
        activitiesResponse,
        recommendationsResponse,
        roadmapResponse,
        interviewsResponse,
        enrollmentsResponse
      ] = await Promise.all([
        supabase.from('profiles').select('*').eq('id', userId).single(),
        supabase.from('user_preferences').select('*').eq('user_id', userId).single(),
        supabase.from('user_stats').select('*').eq('user_id', userId).single(),
        supabase.from('user_skills').select('*').eq('user_id', userId),
        supabase.from('user_goals').select('*').eq('user_id', userId),
        supabase.from('learning_activities').select('*').eq('user_id', userId).order('completed_at', { ascending: false }).limit(10),
        supabase.from('ai_recommendations').select('*').eq('user_id', userId).eq('is_active', true),
        supabase.from('roadmap_weeks').select('*').eq('user_id', userId).order('week_number'),
        supabase.from('interview_sessions').select('*').eq('user_id', userId).order('completed_at', { ascending: false }).limit(5),
        supabase.from('user_course_progress').select('*').eq('user_id', userId)
      ]);

      setProfile(profileResponse.data);
      setPreferences(preferencesResponse.data);
      setUserStats(statsResponse.data);
      setSkills(skillsResponse.data || []);
      setGoals(goalsResponse.data || []);
      setActivities(activitiesResponse.data || []);
      setRecommendations(recommendationsResponse.data || []);
      setRoadmapWeeks(roadmapResponse.data || []);
      setInterviewSessions(interviewsResponse.data || []);
      setEnrollments(enrollmentsResponse.data || []);
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  };

  const enrollInCourse = async (courseId: string, courseTitle: string) => {
    if (!user) {
      toast({ title: "Error", description: "You must be logged in to enroll.", variant: "destructive" });
      return;
    }
    try {
      const isAlreadyEnrolled = enrollments.some(e => e.course_id === courseId);
      if (isAlreadyEnrolled) {
        toast({ title: "Already Enrolled", description: "You are already enrolled in this course." });
        return;
      }
      const { error } = await supabase.from('enrollments').insert({ user_id: user.id, course_id: courseId });
      if (error) throw error;
      toast({ title: "Success!", description: "You have successfully enrolled." });
      await trackLearningActivity({
        activity_type: 'enrollment',
        title: `Enrolled in: ${courseTitle}`,
      });
      await fetchAllUserData(user.id);
    } catch (error) {
      console.error('Error enrolling in course:', error);
      toast({ title: "Error", description: (error as Error).message || "Could not enroll in the course.", variant: "destructive" });
    }
  };

  const markCourseAsComplete = async (courseId: string) => {
    if (!user) {
      toast({ title: "Error", description: "You must be logged in to mark a course as complete.", variant: "destructive" });
      return;
    }
    try {
      const { error: enrollError } = await supabase
        .from('enrollments')
        .update({ status: 'completed' })
        .eq('user_id', user.id)
        .eq('course_id', courseId);
      if (enrollError) throw enrollError;

      const { error: statsError } = await supabase.rpc('increment_courses_completed', { user_id_param: user.id });
      if (statsError) throw statsError;

      toast({ title: "Course Completed!", description: "Congratulations! This will now be reflected on your dashboard." });
      await fetchAllUserData(user.id);
    } catch (error) {
      console.error("Error marking course as complete:", error);
      toast({ title: "Error", description: "Could not update course status.", variant: "destructive" });
    }
  };

  const generatePersonalizedRoadmap = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase.functions.invoke('ai-personalization', {
        body: {
          userId: user.id,
          action: 'generate_roadmap',
          data: {}
        }
      });

      if (error) throw error;
      
      await fetchAllUserData(user.id);
      toast({
        title: "Success",
        description: "Personalized roadmap generated!",
      });
    } catch (error) {
      console.error('Error generating roadmap:', error);
      toast({
        title: "Error",
        description: "Failed to generate roadmap",
        variant: "destructive",
      });
    }
  };

  const generateJobMatches = async () => {
    if (!user) return null;
    
    try {
      const { data, error } = await supabase.functions.invoke('ai-personalization', {
        body: {
          userId: user.id,
          action: 'generate_job_matches',
          data: {}
        }
      });

      if (error) throw error;
      return data.jobMatches;
    } catch (error) {
      console.error('Error generating job matches:', error);
      return [];
    }
  };

  const generateAIInsights = async () => {
    if (!user) return null;
    
    try {
      const { data, error } = await supabase.functions.invoke('ai-personalization', {
        body: {
          userId: user.id,
          action: 'generate_ai_insights',
          data: {}
        }
      });

      if (error) throw error;
      
      await fetchAllUserData(user.id);
      return data;
    } catch (error) {
      console.error('Error generating AI insights:', error);
      return null;
    }
  };

  const trackLearningActivity = async (activityData: Partial<LearningActivity>) => {
    if (!user || !activityData.activity_type || !activityData.title) return;

    try {
      await supabase.from('learning_activities').insert({
        user_id: user.id,
        activity_type: activityData.activity_type,
        title: activityData.title,
        duration_minutes: activityData.duration_minutes,
        accuracy_score: activityData.accuracy_score,
        difficulty_level: activityData.difficulty_level || 'medium',
        skills_practiced: activityData.skills_practiced || [],
        engagement_score: activityData.engagement_score || 50
      });

      await supabase.from('user_stats').update({
        total_learning_hours: (userStats?.total_learning_hours || 0) + (activityData.duration_minutes || 0) / 60,
        last_activity: new Date().toISOString()
      }).eq('user_id', user.id);

      await fetchAllUserData(user.id);
    } catch (error) {
      console.error('Error tracking activity:', error);
    }
  };

  const updateProfile = async (updates: {
    fullName: string;
    avatarUrl: string;
    bio: string;
    careerFocuses: string[]; // Changed from careerFocus
    interests: string[];
    skillsToLearn: string[];
    goals: string[]; // Now accepts an array of goal titles
  }) => {
    if (!user) return false;
    try {
      // Perform all updates in parallel
      const [profileResult, prefsResult] = await Promise.all([
        // 1. Update the 'profiles' table
        supabase.from('profiles').update({
          full_name: updates.fullName,
          avatar_url: updates.avatarUrl,
          bio: updates.bio,
        }).eq('id', user.id),

        // 2. Update the 'user_preferences' table
        supabase.from('user_preferences').update({
          career_focuses: updates.careerFocuses, // Changed from careerFocus
          interests: updates.interests,
          skills_to_learn: updates.skillsToLearn
        }).eq('user_id', user.id)
      ]);

      if (profileResult.error) throw profileResult.error;
      if (prefsResult.error) throw prefsResult.error;

      // 3. Synchronize the 'user_goals' table (delete old, insert new)
      // This is a robust way to handle lists
      const { error: deleteError } = await supabase.from('user_goals').delete().eq('user_id', user.id);
      if (deleteError) throw deleteError;

      if (updates.goals.length > 0) {
        const goalsToInsert = updates.goals.map(goalTitle => ({
          user_id: user.id,
          title: goalTitle,
          goal_type: 'career', // Or derive this as needed
        }));
        const { error: insertError } = await supabase.from('user_goals').insert(goalsToInsert);
        if (insertError) throw insertError;
      }
      
      // Refresh all user data to show changes immediately
      await fetchAllUserData(user.id);
      return true;

    } catch (error) {
      console.error("Error updating profile:", error);
      return false;
    }
  };

  const updateUserPassword = async (newPassword: string) => {
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) {
      toast({ title: "Error Updating Password", description: error.message, variant: "destructive" });
      return false;
    }
    toast({ title: "Success!", description: "Your password has been updated." });
    return true;
  };

  const addUserSkill = async (skill: { name: string, category: string }) => {
    if (!user) return false;
    try {
      const { error } = await supabase.from('user_skills').insert({
        user_id: user.id,
        skill_name: skill.name,
        level: 1,
        category: skill.category,
        mastery_score: 0.1,
        last_practiced: new Date().toISOString(),
        decay_rate: 0.01,
        reinforcement_count: 0
      });
      if (error) throw error;
      toast({ title: "Success!", description: `Added skill: ${skill.name}` });
      await fetchAllUserData(user.id); // Refresh data
      return true;
    } catch (error) {
      console.error("Error adding skill:", error);
      toast({ title: "Error", description: "Could not add skill.", variant: "destructive" });
      return false;
    }
  };

  // Skill Graph Functions
  const fetchGraphData = async () => {
    if (!user) return { nodes: [], links: [], clusters: [] };
    try {
      const { data: graphData, error } = await supabase.functions.invoke('skill-graph-engine', {
        body: { userId: user.id, action: 'get_graph_data' }
      });
      if (error) throw error;
      return graphData;
    } catch (error) {
      console.error('Error fetching graph data:', error);
      return { nodes: [], links: [], clusters: [] };
    }
  };

  const getGraphRecommendations = async () => {
    if (!user) return [];
    try {
      const { data, error } = await supabase.functions.invoke('skill-graph-engine', {
        body: { userId: user.id, action: 'get_recommendations' }
      });
      if (error) throw error;
      return data?.recommendations || [];
    } catch (error) {
      console.error('Error getting recommendations:', error);
      return [];
    }
  };

  const updateSkillMastery = async () => {
    if (!user) return;
    try {
      await supabase.functions.invoke('skill-graph-engine', {
        body: { userId: user.id, action: 'update_skill_mastery' }
      });
      await fetchAllUserData(user.id);
    } catch (error) {
      console.error('Error updating skill mastery:', error);
    }
  };

  return {
    user,
    profile,
    preferences,
    userStats,
    skills,
    goals,
    activities,
    recommendations,
    roadmapWeeks,
    interviewSessions,
    enrollments,
    loading,
    generatePersonalizedRoadmap,
    generateJobMatches,
    generateAIInsights,
    trackLearningActivity,
    enrollInCourse,
    markCourseAsComplete,
    updateProfile,
    updateUserPassword,
    addUserSkill,
    fetchGraphData,
    getGraphRecommendations,
    updateSkillMastery,
    refreshData: () => user && fetchAllUserData(user.id)
  };
};