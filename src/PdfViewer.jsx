import React, { useState } from "react";
import { Document, Page } from "react-pdf";
import { useLocation } from "react-router-dom";

import pdfjsWorker from "pdfjs-dist/build/pdf.worker.entry";

// pdfjs.GlobalWorkerOptions.workerSrc = pdfjsWorker;
// pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`;

export default function PdfViewer() {
  const { search } = useLocation();
  const urlParams = search.split("?pdfUrl=")[1].split("&pageNumber=");
  const startingPageNumber = urlParams[1];
  const pdfUrl = urlParams[0];
  const [numPages, setNumPages] = useState(null);
  const [pageNumber, setPageNumber] = useState(Number(startingPageNumber) || 1);
  function onDocumentLoadSuccess({ numPages }) {
    setNumPages(numPages);
    setPageNumber(Number(startingPageNumber) || 1);
  }

  function changePage(offset) {
    setPageNumber((prevPageNumber) => prevPageNumber + offset);
  }

  function previousPage() {
    changePage(-1);
    window.scrollTo(0, 0);
  }

  function nextPage() {
    changePage(1);
    window.scrollTo(0, 0);
  }

  return (
    <div className="container">
      <Document
        file={pdfUrl}
        options={{ workerSrc: pdfjsWorker }}
        onLoadSuccess={onDocumentLoadSuccess}
      >
        <Page pageNumber={pageNumber} className="mt-5" />
      </Document>
      {numPages && (
        <div className="mb-3">
          <p className="text-center">
            Page {pageNumber || (numPages ? 1 : "...")} of {numPages || "..."}
          </p>
          <div className="text-center ">
            <button
              type="button"
              disabled={pageNumber <= 1}
              onClick={previousPage}
            >
              Previous
            </button>
            <button
              type="button"
              disabled={pageNumber >= numPages}
              onClick={nextPage}
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
