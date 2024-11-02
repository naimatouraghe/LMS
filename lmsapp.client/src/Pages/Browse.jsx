import { useState, useEffect } from 'react';
// ... existing code ...
import  NavbarDesktop  from '@/Components/NavbarDesktop';
import {Filters} from '@/Components/Filters';
import { CourseCard } from '../components/CourseCard';
// ... rest of the file ...
const Browse = () => {
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedCategory, setSelectedCategory] = useState('');
    const [selectedPrice, setSelectedPrice] = useState('');
    const [selectedSort, setSelectedSort] = useState('');
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        const fetchCourses = async () => {
            try {
                const response = await fetch('https://localhost:7001/api/Course');
                const data = await response.json();
                setCourses(data);
            } catch (error) {
                console.error('Error fetching courses:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchCourses();
    }, []);

    // Filtrer les cours en fonction des critères sélectionnés
    const filteredCourses = courses.filter(course => {
        // Filtre par catégorie
        if (selectedCategory && course.category.id !== selectedCategory) {
            return false;
        }

        // Filtre par prix
        if (selectedPrice === 'free' && course.price !== 0) {
            return false;
        }
        if (selectedPrice === 'paid' && course.price === 0) {
            return false;
        }

        // Filtre par recherche
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            return (
                course.title.toLowerCase().includes(query) ||
                course.description.toLowerCase().includes(query) ||
                course.category.name.toLowerCase().includes(query)
            );
        }

        return true;
    });

    // Trier les cours
    const sortedCourses = [...filteredCourses].sort((a, b) => {
        switch (selectedSort) {
            case 'title':
                return a.title.localeCompare(b.title);
            case 'price_low':
                return (a.price || 0) - (b.price || 0);
            case 'price_high':
                return (b.price || 0) - (a.price || 0);
            default:
                return 0;
        }
    });

    if (loading) {
        return <div>Chargement...</div>;
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
                        searchQuery={searchQuery}
                        onSearchChange={setSearchQuery}
                    />
                </div>

                {/* Grille de cours */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {sortedCourses.map((course) => (
                        <CourseCard
                            key={course.id}
                            course={course}
                        />
                    ))}
                </div>
            </div>
        </>
    );
};

export default Browse;