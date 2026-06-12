import React, { useState, useEffect } from "react";
import Papa from "papaparse";
import "./App.css";
    import { FiFilter } from "react-icons/fi";

function Table() {
    const [activeFilter, setActiveFilter] = useState(null);
  const [data, setData] = useState([]);
  const [headers, setHeaders] = useState([]);

  const [columnFilters, setColumnFilters] = useState({});
  const [searchTerm, setSearchTerm] = useState("");

  const [sortColumn, setSortColumn] = useState("");
  const [sortOrder, setSortOrder] = useState("asc");

  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 20;

  // 📌 Upload CSV
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.name.endsWith(".csv")) {
      alert("Please upload a CSV file");
      return;
    }

    e.target.value = null;

    // reset state
    setData([]);
    setHeaders([]);
    setColumnFilters({});
    setSearchTerm("");
    setCurrentPage(1);

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (result) => {
        const parsed = result.data;

        setData(parsed);

        if (parsed.length > 0) {
          const cols = Object.keys(parsed[0]);
          setHeaders(cols);
          setSortColumn(cols[0]);
        }
      },
      error: () => alert("Error reading CSV"),
    });
  };

  // 📌 Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, columnFilters, sortColumn, sortOrder]);

  // 📌 FILTER LOGIC
  let filteredData = [...data];

  // Global search
  if (searchTerm) {
    filteredData = filteredData.filter((row) =>
      headers.some((h) =>
        String(row[h] || "")
          .toLowerCase()
          .includes(searchTerm.toLowerCase())
      )
    );
  }

  // Column filters
  Object.keys(columnFilters).forEach((key) => {
    const value = columnFilters[key];

    if (value) {
      filteredData = filteredData.filter((row) =>
        String(row[key] || "")
          .toLowerCase()
          .includes(value.toLowerCase())
      );
    }
  });

  // SORT
  if (sortColumn) {
    filteredData.sort((a, b) => {
      const A = a[sortColumn] || "";
      const B = b[sortColumn] || "";

      return sortOrder === "asc"
        ? String(A).localeCompare(String(B))
        : String(B).localeCompare(String(A));
    });
  }

  // PAGINATION
  const totalPages = Math.ceil(filteredData.length / rowsPerPage);

  const startIndex = (currentPage - 1) * rowsPerPage;

  const paginatedData = filteredData.slice(
    startIndex,
    startIndex + rowsPerPage
  );

  const clearFilters = () => {
    setSearchTerm("");
    setColumnFilters({});
  };

  return (
    <div className="container">
      <h1>CSV Data Viewer</h1>

      {/* UPLOAD */}
      <input type="file" accept=".csv" onChange={handleFileUpload} />

      {headers.length > 0 && (
        <>
          {/* CONTROLS */}
          <div className="controls">
            <input
              placeholder="Global Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />

            <select
              value={sortColumn}
              onChange={(e) => setSortColumn(e.target.value)}
            >
              {headers.map((h) => (
                <option key={h}>{h}</option>
              ))}
            </select>

            <button
              onClick={() =>
                setSortOrder((p) => (p === "asc" ? "desc" : "asc"))
              }
            >
              {sortOrder === "asc" ? "ASC" : "DESC"}
            </button>

            <button onClick={clearFilters}>Clear Filters</button>
          </div>

          {/* COLUMN FILTERS */}
          {/* <div className="column-filters">
            {headers.map((h) => (
              <input
                key={h}
                placeholder={`Filter ${h}`}
                value={columnFilters[h] || ""}
                onChange={(e) =>
                  setColumnFilters({
                    ...columnFilters,
                    [h]: e.target.value,
                  })
                }
              />
            ))}
          </div> */}

          {/* COUNT */}
          <p>
            Showing {filteredData.length} of {data.length} records
          </p>

          {/* TABLE */}
         {/* TABLE */}
<table className="table">
  <thead>
    <tr>
      {headers.map((header) => (
        <th key={header} style={{ position: "relative" }}>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span>{header}</span>

            <FiFilter
              style={{ cursor: "pointer" }}
              onClick={() =>
                setActiveFilter(activeFilter === header ? null : header)
              }
            />
          </div>

          {activeFilter === header && (
            <div className="filter-popup">
              <input
                type="text"
                placeholder={`Filter ${header}`}
                value={columnFilters[header] || ""}
                onChange={(e) =>
                  setColumnFilters({
                    ...columnFilters,
                    [header]: e.target.value,
                  })
                }
              />

              <button onClick={() => setActiveFilter(null)}>Close</button>
            </div>
          )}
        </th>
      ))}
    </tr>
  </thead>

  <tbody>
    {paginatedData.map((row, index) => (
      <tr key={index}>
        {headers.map((h) => (
          <td key={h}>{row[h]}</td>
        ))}
      </tr>
    ))}
  </tbody>
</table>
          {/* PAGINATION */}
          <div className="pagination">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => p - 1)}
            >
              Prev
            </button>

            <span>
              Page {currentPage} of {totalPages || 1}
            </span>

            <button
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((p) => p + 1)}
            >
              Next
            </button>
          </div>
        </>
      )}
    </div>
  );
}

export default Table;