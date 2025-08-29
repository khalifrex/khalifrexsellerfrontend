export default function PrivacyPolicyModal({ setPrivacyOpen }) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 z-50">
      <div className="fixed inset-x-0 top-8 bottom-0 bg-white rounded-t-lg shadow-lg p-6 overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-2xl font-semibold">Privacy Policy</h3>
          <button
            onClick={() => setPrivacyOpen(false)}
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            &times;
          </button>
        </div>
        <div className="prose max-w-none">
          <h4>Your Privacy Matters</h4>
          <p>
            This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our platform.
          </p>
          <h4>Information We Collect</h4>
          <ul>
            <li>Personal Data: name, email, phone number, store details.</li>
            <li>Usage Data: device info, browser type, pages visited.</li>
          </ul>
          <h4>How We Use Your Data</h4>
          <p>
            We use the data to deliver services, improve user experience, prevent fraud, and communicate important updates.
          </p>
          <h4>Your Rights</h4>
          <p>
            You have the right to access, update, or delete your data. Contact us at privacy@khalifrex.com.
          </p>
          <h4>Contact</h4>
          <p>
            If you have any questions, email us at support@khalifrex.com.
          </p>
        </div>
      </div>
    </div>
  );
}
