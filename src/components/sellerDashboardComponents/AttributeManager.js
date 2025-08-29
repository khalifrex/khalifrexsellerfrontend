import { Trash2, PlusCircle } from "lucide-react";

export default function AttributeManager({ attributes, setAttributes }) {

  const handleAttributeChange = (index, key, value) => {
    setAttributes((prev) => {
      const updated = [...prev];
      updated[index][key] = value;
      return updated;
    });
  };

  const addAttribute = () => {
    setAttributes((prev) => [...prev, { name: "", values: [""] }]);
  };

  const removeAttribute = (index) => {
    setAttributes((prev) => prev.filter((_, i) => i !== index));
  };

  const addAttributeValue = (attrIndex) => {
    setAttributes((prev) => {
      const updated = [...prev];
      updated[attrIndex].values.push("");
      return updated;
    });
  };

  const removeAttributeValue = (attrIndex, valueIndex) => {
    setAttributes((prev) => {
      const updated = [...prev];
      updated[attrIndex].values = updated[attrIndex].values.filter((_, i) => i !== valueIndex);
      return updated;
    });
  };

  const handleAttributeValueChange = (attrIndex, valueIndex, newValue) => {
    setAttributes((prev) => {
      const updated = [...prev];
      updated[attrIndex].values[valueIndex] = newValue;
      return updated;
    });
  };

  return (
    <div className="mt-6">
      <h3 className="font-semibold mb-2">Attributes (Name & Multiple Values)</h3>

      {attributes.map((attr, attrIdx) => (
        <div key={attrIdx} className="mb-4 border rounded p-3">
          <div className="flex items-center gap-2 mb-2">
            <input
              value={attr.name}
              onChange={(e) => handleAttributeChange(attrIdx, "name", e.target.value)}
              placeholder="Attribute Name (e.g., RAM)"
              className="flex-1 border border-gray-300 rounded px-2 py-1"
            />
            <button type="button" onClick={() => removeAttribute(attrIdx)} className="text-red-500">
              <Trash2 size={18} />
            </button>
          </div>

          {attr.values.map((val, valIdx) => (
            <div key={valIdx} className="flex gap-2 mb-1">
              <input
                value={val}
                onChange={(e) => handleAttributeValueChange(attrIdx, valIdx, e.target.value)}
                placeholder="Value (e.g., 16GB)"
                className="flex-1 border border-gray-300 rounded px-2 py-1"
              />
              <button
                type="button"
                onClick={() => removeAttributeValue(attrIdx, valIdx)}
                className="text-red-500"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}

          <button
            type="button"
            onClick={() => addAttributeValue(attrIdx)}
            className="flex items-center gap-1 text-blue-600 mt-1"
          >
            <PlusCircle size={16} /> Add Value
          </button>
        </div>
      ))}

      <button
        type="button"
        onClick={addAttribute}
        className="flex items-center gap-1 text-blue-600 mt-2"
      >
        <PlusCircle size={18} /> Add Attribute
      </button>
    </div>
  );
}
