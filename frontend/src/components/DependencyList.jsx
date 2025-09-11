import React, { useState, useEffect, useCallback } from "react";
import { fetchDependencies, getDependencyDetails } from "../api/api";
import DependencyModal from "./DependencyModal";

const DependencyList = () => {
  const [activeTab, setActiveTab] = useState("github"); // 'url' hoặc 'github'
  const [dependencies, setDependencies] = useState([]);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    pageSize: 10,
  });
  const [filters, setFilters] = useState({
    SearchTerm: "",
    Filter: [],
    OrderBy: "name",
    Ascending: true,
  });
  const [selectedDependency, setSelectedDependency] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);

  // Các loại `type` tương ứng với từng tab
  const types =
    activeTab === "github"
      ? ["NPM", "Maven"]
      : ["JavaScript", "CSS", "Image", "Video"];

  const fetchData = useCallback(async () => {
    try {
      const params = {
        PageSize: pagination.pageSize, // Số bản ghi mỗi trang
        PageNumber: pagination.currentPage, // Trang hiện tại
        ...filters,
      };

      const result = await fetchDependencies(activeTab, params);

      setDependencies(result.data.dependencies || []); // Cập nhật danh sách dependencies
      setPagination((prev) => ({
        ...prev,
        totalRecords: result.data.total || 0, // Tổng số bản ghi từ API
        totalPages: Math.ceil((result.data.total || 0) / prev.pageSize), // Tính tổng số trang nếu cần
      }));
    } catch (error) {
      console.error("Error fetching dependencies:", error.message);
      setDependencies([]); // Reset dependencies nếu có lỗi
      setPagination((prev) => ({
        ...prev,
        totalRecords: 0,
        totalPages: 1,
      }));
    }
  }, [activeTab, pagination.currentPage, pagination.pageSize, filters]);

  const handleDependencyClick = async (name) => {
    try {
      const data = await getDependencyDetails(activeTab, name);
      setSelectedDependency(data.data);
      setModalVisible(true);
    } catch (error) {
      console.error("Error fetching dependency details:", error);
    }
  };

  const handleFilterChange = (type) => {
    setFilters((prev) => {
      const currentFilters = prev.Filter.includes(type)
        ? prev.Filter.filter((filter) => filter !== type)
        : [...prev.Filter, type];
      return { ...prev, Filter: currentFilters };
    });
  };

  const renderPagination = () => {
    const { currentPage, pageSize, totalRecords } = pagination;
    const totalPages = Math.ceil(totalRecords / pageSize);

    if (totalRecords === 0) {
      return (
        <div className="d-flex justify-content-center mt-4">
          <span className="text-muted">Không có dữ liệu để hiển thị</span>
        </div>
      );
    }

    const startRecord = (currentPage - 1) * pageSize + 1;
    const endRecord = Math.min(startRecord + pageSize - 1, totalRecords);

    return (
      <div className="d-flex align-items-center justify-content-center m-3 p-3">
        {/* Previous Button */}
        <button
          className="btn btn-outline-primary mx-2"
          onClick={() =>
            setPagination((prev) => ({
              ...prev,
              currentPage: Math.max(1, prev.currentPage - 1),
            }))
          }
          disabled={currentPage === 1}
        >
          &lt; Previous
        </button>

        {/* Pagination Info */}
        <div className="d-flex align-items-center">
          <span className="me-2">Trang</span>
          <input
            type="number"
            className="form-control text-center"
            style={{ width: "80px" }}
            value={currentPage}
            min="1"
            max={totalPages.length}
            onChange={(e) => {
              const page = Math.max(
                1,
                Math.min(totalPages, Number(e.target.value))
              );
              setPagination((prev) => ({ ...prev, currentPage: page }));
            }}
          />
          <span className="ms-2">
            {startRecord}-{endRecord} / {totalRecords} bản ghi
          </span>
        </div>

        {/* Next Button */}
        <button
          className="btn btn-outline-primary mx-2"
          onClick={() =>
            setPagination((prev) => ({
              ...prev,
              currentPage: Math.min(totalPages, prev.currentPage + 1),
            }))
          }
          disabled={currentPage === totalPages}
        >
          Next &gt;
        </button>
      </div>
    );
  };

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return (
    <div className="container mt-4">
      <h1 className="text-center">Dependency List</h1>
      <div className="d-flex flex-row-reverse">
        <a className="btn btn-primary mb-3" href="/crawl">
          Crawler Data
        </a>
      </div>
      <ul className="nav nav-tabs mb-3">
        <li className="nav-item">
          <button
            className={`nav-link ${activeTab === "github" ? "active" : ""}`}
            onClick={() => setActiveTab("github")}
          >
            GitHub Dependencies
          </button>
        </li>
        <li className="nav-item">
          <button
            className={`nav-link ${activeTab === "url" ? "active" : ""}`}
            onClick={() => setActiveTab("url")}
          >
            URL Dependencies
          </button>
        </li>
      </ul>
      <div className="input-group mb-3">
        <input
          type="text"
          className="form-control"
          placeholder="Search for name or source..."
          onChange={(e) =>
            setFilters((prev) => ({ ...prev, SearchTerm: e.target.value }))
          }
        />
        <button
          className="btn btn-outline-secondary"
          onClick={() => fetchData()}
        >
          Search
        </button>
      </div>
      <div className="mt-2 row w-50">
        <div className="col-2">
          <button className="btn btn-secondary" disabled>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              fill="currentColor"
              className="bi bi-funnel"
              viewBox="0 0 16 16"
            >
              <path d="M1.5 1.5A.5.5 0 0 1 2 1h12a.5.5 0 0 1 .5.5v2a.5.5 0 0 1-.128.334L10 8.692V13.5a.5.5 0 0 1-.342.474l-3 1A.5.5 0 0 1 6 14.5V8.692L1.628 3.834A.5.5 0 0 1 1.5 3.5zm1 .5v1.308l4.372 4.858A.5.5 0 0 1 7 8.5v5.306l2-.666V8.5a.5.5 0 0 1 .128-.334L13.5 3.308V2z" />
            </svg>
            Filter
          </button>
        </div>
        {types.map((type) => (
          <div className="form-check col mt-3" key={type}>
            <input
              className="form-check-input"
              type="checkbox"
              value={type}
              onChange={() => handleFilterChange(type)}
              id={`filter-${type}`}
            />
            <label className="form-check-label" htmlFor={`filter-${type}`}>
              {type}
            </label>
          </div>
        ))}
      </div>
      <table className="table table-hover mt-3 table-bordered">
        <thead className="table-secondary">
          <tr>
            <th
              onClick={() =>
                setFilters((prev) => ({ ...prev, OrderBy: "name" }))
              }
            >
              Name
            </th>
            <th>Version</th>
            <th
              onClick={() =>
                setFilters((prev) => ({ ...prev, OrderBy: "source" }))
              }
            >
              Source
            </th>
            <th>Type</th>
          </tr>
        </thead>
        <tbody>
          {dependencies.map((dep, index) => (
            <tr
              key={dep._id}
              onClick={() => handleDependencyClick(dep.name)}
              style={{ cursor: "pointer" }}
            >
              <td>{dep.name}</td>
              <td>{dep.version || "N/A"}</td>
              <td>{dep.source}</td>
              <td>{dep.type}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <nav className="mt-4">{renderPagination()}</nav>

      {modalVisible && selectedDependency && (
        <DependencyModal
          dependency={selectedDependency}
          onClose={() => setModalVisible(false)}
        />
      )}
    </div>
  );
};

export default DependencyList;
