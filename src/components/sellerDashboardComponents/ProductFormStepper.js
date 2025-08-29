export default function ProductFormStepper({ step, completedStep, onStepClick }) {
  return (
    <div className="flex justify-between mb-6">
      {[1, 2, 3, 4].map((s) => (
        <button
          key={s}
          type="button"
          onClick={() => onStepClick(s)}
          className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium border transition-all ${
            s === step
              ? "bg-blue-600 text-white border-blue-600"
              : s <= completedStep
              ? "bg-blue-100 text-blue-800 border-blue-300 hover:bg-blue-200"
              : "bg-gray-100 text-gray-600 border-gray-300 cursor-not-allowed"
          }`}
          aria-label={`Go to step ${s}`}
          disabled={s > completedStep + 1}
        >
          {s}
        </button>
      ))}
    </div>
  );
}