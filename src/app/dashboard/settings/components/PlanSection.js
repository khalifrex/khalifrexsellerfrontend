export default function PlanSection() {
  return (
    <section className="bg-white shadow rounded p-6">
      <h2 className="text-xl font-medium mb-4">Plan</h2>
      <p className="mb-4">Current Plan: <strong>Basic</strong></p>
      <div className="flex gap-2">
        <button className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700">
          Upgrade Plan
        </button>
        <button className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700">
          Cancel Plan
        </button>
      </div>
    </section>
  );
}
