export default function FormNavigation({ step, onPrevStep, onNextStep }) {
  return (
    <div className="mt-6 flex justify-between">
      {step > 1 && (
        <button
          onClick={onPrevStep}
          className="bg-gray-200 px-4 py-2 rounded"
        >
          Back
        </button>
      )}
      {step < 4 && (
        <button
          onClick={onNextStep}
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          Next
        </button>
      )}
    </div>
  );
}