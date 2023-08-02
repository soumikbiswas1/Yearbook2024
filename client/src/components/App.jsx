import "./App.css";
import BranchForm from "./BranchForm";
import FormSubmitted from "./FormSubmitted";
import Main from "./Main";
import { Routes, Route } from "react-router-dom";
import InvalidPage from "./InvalidPage";
import DetailsForm from "./DetailsForm";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Main />}>
        <Route index element={<BranchForm />} />
        <Route path="/submit" element={<FormSubmitted />} />
        <Route path="/:code" element={<DetailsForm />} />
        <Route path="/error" element={<InvalidPage />} />
      </Route>
    </Routes>
  );
}

export default App;
