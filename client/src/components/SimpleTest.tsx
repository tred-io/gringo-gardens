import React from "react";

export default function SimpleTest() {
  return (
    <div className="min-h-screen bg-blue-500 p-8">
      <div className="max-w-4xl mx-auto bg-white p-8 rounded-lg shadow-lg">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">CSS Test</h1>
        <div className="space-y-4">
          <div className="p-4 bg-red-500 text-white">Red background test</div>
          <div className="p-4 bg-green-500 text-white">Green background test</div>
          <div className="p-4 bg-blue-500 text-white">Blue background test</div>
          <div className="p-4 text-2xl font-semibold">Large text test</div>
          <button className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700">
            Button test
          </button>
        </div>
      </div>
    </div>
  );
}