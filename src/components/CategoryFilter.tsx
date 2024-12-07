import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { PRODUCT_CATEGORIES, ProductCategory } from '../types';

interface CategoryFilterProps {
  selectedCategory: ProductCategory | 'all';
  onCategoryChange: (category: ProductCategory | 'all') => void;
}

export default function CategoryFilter({ selectedCategory, onCategoryChange }: CategoryFilterProps) {
  const allCategories = ['all', ...PRODUCT_CATEGORIES];
  const currentIndex = allCategories.indexOf(selectedCategory);

  const handlePrevious = () => {
    const newIndex = currentIndex > 0 ? currentIndex - 1 : allCategories.length - 1;
    onCategoryChange(allCategories[newIndex] as ProductCategory | 'all');
  };

  const handleNext = () => {
    const newIndex = currentIndex < allCategories.length - 1 ? currentIndex + 1 : 0;
    onCategoryChange(allCategories[newIndex] as ProductCategory | 'all');
  };

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={handlePrevious}
        className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg md:hidden"
      >
        <ChevronLeft className="w-4 h-4" />
      </button>

      <div className="flex gap-2 overflow-x-auto pb-2 -mx-2 px-2 md:flex-wrap">
        <button
          onClick={() => onCategoryChange('all')}
          className={`px-3 py-1.5 rounded-lg text-sm whitespace-nowrap transition-colors ${
            selectedCategory === 'all'
              ? 'bg-green-100 text-green-800'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          All Categories
        </button>
        {PRODUCT_CATEGORIES.map((category) => (
          <button
            key={category}
            onClick={() => onCategoryChange(category)}
            className={`px-3 py-1.5 rounded-lg text-sm whitespace-nowrap transition-colors ${
              selectedCategory === category
                ? 'bg-green-100 text-green-800'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {category}
          </button>
        ))}
      </div>

      <button
        onClick={handleNext}
        className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg md:hidden"
      >
        <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  );
}