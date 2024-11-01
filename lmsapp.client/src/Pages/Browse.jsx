import { useState } from "react";
import { Filters } from "@/components/Filters";
import { CourseCard } from "@/components/CourseCard";

const Browse = () => {
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [selectedPrice, setSelectedPrice] = useState("all");
    const [selectedSort, setSelectedSort] = useState("recent");
    const [searchQuery, setSearchQuery] = useState("");

    const courses = [
        // Cours complétés
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
        {
            id: "uuid2",
            title: "Rhythms and Melodies",
            description: "Master the basics of musical rhythm and melody",
            imageUrl: "/path/to/music.jpg",
            price: null,
            isPublished: true,
            categoryId: "cat4",
            category: {
                id: "cat4",
                name: "Music"
            },
            chapters: [
                {
                    id: "chap3",
                    title: "Basic Rhythm",
                    position: 1,
                    isPublished: true,
                    isFree: true,
                    userProgress: [
                        { isCompleted: true, userId: "currentUser" }
                    ]
                },
                {
                    id: "chap4",
                    title: "Melody Composition",
                    position: 2,
                    isPublished: true,
                    isFree: false,
                    userProgress: [
                        { isCompleted: true, userId: "currentUser" }
                    ]
                },
                {
                    id: "chap5",
                    title: "Advanced Concepts",
                    position: 3,
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
    
        // Cours en progression
        {
            id: "uuid3",
            title: "Introduction to Filming",
            description: "Learn the basics of cinematography",
            imageUrl: "/path/to/filming.jpg",
            price: null,
            isPublished: true,
            categoryId: "cat5",
            category: {
                id: "cat5",
                name: "Filming"
            },
            chapters: [
                {
                    id: "chap6",
                    title: "Camera Basics",
                    position: 1,
                    isPublished: true,
                    isFree: true,
                    userProgress: [
                        { isCompleted: true, userId: "currentUser" }
                    ]
                },
                {
                    id: "chap7",
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
                }
            ],
            purchases: [
                { userId: "currentUser" }
            ]
        },
    
        // Cours non achetés
        {
            id: "uuid5",
            title: "Financial Reporting",
            description: "Master financial reporting standards",
            imageUrl: "/path/to/financial.jpg",
            price: 92.00,
            isPublished: true,
            categoryId: "cat1",
            category: {
                id: "cat1",
                name: "Accounting"
            },
            chapters: [
                {
                    id: "chap10",
                    title: "Basics of Financial Reports",
                    position: 1,
                    isPublished: true,
                    isFree: false
                },
                {
                    id: "chap11",
                    title: "Advanced Reporting",
                    position: 2,
                    isPublished: true,
                    isFree: false
                }
            ],
            purchases: []
        },
        {
            id: "uuid6",
            title: "Nature Photography Basics",
            description: "Learn to capture stunning nature photos",
            imageUrl: "/path/to/photography.jpg",
            price: 53.00,
            isPublished: true,
            categoryId: "cat6",
            category: {
                id: "cat6",
                name: "Photography"
            },
            chapters: [
                {
                    id: "chap12",
                    title: "Camera Settings",
                    position: 1,
                    isPublished: true,
                    isFree: true
                },
                {
                    id: "chap13",
                    title: "Composition",
                    position: 2,
                    isPublished: true,
                    isFree: false
                }
            ],
            purchases: []
        },
        {
            id: "uuid7",
            title: "Advanced Web Development",
            description: "Master modern web development techniques",
            imageUrl: "/path/to/webdev.jpg",
            price: 75.00,
            isPublished: true,
            categoryId: "cat7",
            category: {
                id: "cat7",
                name: "Computer Science"
            },
            chapters: [
                {
                    id: "chap14",
                    title: "Modern JavaScript",
                    position: 1,
                    isPublished: true,
                    isFree: true
                },
                {
                    id: "chap15",
                    title: "React Fundamentals",
                    position: 2,
                    isPublished: true,
                    isFree: false
                }
            ],
            purchases: []
        },
        {
            id: "uuid8",
            title: "Yoga for Beginners",
            description: "Start your yoga journey",
            imageUrl: "/path/to/yoga.jpg",
            price: 45.00,
            isPublished: true,
            categoryId: "cat8",
            category: {
                id: "cat8",
                name: "Fitness"
            },
            chapters: [
                {
                    id: "chap16",
                    title: "Basic Poses",
                    position: 1,
                    isPublished: true,
                    isFree: true
                },
                {
                    id: "chap17",
                    title: "Breathing Techniques",
                    position: 2,
                    isPublished: true,
                    isFree: false
                }
            ],
            purchases: []
        },
        {
            id: "uuid9",
            title: "Digital Marketing Essentials",
            description: "Learn the fundamentals of digital marketing",
            imageUrl: "/path/to/marketing.jpg",
            price: 65.00,
            isPublished: true,
            categoryId: "cat9",
            category: {
                id: "cat9",
                name: "Marketing"
            },
            chapters: [
                {
                    id: "chap18",
                    title: "Marketing Basics",
                    position: 1,
                    isPublished: true,
                    isFree: true
                },
                {
                    id: "chap19",
                    title: "Social Media Strategy",
                    position: 2,
                    isPublished: true,
                    isFree: false
                }
            ],
            purchases: []
        },
        {
            id: "uuid10",
            title: "Guitar Mastery",
            description: "From beginner to advanced guitar techniques",
            imageUrl: "/path/to/guitar.jpg",
            price: 85.00,
            isPublished: true,
            categoryId: "cat4",
            category: {
                id: "cat4",
                name: "Music"
            },
            chapters: [
                {
                    id: "chap20",
                    title: "Basic Chords",
                    position: 1,
                    isPublished: true,
                    isFree: true
                },
                {
                    id: "chap21",
                    title: "Fingerpicking",
                    position: 2,
                    isPublished: true,
                    isFree: false
                }
            ],
            purchases: []
        }
    ];

    // Filtrer les cours
    const filteredCourses = courses.filter(course => {
        // Filtre par catégorie
        if (selectedCategory && course.category.name !== selectedCategory) {
            return false;
        }

        // Filtre par recherche
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            return (
                course.title.toLowerCase().includes(query) ||
                course.description.toLowerCase().includes(query)
            );
        }

        return true;
    }).sort((a, b) => {
        // Logique de tri existante
    });

    return (
        <div className="p-6">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-2xl font-bold">Browse Courses</h1>
                <p className="text-slate-500">
                    Explore our wide range of courses and find what interests you.
                </p>
            </div>

            {/* Filtres */}
            <div className="mb-6">
            <Filters
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
        selectedPrice={selectedPrice}
        onSelectPrice={setSelectedPrice}
        selectedSort={selectedSort}
        onSelectSort={setSelectedSort}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
    />
            </div>

            {/* Grille de cours */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {filteredCourses.map((course) => (
                    <CourseCard
                        key={course.id}
                        {...course}
                        currentUserId="currentUser"
                    />
                ))}
            </div>
        </div>
    );
};
export default Browse;