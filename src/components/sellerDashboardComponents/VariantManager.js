import { Trash2, PlusCircle } from "lucide-react";

export default function VariantManager({ variants, setVariants }) {
  const handleVariantChange = (index, key, value) => {
    setVariants((prev) => {
      const updated = [...prev];
      updated[index][key] = value;
      return updated;
    });
  };

  const addVariant = () => {
    setVariants([...variants, { name: "", values: [""] }]);
  };

  const removeVariant = (index) => {
    setVariants((prev) => prev.filter((_, i) => i !== index));
  };

  const addVariantValue = (variantIndex) => {
    setVariants((prev) => {
      const updated = [...prev];
      updated[variantIndex].values.push("");
      return updated;
    });
  };

  const removeVariantValue = (variantIndex, valueIndex) => {
    setVariants((prev) => {
      const updated = [...prev];
      updated[variantIndex].values = updated[variantIndex].values.filter(
        (_, i) => i !== valueIndex
      );
      return updated;
    });
  };

  const handleVariantValueChange = (variantIndex, valueIndex, newValue) => {
    setVariants((prev) => {
      const updated = [...prev];
      updated[variantIndex].values[valueIndex] = newValue;
      return updated;
    });
  };

  return (
    <div className="mt-6">
      <h3 className="font-semibold mb-2">Variants (Custom Attributes)</h3>
      {variants.map((v, idx) => (
        <div key={idx} className="mb-4 border rounded p-2">
          <div className="flex items-center gap-2 mb-2">
            <input
              value={v.name}
              onChange={(e) => handleVariantChange(idx, "name", e.target.value)}
              placeholder="Attribute Name (e.g., Color)"
              className="flex-1 border border-gray-300 rounded px-2 py-1"
            />
            <button
              type="button"
              onClick={() => removeVariant(idx)}
              className="text-red-500"
            >
              <Trash2 />
            </button>
          </div>

          {v.values.map((val, valIdx) => (
            <div key={valIdx} className="flex gap-2 mb-1">
              <input
                value={val}
                onChange={(e) =>
                  handleVariantValueChange(idx, valIdx, e.target.value)
                }
                placeholder="Value"
                className="flex-1 border border-gray-300 rounded px-2 py-1"
              />
              <button
                type="button"
                onClick={() => removeVariantValue(idx, valIdx)}
                className="text-red-500"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={() => addVariantValue(idx)}
            className="flex items-center gap-1 text-blue-600 mt-1"
          >
            <PlusCircle size={16} /> Add Value
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={addVariant}
        className="flex items-center gap-1 text-blue-600 mt-2"
      >
        <PlusCircle size={18} /> Add Variant
      </button>
    </div>
  );
}