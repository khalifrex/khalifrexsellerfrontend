import { Loader2 } from "lucide-react";

export default function ReviewStep({
  form,
  variants,
  attributes,
  submitting,
  uploadProgress,
}) {
  return (
    <>
      <h2 className="text-xl font-semibold mb-4">Review & Submit</h2>
      <pre className="bg-gray-100 p-3 rounded">
        {JSON.stringify({ ...form, variants, attributes }, null, 2)}
      </pre>
      <button
        type="submit"
        disabled={submitting}
        className="w-full bg-blue-600 text-white py-3 rounded flex justify-center items-center gap-2"
      >
        {submitting ? <Loader2 className="animate-spin" /> : "Create Product"}
      </button>
      {submitting && (
        <div className="w-full bg-gray-200 rounded h-2 mt-3 overflow-hidden">
          <div
            className="bg-blue-600 h-2 transition-all"
            style={{ width: `${uploadProgress}%` }}
          />
        </div>
      )}
    </>
  );
}