import { useState, useEffect, useCallback, useMemo } from "react";
import axios from "axios";
import NavbarDesktop from "@/components/NavbarDesktop";
import { CourseCard } from "@/components/CourseCard";
import { Filters } from "@/components/Filters";

const Browse = () => {
    const [courses, setCourses] = useState([]);
    const [filteredCourses, setFilteredCourses] = useState([]);
    const [userProgress, setUserProgress] = useState({});
    const [isLoading, setIsLoading] = useState(true);
    const [isFiltering, setIsFiltering] = useState(false);
    const [error, setError] = useState(null);
    
    // Filter states
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [selectedPrice, setSelectedPrice] = useState("all");
    const [selectedSort, setSelectedSort] = useState(null);
    const [selectedLevel, setSelectedLevel] = useState("all");
    const [searchQuery, setSearchQuery] = useState("");

    // Memoize sort function
    const sortCourses = useCallback((coursesToSort, progress) => {
        return [...coursesToSort].sort((a, b) => {
            const aIsPurchased = progress[a.id] !== undefined;
            const bIsPurchased = progress[b.id] !== undefined;
            
            if (aIsPurchased === bIsPurchased) {
                if (aIsPurchased) {
                    return progress[b.id] - progress[a.id];
                }
                return 0;
            }
            return aIsPurchased ? 1 : -1;
        });
    }, []);

    // Initial data fetch
    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                setIsLoading(true);
                const userId = "28c11eb6-e92f-434e-bf26-c731e3cb5367";
                
                const [coursesResponse, progressResponse] = await Promise.all([
                    axios.get('https://localhost:7001/api/Course/filter'),
                    axios.get(`https://localhost:7001/api/Course/Users/${userId}/purchased`)
                ]);

                const progressMap = {};
                progressResponse.data.forEach(course => {
                    progressMap[course.id] = course.progress;
                });

                setUserProgress(progressMap);
                const sortedCourses = sortCourses(coursesResponse.data, progressMap);
                setCourses(sortedCourses);
                setFilteredCourses(sortedCourses);
            } catch (err) {
                setError("Erreur lors du chargement des cours");
                console.error(err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchInitialData();
    }, []);

    // Filter effect
    useEffect(() => {
        if (!courses.length) return;

        const applyFilters = async () => {
            try {
                setIsFiltering(true);
                
                const params = new URLSearchParams();
                if (selectedCategory) params.append("category", selectedCategory);
                if (selectedPrice !== "all") params.append("price", selectedPrice);
                if (selectedLevel !== "all") params.append("level", selectedLevel);
                if (searchQuery) params.append("search", searchQuery);
                if (selectedSort) params.append("sort", selectedSort);

                const response = await axios.get(`https://localhost:7001/api/Course/filter?${params}`);
                const sortedCourses = sortCourses(response.data, userProgress);
                setFilteredCourses(sortedCourses);
            } catch (err) {
                console.error("Error applying filters:", err);
            } finally {
                setIsFiltering(false);
            }
        };

        const debounceTimeout = setTimeout(applyFilters, 300);
        return () => clearTimeout(debounceTimeout);
    }, [selectedCategory, selectedPrice, selectedLevel, selectedSort, searchQuery, courses.length]);

    // Memoize filter handlers
    const handleCategoryChange = useCallback((category) => {
        setSelectedCategory(category);
    }, []);

    const handlePriceChange = useCallback((price) => {
        setSelectedPrice(price);
    }, []);

    const handleSortChange = useCallback((sort) => {
        setSelectedSort(sort);
    }, []);

    const handleLevelChange = useCallback((level) => {
        setSelectedLevel(level);
    }, []);

    const handleSearchChange = useCallback((query) => {
        setSearchQuery(query);
    }, []);

    // Memoize filter props
    const filterProps = useMemo(() => ({
        selectedCategory,
        onSelectCategory: handleCategoryChange,
        selectedPrice,
        onSelectPrice: handlePriceChange,
        selectedSort,
        onSelectSort: handleSortChange,
        selectedLevel,
        onSelectLevel: handleLevelChange,
        searchQuery,
        onSearchChange: handleSearchChange,
    }), [
        selectedCategory,
        selectedPrice,
        selectedSort,
        selectedLevel,
        searchQuery,
        handleCategoryChange,
        handlePriceChange,
        handleSortChange,
        handleLevelChange,
        handleSearchChange,
    ]);

    // Memoize course cards
    const courseCards = useMemo(() => (
        filteredCourses.map((course) => (
            <CourseCard 
                key={course.id} 
                course={course} 
                progress={userProgress[course.id]}
            />
        ))
    ), [filteredCourses, userProgress]);

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
        <div className="min-h-screen bg-slate-50">
            <div className="hidden md:block">
                <NavbarDesktop />
            </div>
            
            <main className="container mx-auto px-4 py-8">
                <h1 className="text-3xl font-bold text-slate-800 mb-8">
                    Explorez nos cours
                </h1>

                <div className="mb-8">
                    <Filters {...filterProps} />
                </div>

                <div className="mb-6">
                    <p className="text-slate-600">
                        {filteredCourses.length} {filteredCourses.length === 1 ? "cours trouvé" : "cours trouvés"}
                        {" "}({filteredCourses.filter(course => userProgress[course.id] === undefined).length} disponibles à l'achat)
                    </p>
                </div>

                <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 
                    ${isFiltering ? 'opacity-60 transition-opacity duration-200' : ''}`}>
                    {courseCards}
                </div>

                {filteredCourses.length === 0 && (
                    <div className="text-center py-12">
                        <p className="text-slate-600">Aucun cours ne correspond à vos critères</p>
                    </div>
                )}
            </main>
        </div>
    );
};

export default Browse;