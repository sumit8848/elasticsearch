import React from "react";
import { Link } from "react-router-dom";

const SearchResultsViewer = ({ result, searchTerm }) => {
  const url = result.issue_url?.raw;
  const startingPageNumber = result?.startingPage.raw[0];
  const description =
    result.body?.raw?.length > 0
      ? JSON.parse(result.body?.raw).p[0].split(" ").slice(0, 25).join(" ") +
        "..."
      : "";

  return (
    <Link
      to={`/pdf-viewer?pdfUrl=${url}&pageNumber=${startingPageNumber}`}
      target="_blank"
      style={{ textDecoration: "none", color: "inherit" }}
    >
      <div
        className="p-3 shadow-1 blue-hover"
        style={{
          cursor: "pointer",
          margin: "3.2vh 10vw",
        }}
      >
        <img
          src="./images/fallback.jpg"
          alt="Magazine"
          className="d-block w-full"
        />

        <div className="px-1 py-2">
          <p className="mb-3 small font-weight-medium text-uppercase mb-1 text-muted lts-2px">
            {result.subject?.raw.join(", ")}
          </p>
          <h1 className="ff-serif font-weight-normal text-black card-heading mb-2">
            {result.title?.raw.join(", ")}
          </h1>

          <p>{description}</p>
        </div>
        <div
          className="w-full bg-white py-1 px-2 clearfix"
          style={{ borderTop: "1px solid rgba(0,0,0,0.12)" }}
        >
          <span className="float-right">
            <span className="styled-link">
              {result.creator?.raw.join(", ")}
            </span>
          </span>
        </div>
      </div>
    </Link>
  );
};

export default SearchResultsViewer;
