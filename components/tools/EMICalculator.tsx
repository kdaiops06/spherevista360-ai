"use client";

import { useState } from "react";

export default function EMICalculator() {
  const [principal, setPrincipal] = useState("1000000");
  const [rate, setRate] = useState("8.5");
  const [tenure, setTenure] = useState("20");

  const P = parseFloat(principal) || 0;
  const annualRate = parseFloat(rate) || 0;
  const N = (parseFloat(tenure) || 0) * 12;
  const r = annualRate / 12 / 100;

  let emi = 0;
  let totalPayment = 0;
  let totalInterest = 0;

  if (P > 0 && N > 0) {
    if (r > 0) {
      emi = (P * r * Math.pow(1 + r, N)) / (Math.pow(1 + r, N) - 1);
      totalPayment = emi * N;
      totalInterest = totalPayment - P;
    } else {
      emi = P / N;
      totalPayment = P;
      totalInterest = 0;
    }
  }

  const interestPercent = totalPayment > 0 ? (totalInterest / totalPayment) * 100 : 0;

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Loan Amount
          </label>
          <input
            type="number"
            value={principal}
            onChange={(e) => setPrincipal(e.target.value)}
            min="0"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Annual Interest Rate (%)
          </label>
          <input
            type="number"
            value={rate}
            onChange={(e) => setRate(e.target.value)}
            min="0"
            step="0.1"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Loan Tenure (Years)
          </label>
          <input
            type="number"
            value={tenure}
            onChange={(e) => setTenure(e.target.value)}
            min="1"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>
      </div>

      {emi > 0 && (
        <div className="grid gap-4 md:grid-cols-3">
          <div className="bg-indigo-50 rounded-xl p-5 text-center">
            <p className="text-sm text-gray-600">Monthly EMI</p>
            <p className="text-2xl font-bold text-indigo-700 mt-1">
              ₹{Math.round(emi).toLocaleString()}
            </p>
          </div>
          <div className="bg-green-50 rounded-xl p-5 text-center">
            <p className="text-sm text-gray-600">Total Payment</p>
            <p className="text-2xl font-bold text-green-700 mt-1">
              ₹{Math.round(totalPayment).toLocaleString()}
            </p>
          </div>
          <div className="bg-red-50 rounded-xl p-5 text-center">
            <p className="text-sm text-gray-600">Total Interest</p>
            <p className="text-2xl font-bold text-red-700 mt-1">
              ₹{Math.round(totalInterest).toLocaleString()}
            </p>
          </div>
        </div>
      )}

      {emi > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="font-semibold text-gray-900 mb-3">Payment Breakdown</h3>
          <div className="w-full h-6 rounded-full overflow-hidden bg-gray-200 flex">
            <div
              className="bg-indigo-600 h-full"
              style={{ width: `${100 - interestPercent}%` }}
            />
            <div
              className="bg-red-400 h-full"
              style={{ width: `${interestPercent}%` }}
            />
          </div>
          <div className="flex justify-between mt-2 text-sm text-gray-600">
            <span>
              <span className="inline-block w-3 h-3 bg-indigo-600 rounded mr-1" />
              Principal: {(100 - interestPercent).toFixed(1)}%
            </span>
            <span>
              <span className="inline-block w-3 h-3 bg-red-400 rounded mr-1" />
              Interest: {interestPercent.toFixed(1)}%
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
