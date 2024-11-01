import { useState } from "react";
import { Search, ChevronDown, X, Filter } from "lucide-react";
import * as Dialog from '@radix-ui/react-dialog';
import * as Tabs from '@radix-ui/react-tabs';

const categories = [
    { name: "Accounting", icon: "📊" },
    { name: "Computer Science", icon: "💻" },
    { name: "Engineering", icon: "⚙️" },
    { name: "Filming", icon: "🎥" },
    { name: "Fitness", icon: "🏃" },
    { name: "Music", icon: "🎵" },
    { name: "Photography", icon: "📸" },
];

const priceRanges = [
    { label: "All Prices", value: "all" },
    { label: "Free", value: "free" },
    { label: "Less than $20", value: "<20" },
    { label: "$20 - $50", value: "20-50" },
    { label: "$50 - $100", value: "50-100" },
    { label: "$100+", value: ">100" },
];

const sortOptions = [
    { label: "Most Recent", value: "recent" },
    { label: "Oldest", value: "oldest" },
    { label: "Price: Low to High", value: "price-asc" },
    { label: "Price: High to Low", value: "price-desc" },
];

export const Filters = ({
    selectedCategory,
    onSelectCategory,
    selectedPrice,
    onSelectPrice,
    selectedSort,
    onSelectSort,
    searchQuery,
    onSearchChange,
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [isCategoryOpen, setIsCategoryOpen] = useState(false);
    const [isPriceOpen, setIsPriceOpen] = useState(false);
    const [isSortOpen, setIsSortOpen] = useState(false);

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
                            value={searchQuery}
                            onChange={(e) => onSearchChange(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 rounded-full border bg-white focus:ring-2 focus:ring-slate-200 transition"
                        />
                    </div>
                    <button
                        onClick={() => setIsOpen(true)}
                        className="flex items-center justify-center w-10 h-10 rounded-full bg-slate-900 text-white"
                    >
                        <Filter className="w-4 h-4" />
                    </button>
                </div>

                {/* Active Filters - Mobile */}
                {(selectedCategory || selectedPrice !== "all" || searchQuery) && (
                    <div className="flex gap-2 overflow-x-auto pb-2 mt-2">
                        {selectedCategory && (
                            <span className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-slate-900 text-white text-sm whitespace-nowrap">
                                {categories.find(c => c.name === selectedCategory)?.icon} {selectedCategory}
                                <button
                                    onClick={() => onSelectCategory(null)}
                                    className="ml-1 hover:text-slate-200"
                                >
                                    ×
                                </button>
                            </span>
                        )}
                        {selectedPrice !== "all" && (
                            <span className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-slate-900 text-white text-sm whitespace-nowrap">
                                {priceRanges.find(p => p.value === selectedPrice)?.label}
                                <button
                                    onClick={() => onSelectPrice("all")}
                                    className="ml-1 hover:text-slate-200"
                                >
                                    ×
                                </button>
                            </span>
                        )}
                    </div>
                )}
            </div>

            {/* Desktop & Tablet View */}
            <div className="hidden md:block space-y-4">
                {/* Search Bar */}
              
                {/* All Filters Row */}
                <div className="flex flex-wrap gap-2">
                    {/* Category Filter */}
                    <div className="relative">
                        <button
                            onClick={() => setIsCategoryOpen(!isCategoryOpen)}
                            className="flex items-center gap-2 px-4 py-2 rounded-full bg-white border hover:bg-slate-50 transition"
                        >
                            <span className="text-sm font-medium">
                                {selectedCategory ? (
                                    <>
                                        <span className="mr-2">
                                            {categories.find(c => c.name === selectedCategory)?.icon}
                                        </span>
                                        {selectedCategory}
                                    </>
                                ) : (
                                    "All Categories"
                                )}
                            </span>
                            <ChevronDown className="w-4 h-4" />
                        </button>
                        {isCategoryOpen && (
                            <>
                                <div 
                                    className="fixed inset-0 z-40" 
                                    onClick={() => setIsCategoryOpen(false)}
                                />
                                <div className="absolute top-full left-0 mt-2 w-56 bg-white rounded-lg shadow-lg border p-2 z-50">
                                    <button
                                        onClick={() => {
                                            onSelectCategory(null);
                                            setIsCategoryOpen(false);
                                        }}
                                        className={`w-full text-left px-3 py-2 rounded-md text-sm transition flex items-center gap-2
                                            ${!selectedCategory ? "bg-slate-100" : "hover:bg-slate-50"}`}
                                    >
                                        <span>🔍</span>
                                        <span>All Categories</span>
                                    </button>
                                    {categories.map((category) => (
                                        <button
                                            key={category.name}
                                            onClick={() => {
                                                onSelectCategory(category.name);
                                                setIsCategoryOpen(false);
                                            }}
                                            className={`w-full text-left px-3 py-2 rounded-md text-sm transition flex items-center gap-2
                                                ${selectedCategory === category.name ? "bg-slate-100" : "hover:bg-slate-50"}`}
                                        >
                                            <span>{category.icon}</span>
                                            <span>{category.name}</span>
                                        </button>
                                    ))}
                                </div>
                            </>
                        )}
                    </div>

                    {/* Price Filter */}
                    <div className="relative">
                        <button
                            onClick={() => setIsPriceOpen(!isPriceOpen)}
                            className="flex items-center gap-2 px-4 py-2 rounded-full bg-white border hover:bg-slate-50 transition"
                        >
                            <span className="text-sm font-medium">
                                {priceRanges.find(p => p.value === selectedPrice)?.label}
                            </span>
                            <ChevronDown className="w-4 h-4" />
                        </button>
                        {isPriceOpen && (
                            <>
                                <div 
                                    className="fixed inset-0 z-40" 
                                    onClick={() => setIsPriceOpen(false)}
                                />
                                <div className="absolute top-full left-0 mt-2 w-48 bg-white rounded-lg shadow-lg border p-2 z-50">
                                    {priceRanges.map((range) => (
                                        <button
                                            key={range.value}
                                            onClick={() => {
                                                onSelectPrice(range.value);
                                                setIsPriceOpen(false);
                                            }}
                                            className={`w-full text-left px-3 py-2 rounded-md text-sm transition
                                                ${selectedPrice === range.value ? "bg-slate-100" : "hover:bg-slate-50"}`}
                                        >
                                            {range.label}
                                        </button>
                                    ))}
                                </div>
                            </>
                        )}
                    </div>

                    {/* Sort Filter */}
                    <div className="relative">
                        <button
                            onClick={() => setIsSortOpen(!isSortOpen)}
                            className="flex items-center gap-2 px-4 py-2 rounded-full bg-white border hover:bg-slate-50 transition"
                        >
                            <span className="text-sm font-medium">
                                {sortOptions.find(s => s.value === selectedSort)?.label}
                            </span>
                            <ChevronDown className="w-4 h-4" />
                        </button>
                        {isSortOpen && (
                            <>
                                <div 
                                    className="fixed inset-0 z-40" 
                                    onClick={() => setIsSortOpen(false)}
                                />
                                <div className="absolute top-full right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border p-2 z-50">
                                    {sortOptions.map((option) => (
                                        <button
                                            key={option.value}
                                            onClick={() => {
                                                onSelectSort(option.value);
                                                setIsSortOpen(false);
                                            }}
                                            className={`w-full text-left px-3 py-2 rounded-md text-sm transition
                                                ${selectedSort === option.value ? "bg-slate-100" : "hover:bg-slate-50"}`}
                                        >
                                            {option.label}
                                        </button>
                                    ))}
                                </div>
                            </>
                        )}
                    </div>
                </div>

                {/* Active Filters */}
                {(selectedCategory || selectedPrice !== "all" || searchQuery) && (
                    <div className="flex flex-wrap gap-2">
                        {selectedCategory && (
                            <span className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-slate-100 text-sm">
                                {categories.find(c => c.name === selectedCategory)?.icon} {selectedCategory}
                                <button
                                    onClick={() => onSelectCategory(null)}
                                    className="ml-1 hover:text-slate-700"
                                >
                                    ×
                                </button>
                            </span>
                        )}
                        {selectedPrice !== "all" && (
                            <span className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-slate-100 text-sm">
                                {priceRanges.find(p => p.value === selectedPrice)?.label}
                                <button
                                    onClick={() => onSelectPrice("all")}
                                    className="ml-1 hover:text-slate-700"
                                >
                                    ×
                                </button>
                            </span>
                        )}
                        {searchQuery && (
                            <span className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-slate-100 text-sm">
                                Search: "{searchQuery}"
                                <button
                                    onClick={() => onSearchChange("")}
                                    className="ml-1 hover:text-slate-700"
                                >
                                    ×
                                </button>
                            </span>
                        )}
                    </div>
                )}
            </div>

            {/* Mobile Filters Bottom Sheet */}
            <Dialog.Root open={isOpen} onOpenChange={setIsOpen}>
                <Dialog.Portal>
                    <Dialog.Overlay className="fixed inset-0 bg-black/40 z-50" />
                    <Dialog.Content className="fixed inset-x-0 bottom-0 z-50 bg-white rounded-t-xl max-h-[85vh] overflow-hidden">
                        <div className="flex items-center justify-between p-4 border-b">
                            <div className="absolute left-1/2 -translate-x-1/2 top-3 w-12 h-1 rounded-full bg-slate-200" />
                            <h3 className="text-lg font-semibold">Filters</h3>
                            <button 
                                onClick={() => setIsOpen(false)}
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
                                    value="sort"
                                    className="flex-1 px-4 py-3 text-sm font-medium text-slate-600 data-[state=active]:text-slate-900 data-[state=active]:border-b-2 data-[state=active]:border-slate-900"
                                >
                                    Sort By
                                </Tabs.Trigger>
                            </Tabs.List>

                            <Tabs.Content value="category" className="p-4 overflow-y-auto">
                                <div className="grid grid-cols-2 gap-2">
                                    <button
                                        onClick={() => {
                                            onSelectCategory(null);
                                            setIsOpen(false);
                                        }}
                                        className={`flex flex-col items-center gap-2 p-4 rounded-xl border transition
                                            ${!selectedCategory ? "bg-slate-100 border-slate-900" : "hover:bg-slate-50"}`}
                                    >
                                        <span className="text-2xl">🔍</span>
                                        <span className="text-sm font-medium">All Categories</span>
                                    </button>
                                    {categories.map((category) => (
                                        <button
                                            key={category.name}
                                            onClick={() => {
                                                onSelectCategory(category.name);
                                                setIsOpen(false);
                                            }}
                                            className={`flex flex-col items-center gap-2 p-4 rounded-xl border transition
                                                ${selectedCategory === category.name ? "bg-slate-100 border-slate-900" : "hover:bg-slate-50"}`}
                                        >
                                            <span className="text-2xl">{category.icon}</span>
                                            <span className="text-sm font-medium">{category.name}</span>
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
                                                setIsOpen(false);
                                            }}
                                            className={`w-full flex items-center justify-between p-4 rounded-xl border transition
                                                ${selectedPrice === range.value ? "bg-slate-100 border-slate-900" : "hover:bg-slate-50"}`}
                                        >
                                            <span className="text-sm font-medium">{range.label}</span>
                                            {selectedPrice === range.value && (
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
                                                setIsOpen(false);
                                            }}
                                            className={`w-full flex items-center justify-between p-4 rounded-xl border transition
                                                ${selectedSort === option.value ? "bg-slate-100 border-slate-900" : "hover:bg-slate-50"}`}
                                        >
                                            <span className="text-sm font-medium">{option.label}</span>
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