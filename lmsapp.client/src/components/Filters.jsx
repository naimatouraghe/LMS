import { useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import * as Tabs from '@radix-ui/react-tabs';
import { Search, Filter, ChevronDown, X } from 'lucide-react';
import ReactCountryFlag from 'react-country-flag';
import {
  priceRanges,
  sortOptions,
  levelOptions,
  iconMap,
} from '@/constants/filters';

export const Filters = ({
  selectedCategory,
  onSelectCategory,
  selectedPrice,
  onSelectPrice,
  selectedSort,
  onSelectSort,
  selectedLevel,
  onSelectLevel,
  searchQuery,
  onSearchChange,
  categories,
}) => {
  const [dropdownStates, setDropdownStates] = useState({
    category: false,
    price: false,
    level: false,
    sort: false,
    modal: false,
  });

  const toggleDropdown = (dropdown) => {
    setDropdownStates((prev) => ({
      ...Object.keys(prev).reduce((acc, key) => ({ ...acc, [key]: false }), {}),
      [dropdown]: !prev[dropdown],
    }));
  };

  const closeAllDropdowns = () => {
    setDropdownStates({
      category: false,
      price: false,
      level: false,
      sort: false,
      modal: false,
    });
  };

  const selectedCategoryData = categories?.find(
    (c) => c.name === selectedCategory
  );

  const renderFlag = (language) => {
    const countryCode = iconMap[language];
    return (
      <ReactCountryFlag
        countryCode={countryCode}
        svg
        style={{
          width: '20px',
          height: '20px',
          borderRadius: '50%',
        }}
      />
    );
  };

  return (
    <div className="space-y-4">
      {/* Mobile View */}
      <div className="md:hidden">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search courses..."
              value={searchQuery || ''}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-full border bg-white focus:ring-2 focus:ring-slate-200 transition"
            />
          </div>
          <button
            onClick={() =>
              setDropdownStates({ ...dropdownStates, modal: true })
            }
            className="flex items-center justify-center w-10 h-10 rounded-full bg-white border hover:bg-slate-50"
          >
            <Filter className="w-4 h-4" />
          </button>
        </div>

        {/* Active Filters - Mobile */}
        {(selectedCategory ||
          (selectedPrice && selectedPrice !== 'all') ||
          (selectedLevel && selectedLevel !== 'all') ||
          searchQuery) && (
          <div className="flex gap-2 overflow-x-auto pb-2 mt-2">
            {selectedCategory && (
              <span className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-slate-100 text-sm whitespace-nowrap">
                {renderFlag(selectedCategoryData?.countryCode)}{' '}
                {selectedCategory}
                <span
                  onClick={() => onSelectCategory(null)}
                  className="ml-1 hover:text-slate-700 cursor-pointer"
                >
                  ×
                </span>
              </span>
            )}
            {selectedPrice && selectedPrice !== 'all' && (
              <span className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-slate-100 text-sm whitespace-nowrap">
                {priceRanges.find((p) => p.value === selectedPrice)?.label}
                <span
                  onClick={() => onSelectPrice('all')}
                  className="ml-1 hover:text-slate-700 cursor-pointer"
                >
                  ×
                </span>
              </span>
            )}
            {selectedLevel && selectedLevel !== 'all' && (
              <span className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-slate-100 text-sm whitespace-nowrap">
                {levelOptions.find((l) => l.value === selectedLevel)?.label}
                <span
                  onClick={() => onSelectLevel('all')}
                  className="ml-1 hover:text-slate-700 cursor-pointer"
                >
                  ×
                </span>
              </span>
            )}
            {searchQuery && (
              <span className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-slate-100 text-sm whitespace-nowrap">
                Search: "{searchQuery}"
                <span
                  onClick={() => onSearchChange('')}
                  className="ml-1 hover:text-slate-700 cursor-pointer"
                >
                  ×
                </span>
              </span>
            )}
          </div>
        )}
      </div>

      {/* Desktop View */}
      <div className="hidden md:flex items-center gap-2">
        {/* Category Filter */}
        <div className="relative">
          <button
            onClick={() => toggleDropdown('category')}
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-white border hover:bg-slate-50 transition min-w-[140px]"
          >
            {selectedCategory ? (
              <>
                {renderFlag(selectedCategory)}
                <span className="text-sm font-medium">{selectedCategory}</span>
                <span
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectCategory(null);
                  }}
                  className="ml-1 hover:text-slate-700 cursor-pointer"
                >
                  ×
                </span>
              </>
            ) : (
              <>
                <span className="text-sm font-medium">All categories</span>
                <ChevronDown className="w-4 h-4" />
              </>
            )}
          </button>
          {dropdownStates.category && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => closeAllDropdowns()}
              />
              <div className="absolute top-full left-0 mt-2 w-56 bg-white rounded-lg shadow-lg border p-2 z-50">
                <button
                  onClick={() => {
                    onSelectCategory(null);
                    closeAllDropdowns();
                  }}
                  className={`w-full text-left px-3 py-2 rounded-md text-sm transition flex items-center gap-2
                                        ${
                                          !selectedCategory
                                            ? 'bg-slate-100'
                                            : 'hover:bg-slate-50'
                                        }`}
                >
                  <span>🔍</span>
                  <span>All categories</span>
                </button>
                {Array.isArray(categories) &&
                  categories.map((category) => (
                    <button
                      key={category.id}
                      onClick={() => {
                        onSelectCategory(category.name);
                        closeAllDropdowns();
                      }}
                      className="flex items-center gap-3 w-full p-3 hover:bg-slate-50 transition"
                    >
                      {renderFlag(category.name)}
                      <span className="text-sm font-medium">
                        {category.name}
                      </span>
                    </button>
                  ))}
              </div>
            </>
          )}
        </div>

        {/* Price Filter */}
        <div className="relative">
          <button
            onClick={() => toggleDropdown('price')}
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-white border hover:bg-slate-50 transition"
          >
            {selectedPrice && selectedPrice !== 'all' ? (
              <>
                <span className="text-sm font-medium">
                  {priceRanges.find((p) => p.value === selectedPrice)?.label}
                </span>
                <span
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectPrice('all');
                  }}
                  className="ml-1 hover:text-slate-700 cursor-pointer"
                >
                  ×
                </span>
              </>
            ) : (
              <>
                <span className="text-sm font-medium">All prices</span>
                <ChevronDown className="w-4 h-4" />
              </>
            )}
          </button>
          {dropdownStates.price && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => closeAllDropdowns()}
              />
              <div className="absolute top-full right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border p-2 z-50">
                {priceRanges.map((range) => (
                  <button
                    key={range.value}
                    onClick={() => {
                      onSelectPrice(range.value);
                      closeAllDropdowns();
                    }}
                    className={`w-full text-left px-3 py-2 rounded-md text-sm transition
                                            ${
                                              selectedPrice === range.value
                                                ? 'bg-slate-100'
                                                : 'hover:bg-slate-50'
                                            }`}
                  >
                    {range.label}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Level Filter */}
        <div className="relative">
          <button
            onClick={() => toggleDropdown('level')}
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-white border hover:bg-slate-50 transition"
          >
            {selectedLevel && selectedLevel !== 'all' ? (
              <>
                <span className="text-sm font-medium">
                  {levelOptions.find((l) => l.value === selectedLevel)?.label}
                </span>
                <span
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectLevel('all');
                  }}
                  className="ml-1 hover:text-slate-700 cursor-pointer"
                >
                  ×
                </span>
              </>
            ) : (
              <>
                <span className="text-sm font-medium">All levels</span>
                <ChevronDown className="w-4 h-4" />
              </>
            )}
          </button>
          {dropdownStates.level && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => closeAllDropdowns()}
              />
              <div className="absolute top-full right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border p-2 z-50">
                {levelOptions.map((level) => (
                  <button
                    key={level.value}
                    onClick={() => {
                      onSelectLevel(level.value);
                      closeAllDropdowns();
                    }}
                    className={`w-full text-left px-3 py-2 rounded-md text-sm transition
                                            ${
                                              selectedLevel === level.value
                                                ? 'bg-slate-100'
                                                : 'hover:bg-slate-50'
                                            }`}
                  >
                    {level.label}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Sort Filter */}
        <div className="relative">
          <button
            onClick={() => toggleDropdown('sort')}
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-white border hover:bg-slate-50 transition"
          >
            {selectedSort ? (
              <>
                <span className="text-sm font-medium">
                  {sortOptions.find((o) => o.value === selectedSort)?.label}
                </span>
                <span
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectSort(null);
                  }}
                  className="ml-1 hover:text-slate-700 cursor-pointer"
                >
                  ×
                </span>
              </>
            ) : (
              <>
                <span className="text-sm font-medium">Sort</span>
                <ChevronDown className="w-4 h-4" />
              </>
            )}
          </button>
          {dropdownStates.sort && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => closeAllDropdowns()}
              />
              <div className="absolute top-full right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border p-2 z-50">
                {sortOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => {
                      onSelectSort(option.value);
                      closeAllDropdowns();
                    }}
                    className={`w-full text-left px-3 py-2 rounded-md text-sm transition
                                            ${
                                              selectedSort === option.value
                                                ? 'bg-slate-100'
                                                : 'hover:bg-slate-50'
                                            }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Mobile Filters Modal */}
      <Dialog.Root open={dropdownStates.modal} onOpenChange={setDropdownStates}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/40 z-50" />
          <Dialog.Content className="fixed inset-x-0 bottom-0 z-50 bg-white rounded-t-xl max-h-[85vh] overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b">
              <div className="absolute left-1/2 -translate-x-1/2 top-3 w-12 h-1 rounded-full bg-slate-200" />
              <h3 className="text-lg font-semibold">Filters</h3>
              <button
                onClick={() =>
                  setDropdownStates({ ...dropdownStates, modal: false })
                }
                className="p-2 hover:bg-slate-100 rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <Tabs.Root defaultValue="category" className="h-full">
              <Tabs.List className="flex border-b">
                <Tabs.Trigger
                  value="category"
                  className="flex-1 px-4 py-3 text-sm font-medium text-slate-600 data-[state=active]:text-slate-900 data-[state=active]:border-b-2 data-[state=active]:border-slate-900"
                >
                  Category
                </Tabs.Trigger>
                <Tabs.Trigger
                  value="price"
                  className="flex-1 px-4 py-3 text-sm font-medium text-slate-600 data-[state=active]:text-slate-900 data-[state=active]:border-b-2 data-[state=active]:border-slate-900"
                >
                  Price
                </Tabs.Trigger>
                <Tabs.Trigger
                  value="level"
                  className="flex-1 px-4 py-3 text-sm font-medium text-slate-600 data-[state=active]:text-slate-900 data-[state=active]:border-b-2 data-[state=active]:border-slate-900"
                >
                  Level
                </Tabs.Trigger>
                <Tabs.Trigger
                  value="sort"
                  className="flex-1 px-4 py-3 text-sm font-medium text-slate-600 data-[state=active]:text-slate-900 data-[state=active]:border-b-2 data-[state=active]:border-slate-900"
                >
                  Sort
                </Tabs.Trigger>
              </Tabs.List>

              <Tabs.Content value="category" className="p-4 overflow-y-auto">
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => {
                      onSelectCategory(null);
                      closeAllDropdowns();
                    }}
                    className={`flex flex-col items-center gap-2 p-4 rounded-xl border transition
                                            ${
                                              !selectedCategory
                                                ? 'bg-slate-100 border-slate-900'
                                                : 'hover:bg-slate-50'
                                            }`}
                  >
                    <span className="text-2xl">🔍</span>
                    <span className="text-sm font-medium">All categories</span>
                  </button>
                  {categories.map((category) => (
                    <button
                      key={category.id}
                      onClick={() => {
                        onSelectCategory(category.name);
                        closeAllDropdowns();
                      }}
                      className={`flex flex-col items-center gap-2 p-4 rounded-xl border transition
                                                ${
                                                  selectedCategory ===
                                                  category.name
                                                    ? 'bg-slate-100 border-slate-900'
                                                    : 'hover:bg-slate-50'
                                                }`}
                    >
                      {renderFlag(category.name)}
                      <span className="text-sm font-medium ml-2">
                        {category.name}
                      </span>
                    </button>
                  ))}
                </div>
              </Tabs.Content>

              <Tabs.Content value="price" className="p-4 overflow-y-auto">
                <div className="space-y-2">
                  {priceRanges.map((range) => (
                    <button
                      key={range.value}
                      onClick={() => {
                        onSelectPrice(range.value);
                        closeAllDropdowns();
                      }}
                      className={`w-full flex items-center justify-between p-4 rounded-xl border transition
                                                ${
                                                  selectedPrice === range.value
                                                    ? 'bg-slate-100 border-slate-900'
                                                    : 'hover:bg-slate-50'
                                                }`}
                    >
                      <span className="text-sm font-medium">{range.label}</span>
                      {selectedPrice === range.value && (
                        <span className="text-slate-900">✓</span>
                      )}
                    </button>
                  ))}
                </div>
              </Tabs.Content>

              <Tabs.Content value="level" className="p-4 overflow-y-auto">
                <div className="space-y-2">
                  {levelOptions.map((level) => (
                    <button
                      key={level.value}
                      onClick={() => {
                        onSelectLevel(level.value);
                        closeAllDropdowns();
                      }}
                      className={`w-full flex items-center justify-between p-4 rounded-xl border transition
                                                ${
                                                  selectedLevel === level.value
                                                    ? 'bg-slate-100 border-slate-900'
                                                    : 'hover:bg-slate-50'
                                                }`}
                    >
                      <span className="text-sm font-medium">{level.label}</span>
                      {selectedLevel === level.value && (
                        <span className="text-slate-900">✓</span>
                      )}
                    </button>
                  ))}
                </div>
              </Tabs.Content>

              <Tabs.Content value="sort" className="p-4 overflow-y-auto">
                <div className="space-y-2">
                  {sortOptions.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => {
                        onSelectSort(option.value);
                        closeAllDropdowns();
                      }}
                      className={`w-full flex items-center justify-between p-4 rounded-xl border transition
                                                ${
                                                  selectedSort === option.value
                                                    ? 'bg-slate-100 border-slate-900'
                                                    : 'hover:bg-slate-50'
                                                }`}
                    >
                      <span className="text-sm font-medium">
                        {option.label}
                      </span>
                      {selectedSort === option.value && (
                        <span className="text-slate-900">✓</span>
                      )}
                    </button>
                  ))}
                </div>
              </Tabs.Content>
            </Tabs.Root>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  );
};
