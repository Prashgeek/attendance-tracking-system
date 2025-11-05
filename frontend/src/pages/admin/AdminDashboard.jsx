import React from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import { Line, Pie } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Tooltip,
  Legend,
  Filler
);

export default function AdminDashboard() {
  // --- Data ---
  const totalUsers = 8;
  const presentCount = 6;
  const absentCount = 2;
  const lateCount = 0;

  const presentPerc = totalUsers ? Math.round((presentCount / totalUsers) * 100) : 0;
  const absentPerc = totalUsers ? Math.round((absentCount / totalUsers) * 100) : 0;
  const latePerc = totalUsers ? Math.round((lateCount / totalUsers) * 100) : 0;

  const trendLabels = ["Oct 24", "Oct 25", "Oct 26", "Oct 27", "Oct 28", "Oct 29", "Oct 30"];

  const trendData = {
    labels: trendLabels,
    datasets: [
      {
        label: "Absent",
        data: [2, 0, 0, 0, 2, 0, 2],
        borderColor: "#ef4444",
        backgroundColor: "#f87171",
        tension: 0.4,
        fill: false,
        pointStyle: "circle",
        pointRadius: 5,
        pointBackgroundColor: "#ef4444",
        borderWidth: 2,
        spanGaps: true,
      },
      {
        label: "Late",
        data: [0, 0, 1, 2, 1, 0, 0],
        borderColor: "#f59e0b",
        backgroundColor: "#fbbf24",
        tension: 0.4,
        fill: false,
        pointStyle: "circle",
        pointRadius: 5,
        pointBackgroundColor: "#f59e0b",
        borderWidth: 2,
        spanGaps: true,
      },
      {
        label: "Present",
        data: [6, 0, 0, 5, 6, 6, 6],
        borderColor: "#10b981",
        backgroundColor: "#34d399",
        tension: 0.4,
        fill: false,
        pointStyle: "circle",
        pointRadius: 5,
        pointBackgroundColor: "#10b981",
        borderWidth: 2,
        spanGaps: true,
      },
    ],
  };

  const trendOptions = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: { mode: "index", intersect: false },
    plugins: {
      legend: {
        position: "bottom",
        labels: {
          usePointStyle: true,
          pointStyle: "circle",
          color: "#374151",
        },
      },
      tooltip: { mode: "index", intersect: false },
    },
    scales: {
      y: {
        min: 0,
        max: 8,
        ticks: { stepSize: 2 },
        grid: { drawBorder: false },
      },
      x: { grid: { drawBorder: false } },
    },
  };

  const pieData = {
    labels: [`Present (${presentPerc}%)`, `Absent (${absentPerc}%)`, `Late (${latePerc}%)`],
    datasets: [
      {
        label: "Today's Attendance",
        data: [presentPerc, absentPerc, latePerc],
        backgroundColor: ["#10b981", "#ef4444", "#f59e0b"],
        borderWidth: 0,
        hoverOffset: 20,
      },
    ],
  };

  const pieOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "right",
        labels: {
          usePointStyle: true,
          pointStyle: "circle",
          boxWidth: 14,
          padding: 20,
          color: "#374151",
          font: { size: 14, weight: "600" },
        },
      },
      tooltip: { enabled: true },
    },
  };

  // Custom human icons for all cards with different status indicators
  const TotalUsersIcon = () => (
    <div className="w-10 h-10 rounded-full border-2 border-gray-300 flex items-center justify-center">
      <svg className="w-5 h-5 text-gray-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
        <circle cx="9" cy="7" r="4"></circle>
        <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
        <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
      </svg>
    </div>
  );

  const PresentTodayIcon = () => (
    <div className="w-10 h-10 rounded-full border-2 border-green-400 flex items-center justify-center">
      <svg className="w-5 h-5 text-green-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        {/* Human icon */}
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
        <circle cx="12" cy="7" r="4"></circle>
        {/* Green tick */}
        <path d="m9 12l2 2l4-4" stroke="#10b981" strokeWidth="2"/>
      </svg>
    </div>
  );

  const AbsentTodayIcon = () => (
    <div className="w-10 h-10 rounded-full border-2 border-red-400 flex items-center justify-center">
      <svg className="w-5 h-5 text-red-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        {/* Human icon */}
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
        <circle cx="12" cy="7" r="4"></circle>
        {/* Red cross */}
        <path d="m15 9l-6 6m0-6l6 6" stroke="#ef4444" strokeWidth="2"/>
      </svg>
    </div>
  );

  const LateArrivalsIcon = () => (
    <div className="w-10 h-10 rounded-full border-2 border-amber-400 flex items-center justify-center">
      <svg className="w-5 h-5 text-amber-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        {/* Human icon */}
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
        <circle cx="12" cy="7" r="4"></circle>
        {/* Clock icon */}
        <circle cx="12" cy="12" r="8" stroke="#f59e0b" strokeWidth="2" fill="none"/>
        <path d="M12 8v4l2 2" stroke="#f59e0b" strokeWidth="2"/>
      </svg>
    </div>
  );

  // Monthly Overview cards icons
  const TotalPresentIcon = () => (
    <div className="w-10 h-10 rounded-full border-2 border-green-400 flex items-center justify-center">
      <svg className="w-5 h-5 text-green-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
        <circle cx="9" cy="7" r="4"></circle>
        <path d="m9 12l2 2l4-4" stroke="#10b981" strokeWidth="2"/>
      </svg>
    </div>
  );

  const TotalRecordsIcon = () => (
    <div className="w-10 h-10 rounded-full border-2 border-blue-400 flex items-center justify-center">
      <svg className="w-5 h-5 text-blue-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
        <circle cx="9" cy="7" r="4"></circle>
        <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
        <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
      </svg>
    </div>
  );

  const AttendanceRateIcon = () => (
    <div className="w-10 h-10 rounded-full border-2 border-purple-400 flex items-center justify-center">
      <svg className="w-5 h-5 text-purple-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
        <circle cx="9" cy="7" r="4"></circle>
        <path d="M14 14l2 2l4-4" stroke="#8b5cf6" strokeWidth="2"/>
      </svg>
    </div>
  );

  return (
    <div className="bg-[#f9fafb] min-h-screen p-6">
      {/* The original container from before */}
      <section className="mb-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-5">
          {/* Total Users Card */}
          <article className="bg-white rounded-lg p-4 shadow-sm relative">
            <div className="absolute top-3 right-3">
              <TotalUsersIcon />
            </div>
            <div className="text-sm font-semibold text-gray-700">
              Total Users
            </div>
            <div className="text-2xl font-bold mt-3">{totalUsers}</div>
            <div className="text-xs text-gray-500 mt-1">Registered students</div>
          </article>

          {/* Present Today Card */}
          <article className="bg-white rounded-lg p-4 shadow-sm border-l-4 border-green-400 relative">
            <div className="absolute top-3 right-3">
              <PresentTodayIcon />
            </div>
            <div className="text-sm font-semibold text-gray-700">
              Present Today
            </div>
            <div className="text-2xl font-bold mt-3 text-green-600">{presentCount}</div>
            <div className="text-xs text-gray-500 mt-1">≈ {presentPerc}% attendance rate</div>
          </article>

          {/* Absent Today Card */}
          <article className="bg-white rounded-lg p-4 shadow-sm border-l-4 border-red-400 relative">
            <div className="absolute top-3 right-3">
              <AbsentTodayIcon />
            </div>
            <div className="text-sm font-semibold text-gray-700">
              Absent Today
            </div>
            <div className="text-2xl font-bold mt-3 text-red-600">{absentCount}</div>
            <div className="text-xs text-gray-500 mt-1">{absentPerc}% — Requires attention</div>
          </article>

          {/* Late Arrivals Card */}
          <article className="bg-white rounded-lg p-4 shadow-sm border-l-4 border-amber-400 relative">
            <div className="absolute top-3 right-3">
              <LateArrivalsIcon />
            </div>
            <div className="text-sm font-semibold text-gray-700">
              Late Arrivals
            </div>
            <div className="text-2xl font-bold mt-3 text-amber-600">{lateCount}</div>
            <div className="text-xs text-gray-500 mt-1">{latePerc}% — Today's late entries</div>
          </article>
        </div>
      </section>

      {/* Charts area */}
      <section className="mb-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-7">
          <div className="bg-white rounded-lg p-5 shadow-sm min-h-[260px]">
            <h3 className="text-base font-semibold mb-1">7-Day Attendance Trend</h3>
            <p className="text-sm text-gray-500 mb-4">Daily attendance breakdown for the past week</p>
            <div className="w-full h-56 md:h-64 lg:h-56">
              <Line data={trendData} options={trendOptions} />
            </div>
          </div>

          <div className="bg-white rounded-lg p-5 shadow-sm min-h-[260px]">
            <h3 className="text-base font-semibold mb-1">Today's Attendance Distribution</h3>
            <p className="text-sm text-gray-500 mb-4">Breakdown of today's attendance status</p>
            <div className="w-full h-64 flex items-center justify-center">
              <div className="w-full max-w-xs">
                <Pie data={pieData} options={pieOptions} />
              </div>
            </div>
          </div>
        </div>
      </section>

           {/* Monthly overview */}
      <section className="mb-10">
        <div className="mb-4 ml-11">
          <h3 className="text-base font-semibold mb-1">Monthly Overview</h3>
          <p className="text-sm text-gray-500">Current month attendance statistics</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-6 max-w-8xl mx-auto justify-center">
          <div className="flex-1 rounded-lg p-6 font-semibold shadow-sm bg-green-50 text-green-700 min-w-[250px] max-w-[410px]">
            <div className="text-sm">Total Present</div>
            <div className="text-2xl font-bold mt-2">147</div>
          </div>
          <div className="flex-1 rounded-lg p-6 font-semibold shadow-sm bg-blue-50 text-blue-700 min-w-[250px] max-w-[410px]">
            <div className="text-sm">Total Records</div>
            <div className="text-2xl font-bold mt-2">176</div>
          </div>
          <div className="flex-1 rounded-lg p-6 font-semibold shadow-sm bg-purple-50 text-purple-700 min-w-[250px] max-w-[410px]">
            <div className="text-sm">Attendance Rate</div>
            <div className="text-2xl font-bold mt-2">83.5%</div>
          </div>
        </div>
      </section>
    </div>
  );
}