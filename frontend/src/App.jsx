import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import DependencyList from "./components/DependencyList";
import CrawlerForm from "./components/CrawlerForm";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<DependencyList />} />
        <Route path="/crawl" element={<CrawlerForm />} />
      </Routes>
    </Router>
  );
}

export default App;
