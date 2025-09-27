import { Plus, Minus, Lock, Star, CheckCircle, AlertTriangle } from "lucide-react";
import Skeleton from "../../../../components/sellerDashboardComponents/Skeleton";

export default function VariationThemeManager({
  form,
  formErrors,
  handleInput,
  categoryVariationThemes,
  requiredVariants,
  loadingVariationThemes,
  handleVariationThemeChange,
  themeValues,
  addThemeValue,
  removeThemeValue
}) {
  const selectedThemes = form.variationTheme || [];
  const availableThemes = categoryVariationThemes.filter(theme => 
    !selectedThemes.includes(theme)
  );

  const addThemeValueHandler = (theme, inputElement) => {
    const value = inputElement.value.trim();
    if (value) {
      addThemeValue(theme, value);
      inputElement.value = '';
      inputElement.focus();
    }
  };

  if (loadingVariationThemes) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <Skeleton className="h-6 w-48 mb-4" />
        <Skeleton className="h-10 mb-4" />
        <div className="space-y-3">
          <Skeleton className="h-8" />
          <Skeleton className="h-8" />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <div className="flex items-center gap-2 mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Variation Themes</h3>
        <span className="text-red-500">*</span>
      </div>

      {/* Required Themes Section */}
      {requiredVariants.length > 0 && (
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <Lock className="w-4 h-4 text-orange-600" />
            <h4 className="font-medium text-orange-900">Required Themes</h4>
          </div>
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
            <p className="text-sm text-orange-800 mb-3">
              These themes are required for this category and have been automatically selected:
            </p>
            <div className="flex flex-wrap gap-2">
              {requiredVariants.map((theme) => (
                <div key={theme} className="flex items-center gap-2 bg-orange-100 border border-orange-300 rounded-lg px-3 py-2">
                  <Star className="w-4 h-4 text-orange-600" />
                  <span className="text-sm font-medium text-orange-900">{theme}</span>
                  <Lock className="w-3 h-3 text-orange-600" />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Theme Selection */}
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Additional Variation Themes
          </label>
          
          {categoryVariationThemes.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {categoryVariationThemes.map((theme) => {
                const isRequired = requiredVariants.includes(theme);
                const isSelected = selectedThemes.includes(theme);
                
                return (
                  <label 
                    key={theme} 
                    className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition-all ${
                      isSelected 
                        ? 'border-blue-500 bg-blue-50' 
                        : 'border-gray-200 bg-white hover:border-gray-300'
                    } ${isRequired ? 'opacity-75' : ''}`}
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      disabled={isRequired}
                      onChange={(e) => {
                        if (isRequired) return;
                        
                        const currentThemes = selectedThemes || [];
                        let newThemes;
                        
                        if (e.target.checked) {
                          newThemes = [...currentThemes, theme];
                        } else {
                          newThemes = currentThemes.filter(t => t !== theme);
                        }
                        
                        handleVariationThemeChange(newThemes);
                      }}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 disabled:opacity-50"
                    />
                    <div className="flex items-center gap-2 flex-1">
                      <span className="text-sm font-medium text-gray-900">{theme}</span>
                      {isRequired && <Lock className="w-3 h-3 text-orange-500" />}
                    </div>
                  </label>
                );
              })}
            </div>
          ) : (
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-yellow-800">
                This category does not have predefined variation themes. 
                You can create custom themes by typing them below.
              </p>
              <input
                type="text"
                placeholder="e.g., Color, Size, Material (press Enter to add)"
                className={`mt-2 w-full border ${
                  formErrors.variationTheme ? "border-red-500" : "border-gray-300"
                } rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    const value = e.target.value.trim();
                    if (value) {
                      const themes = selectedThemes.includes(value) 
                        ? selectedThemes 
                        : [...selectedThemes, value];
                      handleVariationThemeChange(themes);
                      e.target.value = '';
                    }
                  }
                }}
              />
            </div>
          )}
          
          {formErrors.variationTheme && (
            <p className="text-red-500 text-sm mt-2 flex items-center gap-1">
              <AlertTriangle className="w-4 h-4" />
              {formErrors.variationTheme}
            </p>
          )}
        </div>

        {/* Selected Themes Summary */}
        {selectedThemes.length > 0 && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <h5 className="font-medium text-green-900">Selected Themes ({selectedThemes.length})</h5>
            </div>
            <div className="flex flex-wrap gap-2">
              {selectedThemes.map((theme) => (
                <span 
                  key={theme}
                  className={`px-3 py-1 rounded-full text-xs font-medium ${
                    requiredVariants.includes(theme)
                      ? 'bg-orange-100 text-orange-800 border border-orange-300'
                      : 'bg-green-100 text-green-800 border border-green-300'
                  }`}
                >
                  {theme}
                  {requiredVariants.includes(theme) && (
                    <Lock className="w-3 h-3 ml-1 inline" />
                  )}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Theme Values Configuration */}
      {selectedThemes.length > 0 && (
        <div className="mt-8 space-y-6">
          <div className="border-t pt-6">
            <h4 className="text-lg font-medium text-gray-900 mb-4">Configure Theme Values</h4>
            <p className="text-sm text-gray-600 mb-4">
              Add the possible values for each variation theme. These will be combined to create all product variants.
            </p>
          </div>

          {selectedThemes.map((theme) => {
            const currentValues = themeValues[theme] || [];
            const isRequired = requiredVariants.includes(theme);
            
            return (
              <div key={theme} className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-3">
                  <h5 className="font-medium text-gray-800">{theme}</h5>
                  {isRequired && (
                    <div className="flex items-center gap-1 text-xs text-orange-600 bg-orange-100 px-2 py-1 rounded">
                      <Star className="w-3 h-3" />
                      Required
                    </div>
                  )}
                  <span className="text-xs text-gray-500">
                    ({currentValues.length} value{currentValues.length !== 1 ? 's' : ''})
                  </span>
                </div>
                
                {/* Add Value Input */}
                <div className="flex gap-2 mb-3">
                  <input
                    type="text"
                    placeholder={`Add ${theme.toLowerCase()} value (e.g., ${getPlaceholderForTheme(theme)})`}
                    className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        addThemeValueHandler(theme, e.target);
                      }
                    }}
                  />
                  <button
                    type="button"
                    onClick={(e) => {
                      const input = e.target.parentElement.querySelector('input');
                      addThemeValueHandler(theme, input);
                    }}
                    className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-1"
                  >
                    <Plus className="w-4 h-4" />
                    Add
                  </button>
                </div>

                {/* Current Values */}
                {currentValues.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {currentValues.map((value, index) => (
                      <div key={index} className="bg-white border border-gray-300 rounded-lg px-3 py-2 flex items-center gap-2 group">
                        <span className="text-sm text-gray-900">{value}</span>
                        <button
                          type="button"
                          onClick={() => removeThemeValue(theme, value)}
                          className="text-red-500 hover:text-red-700 opacity-0 group-hover:opacity-100 transition-opacity"
                          title={`Remove ${value}`}
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-4 border-2 border-dashed border-gray-300 rounded-lg">
                    <p className="text-sm text-gray-500">
                      No values added yet. Add values to generate variants.
                    </p>
                  </div>
                )}

                {/* Theme Validation */}
                {currentValues.length === 0 && isRequired && (
                  <div className="mt-2 flex items-center gap-1 text-xs text-orange-600">
                    <AlertTriangle className="w-3 h-3" />
                    This required theme needs at least one value
                  </div>
                )}
              </div>
            );
          })}

          {/* Combination Preview */}
          {selectedThemes.every(theme => themeValues[theme]?.length > 0) && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h5 className="font-medium text-blue-900 mb-2">Variant Preview</h5>
              <p className="text-sm text-blue-800 mb-2">
                Your selections will create{' '}
                <span className="font-medium">
                  {selectedThemes.reduce((total, theme) => 
                    total * (themeValues[theme]?.length || 1), 1
                  )}
                </span>{' '}
                unique variants
              </p>
              <div className="text-xs text-blue-700">
                {selectedThemes.map((theme, index) => (
                  <span key={theme}>
                    {themeValues[theme]?.length || 0} {theme.toLowerCase()}
                    {index < selectedThemes.length - 1 ? ' × ' : ''}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// Helper function to provide contextual placeholders
function getPlaceholderForTheme(theme) {
  const placeholders = {
    'Color': 'Red, Blue, Green',
    'Size': 'Small, Medium, Large',
    'Brand': 'Nike, Adidas',
    'Model': 'Pro, Basic, Premium',
    'Material': 'Cotton, Polyester',
    'Style': 'Classic, Modern',
    'Capacity': '16GB, 32GB, 64GB',
    'Connectivity': 'WiFi, Bluetooth',
    'Band Size': '38mm, 42mm, 44mm'
  };
  
  return placeholders[theme] || `${theme} option`;
}