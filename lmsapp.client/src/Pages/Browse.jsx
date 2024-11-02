import { useState, useEffect } from "react";
import axios from "axios";
import { Filters } from "../components/Filters";
import { CourseCard } from "../components/CourseCard";
import NavbarDesktop from "@/components/NavbarDesktop";
const Browse = () => {
    const [courses, setCourses] = useState([]);
    const [filteredCourses, setFilteredCourses] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    
    // Filter states
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [selectedPrice, setSelectedPrice] = useState("all");
    const [selectedSort, setSelectedSort] = useState(null);
    const [selectedLevel, setSelectedLevel] = useState("all");
    const [searchQuery, setSearchQuery] = useState("");

    // Fetch courses with filters
    useEffect(() => {
        const fetchCourses = async () => {
            try {
                setIsLoading(true);
                
                // Construct query parameters
                const params = new URLSearchParams();
                if (selectedCategory) params.append("category", selectedCategory);
                if (selectedPrice !== "all") params.append("price", selectedPrice);
                if (selectedLevel !== "all") params.append("level", selectedLevel);
                if (searchQuery) params.append("search", searchQuery);
                if (selectedSort) params.append("sort", selectedSort);

                const response = await axios.get(`https://localhost:7001/api/Course/filter?${params}`);
                setFilteredCourses(response.data);
            } catch (err) {
                setError("Error loading courses");
                console.error(err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchCourses();
    }, [selectedCategory, selectedPrice, selectedLevel, selectedSort, searchQuery]);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-900" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-red-500 text-center p-4">
                {error}
            </div>
        );
    }

    return (
        <>
            <div className="hidden md:block space-y-4">
                <NavbarDesktop />
            </div>
            <div className="p-1">
                {/* Filtres */}
                <div className="mb-6">
            <Filters
                selectedCategory={selectedCategory}
                onSelectCategory={setSelectedCategory}
                selectedPrice={selectedPrice}
                onSelectPrice={setSelectedPrice}
                selectedSort={selectedSort}
                onSelectSort={setSelectedSort}
                selectedLevel={selectedLevel}
                onSelectLevel={setSelectedLevel}
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
            />

            {/* Results count */}
            <div className="mt-6 mb-4">
                <p className="text-slate-600">
                    {filteredCourses.length} {filteredCourses.length === 1 ? "course" : "courses"} found
                </p>
            </div>

            {/* Courses grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredCourses.map((course) => (
                    <CourseCard key={course.id} course={course} />
                ))}
            </div>

            {/* No results message */}
            {filteredCourses.length === 0 && (
                <div className="text-center py-12">
                    <p className="text-slate-600">No courses found matching your criteria</p>
                </div>
            )}
                </div>
            </div>
        </>
    );
};


export default Browse;