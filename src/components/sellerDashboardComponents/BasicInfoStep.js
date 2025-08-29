export default function BasicInfoStep({ form, formErrors, onInputChange }) {
  return (
    <>
      <h2 className="text-xl font-semibold">Basic Info</h2>
      {["name", "brand"].map((field) => (
        <div key={field}>
          <label className="block text-sm">{field}</label>
          <input
            value={form[field] || ""}
            onChange={(e) => onInputChange(field, e.target.value)}
            className={`w-full border ${formErrors[field] ? "border-red-500" : "border-gray-300"} rounded px-3 py-2`}
          />
          {formErrors[field] && (
            <p className="text-red-500 text-sm">{formErrors[field]}</p>
          )}
        </div>
      ))}
    </>
  );
}