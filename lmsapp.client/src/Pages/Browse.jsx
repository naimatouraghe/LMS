import { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { courseApi } from '@/services/api/courseApi';
import NavbarDesktop from '@/components/layout/NavbarDesktop';
import { CourseCard } from '@/components/CourseCard';
import { Filters } from '@/components/Filters';
import { iconMap } from '@/constants/filters';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';

const Browse = () => {
  const { isAuthenticated, user } = useAuth();
  const [courses, setCourses] = useState([]);
  const [filteredCourses, setFilteredCourses] = useState([]);
  const [userProgress, setUserProgress] = useState({});
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFiltering, setIsFiltering] = useState(false);
  const [error, setError] = useState(null);

  // États des filtres
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedPrice, setSelectedPrice] = useState('all');
  const [selectedSort, setSelectedSort] = useState(null);
  const [selectedLevel, setSelectedLevel] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Séparation du chargement
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [isPurchasedLoading, setIsPurchasedLoading] = useState(false);

  // Chargement initial des cours et catégories
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setIsLoading(true);

        // Charger d'abord les cours achetés si l'utilisateur est connecté
        let purchasedCoursesIds = [];
        if (isAuthenticated) {
          const purchasedCoursesData = await courseApi.getPurchasedCourses();
          // Vérifier si purchasedCoursesData est un tableau
          const purchasedCourses = Array.isArray(purchasedCoursesData)
            ? purchasedCoursesData
            : purchasedCoursesData?.courses || [];

          purchasedCoursesIds = purchasedCourses.map((course) => course.id);
          console.log('Cours achetés:', purchasedCoursesIds); // Pour le débogage
        }

        // Charger tous les cours et les catégories
        const [coursesData, categoriesData] = await Promise.all([
          courseApi.getCourses({
            searchTerm: searchQuery,
            category: selectedCategory,
          }),
          courseApi.getCategories(),
        ]);

        // Filtrer les cours achetés
        const availableCourses = Array.isArray(coursesData)
          ? coursesData.filter(
              (course) => !purchasedCoursesIds.includes(course.id)
            )
          : [];

        console.log('Cours disponibles:', availableCourses.length); // Pour le débogage

        setCourses(availableCourses);
        setFilteredCourses(availableCourses);

        setCategories(
          (Array.isArray(categoriesData) ? categoriesData : []).map(
            (category) => ({
              id: category.id,
              name: category.name,
              countryCode: iconMap[category.name] || 'US',
            })
          )
        );
      } catch (err) {
        console.error('Error fetching initial data:', err);
        setError('Erreur lors du chargement des données');
      } finally {
        setIsInitialLoad(false);
        setIsLoading(false);
      }
    };

    fetchInitialData();
  }, [searchQuery, selectedCategory, isAuthenticated]);

  // Application des filtres
  useEffect(() => {
    if (!courses.length) return;

    const applyFilters = async () => {
      try {
        setIsFiltering(true);
        let filteredData = courses;

        // Filtre par catégorie
        if (selectedCategory) {
          filteredData = filteredData.filter(
            (course) => course.category?.name === selectedCategory
          );
        }

        // Filtre par prix
        if (selectedPrice !== 'all') {
          filteredData = filteredData.filter((course) => {
            if (selectedPrice === 'free') return course.price === 0;
            if (selectedPrice === 'paid') return course.price > 0;
            return true;
          });
        }

        // Filtre par niveau
        if (selectedLevel !== 'all') {
          filteredData = filteredData.filter(
            (course) => course.level === selectedLevel
          );
        }

        // Filtre par recherche
        if (searchQuery) {
          const query = searchQuery.toLowerCase();
          filteredData = filteredData.filter(
            (course) =>
              course.title.toLowerCase().includes(query) ||
              course.description.toLowerCase().includes(query)
          );
        }

        // Tri
        if (selectedSort) {
          filteredData.sort((a, b) => {
            switch (selectedSort) {
              case 'price-asc':
                return a.price - b.price;
              case 'price-desc':
                return b.price - a.price;
              case 'title-asc':
                return a.title.localeCompare(b.title);
              case 'title-desc':
                return b.title.localeCompare(a.title);
              default:
                return 0;
            }
          });
        }

        setFilteredCourses(filteredData);
      } catch (error) {
        console.error('Error applying filters:', error);
      } finally {
        setIsFiltering(false);
      }
    };

    applyFilters();
  }, [
    selectedCategory,
    selectedPrice,
    selectedLevel,
    selectedSort,
    searchQuery,
    courses,
  ]);

  // Handlers des filtres
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

  // Props des filtres mémorisées
  const filterProps = useMemo(
    () => ({
      categories,
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
    }),
    [
      categories,
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
    ]
  );

  // Memoize course cards
  const courseCards = useMemo(
    () =>
      filteredCourses.map((course) => (
        <CourseCard
          key={course.id}
          course={course}
          progress={userProgress[course.id]}
        />
      )),
    [filteredCourses, userProgress]
  );

  if (isInitialLoad) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" color="primary" />
      </div>
    );
  }

  if (error) {
    return <div className="text-red-500 text-center p-4">{error}</div>;
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
            {filteredCourses.length}{' '}
            {filteredCourses.length === 1
              ? 'cours disponible'
              : 'cours disponibles'}{' '}
            à l'achat
          </p>
        </div>

        <div
          className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 
                    ${
                      isFiltering
                        ? 'opacity-60 transition-opacity duration-200'
                        : ''
                    }`}
        >
          {courseCards}
        </div>

        {filteredCourses.length === 0 && (
          <div className="text-center py-12">
            <p className="text-slate-600">
              Aucun cours ne correspond à vos critères
            </p>
          </div>
        )}
      </main>
    </div>
  );
};

export default Browse;
