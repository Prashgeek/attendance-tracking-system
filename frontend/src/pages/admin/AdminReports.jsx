import React, { useRef, useState } from "react";

export default function Reports() {
  const scrollRef = useRef(null);
  const [exportLoading, setExportLoading] = useState({
    pdf: false,
    excel: false,
    email: false
  });
  const [filters, setFilters] = useState({
    user: "all",
    status: "all",
    fromDate: "",
    toDate: ""
  });

  // Sample data
  const allData = [
    { id: 1, date: "1/10/2025", name: "Sarah Johnson", status: "present", checkIn: "09:20", checkOut: "16:28", hours: "7.1h" },
    { id: 2, date: "1/10/2025", name: "Michael Brown", status: "present", checkIn: "09:09", checkOut: "16:09", hours: "7.0h" },
    { id: 3, date: "1/10/2025", name: "Emily Davis", status: "late", checkIn: "10:43", checkOut: "15:43", hours: "5.0h" },
    { id: 4, date: "1/10/2025", name: "David Wilson", status: "present", checkIn: "09:59", checkOut: "17:04", hours: "7.1h" },
    { id: 5, date: "1/10/2025", name: "Lisa Anderson", status: "present", checkIn: "08:39", checkOut: "16:44", hours: "8.1h" },
    { id: 6, date: "1/10/2025", name: "Robert Taylor", status: "present", checkIn: "09:55", checkOut: "16:52", hours: "7.0h" },
    { id: 7, date: "1/10/2025", name: "Jennifer Martinez", status: "present", checkIn: "08:54", checkOut: "16:10", hours: "7.3h" },
    { id: 8, date: "1/10/2025", name: "James Garcia", status: "present", checkIn: "08:35", checkOut: "15:42", hours: "7.1h" },
    { id: 9, date: "2/10/2025", name: "Sarah Johnson", status: "present", checkIn: "09:10", checkOut: "17:07", hours: "8.0h" },
    { id: 10, date: "2/10/2025", name: "Michael Brown", status: "absent", checkIn: "-", checkOut: "-", hours: "0h" },
    { id: 11, date: "2/10/2025", name: "Emily Davis", status: "late", checkIn: "10:15", checkOut: "16:30", hours: "6.3h" },
    { id: 12, date: "2/10/2025", name: "David Wilson", status: "present", checkIn: "09:00", checkOut: "17:00", hours: "8.0h" },
  ];

  // Filter data based on current filters
  const filteredData = allData.filter(item => {
    if (filters.user !== "all" && item.name !== getUserName(filters.user)) return false;
    if (filters.status !== "all" && item.status !== filters.status) return false;
    if (filters.fromDate) {
      const itemDate = new Date(item.date);
      const fromDate = new Date(filters.fromDate);
      if (itemDate < fromDate) return false;
    }
    if (filters.toDate) {
      const itemDate = new Date(item.date);
      const toDate = new Date(filters.toDate);
      if (itemDate > toDate) return false;
    }
    return true;
  });

  // Calculate statistics from filtered data
  const statistics = {
    total: filteredData.length,
    present: filteredData.filter(item => item.status === "present").length,
    late: filteredData.filter(item => item.status === "late").length,
    absent: filteredData.filter(item => item.status === "absent").length,
    attendanceRate: filteredData.length > 0 
      ? ((filteredData.filter(item => item.status === "present" || item.status === "late").length / filteredData.length) * 100).toFixed(1)
      : "0.0"
  };

  function getUserName(userId) {
    const users = {
      "all": "All Users",
      "user1": "Sarah Johnson",
      "user2": "Michael Brown", 
      "user3": "Emily Davis",
      "user4": "David Wilson",
      "user5": "Lisa Anderson"
    };
    return users[userId];
  }

  function handleFilterChange(key, value) {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  }

  // Function to get current date for filename
  const getCurrentDate = () => {
    return new Date().toISOString().split('T')[0];
  };

  // Fixed PDF Export with proper PDF generation
  const handleExportPDF = async () => {
    setExportLoading(prev => ({ ...prev, pdf: true }));
    
    try {
      // Simulate processing time for animation
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Create PDF content with proper formatting
      let pdfContent = `%PDF-1.4
1 0 obj
<<
/Type /Catalog
/Pages 2 0 R
>>
endobj

2 0 obj
<<
/Type /Pages
/Kids [3 0 R]
/Count 1
>>
endobj

3 0 obj
<<
/Type /Page
/Parent 2 0 R
/MediaBox [0 0 612 792]
/Contents 4 0 R
/Resources <<
/Font <<
/F1 5 0 R
>>
>>
>>
endobj

4 0 obj
<<
/Length 2000
>>
stream
BT
/F1 12 Tf
50 750 Td
(ATTENDANCE REPORT) Tj
0 -20 Td
(Generated: ${new Date().toLocaleDateString()}) Tj
0 -40 Td
(SUMMARY:) Tj
0 -20 Td
(Total Records: ${statistics.total}) Tj
0 -15 Td
(Present: ${statistics.present}) Tj
0 -15 Td
(Late: ${statistics.late}) Tj
0 -15 Td
(Absent: ${statistics.absent}) Tj
0 -15 Td
(Attendance Rate: ${statistics.attendanceRate}%) Tj
0 -40 Td
(DETAILED RECORDS:) Tj
0 -20 Td
(Date               Name               Status   Check-In Check-Out Hours) Tj
`;

      // Add table rows
      filteredData.forEach((item, index) => {
        const yPos = 450 - (index * 15);
        if (yPos > 50) { // Simple pagination check
          pdfContent += `0 -15 Td
(${item.date} ${item.name} ${item.status} ${item.checkIn} ${item.checkOut} ${item.hours}) Tj
`;
        }
      });

      pdfContent += `ET
endstream
endobj

5 0 obj
<<
/Type /Font
/Subtype /Type1
/BaseFont /Helvetica
>>
endobj

xref
0 6
0000000000 65535 f 
0000000009 00000 n 
0000000058 00000 n 
0000000115 00000 n 
0000000250 00000 n 
0000002500 00000 n 
trailer
<<
/Size 6
/Root 1 0 R
>>
startxref
${pdfContent.length}
%%EOF`;

      // Create and download PDF file
      const blob = new Blob([pdfContent], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `attendance-report-${getCurrentDate()}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
    } catch (error) {
      console.error('PDF export error:', error);
      alert("Error generating PDF. Please try again.");
    } finally {
      setExportLoading(prev => ({ ...prev, pdf: false }));
    }
  };

  // Enhanced Excel Export with animations
  const handleExportExcel = async () => {
    setExportLoading(prev => ({ ...prev, excel: true }));
    
    try {
      // Simulate processing time for animation
      await new Promise(resolve => setTimeout(resolve, 1200));
      
      // Create CSV content
      let csvContent = "Attendance Report\n";
      csvContent += `Generated: ${new Date().toLocaleDateString()}\n\n`;
      
      // Summary section
      csvContent += "SUMMARY\n";
      csvContent += `Total Records,${statistics.total}\n`;
      csvContent += `Present,${statistics.present}\n`;
      csvContent += `Late,${statistics.late}\n`;
      csvContent += `Absent,${statistics.absent}\n`;
      csvContent += `Attendance Rate,${statistics.attendanceRate}%\n\n`;
      
      csvContent += "DETAILED RECORDS\n";
      csvContent += "Date,Name,Status,Check-In,Check-Out,Working Hours\n";
      
      // Add data rows
      filteredData.forEach(item => {
        csvContent += `${item.date},${item.name},${item.status},${item.checkIn},${item.checkOut},${item.hours}\n`;
      });
      
      // Create and download file
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      
      link.setAttribute('href', url);
      link.setAttribute('download', `attendance-report-${getCurrentDate()}.csv`);
      link.style.visibility = 'hidden';
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
    } catch (error) {
      console.error('Excel export error:', error);
      alert("Error generating Excel file. Please try again.");
    } finally {
      setExportLoading(prev => ({ ...prev, excel: false }));
    }
  };

  // Fixed Email Report - properly formatted
  const handleEmailReport = async () => {
    setExportLoading(prev => ({ ...prev, email: true }));
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Create properly formatted email content
      const subject = `Attendance Report - ${getCurrentDate()}`;
      const body = `ATTENDANCE REPORT

SUMMARY:
Total Records: ${statistics.total}
Present: ${statistics.present}
Late: ${statistics.late}
Absent: ${statistics.absent}
Attendance Rate: ${statistics.attendanceRate}%

RECENT RECORDS:
Date | Name | Status | Check-In | Check-Out | Hours
---------------------------------------------------
${filteredData.slice(0, 8).map(item => 
  `${item.date} | ${item.name} | ${item.status} | ${item.checkIn} | ${item.checkOut} | ${item.hours}`
).join('\n')}

Total records: ${filteredData.length}
Generated on: ${new Date().toLocaleDateString()}`;

      // Create mailto link with proper encoding
      const mailtoLink = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
      
      // Open email client in new tab
      window.open(mailtoLink, '_blank');
      
    } catch (error) {
      console.error('Email report error:', error);
      alert("Error preparing email. Please try again.");
    } finally {
      setExportLoading(prev => ({ ...prev, email: false }));
    }
  };

  // Loading spinner component
  const LoadingSpinner = () => (
    <div className="animate-spin rounded-full border-2 border-gray-300 border-t-blue-600 w-4 h-4"></div>
  );

  return (
    <section id="panel-reports" role="tabpanel" aria-labelledby="reports-section" tabIndex={0} className="max-w-[1440px] mx-auto">
      <div className="bg-white rounded-xl p-6 md:p-8 shadow-md">
        <h2 id="reports-section" className="text-lg font-bold text-gray-900">Generate Reports</h2>
        <p className="text-sm text-gray-500 mt-1">Filter and export attendance reports</p>

        <form onSubmit={(e) => e.preventDefault()} className="mt-6" aria-describedby="report-instructions">
          {/* Filters - Responsive grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-2">
              <label htmlFor="user-select" className="block text-sm font-semibold text-gray-700">User</label>
              <select 
                id="user-select" 
                value={filters.user}
                onChange={(e) => handleFilterChange("user", e.target.value)}
                className="w-full rounded-2xl p-2.5 bg-gray-50 border border-gray-200 focus:outline-none focus:ring-1 focus:ring-blue-400"
              >
                <option value="all">All Users</option>
                <option value="user1">Sarah Johnson</option>
                <option value="user2">Michael Brown</option>
                <option value="user3">Emily Davis</option>
                <option value="user4">David Wilson</option>
                <option value="user5">Lisa Anderson</option>
              </select>
            </div>

            <div className="space-y-2">
              <label htmlFor="status-select" className="block text-sm font-semibold text-gray-700">Status</label>
              <select 
                id="status-select"
                value={filters.status}
                onChange={(e) => handleFilterChange("status", e.target.value)}
                className="w-full rounded-2xl p-2.5 bg-gray-50 border border-gray-200 focus:outline-none focus:ring-1 focus:ring-blue-400"
              >
                <option value="all">All Status</option>
                <option value="present">Present</option>
                <option value="late">Late</option>
                <option value="absent">Absent</option>
              </select>
            </div>

            <div className="space-y-2">
              <label htmlFor="from-date" className="block text-sm font-semibold text-gray-700">From Date</label>
              <input 
                id="from-date" 
                type="date" 
                value={filters.fromDate}
                onChange={(e) => handleFilterChange("fromDate", e.target.value)}
                className="w-full rounded-2xl p-2.5 bg-gray-50 border border-gray-200 focus:outline-none focus:ring-1 focus:ring-blue-400" 
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="to-date" className="block text-sm font-semibold text-gray-700">To Date</label>
              <input 
                id="to-date" 
                type="date" 
                value={filters.toDate}
                onChange={(e) => handleFilterChange("toDate", e.target.value)}
                className="w-full rounded-2xl p-2.5 bg-gray-50 border border-gray-200 focus:outline-none focus:ring-1 focus:ring-blue-400" 
              />
            </div>
          </div>

          {/* Export Buttons - Responsive layout */}
          <div className="mt-4 flex flex-col sm:flex-row gap-3">
            <button 
              type="button" 
              onClick={handleExportPDF}
              disabled={exportLoading.pdf}
              id="export-pdf-btn" 
              className="bg-white border border-gray-200 rounded-xl px-4 py-2 flex items-center justify-center gap-2 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
            >
              {exportLoading.pdf ? (
                <LoadingSpinner />
              ) : (
                <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" stroke="#121212" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                  <polyline points="14 2 14 8 20 8" stroke="#121212" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
              {exportLoading.pdf ? "Generating PDF..." : "Export PDF"}
            </button>

            <button 
              type="button" 
              onClick={handleExportExcel}
              disabled={exportLoading.excel}
              id="export-excel-btn" 
              className="bg-white border border-gray-200 rounded-xl px-4 py-2 flex items-center justify-center gap-2 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
            >
              {exportLoading.excel ? (
                <LoadingSpinner />
              ) : (
                <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" stroke="#121212" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                  <polyline points="7 10 12 15 17 10" stroke="#121212" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                  <line x1="12" y1="15" x2="12" y2="3" stroke="#121212" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
              {exportLoading.excel ? "Generating Excel..." : "Export Excel"}
            </button>

            <button 
              type="button" 
              onClick={handleEmailReport}
              disabled={exportLoading.email}
              id="email-report-btn" 
              className="bg-white border border-gray-200 rounded-xl px-4 py-2 flex items-center justify-center gap-2 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
            >
              {exportLoading.email ? (
                <LoadingSpinner />
              ) : (
                <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
                  <path d="M4 4h16v16H4z" stroke="#121212" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                  <polyline points="22,6 12,13 2,6" stroke="#121212" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
              {exportLoading.email ? "Preparing Email..." : "Email Report"}
            </button>
          </div>
        </form>

        {/* Statistics Cards - Responsive grid */}
        <div className="mt-8 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
          <div className="bg-white rounded-lg p-4 shadow-sm flex flex-col">
            <div className="text-sm font-semibold text-gray-800">Total Records</div>
            <div className="text-2xl font-bold mt-2">{statistics.total}</div>
          </div>

          <div className="bg-white rounded-lg p-4 shadow-sm flex flex-col text-green-600">
            <div className="text-sm font-semibold text-gray-800">Present</div>
            <div className="text-2xl font-bold mt-2">{statistics.present}</div>
          </div>

          <div className="bg-white rounded-lg p-4 shadow-sm flex flex-col text-orange-500">
            <div className="text-sm font-semibold text-gray-800">Late</div>
            <div className="text-2xl font-bold mt-2">{statistics.late}</div>
          </div>

          <div className="bg-white rounded-lg p-4 shadow-sm flex flex-col text-red-500">
            <div className="text-sm font-semibold text-gray-800">Absent</div>
            <div className="text-2xl font-bold mt-2">{statistics.absent}</div>
          </div>

          <div className="bg-white rounded-lg p-4 shadow-sm flex flex-col text-blue-600">
            <div className="text-sm font-semibold text-gray-800">Attendance Rate</div>
            <div className="text-2xl font-bold mt-2">{statistics.attendanceRate}%</div>
          </div>
        </div>

        {/* Data Table Section */}
        <div className="mt-6 bg-white rounded-lg shadow-sm overflow-hidden">
          <div ref={scrollRef} className="max-h-60 overflow-y-auto border-t">
            <table className="w-full min-w-[720px]">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-bold text-gray-600">Date</th>
                  <th className="px-4 py-3 text-left text-sm font-bold text-gray-600">Name</th>
                  <th className="px-4 py-3 text-left text-sm font-bold text-gray-600">Status</th>
                  <th className="px-4 py-3 text-left text-sm font-bold text-gray-600">Check-In</th>
                  <th className="px-4 py-3 text-left text-sm font-bold text-gray-600">Check-Out</th>
                  <th className="px-4 py-3 text-left text-sm font-bold text-gray-600">Working Hours</th>
                </tr>
              </thead>

              <tbody>
                {filteredData.map((item, idx) => (
                  <tr key={item.id} className={idx % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                    <td className="px-4 py-3 text-sm">{item.date}</td>
                    <td className="px-4 py-3 text-sm">{item.name}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-block text-xs font-bold px-3 py-1 rounded-full text-white ${
                          item.status === "present" 
                            ? "bg-green-500" 
                            : item.status === "late" 
                              ? "bg-yellow-500" 
                              : "bg-red-500"
                        }`}
                      >
                        {item.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm">{item.checkIn}</td>
                    <td className="px-4 py-3 text-sm">{item.checkOut}</td>
                    <td className="px-4 py-3 text-sm">{item.hours}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div id="footer-note" className="text-center text-sm text-gray-500 mt-4" aria-live="polite">
          Showing {filteredData.length} of {allData.length} records. Export for full data.
        </div>
      </div>
    </section>
  );
}