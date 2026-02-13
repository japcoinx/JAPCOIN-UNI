
import React, { useState, useEffect } from 'react';
import { Course } from '../types';
import Button from './Button';

interface CourseCardProps {
  course: Course;
  onEnroll: (id: number) => void;
}

const CourseCard: React.FC<CourseCardProps> = ({ course, onEnroll }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [visualProgress, setVisualProgress] = useState(0);

  useEffect(() => {
    // Trigger animation on mount or update
    const timer = setTimeout(() => {
      setVisualProgress(course.progress || 0);
    }, 100);
    return () => clearTimeout(timer);
  }, [course.progress]);

  return (
    <div className="bg-jap-card rounded-lg overflow-hidden border border-white/5 hover:border-jap-gold/50 transition-all duration-300 hover:shadow-[0_0_20px_rgba(212,175,55,0.15)] flex flex-col h-full group relative">
      <div className="relative h-48 overflow-hidden">
        <img 
          src={course.image} 
          alt={course.title} 
          className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700 ease-out will-change-transform"
        />
        
        {/* Subtle Gold Overlay on Hover */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-jap-gold/10 transition-colors duration-500 pointer-events-none" />

        <div className="absolute top-2 right-2 bg-black/80 backdrop-blur text-jap-gold text-xs font-bold px-2 py-1 rounded border border-jap-gold/20 z-10">
          +{course.reward} JAP
        </div>
        <div className="absolute bottom-2 left-2 bg-jap-gold text-black text-xs font-bold px-2 py-1 rounded z-10">
          {course.level}
        </div>
      </div>
      
      <div className="p-5 flex-1 flex flex-col">
        <h3 className="text-xl font-bold text-white mb-2">{course.title}</h3>
        
        <div 
          className="flex-1 mb-4 cursor-pointer group/desc"
          onMouseEnter={() => setIsExpanded(true)}
          onMouseLeave={() => setIsExpanded(false)}
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <p className={`text-gray-400 text-sm transition-all duration-200 ${isExpanded ? '' : 'line-clamp-2'}`}>
            {course.description}
          </p>
        </div>
        
        <div className="flex items-center justify-between text-xs text-gray-500 mb-4 mt-auto">
          <span className="flex items-center">
            <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {course.duration}
          </span>
          <span>{course.progress !== undefined ? `${course.progress}% Complete` : 'Not Started'}</span>
        </div>

        {course.progress !== undefined && course.progress > 0 ? (
          <div className="w-full bg-gray-700 rounded-full h-2 mb-4">
            <div 
              className="bg-jap-gold h-2 rounded-full transition-all duration-1000 ease-out" 
              style={{ width: `${visualProgress}%` }}
            ></div>
          </div>
        ) : null}

        <Button 
          variant={course.progress !== undefined ? 'outline' : 'primary'} 
          fullWidth
          onClick={() => onEnroll(course.id)}
        >
          {course.progress !== undefined ? (course.progress === 100 ? 'Review' : 'Continue Learning') : 'Enroll Now'}
        </Button>
      </div>
    </div>
  );
};

export default CourseCard;
