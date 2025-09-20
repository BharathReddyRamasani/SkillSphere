// FILE: src/components/ui/CourseCard.tsx

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Clock, Users, Play, ArrowRight, CheckCircle, Star, BookOpen } from "lucide-react";
import { Link } from "react-router-dom";

export const CourseCard = ({ course, onEnroll }) => {
  return (
    <Card className="p-4 flex flex-col md:flex-row gap-4 transition-all hover:shadow-lg">
      <div className="flex-1">
        <div className="flex justify-between items-start mb-2">
          <div className="flex-1">
            <h3 className="text-lg font-bold hover:text-primary transition-colors">
              <Link to={`/courses/${course.id}`}>{course.title}</Link>
            </h3>
            <p className="text-sm text-muted-foreground">by {course.instructor ?? 'LearnSphere Instructors'}</p>
          </div>
          <div className="flex items-center space-x-2">
             <Badge variant="outline">{course.level ?? 'Intermediate'}</Badge>
             <Badge variant="secondary">{course.category ?? 'Tech'}</Badge>
          </div>
        </div>
        <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{course.description}</p>
        <div className="flex items-center flex-wrap gap-x-4 gap-y-2 text-sm text-muted-foreground">
          <div className="flex items-center">
            <Star className="w-4 h-4 mr-1 text-warning fill-warning" />
            {course.rating ?? '4.5'} ({ (course.students_count ?? 0).toLocaleString() } students)
          </div>
          <div className="flex items-center">
            <Clock className="w-4 h-4 mr-1" /> {course.duration_hours ? `${course.duration_hours} hours` : '20 hours'}
          </div>
          <div className="flex items-center">
            <BookOpen className="w-4 h-4 mr-1" /> {course.modules_count ? `${course.modules_count} modules` : '8 modules'}
          </div>
        </div>
      </div>
      <div className="md:w-52 flex flex-col justify-between items-stretch md:items-end">
        <span className="text-xl font-bold text-primary text-left md:text-right mb-2">Free</span>
        
        {course.enrolled ? (
          <div className="w-full">
            <div className="flex justify-between items-center mb-1">
              <span className="text-xs text-muted-foreground">Progress</span>
              <span className="text-xs font-semibold">{course.progress}%</span>
            </div>
            <Progress value={course.progress} className="mb-2" />
            <Link to={`/courses/${course.id}`} className="w-full">
              <Button className="w-full hero-gradient text-white">
                {course.progress === 100 ? <CheckCircle className="w-4 h-4 mr-2" /> : <Play className="w-4 h-4 mr-2" />}
                {course.progress === 100 ? 'Review' : 'Continue'}
              </Button>
            </Link>
          </div>
        ) : (
          <div className="w-full">
            <Button className="w-full hero-gradient text-white" onClick={() => onEnroll(course.id)}>
              Enroll Now
            </Button>
            <Button variant="outline" className="w-full mt-2" size="sm" asChild>
               <Link to={`/courses/${course.id}`}>Preview</Link>
            </Button>
          </div>
        )}
      </div>
    </Card>
  );
};