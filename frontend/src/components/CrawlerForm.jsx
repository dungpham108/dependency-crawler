import React, { useState } from "react";
import { crawlData, fetchDependencies } from "../api/api";

const CrawlerForm = () => {
  const [type, setType] = useState("url");
  const [input, setInput] = useState("");
  const [message, setMessage] = useState("");
  const [dependencies, setDependencies] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleCrawl = async () => {
    setMessage("");
    setIsLoading(true);
    try {
      const payload =
        type === "url"
          ? { url: input }
          : { owner: input.split("/")[0], repo: input.split("/")[1] };
      await crawlData(type, payload);
      setMessage("Crawl successful!");
      const searchParams = { SearchTerm: input, PageSize: 10, PageNumber: 1 };
      const result = await fetchDependencies(type, searchParams);
      setDependencies(result.data.dependencies);
    } catch (error) {
      setMessage(`Error: ${error.response?.data?.message || error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mt-4">
      <h1 className="text-center">Crawler Data</h1>
      <div className="mb-3">
        <button
          className={`btn ${
            type === "url" ? "btn-primary" : "btn-outline-primary"
          }`}
          onClick={() => setType("url")}
        >
          Crawling URL
        </button>
        <button
          className={`btn ${
            type === "github" ? "btn-primary" : "btn-outline-primary"
          } mx-2`}
          onClick={() => setType("github")}
        >
          Crawling GitHub
        </button>
      </div>
      <div className="input-group mb-3 w-50">
        <input
          type="text"
          className="form-control"
          placeholder={type === "url" ? "Enter URL" : "Enter owner/repo"}
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
        <button
          className="btn btn-outline-secondary"
          onClick={handleCrawl}
          disabled={isLoading}
        >
          {isLoading ? "Crawling..." : "Crawl"}
        </button>
      </div>
      {message && (
        <div
          className={`alert ${
            message.includes("Error") ? "alert-danger" : "alert-success"
          } mt-3`}
        >
          {message}
        </div>
      )}
      {dependencies.length > 0 && (
        <table className="table table-hover mt-3">
          <thead>
            <tr>
              <th>Name</th>
              <th>Version</th>
              <th>Source</th>
              <th>Type</th>
            </tr>
          </thead>
          <tbody>
            {dependencies.map((dep) => (
              <tr key={dep._id}>
                <td>{dep.name}</td>
                <td>{dep.version || "N/A"}</td>
                <td>{dep.source}</td>
                <td>{dep.type}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      <div className="d-flex flex-row-reverse">
        <a className="btn btn-secondary mb-3" href="/">
          Back to Home
        </a>
      </div>
    </div>
  );
};

export default CrawlerForm;
