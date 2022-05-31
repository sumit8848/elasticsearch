import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import PdfViewer from "./PdfViewer";
import SearchUI from "./SearchUI";

function App() {
  return (
    <Router>
      <Routes>
        <Route exact path="/" element={<SearchUI />}></Route>
        <Route exact path="/pdf-viewer" element={<PdfViewer />}></Route>
      </Routes>
    </Router>
  );
}
export default App;
