"use client";

import { useState } from "react";
import Link from "next/link";
import { Search, Mail, BookOpen, ChevronRight } from "lucide-react";

export default function HelpPage() {
  const [searchQuery, setSearchQuery] = useState("");

  const faqs = [
    {
      question: "How do I add a product?",
      answer:
        "To add a product, go to the Products section and click 'Add Product'. Fill in the product details and save.",
    },
    {
      question: "How can I track my orders?",
      answer:
        "Navigate to the Orders page to see all your orders and their statuses.",
    },
    {
      question: "How do I update my billing information?",
      answer:
        "Go to Settings > Billing to add or update your payment methods.",
    },
    {
      question: "How do I verify my account?",
      answer:
        "In Settings > KYC, upload your documents to complete verification.",
    },
  ];

  return (
    <div className="max-w-3xl mx-auto py-10 px-4">
      <h1 className="text-3xl font-bold mb-6">Help Center</h1>

      {/* Search */}
      <div className="mb-8">
        <div className="flex items-center border border-gray-300 rounded overflow-hidden">
          <input
            type="text"
            placeholder="Search articles..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 px-4 py-2 focus:outline-none"
          />
          <button className="px-3 bg-gray-100">
            <Search size={18} />
          </button>
        </div>
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
        <Link
          href="/dashboard/settings"
          className="flex items-center p-4 border rounded hover:bg-gray-50 transition"
        >
          <BookOpen size={20} className="mr-3 text-blue-600" />
          <span>View Settings & Guides</span>
          <ChevronRight className="ml-auto" size={16} />
        </Link>
        <a
          href="mailto:support@yourcompany.com"
          className="flex items-center p-4 border rounded hover:bg-gray-50 transition"
        >
          <Mail size={20} className="mr-3 text-blue-600" />
          <span>Contact Support</span>
          <ChevronRight className="ml-auto" size={16} />
        </a>
      </div>

      {/* FAQs */}
      <h2 className="text-xl font-semibold mb-4">Frequently Asked Questions</h2>
      <div className="space-y-4">
        {faqs
          .filter(
            (faq) =>
              faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
              faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
          )
          .map((faq, idx) => (
            <details
              key={idx}
              className="border rounded"
            >
              <summary className="cursor-pointer px-4 py-3 font-medium flex justify-between items-center hover:bg-gray-50">
                {faq.question}
                <ChevronRight size={16} className="transition-transform group-open:rotate-90" />
              </summary>
              <div className="px-4 py-3 text-sm text-gray-700">
                {faq.answer}
              </div>
            </details>
          ))}
      </div>

      {/* Contact */}
      <div className="mt-12 border-t pt-6">
        <h2 className="text-xl font-semibold mb-2">Still need help?</h2>
        <p className="mb-4 text-gray-600">
          If you didn’t find your answer here, our support team is ready to help you.
        </p>
        <a
          href="mailto:support@yourcompany.com"
          className="inline-block px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Contact Support
        </a>
      </div>
    </div>
  );
}
