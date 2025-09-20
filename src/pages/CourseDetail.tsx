// // import Navigation from "@/components/Navigation";
// // import { Card } from "@/components/ui/card";
// // import { Button } from "@/components/ui/button";
// // import { Badge } from "@/components/ui/badge";
// // import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
// // import { useEffect, useMemo, useState } from "react";
// // import { useNavigate, useParams } from "react-router-dom";
// // import { supabase } from "@/integrations/supabase/client";
// // import { toast } from "@/components/ui/use-toast";

// // interface Course { id: string; title: string; description?: string | null }
// // interface Module { id: string; course_id: string; title: string; position: number }
// // interface Lesson { id: string; module_id: string; title: string; content: string | null; position: number }

// // const CourseDetail = () => {
// //   const { id } = useParams();
// //   const navigate = useNavigate();
// //   const [course, setCourse] = useState<Course | null>(null);
// //   const [modules, setModules] = useState<Module[]>([]);
// //   const [lessons, setLessons] = useState<Lesson[]>([]);
// //   const [loading, setLoading] = useState(true);
// //   const [enrolled, setEnrolled] = useState(false);

// //   const lessonsByModule = useMemo(() => {
// //     const map: Record<string, Lesson[]> = {};
// //     for (const l of lessons) {
// //       if (!map[l.module_id]) map[l.module_id] = [];
// //       map[l.module_id].push(l);
// //     }
// //     for (const key of Object.keys(map)) map[key].sort((a, b) => a.position - b.position);
// //     return map;
// //   }, [lessons]);

// //   useEffect(() => {
// //     if (!id) return;
// //     (async () => {
// //       try {
// //         setLoading(true);
// // const { data: c } = await supabase.from("courses").select("*").eq("id", id).maybeSingle();
// // const { data: mods } = await supabase.from("modules").select("*").eq("course_id", id).order("position", { ascending: true });
// //         if (!c) {
// //           toast({ title: "Course not found" });
// //           navigate("/courses", { replace: true });
// //           return;
// //         }
// //         setCourse(c as Course);
// //         setModules((mods || []) as Module[]);

// //         let allLessons: Lesson[] = [];
// //         if (mods && mods.length > 0) {
// //           const moduleIds = mods.map((m: any) => m.id);
// //           const { data: lessonsData } = await supabase
// //             .from("lessons")
// //             .select("*")
// //             .in("module_id", moduleIds)
// //             .order("position", { ascending: true });
// //           allLessons = (lessonsData || []) as Lesson[];
// //         }
// //         setLessons(allLessons);

// // const { data: sessionData } = await supabase.auth.getSession();
// //         const userId = sessionData.session?.user.id;
// //         if (userId) {
// //           const { data: enrollment } = await supabase
// //             .from("enrollments")
// //             .select("id")
// //             .eq("user_id", userId)
// //             .eq("course_id", id)
// //             .maybeSingle();
// //           setEnrolled(!!enrollment);
// //         }
// //       } catch (e: any) {
// //         console.error(e);
// //         toast({ title: "Failed to load course", description: e.message });
// //       } finally {
// //         setLoading(false);
// //       }
// //     })();
// //   }, [id, navigate]);

// //   const handleEnroll = async () => {
// //     const { data: { session } } = await supabase.auth.getSession();
// //     if (!session) {
// //       toast({ title: "Please sign in", description: "You need an account to enroll." });
// //       navigate("/auth");
// //       return;
// //     }
// //     try {
// //       const { error } = await supabase.from("enrollments").insert({ user_id: session.user.id, course_id: id });
// //       if (error) throw error;
// //       setEnrolled(true);
// //       toast({ title: "Enrolled", description: "You're enrolled in this course." });
// //     } catch (e: any) {
// //       toast({ title: "Enroll failed", description: e.message });
// //     }
// //   };

// //   const markLessonComplete = async (lessonId: string) => {
// //     const { data: { session } } = await supabase.auth.getSession();
// //     if (!session) return;
// //     try {
// //       const { error } = await supabase
// //         .from("lesson_progress")
// //         .upsert({
// //           user_id: session.user.id,
// //           lesson_id: lessonId,
// //           status: "completed",
// //           completed_at: new Date().toISOString(),
// //         }, { onConflict: "user_id,lesson_id" });
// //       if (error) throw error;
// //       toast({ title: "Marked complete" });
// //     } catch (e: any) {
// //       toast({ title: "Update failed", description: e.message });
// //     }
// //   };

// //   return (
// //     <div className="min-h-screen bg-background">
// //       <Navigation />
// //       <main className="max-w-5xl mx-auto px-4 py-8">
// //         {loading ? (
// //           <p className="text-muted-foreground">Loading...</p>
// //         ) : (
// //           <>
// //             <header className="mb-6">
// //               <h1 className="text-3xl font-bold mb-2">{course?.title}</h1>
// //               <p className="text-muted-foreground mb-4">{course?.description}</p>
// //               {!enrolled ? (
// //                 <Button onClick={handleEnroll}>Enroll</Button>
// //               ) : (
// //                 <Badge variant="secondary">Enrolled</Badge>
// //               )}
// //             </header>

// //             <section>
// //               {modules.length === 0 ? (
// //                 <Card className="p-6">
// //                   <p className="text-muted-foreground">No modules available.</p>
// //                 </Card>
// //               ) : (
// //                 <Accordion type="single" collapsible className="w-full">
// //                   {modules.map((m) => (
// //                     <AccordionItem key={m.id} value={m.id}>
// //                       <AccordionTrigger>
// //                         <div className="flex items-center gap-3">
// //                           <span className="text-sm text-muted-foreground">Module {m.position}</span>
// //                           <span className="font-medium">{m.title}</span>
// //                         </div>
// //                       </AccordionTrigger>
// //                       <AccordionContent>
// //                         <div className="space-y-3">
// //                           {(lessonsByModule[m.id] || []).map((l) => (
// //                             <Card key={l.id} className="p-4 flex items-start justify-between">
// //                               <div>
// //                                 <h3 className="font-medium">{l.title}</h3>
// //                                 <p className="text-sm text-muted-foreground whitespace-pre-line">{l.content || "No content yet."}</p>
// //                               </div>
// //                               <Button size="sm" onClick={() => markLessonComplete(l.id)}>Mark complete</Button>
// //                             </Card>
// //                           ))}
// //                         </div>
// //                       </AccordionContent>
// //                     </AccordionItem>
// //                   ))}
// //                 </Accordion>
// //               )}
// //             </section>
// //           </>
// //         )}
// //       </main>
// //     </div>
// //   );
// // };

// // export default CourseDetail;

// // FILE: src/pages/CourseDetail.tsx
// import { useState, useEffect } from 'react';
// import { useParams, Link } from 'react-router-dom';
// import { supabase } from '@/integrations/supabase/client';
// import { usePersonalizedData } from '@/hooks/usePersonalizedData';
// import Navigation from '@/components/Navigation';
// import { Card } from '@/components/ui/card';
// import { Button } from '@/components/ui/button';
// import { Badge } from '@/components/ui/badge';
// import { Progress } from '@/components/ui/progress';
// import { 
//   BookOpen, 
//   Play, 
//   CheckCircle, 
//   ArrowLeft, 
//   FileText, 
//   Brain,
//   Star,
//   Users,
//   Clock
// } from 'lucide-react';
// import { useToast } from '@/hooks/use-toast';

// interface Course {
//   id: string;
//   title: string;
//   description: string;
//   instructor: string;
//   rating: number;
//   students: number;
//   duration: string;
//   modules: number;
//   level: string;
//   category: string;
//   price: string;
//   skills: string[];
// }

// interface Module {
//   id: string;
//   title: string;
//   position: number;
//   course_id: string;
// }

// interface Quiz {
//   id: string;
//   title: string;
//   quiz_type: 'module_quiz' | 'final_exam';
//   module_id: string | null;
// }

// interface Question {
//   id: string;
//   quiz_id: string;
//   question_text: string;
//   options: { [key: string]: string };
//   correct_answer: string;
// }

// interface QuizAttempt {
//   id: string;
//   quiz_id: string;
//   score: number;
//   completed_at: string;
// }

// const CourseDetail = () => {
//   const { courseId } = useParams<{ courseId: string }>();
//   const { user, enrollments, enrollInCourse, trackLearningActivity } = usePersonalizedData();
//   const [course, setCourse] = useState<Course | null>(null);
//   const [modules, setModules] = useState<Module[]>([]);
//   const [quizzes, setQuizzes] = useState<Quiz[]>([]);
//   const [quizQuestions, setQuizQuestions] = useState<{ [quizId: string]: Question[] }>({});
//   const [quizAttempts, setQuizAttempts] = useState<QuizAttempt[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [selectedQuiz, setSelectedQuiz] = useState<Quiz | null>(null);
//   const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
//   const [userAnswers, setUserAnswers] = useState<{ [questionId: string]: string }>({});
//   const [quizScore, setQuizScore] = useState<number | null>(null);
//   const { toast } = useToast();

//   const enrollment = enrollments.find(e => e.course_id === courseId);
//   const progress = enrollment ? Math.round(enrollment.progress_percentage || 0) : 0;

//   useEffect(() => {
//     const fetchCourseData = async () => {
//       setLoading(true);
//       try {
//         // Fetch course details
//         const { data: courseData, error: courseError } = await supabase
//           .from('courses')
//           .select('*')
//           .eq('id', courseId)
//           .single();
//         if (courseError) throw courseError;
//         setCourse(courseData);

//         // Fetch modules
//         const { data: modulesData, error: modulesError } = await supabase
//           .from('modules')
//           .select('*')
//           .eq('course_id', courseId)
//           .order('position', { ascending: true });
//         if (modulesError) throw modulesError;
//         setModules(modulesData || []);

//         // Fetch quizzes
//         const { data: quizzesData, error: quizzesError } = await supabase
//           .from('quizzes')
//           .select('*')
//           .eq('course_id', courseId);
//         if (quizzesError) throw quizzesError;
//         setQuizzes(quizzesData || []);

//         // Fetch quiz attempts for the user
//         if (user) {
//           const { data: attemptsData, error: attemptsError } = await supabase
//             .from('quiz_attempts')
//             .select('*')
//             .eq('user_id', user.id)
//             .eq('quiz_id', quizzesData?.map(q => q.id) || []);
//           if (attemptsError) throw attemptsError;
//           setQuizAttempts(attemptsData || []);
//         }

//         // Fetch questions for each quiz
//         if (quizzesData?.length) {
//           const { data: questionsData, error: questionsError } = await supabase
//             .from('questions')
//             .select('*')
//             .in('quiz_id', quizzesData.map(q => q.id));
//           if (questionsError) throw questionsError;
//           const questionsByQuiz = questionsData.reduce((acc, question) => {
//             acc[question.quiz_id] = [...(acc[question.quiz_id] || []), question];
//             return acc;
//           }, {} as { [quizId: string]: Question[] });
//           setQuizQuestions(questionsByQuiz);
//         }
//       } catch (error) {
//         console.error('Error fetching course data:', error);
//         toast({ title: "Error", description: "Failed to load course data", variant: "destructive" });
//       } finally {
//         setLoading(false);
//       }
//     };
//     fetchCourseData();
//   }, [courseId, user]);

//   const handleGenerateQuiz = async (moduleId: string) => {
//     if (!user || !courseId) {
//       toast({ title: "Error", description: "You must be logged in to generate a quiz.", variant: "destructive" });
//       return;
//     }
//     try {
//       const { data, error } = await supabase.functions.invoke('ai-personalization', {
//         body: {
//           userId: user.id,
//           action: 'generate_quiz',
//           data: { moduleId, courseId }
//         }
//       });
//       if (error) throw error;
//       const { quizId, questions } = data;
//       setQuizzes([...quizzes, { id: quizId, title: `${modules.find(m => m.id === moduleId)?.title} Quiz`, quiz_type: 'module_quiz', module_id: moduleId }]);
//       setQuizQuestions({ ...quizQuestions, [quizId]: questions });
//       toast({ title: "Success", description: "Quiz generated successfully!", variant: "default" });
//     } catch (error) {
//       console.error('Error generating quiz:', error);
//       toast({ title: "Error", description: "Failed to generate quiz", variant: "destructive" });
//     }
//   };

//   const handleStartQuiz = (quiz: Quiz) => {
//     setSelectedQuiz(quiz);
//     setCurrentQuestionIndex(0);
//     setUserAnswers({});
//     setQuizScore(null);
//   };

//   const handleAnswer = (questionId: string, answer: string) => {
//     setUserAnswers({ ...userAnswers, [questionId]: answer });
//   };

//   const handleSubmitQuiz = async () => {
//     if (!selectedQuiz || !user) return;
//     const questions = quizQuestions[selectedQuiz.id] || [];
//     let correctAnswers = 0;
//     questions.forEach(q => {
//       if (userAnswers[q.id] === q.correct_answer) {
//         correctAnswers++;
//       }
//     });
//     const score = Math.round((correctAnswers / questions.length) * 100);

//     try {
//       const { error } = await supabase.from('quiz_attempts').insert({
//         user_id: user.id,
//         quiz_id: selectedQuiz.id,
//         score
//       });
//       if (error) throw error;
//       setQuizAttempts([...quizAttempts, { id: crypto.randomUUID(), quiz_id: selectedQuiz.id, score, completed_at: new Date().toISOString() }]);
//       setQuizScore(score);
//       await trackLearningActivity({
//         activity_type: 'quiz',
//         title: `${selectedQuiz.title} Attempt`,
//         duration_minutes: 10,
//         accuracy_score: score,
//         skills_practiced: course?.skills || []
//       });
//       toast({ title: "Quiz Submitted", description: `Your score: ${score}%`, variant: "default" });
//     } catch (error) {
//       console.error('Error submitting quiz:', error);
//       toast({ title: "Error", description: "Failed to submit quiz", variant: "destructive" });
//     }
//   };

//   const handleNextQuestion = () => {
//     if (selectedQuiz && currentQuestionIndex < (quizQuestions[selectedQuiz.id]?.length || 0) - 1) {
//       setCurrentQuestionIndex(currentQuestionIndex + 1);
//     } else {
//       handleSubmitQuiz();
//     }
//   };

//   const categoryIcons: { [key: string]: { icon: any; color: string } } = {
//     Frontend: { icon: 'Globe', color: 'text-blue-500' },
//     Backend: { icon: 'Code', color: 'text-green-500' },
//     Database: { icon: 'Database', color: 'text-emerald-500' },
//     'AI/ML': { icon: 'Brain', color: 'text-purple-500' },
//     'Full Stack': { icon: 'Code', color: 'text-indigo-500' },
//     'CS Fundamentals': { icon: 'BarChart3', color: 'text-orange-500' },
//   };

//   if (loading) {
//     return (
//       <div className="min-h-screen bg-background flex items-center justify-center">
//         <p>Loading course details...</p>
//       </div>
//     );
//   }

//   if (!course) {
//     return (
//       <div className="min-h-screen bg-background flex items-center justify-center">
//         <p>Course not found</p>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-background">
//       <Navigation />
//       <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
//         {/* Header */}
//         <div className="mb-8">
//           <Link to="/courses" className="flex items-center text-primary mb-4">
//             <ArrowLeft className="w-5 h-5 mr-2" />
//             Back to Courses
//           </Link>
//           <h1 className="text-4xl font-bold mb-2 flex items-center">
//             <BookOpen className="mr-3 w-10 h-10 text-primary" />
//             {course.title}
//           </h1>
//           <p className="text-muted-foreground mb-4">{course.description}</p>
//           <div className="flex items-center space-x-6 text-sm text-muted-foreground mb-4">
//             <div className="flex items-center">
//               <Star className="w-4 h-4 mr-1 text-warning fill-warning" />
//               {course.rating} ({course.students.toLocaleString()} students)
//             </div>
//             <div className="flex items-center">
//               <Users className="w-4 h-4 mr-1" />
//               by {course.instructor}
//             </div>
//             <div className="flex items-center">
//               <Clock className="w-4 h-4 mr-1" />
//               {course.duration}
//             </div>
//             <Badge variant="outline">{course.level}</Badge>
//             <Badge variant="secondary">{course.category}</Badge>
//           </div>
//           {enrollment ? (
//             <div className="space-y-3">
//               <Progress value={progress} />
//               <p className="text-sm text-muted-foreground">{progress}% Complete</p>
//             </div>
//           ) : (
//             <Button className="hero-gradient text-white" onClick={() => enrollInCourse(courseId!)}>
//               Enroll Now
//             </Button>
//           )}
//         </div>

//         {/* Modules */}
//         <div className="mb-12">
//           <h2 className="text-2xl font-semibold mb-6">Course Modules</h2>
//           <div className="space-y-4">
//             {modules.map((module) => {
//               const quiz = quizzes.find(q => q.module_id === module.id);
//               const attempt = quizAttempts.find(a => a.quiz_id === quiz?.id);
//               return (
//                 <Card key={module.id} className="p-6">
//                   <div className="flex items-center justify-between">
//                     <div className="flex items-center space-x-4">
//                       <FileText className="w-6 h-6 text-primary" />
//                       <div>
//                         <h3 className="text-lg font-semibold">{module.title}</h3>
//                         <p className="text-sm text-muted-foreground">Module {module.position}</p>
//                       </div>
//                     </div>
//                     <div className="space-x-2">
//                       {quiz ? (
//                         <>
//                           {attempt ? (
//                             <Badge variant="default">Score: {attempt.score}%</Badge>
//                           ) : (
//                             <Button size="sm" onClick={() => handleStartQuiz(quiz)}>
//                               Take Quiz
//                             </Button>
//                           )}
//                         </>
//                       ) : (
//                         <Button size="sm" onClick={() => handleGenerateQuiz(module.id)}>
//                           Generate Quiz
//                         </Button>
//                       )}
//                       <Button variant="outline" size="sm" asChild>
//                         <Link to={`/courses/${courseId}/modules/${module.id}`}>View Module</Link>
//                       </Button>
//                     </div>
//                   </div>
//                 </Card>
//               );
//             })}
//           </div>
//         </div>

//         {/* Quiz Modal */}
//         {selectedQuiz && (
//           <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4">
//             <Card className="p-6 max-w-2xl w-full">
//               <h2 className="text-2xl font-semibold mb-4">{selectedQuiz.title}</h2>
//               {quizScore !== null ? (
//                 <div className="text-center">
//                   <h3 className="text-xl font-semibold mb-2">Quiz Completed!</h3>
//                   <p className="text-lg mb-4">Your score: {quizScore}%</p>
//                   <Button onClick={() => setSelectedQuiz(null)}>Close</Button>
//                 </div>
//               ) : (
//                 <>
//                   {quizQuestions[selectedQuiz.id]?.length > 0 && (
//                     <div>
//                       <h3 className="text-lg font-semibold mb-2">
//                         Question {currentQuestionIndex + 1} of {quizQuestions[selectedQuiz.id].length}
//                       </h3>
//                       <p className="mb-4">{quizQuestions[selectedQuiz.id][currentQuestionIndex].question_text}</p>
//                       <div className="space-y-2">
//                         {Object.entries(quizQuestions[selectedQuiz.id][currentQuestionIndex].options).map(([key, value]) => (
//                           <Button
//                             key={key}
//                             variant={userAnswers[quizQuestions[selectedQuiz.id][currentQuestionIndex].id] === key ? "default" : "outline"}
//                             className="w-full text-left justify-start"
//                             onClick={() => handleAnswer(quizQuestions[selectedQuiz.id][currentQuestionIndex].id, key)}
//                           >
//                             {key}. {value}
//                           </Button>
//                         ))}
//                       </div>
//                       <div className="mt-6 flex justify-end">
//                         <Button onClick={handleNextQuestion}>
//                           {currentQuestionIndex < quizQuestions[selectedQuiz.id].length - 1 ? 'Next' : 'Submit'}
//                         </Button>
//                       </div>
//                     </div>
//                   )}
//                 </>
//               )}
//             </Card>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default CourseDetail;
// FILE: src/pages/CourseDetail.tsx
// FILE: src/pages/CourseDetail.tsx
// FILE: src/pages/CourseDetail.tsx

// FILE: src/pages/CourseDetail.tsx
// FILE: src/pages/CourseDetail.tsx
// FILE: src/components/QuizModal.tsx
// FILE: src/pages/CourseDetail.tsx
// FILE: src/pages/CourseDetail.tsx

import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import Navigation from '@/components/Navigation';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Loader2, BrainCircuit, CheckCircle, Trophy, FileText, Video, RotateCw } from 'lucide-react';
import { usePersonalizedData } from '@/hooks/usePersonalizedData';
import { useToast } from "@/hooks/use-toast";
import { QuizModal } from '@/components/QuizModal';

const CourseDetail = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const { user, enrollments, markCourseAsComplete, trackLearningActivity } = usePersonalizedData();
  const { toast } = useToast();

  const [course, setCourse] = useState<any>(null);
  const [modules, setModules] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isQuizModalOpen, setIsQuizModalOpen] = useState(false);
  const [currentQuizData, setCurrentQuizData] = useState<any>(null);
  const [generatingQuiz, setGeneratingQuiz] = useState<string | null>(null);

  const enrollment = enrollments.find(e => e.course_id === courseId);
  const courseProgress = enrollment ? Math.round(enrollment.progress_percentage || 0) : 0;
  const isCompleted = enrollment?.status === 'completed';

  useEffect(() => {
    // This function fetches all the necessary data for the page
    const fetchCourseData = async () => {
      if (!courseId) { setLoading(false); return; }
      setLoading(true);
      try {
        const courseRequest = supabase.from('courses').select('*').eq('id', courseId).single();
        const modulesRequest = supabase.from('modules').select('*').eq('course_id', courseId).order('position');
        const [courseResponse, modulesResponse] = await Promise.all([courseRequest, modulesRequest]);
        setCourse(courseResponse.data);
        setModules(modulesResponse.data || []);
      } catch (error) { console.error("Error fetching course data:", error); setCourse(null); }
      finally { setLoading(false); }
    };
    fetchCourseData();
  }, [courseId]);

  const handleGenerateQuiz = async (moduleId: string, regenerate = false) => {
    // This function remains the same
    if (!user || !courseId) return;
    setGeneratingQuiz(moduleId);
    try {
      const { data, error } = await supabase.functions.invoke('ai-personalization', {
        body: { userId: user.id, action: 'generate_quiz', data: { moduleId, courseId, regenerate } }
      });
      if (error) throw error;
      setCurrentQuizData({ ...data, moduleTitle: modules.find(m => m.id === moduleId)?.title });
      setIsQuizModalOpen(true);
      toast({ title: "Quiz Generated!", description: "Your AI-powered quiz is ready." });
    } catch (error) {
      console.error('Failed to generate quiz:', error);
      toast({ title: "Error", description: (error as Error).message || "Edge Function returned a non-2xx status code", variant: "destructive" });
    } finally {
      setGeneratingQuiz(null);
    }
  };

  const handleQuizSubmit = async (quizId: string, score: number) => {
    // This function remains the same
    if (!user || !quizId) return;
    await supabase.from('quiz_attempts').upsert({ user_id: user.id, quiz_id: quizId, score: score }, { onConflict: 'user_id, quiz_id' });
    toast({ title: "Score Saved!", description: `You scored ${score}%.` });
    await trackLearningActivity({ activity_type: 'quiz', title: `Completed Quiz: ${currentQuizData?.moduleTitle || 'Module Quiz'}`, accuracy_score: score });
  };
  
  const handleMarkAsComplete = () => {
    // This function remains the same
    if (courseProgress < 100) {
      toast({ title: "Course Not Finished", description: "Please complete all lessons and quizzes.", variant: "destructive" });
      return;
    }
    if (courseId) {
      markCourseAsComplete(courseId);
    }
  };

  const handleViewContent = (type: 'PDF' | 'Video') => {
    // This function remains the same
    toast({ title: "Feature Coming Soon!", description: `The functionality to view ${type} content will be added.` });
  };

  if (loading) { return <div className="flex h-screen items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>; }
  if (!course) { return <div>Course not found</div>; }

  return (
    <>
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="max-w-4xl mx-auto px-4 py-8">
          <header className="mb-8">
            <p className="text-primary font-semibold mb-2">{course?.category ?? 'Tech Course'}</p>
            <h1 className="text-4xl font-bold mb-2">{course?.title}</h1>
            <p className="text-muted-foreground text-lg">{course?.description}</p>
          </header>
          
          {/* --- MISSING BUTTONS RESTORED HERE --- */}
          <div className="bg-card border rounded-lg p-4 mb-8 flex flex-col sm:flex-row gap-4 justify-between items-center">
            <div>
              <h3 className="font-semibold">Course Status</h3>
              <p className="text-sm text-muted-foreground">
                {isCompleted ? "You have completed this course!" : `You are at ${courseProgress}% progress.`}
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline"><Trophy className="mr-2 h-4 w-4" /> Start Final Exam</Button>
              <Button onClick={handleMarkAsComplete} disabled={isCompleted}>
                <CheckCircle className="mr-2 h-4 w-4" />
                {isCompleted ? 'Completed' : 'Mark as Complete'}
              </Button>
            </div>
          </div>

          <section>
            <h2 className="text-2xl font-semibold mb-4">Course Modules</h2>
            <Accordion type="single" collapsible className="w-full">
              {modules.map((module) => (
                <AccordionItem key={module.id} value={`item-${module.position}`}>
                  <AccordionTrigger className="text-lg text-left">{`Module ${module.position}: ${module.title}`}</AccordionTrigger>
                  <AccordionContent className="p-4 space-y-4">
                    <p className="text-muted-foreground">Access this module's learning materials below.</p>
                    <div className="flex flex-wrap gap-2">
                      <Button variant="outline" onClick={() => handleViewContent('Video')}><Video className="mr-2 h-4 w-4" /> View Video</Button>
                      <Button variant="outline" onClick={() => handleViewContent('PDF')}><FileText className="mr-2 h-4 w-4" /> View PDF</Button>
                      <Button onClick={() => handleGenerateQuiz(module.id, false)} disabled={!!generatingQuiz}>
                        {generatingQuiz === module.id ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <BrainCircuit className="mr-2 h-4 w-4" />}
                        {generatingQuiz === module.id ? 'Generating...' : 'Start Module Quiz'}
                      </Button>
                      <Button variant="outline" size="icon" onClick={() => handleGenerateQuiz(module.id, true)} disabled={!!generatingQuiz} title="Regenerate Quiz with new questions">
                         <RotateCw className="h-4 w-4" />
                      </Button>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </section>
        </div>
      </div>
      
      <QuizModal
        isOpen={isQuizModalOpen}
        onClose={() => setIsQuizModalOpen(false)}
        quizData={currentQuizData}
        onSubmit={handleQuizSubmit}
      />
    </>
  );
};

export default CourseDetail;
