import { useState, useEffect, useCallback, useMemo } from 'react';
import axiosInstance from '@/utils/axios';
import { useAuth } from '@/contexts/AuthContext';
import NavbarDesktop from '@/components/NavbarDesktop';
import { CourseCard } from '@/components/CourseCard';
import { Filters } from '@/components/Filters';
import { iconMap } from '@/constants/filters';

// Constantes pour les routes API
const API_ROUTES = {
  COURSES: '/Course',
  PURCHASED_COURSES: (userId) => `/Course/${userId}/purchased`,
  CATEGORIES: '/Course/categories',
};

const Browse = () => {
  const { isAuthenticated, user } = useAuth();
  // États existants
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

  // Fonction de tri mémorisée
  const sortCourses = useCallback((coursesToSort, progress) => {
    if (!Array.isArray(coursesToSort)) {
      console.error('coursesToSort is not an array:', coursesToSort);
      return [];
    }

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

  // Chargement initial des données
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setIsLoading(true);

        const [coursesResponse, categoriesResponse] = await Promise.all([
          axiosInstance.get(API_ROUTES.COURSES),
          axiosInstance.get('/Course/categories'),
        ]);

        console.log('Categories API response:', categoriesResponse.data);

        const categoriesData = Array.isArray(categoriesResponse.data)
          ? categoriesResponse.data
          : categoriesResponse.data?.value || [];

        const categoriesWithIcons = categoriesData.map((category) => ({
          id: category.id,
          name: category.name,
          countryCode: iconMap[category.name] || 'US',
        }));

        console.log('Processed categories:', categoriesWithIcons);
        setCategories(categoriesWithIcons);

        let progressMap = {};

        if (isAuthenticated && user?.id) {
          try {
            const purchasedResponse = await axiosInstance.get(
              API_ROUTES.PURCHASED_COURSES(user.id)
            );

            console.log('Purchased response:', purchasedResponse.data);

            const purchasedCourses = Array.isArray(purchasedResponse.data)
              ? purchasedResponse.data
              : [];

            purchasedCourses.forEach((course) => {
              progressMap[course.id] = course.progress || 0;
            });
          } catch (err) {
            console.error('Error fetching purchased courses:', err);
          }
        }

        setUserProgress(progressMap);

        const coursesData = Array.isArray(coursesResponse.data)
          ? coursesResponse.data
          : [];

        const sortedCourses = sortCourses(coursesData, progressMap);
        setCourses(sortedCourses);
        setFilteredCourses(sortedCourses);
      } catch (err) {
        console.error('Error fetching data:', err);
        if (err.response) {
          console.error('API Error response:', err.response.data);
        }
        setError('Erreur lors du chargement des données');
      } finally {
        setIsLoading(false);
      }
    };

    fetchInitialData();
  }, [sortCourses, isAuthenticated, user]);

  // Effet de filtrage
  useEffect(() => {
    if (!courses.length) return;

    const applyFilters = async () => {
      try {
        setIsFiltering(true);

        // Commencer par filtrer les cours non achetés
        let filteredData = courses.filter((course) => !userProgress[course.id]);

        // Filtre par catégorie (langue)
        if (selectedCategory) {
          filteredData = filteredData.filter(
            (course) => course.category?.name === selectedCategory
          );
        }

        // Filtre par prix
        if (selectedPrice && selectedPrice !== 'all') {
          filteredData = filteredData.filter((course) => {
            const price = parseFloat(course.price);
            switch (selectedPrice) {
              case '<30':
                return price < 30;
              case '30-50':
                return price >= 30 && price <= 50;
              case '50-70':
                return price > 50 && price <= 70;
              case '70-90':
                return price > 70 && price <= 90;
              case '>90':
                return price > 90;
              default:
                return true;
            }
          });
        }

        // Filtre par niveau
        if (selectedLevel && selectedLevel !== 'all') {
          filteredData = filteredData.filter((course) => {
            // Convertir le niveau numérique en niveau CEFR
            const levelMap = {
              0: 'A1',
              1: 'A2',
              2: 'B1',
              3: 'B2',
              4: 'C1',
              5: 'C2',
            };
            return levelMap[course.level] === selectedLevel;
          });
        }

        // Filtre par recherche
        if (searchQuery) {
          const query = searchQuery.toLowerCase();
          filteredData = filteredData.filter(
            (course) =>
              course.title?.toLowerCase().includes(query) ||
              course.description?.toLowerCase().includes(query)
          );
        }

        // Tri
        if (selectedSort) {
          filteredData.sort((a, b) => {
            switch (selectedSort) {
              case 'recent':
                return new Date(b.createdAt) - new Date(a.createdAt);
              case 'oldest':
                return new Date(a.createdAt) - new Date(b.createdAt);
              case 'price-asc':
                return parseFloat(a.price) - parseFloat(b.price);
              case 'price-desc':
                return parseFloat(b.price) - parseFloat(a.price);
              default:
                return 0;
            }
          });
        }

        setFilteredCourses(filteredData);
      } catch (err) {
        console.error('Error applying filters:', err);
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
    userProgress,
  ]);

  // Handlers des filtres mémorisés (inchangés)
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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-900" />
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
          <Filters
            categories={categories}
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
