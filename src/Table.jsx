import React, { useState } from "react";
import Papa from "papaparse";
import "./App.css";

function Table() {
  const [data, setData] = useState([]);
  const [headers, setHeaders] = useState([]);
  const [filterColumn, setFilterColumn] = useState("");
  const [filterValue, setFilterValue] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortColumn, setSortColumn] = useState("");
  const [sortOrder, setSortOrder] = useState("asc");
  const [currentPage, setCurrentPage] = useState(1);

  const rowsPerPage = 20;

  const handleFileUpload = (e) => {
    const file = e.target.files[0];

    if (!file) return;

    if (!file.name.endsWith(".csv")) {
      alert("Please upload a CSV file");
      return;
    }

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (result) => {
        const parsedData = result.data;

        setData(parsedData);

        if (parsedData.length > 0) {
          const cols = Object.keys(parsedData[0]);
          setHeaders(cols);
          setFilterColumn(cols[0]);
          setSortColumn(cols[0]);
        }
      },
      error: () => {
        alert("Error reading CSV");
      },
    });
  };

  let filteredData = [...data];

  // Global Search
  if (searchTerm) {
    filteredData = filteredData.filter((row) =>
      headers.some((header) =>
        String(row[header] || "")
          .toLowerCase()
          .includes(searchTerm.toLowerCase())
      )
    );
  }

  // Column Filter
  if (filterColumn && filterValue) {
    filteredData = filteredData.filter((row) =>
      String(row[filterColumn] || "")
        .toLowerCase()
        .includes(filterValue.toLowerCase())
    );
  }

  // Sorting
  filteredData.sort((a, b) => {
    const valA = a[sortColumn] || "";
    const valB = b[sortColumn] || "";

    return sortOrder === "asc"
      ? String(valA).localeCompare(String(valB))
      : String(valB).localeCompare(String(valA));
  });

  // Pagination
  const totalPages = Math.ceil(filteredData.length / rowsPerPage);

  const startIndex = (currentPage - 1) * rowsPerPage;

  const paginatedData = filteredData.slice(
    startIndex,
    startIndex + rowsPerPage
  );

  const clearFilters = () => {
    setSearchTerm("");
    setFilterValue("");
    setCurrentPage(1);
  };

  return (
    <div className="container">
      <h1>CSV Data Viewer</h1>

      <div className="upload-box">
        <input
          type="file"
          accept=".csv"
          onChange={handleFileUpload}
        />
      </div>

      {headers.length > 0 && (
        <>
          <div className="controls">
            <input
              type="text"
              placeholder="Global Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />

            <select
              value={filterColumn}
              onChange={(e) => setFilterColumn(e.target.value)}
            >
              {headers.map((header) => (
                <option key={header}>{header}</option>
              ))}
            </select>

            <input
              type="text"
              placeholder="Filter Value"
              value={filterValue}
              onChange={(e) => setFilterValue(e.target.value)}
            />

            <select
              value={sortColumn}
              onChange={(e) => setSortColumn(e.target.value)}
            >
              {headers.map((header) => (
                <option key={header}>{header}</option>
              ))}
            </select>

            <button
              onClick={() =>
                setSortOrder(
                  sortOrder === "asc" ? "desc" : "asc"
                )
              }
            >
              {sortOrder === "asc"
                ? "Ascending"
                : "Descending"}
            </button>

            <button onClick={clearFilters}>
              Clear Filters
            </button>
          </div>

          <p className="record-count">
            Showing {filteredData.length} of {data.length} records
          </p>

          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  {headers.map((header) => (
                    <th key={header}>{header}</th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {paginatedData.map((row, index) => (
                  <tr key={index}>
                    {headers.map((header) => (
                      <td key={header}>
                        {row[header]}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="pagination">
            <button
              disabled={currentPage === 1}
              onClick={() =>
                setCurrentPage((prev) => prev - 1)
              }
            >
              Prev
            </button>

            <span>
              Page {currentPage} of {totalPages}
            </span>

            <button
              disabled={currentPage === totalPages}
              onClick={() =>
                setCurrentPage((prev) => prev + 1)
              }
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
