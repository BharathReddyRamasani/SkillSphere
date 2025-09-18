// import { usePersonalizedData } from "@/hooks/usePersonalizedData";
// import { useEffect, useState, useMemo } from "react";
// import { supabase } from "@/integrations/supabase/client";
// import Navigation from "@/components/Navigation";
// import { Card } from "@/components/ui/card";
// import { Button } from "@/components/ui/button";
// import { Badge } from "@/components/ui/badge";
// import { Progress } from "@/components/ui/progress";
// import { Input } from "@/components/ui/input";
// import { Link } from "react-router-dom";
// import { 
//   BookOpen, 
//   Play, 
//   Clock, 
//   Users, 
//   Star, 
//   CheckCircle,
//   ArrowRight,
//   Filter,
//   Search,
//   Brain,
//   Code,
//   Database,
//   Smartphone,
//   Globe,
//   BarChart3
// } from "lucide-react";

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
//   icon: any;
//   color: string;
//   enrolled?: boolean;
//   progress?: number;
// }

// const Courses = () => {
//   const [allCourses, setAllCourses] = useState<Course[]>([]);
//   const [loading, setLoading] = useState(true);
//   const { user, enrollments, enrollInCourse } = usePersonalizedData();

//   // Define category icons
//   const categoryIcons: { [key: string]: { icon: any; color: string } } = {
//     Frontend: { icon: Globe, color: "text-blue-500" },
//     Backend: { icon: Code, color: "text-green-500" },
//     Database: { icon: Database, color: "text-emerald-500" },
//     "AI/ML": { icon: Brain, color: "text-purple-500" },
//     "Full Stack": { icon: Code, color: "text-indigo-500" },
//     "CS Fundamentals": { icon: BarChart3, color: "text-orange-500" },
//   };

//   useEffect(() => {
//     const fetchCourses = async () => {
//       setLoading(true);
//       const { data, error } = await supabase.from('courses').select('*').order('created_at', { ascending: true });
//       if (error) {
//         console.log('Failed to load courses from DB:', error.message);
//       }
//       if (data) {
//         // Map database courses to include icons and colors
//         const coursesWithIcons = data.map((course: any) => ({
//           ...course,
//           icon: categoryIcons[course.category]?.icon || BookOpen,
//           color: categoryIcons[course.category]?.color || "text-gray-500",
//         }));
//         setAllCourses(coursesWithIcons);
//       }
//       setLoading(false);
//     };
//     fetchCourses();
//   }, []);

//   const coursesWithProgress = useMemo(() => {
//     return allCourses.map(course => {
//       const userEnrollment = enrollments.find(e => e.course_id === course.id);
//       return {
//         ...course,
//         enrolled: !!userEnrollment,
//         progress: userEnrollment ? Math.round(userEnrollment.progress_percentage || 0) : 0,
//       };
//     });
//   }, [allCourses, enrollments]);

//   const enrolledCourses = coursesWithProgress.filter(c => c.enrolled);
//   const recommendedCourses = coursesWithProgress.filter(c => !c.enrolled).slice(0, 3);

//   const categories = [
//     { name: "All Courses", count: coursesWithProgress.length, active: true },
//     { name: "Frontend", count: coursesWithProgress.filter(c => c.category === "Frontend").length, active: false },
//     { name: "Backend", count: coursesWithProgress.filter(c => c.category === "Backend").length, active: false },
//     { name: "Database", count: coursesWithProgress.filter(c => c.category === "Database").length, active: false },
//     { name: "AI/ML", count: coursesWithProgress.filter(c => c.category === "AI/ML").length, active: false },
//   ];

//   return (
//     <div className="min-h-screen bg-background">
//       <Navigation />
      
//       <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
//         {/* Header */}
//         <div className="mb-8">
//           <h1 className="text-4xl font-bold mb-2 flex items-center">
//             <BookOpen className="mr-3 w-10 h-10 text-primary" />
//             Course <span className="text-gradient ml-2">Library</span>
//           </h1>
//           <p className="text-muted-foreground">
//             Comprehensive B.Tech courses designed for placement readiness
//           </p>
//         </div>

//         {/* My Learning Section */}
//         {enrolledCourses.length > 0 && (
//           <div className="mb-12">
//             <h2 className="text-2xl font-semibold mb-6">Continue Learning</h2>
//             <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
//               {enrolledCourses.map((course) => (
//                 <Card key={course.id} className="learning-card p-6 hover:shadow-elevated transition-all">
//                   <div className="flex items-start justify-between mb-4">
//                     <div className={`w-12 h-12 rounded-lg bg-gradient-to-r from-primary/20 to-accent/20 flex items-center justify-center`}>
//                       <course.icon className={`w-6 h-6 ${course.color}`} />
//                     </div>
//                     <Badge variant={course.progress === 100 ? "default" : "secondary"}>
//                       {course.progress === 100 ? "Completed" : `${course.progress}%`}
//                     </Badge>
//                   </div>
                  
//                   <h3 className="text-lg font-semibold mb-2">{course.title}</h3>
//                   <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
//                     {course.description}
//                   </p>

//                   <div className="space-y-3">
//                     <Progress value={course.progress} />
//                     <div className="flex items-center justify-between text-sm text-muted-foreground">
//                       <span>{course.progress}% Complete</span>
//                       <span>{course.modules} modules</span>
//                     </div>
//                   </div>

//                   <Button asChild className="w-full mt-4 hero-gradient text-white">
//                     <Link to={`/courses/${course.id}`}>
//                       {course.progress === 100 ? "Review Course" : "Continue Learning"}
//                       <ArrowRight className="w-4 h-4 ml-2" />
//                     </Link>
//                   </Button>
//                 </Card>
//               ))}
//             </div>
//           </div>
//         )}

//         {/* AI Recommendations */}
//         <div className="mb-12">
//           <div className="flex items-center justify-between mb-6">
//             <h2 className="text-2xl font-semibold flex items-center">
//               <Brain className="w-6 h-6 mr-2 text-primary ai-pulse" />
//               AI Recommended for You
//             </h2>
//             <Button variant="outline" size="sm">View All</Button>
//           </div>
//           <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
//             {recommendedCourses.map((course) => (
//               <Card key={course.id} className="learning-card p-6 border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-accent/5">
//                 <div className="flex items-start justify-between mb-4">
//                   <div className={`w-12 h-12 rounded-lg hero-gradient flex items-center justify-center`}>
//                     <course.icon className="w-6 h-6 text-white" />
//                   </div>
//                   <Badge className="bg-gradient-to-r from-primary to-accent text-white">
//                     Recommended
//                   </Badge>
//                 </div>
                
//                 <h3 className="text-lg font-semibold mb-2">{course.title}</h3>
//                 <p className="text-sm text-muted-foreground mb-4">
//                   Based on your learning patterns and career goals
//                 </p>

//                 <div className="flex items-center space-x-4 text-sm text-muted-foreground mb-4">
//                   <div className="flex items-center">
//                     <Star className="w-4 h-4 mr-1 text-warning fill-warning" />
//                     {course.rating}
//                   </div>
//                   <div className="flex items-center">
//                     <Users className="w-4 h-4 mr-1" />
//                     {course.students.toLocaleString()}
//                   </div>
//                   <div className="flex items-center">
//                     <Clock className="w-4 h-4 mr-1" />
//                     {course.duration}
//                   </div>
//                 </div>

//                 <div className="flex flex-wrap gap-1 mb-4">
//                   {course.skills.slice(0, 3).map((skill, index) => (
//                     <Badge key={index} variant="outline" className="text-xs">
//                       {skill}
//                     </Badge>
//                   ))}
//                 </div>

//                 <div className="flex items-center justify-between">
//                   <span className="text-lg font-bold text-primary">{course.price}</span>
//                   <Button 
//                     size="sm" 
//                     className="hero-gradient text-white"
//                     onClick={() => enrollInCourse(course.id)}
//                   >
//                     Enroll Now
//                   </Button>
//                 </div>
//               </Card>
//             ))}
//           </div>
//         </div>

//         {/* Search and Filter */}
//         <div className="mb-8">
//           <div className="flex flex-col md:flex-row gap-4 mb-6">
//             <div className="flex-1 relative">
//               <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
//               <Input placeholder="Search courses..." className="pl-10" />
//             </div>
//             <Button variant="outline">
//               <Filter className="w-4 h-4 mr-2" />
//               Filters
//             </Button>
//           </div>

//           <div className="flex flex-wrap gap-2">
//             {categories.map((category, index) => (
//               <Button
//                 key={index}
//                 variant={category.active ? "default" : "outline"}
//                 size="sm"
//                 className={category.active ? "hero-gradient text-white" : ""}
//               >
//                 {category.name}
//                 <Badge variant="secondary" className="ml-2 text-xs">
//                   {category.count}
//                 </Badge>
//               </Button>
//             ))}
//           </div>
//         </div>

//         {/* All Courses */}
//         <div>
//           <h2 className="text-2xl font-semibold mb-6">All Courses</h2>
//           {loading ? (
//             <p className="text-muted-foreground">Loading courses...</p>
//           ) : coursesWithProgress.length === 0 ? (
//             <Card className="p-6"><p className="text-muted-foreground">No courses available yet.</p></Card>
//           ) : (
//             <div className="grid gap-6">
//               {coursesWithProgress.map((course) => (
//                 <Card key={course.id} className="learning-card p-6">
//                   <div className="flex flex-col lg:flex-row gap-6">
//                     <div className="flex-1">
//                       <div className="flex items-start space-x-4">
//                         <div className={`w-16 h-16 rounded-xl hero-gradient flex items-center justify-center flex-shrink-0`}>
//                           <course.icon className="w-8 h-8 text-white" />
//                         </div>
                        
//                         <div className="flex-1">
//                           <div className="flex items-start justify-between mb-2">
//                             <div>
//                               <h3 className="text-xl font-semibold mb-1">{course.title}</h3>
//                               <p className="text-muted-foreground">by {course.instructor}</p>
//                             </div>
//                             <div className="flex items-center space-x-2">
//                               <Badge variant="outline">{course.level}</Badge>
//                               <Badge variant="secondary">{course.category}</Badge>
//                             </div>
//                           </div>
                          
//                           <p className="text-muted-foreground mb-4">{course.description}</p>
                          
//                           <div className="flex items-center space-x-6 text-sm text-muted-foreground mb-4">
//                             <div className="flex items-center">
//                               <Star className="w-4 h-4 mr-1 text-warning fill-warning" />
//                               {course.rating} ({course.students.toLocaleString()} students)
//                             </div>
//                             <div className="flex items-center">
//                               <Clock className="w-4 h-4 mr-1" />
//                               {course.duration}
//                             </div>
//                             <div className="flex items-center">
//                               <BookOpen className="w-4 h-4 mr-1" />
//                               {course.modules} modules
//                             </div>
//                           </div>

//                           <div className="flex flex-wrap gap-2">
//                             {course.skills.map((skill, index) => (
//                               <Badge key={index} variant="outline" className="text-xs">
//                                 {skill}
//                               </Badge>
//                             ))}
//                           </div>
//                         </div>
//                       </div>
//                     </div>

//                     <div className="lg:w-48 flex flex-col justify-between">
//                       <div className="text-center lg:text-right">
//                         <div className="text-2xl font-bold text-primary mb-2">{course.price}</div>
//                         {course.enrolled && (
//                           <div className="mb-4">
//                             <Progress value={course.progress} className="mb-2" />
//                             <p className="text-sm text-muted-foreground">{course.progress}% complete</p>
//                           </div>
//                         )}
//                       </div>
                      
//                       <div className="space-y-2">
//                         {course.enrolled ? (
//                           <Button asChild className="w-full hero-gradient text-white">
//                             <Link to={`/courses/${course.id}`}>
//                               {course.progress === 100 ? (
//                                 <>
//                                   <CheckCircle className="w-4 h-4 mr-2" />
//                                   Completed
//                                 </>
//                               ) : (
//                                 <>
//                                   <Play className="w-4 h-4 mr-2" />
//                                   Continue
//                                 </>
//                               )}
//                             </Link>
//                           </Button>
//                         ) : (
//                           <>
//                             <Button 
//                               className="w-full hero-gradient text-white"
//                               onClick={() => enrollInCourse(course.id)}
//                             >
//                               Enroll Now
//                             </Button>
//                             <Button asChild variant="outline" className="w-full" size="sm">
//                               <Link to={`/courses/${course.id}`}>Preview</Link>
//                             </Button>
//                           </>
//                         )}
//                       </div>
//                     </div>
//                   </div>
//                 </Card>
//               ))}
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Courses;

// FILE: src/pages/Courses.tsx

import { useEffect, useState, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { usePersonalizedData } from "@/hooks/usePersonalizedData";
import { CourseCard } from "@/components/ui/CourseCard"; // We will only use this to render courses
import Navigation from "@/components/Navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { BookOpen, Filter, Search, Loader2 } from "lucide-react";

const Courses = () => {
  const [allCourses, setAllCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  const { enrollments, enrollInCourse } = usePersonalizedData();

  useEffect(() => {
    const fetchCourses = async () => {
      setLoading(true);
      const { data, error } = await supabase.from('courses').select('*').order('created_at');
      
      if (error) {
        console.error("Error fetching courses:", error);
      } else {
        setAllCourses(data || []);
      }
      
      setLoading(false);
    };
    fetchCourses();
  }, []);

  const filteredCourses = useMemo(() => {
    // This merges your database courses with the user's specific progress
    const coursesWithProgress = allCourses.map(course => {
      const userEnrollment = enrollments.find(e => e.course_id === course.id);
      return {
        ...course,
        enrolled: !!userEnrollment,
        progress: userEnrollment ? Math.round(userEnrollment.progress_percentage || 0) : 0,
      };
    });

    if (!searchTerm) {
      return coursesWithProgress;
    }

    // This filters the list based on the search term
    return coursesWithProgress.filter(course =>
      course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (course.description && course.description.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [allCourses, enrollments, searchTerm]);

  const enrolledCourses = filteredCourses.filter(c => c.enrolled);
  const availableCourses = filteredCourses.filter(c => !c.enrolled);

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <header className="mb-8">
          <h1 className="text-4xl font-bold mb-2 flex items-center">
            <BookOpen className="mr-3 w-10 h-10 text-primary" />
            Course <span className="text-gradient ml-2">Library</span>
          </h1>
          <p className="text-muted-foreground">
            All courses are free. Enroll today and start your journey to placement readiness.
          </p>
        </header>

        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input 
              placeholder="Search by title or description..." 
              className="pl-10" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button variant="outline">
            <Filter className="w-4 h-4 mr-2" />
            Filters
          </Button>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
             <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : (
          <>
            {enrolledCourses.length > 0 && (
              <section className="mb-12">
                <h2 className="text-2xl font-semibold mb-6">Continue Learning</h2>
                <div className="grid gap-6">
                  {enrolledCourses.map(course => (
                    <CourseCard key={course.id} course={course} onEnroll={enrollInCourse} />
                  ))}
                </div>
              </section>
            )}

            <section>
              <h2 className="text-2xl font-semibold mb-6">Available Courses</h2>
              {availableCourses.length > 0 ? (
                <div className="grid gap-6">
                  {availableCourses.map(course => (
                    <CourseCard key={course.id} course={course} onEnroll={enrollInCourse} />
                  ))}
                </div>
              ) : (
                 <p className="text-muted-foreground">No available courses match your search.</p>
              )}
            </section>
          </>
        )}
      </div>
    </div>
  );
};

export default Courses;