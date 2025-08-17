// src/App.jsx
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home.jsx";
import Chat from "./pages/Chat.jsx";
import SummaryPage from "./pages/SummaryPage.jsx";
import Summaries from "./pages/Summaries.jsx";
import Compare from "./pages/Compare.jsx";
import Classify from "./pages/Classify.jsx";

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/chat" element={<Chat />} />
          <Route path="/summary/:pdfName" element={<SummaryPage />} />
          <Route path="/summaries" element={<Summaries />} />
          <Route path="/compare" element={<Compare />} />
          <Route path="/compare/:pdfName" element={<Compare />} />
          <Route path="/classify/:pdfName" element={<Classify />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
