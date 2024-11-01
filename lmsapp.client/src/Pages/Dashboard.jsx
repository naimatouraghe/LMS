import { useState } from "react";
import { CourseCard } from "@/components/CourseCard";
import { Clock, CheckCircle } from "lucide-react";
import NavbarDekstop from "@/Components/NavbarDekstop";
const Dashboard = () => {
    const [courses] = useState([
        // Cours complété
        {
            id: "uuid1",
            title: "Tax Accounting Basics",
            description: "Learn the fundamentals of tax accounting",
            imageUrl: "/path/to/tax-accounting.jpg",
            price: null,
            isPublished: true,
            categoryId: "cat1",
            category: {
                id: "cat1",
                name: "Accounting"
            },
            chapters: [
                {
                    id: "chap1",
                    title: "Introduction",
                    position: 1,
                    isPublished: true,
                    isFree: true,
                    userProgress: [
                        { isCompleted: true, userId: "currentUser" }
                    ]
                },
                {
                    id: "chap2",
                    title: "Basic Concepts",
                    position: 2,
                    isPublished: true,
                    isFree: false,
                    userProgress: [
                        { isCompleted: true, userId: "currentUser" }
                    ]
                }
            ],
            purchases: [
                { userId: "currentUser" }
            ]
        },
        // Cours en progression 1 (50% complété)
        {
            id: "uuid2",
            title: "Introduction to Filming",
            description: "Learn the basics of cinematography",
            imageUrl: "/path/to/filming.jpg",
            price: null,
            isPublished: true,
            categoryId: "cat2",
            category: {
                id: "cat2",
                name: "Filming"
            },
            chapters: [
                {
                    id: "chap3",
                    title: "Camera Basics",
                    position: 1,
                    isPublished: true,
                    isFree: true,
                    userProgress: [
                        { isCompleted: true, userId: "currentUser" }
                    ]
                },
                {
                    id: "chap4",
                    title: "Advanced Techniques",
                    position: 2,
                    isPublished: true,
                    isFree: false,
                    userProgress: [
                        { isCompleted: false, userId: "currentUser" }
                    ]
                }
            ],
            purchases: [
                { userId: "currentUser" }
            ]
        },
        // Cours en progression 2 (30% complété)
        {
            id: "uuid3",
            title: "Structural Design Principles",
            description: "Master the fundamentals of structural engineering",
            imageUrl: "/path/to/structural.jpg",
            price: null,
            isPublished: true,
            categoryId: "cat3",
            category: {
                id: "cat3",
                name: "Engineering"
            },
            chapters: [
                {
                    id: "chap5",
                    title: "Introduction to Structures",
                    position: 1,
                    isPublished: true,
                    isFree: true,
                    userProgress: [
                        { isCompleted: true, userId: "currentUser" }
                    ]
                },
                {
                    id: "chap6",
                    title: "Load Analysis",
                    position: 2,
                    isPublished: true,
                    isFree: false,
                    userProgress: [
                        { isCompleted: false, userId: "currentUser" }
                    ]
                },
                {
                    id: "chap7",
                    title: "Material Properties",
                    position: 3,
                    isPublished: true,
                    isFree: false,
                    userProgress: [
                        { isCompleted: false, userId: "currentUser" }
                    ]
                }
            ],
            purchases: [
                { userId: "currentUser" }
            ]
        },
        // Cours en progression 3 (17% complété)
        {
            id: "uuid4",
            title: "Engineering Basics",
            description: "Foundation course for engineering principles",
            imageUrl: "/path/to/engineering.jpg",
            price: null,
            isPublished: true,
            categoryId: "cat3",
            category: {
                id: "cat3",
                name: "Engineering"
            },
            chapters: [
                {
                    id: "chap8",
                    title: "Engineering Fundamentals",
                    position: 1,
                    isPublished: true,
                    isFree: true,
                    userProgress: [
                        { isCompleted: true, userId: "currentUser" }
                    ]
                },
                {
                    id: "chap9",
                    title: "Mathematics in Engineering",
                    position: 2,
                    isPublished: true,
                    isFree: false,
                    userProgress: [
                        { isCompleted: false, userId: "currentUser" }
                    ]
                },
                {
                    id: "chap10",
                    title: "Physics Applications",
                    position: 3,
                    isPublished: true,
                    isFree: false,
                    userProgress: [
                        { isCompleted: false, userId: "currentUser" }
                    ]
                },
                {
                    id: "chap11",
                    title: "Problem Solving Methods",
                    position: 4,
                    isPublished: true,
                    isFree: false,
                    userProgress: [
                        { isCompleted: false, userId: "currentUser" }
                    ]
                },
                {
                    id: "chap12",
                    title: "Engineering Ethics",
                    position: 5,
                    isPublished: true,
                    isFree: false,
                    userProgress: [
                        { isCompleted: false, userId: "currentUser" }
                    ]
                },
                {
                    id: "chap13",
                    title: "Project Management",
                    position: 6,
                    isPublished: true,
                    isFree: false,
                    userProgress: [
                        { isCompleted: false, userId: "currentUser" }
                    ]
                }
            ],
            purchases: [
                { userId: "currentUser" }
            ]
        }
    ]);

    // Filtrer les cours achetés
    const purchasedCourses = courses.filter(course => 
        course.purchases.some(purchase => purchase.userId === "currentUser")
    );

    // Calculer les statistiques
    const completedCourses = purchasedCourses.filter(course => {
        const completedChapters = course.chapters.filter(chapter =>
            chapter.userProgress?.some(progress =>
                progress.userId === "currentUser" && progress.isCompleted
            )
        ).length;
        return completedChapters === course.chapters.length;
    });

    const inProgressCourses = purchasedCourses.filter(course => {
        const completedChapters = course.chapters.filter(chapter =>
            chapter.userProgress?.some(progress =>
                progress.userId === "currentUser" && progress.isCompleted
            )
        ).length;
        return completedChapters > 0 && completedChapters < course.chapters.length;
    });

    return (
        <>
        <div className="hidden md:block space-y-4">
        <NavbarDekstop/>
        </div>
        <div className="p-1 m-5">
            
            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
               <div className="bg-slate-100 rounded-lg p-4 flex items-center gap-4">
                   <div className="bg-sky-100 p-2 rounded-full">
                       <Clock className="w-6 h-6 text-sky-700" />
                   </div>
                   <div>
                       <p className="font-medium">In Progress</p>
                       <p className="text-slate-500 text-sm">{inProgressCourses.length} courses</p>
                   </div>
               </div>

               <div className="bg-slate-100 rounded-lg p-4 flex items-center gap-4">
                   <div className="bg-emerald-100 p-2 rounded-full">
                       <CheckCircle className="w-6 h-6 text-emerald-700" />
                   </div>
                   <div>
                       <p className="font-medium">Completed</p>
                       <p className="text-slate-500 text-sm">{completedCourses.length} courses</p>
                   </div>
               </div>
           </div>

            {/* All Courses Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {/* Afficher d'abord les cours en progression */}
                {inProgressCourses.map((course) => (
                    <CourseCard
                        key={course.id}
                        {...course}
                        currentUserId="currentUser"
                    />
                ))}
                {/* Puis les cours complétés */}
                {completedCourses.map((course) => (
                    <CourseCard
                        key={course.id}
                        {...course}
                        currentUserId="currentUser"
                    />
                ))}
            </div>
        </div>
        </>
    );
};

export default Dashboard;