import Skeleton from "../../../../components/sellerDashboardComponents/Skeleton";
import { ChevronDown } from "lucide-react";

export default function CategorySelector({
  form,
  formErrors,
  handleInput,
  hasMounted,
  loadingCategories,
  categories,
  selectedCategory
}) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Product Category</h3>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Category <span className="text-red-500">*</span>
          </label>
          
          {!hasMounted || loadingCategories ? (
            <Skeleton className="h-10" />
          ) : (
            <div className="relative">
              <select
                value={form.category}
                onChange={(e) => handleInput("category", e.target.value)}
                className={`w-full border ${
                  formErrors.category ? "border-red-500" : "border-gray-300"
                } rounded-lg px-4 py-3 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none cursor-pointer`}
              >
                <option value="">Choose a product category...</option>
                {categories.map((category) => (
                  <option key={category._id} value={category._id}>
                    {category.name}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
            </div>
          )}
          
          {formErrors.category && (
            <p className="text-red-500 text-sm mt-2 flex items-center gap-1">
              <span className="w-4 h-4 text-red-500">⚠</span>
              {formErrors.category}
            </p>
          )}
        </div>

        {selectedCategory && (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-2">Selected Category</h4>
            <div className="flex items-center justify-between">
              <span className="text-gray-700">{selectedCategory.name}</span>
              <button
                type="button"
                onClick={() => handleInput("category", "")}
                className="text-sm text-blue-600 hover:text-blue-800 font-medium"
              >
                Change Category
              </button>
            </div>
          </div>
        )}

        {!selectedCategory && categories.length > 0 && (
          <div className="text-sm text-gray-600 bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="font-medium text-blue-900 mb-1">Choose the most specific category for your product</p>
            <p>This determines available variation themes and product requirements.</p>
          </div>
        )}
      </div>
    </div>
  );
}