import VariantManager from "./VariantManager";
import AttributeManager from "./AttributeManager";
import Skeleton from "./Skeleton";

export default function DetailsStep({
  form,
  formErrors,
  onInputChange,
  variants,
  setVariants,
  attributes,
  setAttributes,
  categories,
  loadingCategories,
  hasMounted,
}) {
  return (
    <>
      <h2 className="text-xl font-semibold">Details</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {["price", "stock"].map((field) => (
          <div key={field}>
            <label className="block text-sm">{field}</label>
            <input
              type="number"
              value={form[field] || ""}
              onChange={(e) => onInputChange(field, e.target.value)}
              className={`w-full border ${formErrors[field] ? "border-red-500" : "border-gray-300"} rounded px-3 py-2`}
            />
            {formErrors[field] && (
              <p className="text-red-500 text-sm">{formErrors[field]}</p>
            )}
          </div>
        ))}
        <div>
          <label className="block text-sm">Condition</label>
          <select
            value={form.condition}
            onChange={(e) => onInputChange("condition", e.target.value)}
            className="w-full border border-gray-300 rounded px-3 py-2"
          >
            <option value="new">New</option>
            <option value="used">Used</option>
          </select>
        </div>
        <div>
          <label className="block text-sm">Category</label>
          {!hasMounted || loadingCategories ? (
            <Skeleton />
          ) : (
            <select
              value={form.category}
              onChange={(e) => onInputChange("category", e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2"
            >
              {categories.map((c) => (
                <option key={c.slug} value={c.slug}>
                  {c.name}
                </option>
              ))}
            </select>
          )}
        </div>
      </div>

      <VariantManager variants={variants} setVariants={setVariants} />
      <AttributeManager attributes={attributes} setAttributes={setAttributes} />
    </>
  );
}