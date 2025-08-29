export default function PrivacyPolicySection({ setPrivacyOpen }) {
  return (
    <section className="bg-white shadow rounded p-6">
      <div
        onClick={() => setPrivacyOpen(true)}
        className="cursor-pointer flex justify-between items-center hover:bg-gray-50 p-2 rounded"
      >
        <h2 className="text-xl font-medium">Privacy Policy</h2>
        <span className="text-blue-600">View</span>
      </div>
    </section>
  );
}
