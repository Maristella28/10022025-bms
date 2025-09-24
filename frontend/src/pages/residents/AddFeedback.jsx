// src/pages/AddFeedback.jsx

import React, { useState } from 'react';
import Navbares from "../../components/Navbares";
import Sidebares from "../../components/Sidebares";

const AddFeedback = () => {
  const [feedback, setFeedback] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    // You can replace this with an axios POST request to your backend
    console.log('Submitted feedback:', feedback);
    setSubmitted(true);
    setFeedback('');
  };

  return (
    <>
      <Navbares />
      <Sidebares />
      <main className="min-h-screen ml-64 pt-20 bg-green-50 font-sans">
        <div className="p-8 max-w-2xl mx-auto bg-white rounded-2xl shadow-lg">
          <h1 className="text-3xl font-bold text-green-800 mb-6 text-center">📣 Submit Your Feedback</h1>

          {submitted && (
            <div className="bg-green-100 border border-green-400 text-green-700 p-4 mb-4 rounded">
              Thank you for your feedback!
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <label htmlFor="feedback" className="block mb-2 font-semibold text-gray-700">
              Your Feedback:
            </label>
            <textarea
              id="feedback"
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              rows="6"
              className="w-full border border-green-300 rounded-lg p-4 focus:outline-none focus:ring-2 focus:ring-green-400"
              required
            ></textarea>

            <button
              type="submit"
              className="mt-4 bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-6 rounded-lg transition duration-300"
            >
              Submit
            </button>
          </form>
        </div>
      </main>
    </>
  );
};
export default AddFeedback;
