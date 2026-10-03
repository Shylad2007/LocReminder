import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import CreateReminder from './pages/CreateReminder';
import './index.css';

function App() {
  return (
    <Router>
      <div className="app-container">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/create" element={<CreateReminder />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
