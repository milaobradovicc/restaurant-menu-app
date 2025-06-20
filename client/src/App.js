import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import AdminLayout from "./admin/AdminLayout";
import AdminHome from "./admin/AdminHome";
import Kategorije from "./admin/AdminKategorije";
import Proizvodi from "./pages/Proizvodi"; // <- korisnička strana
import AdminProizvodi from "./admin/AdminProizvodi"; // <- admin strana

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/kategorija/:id" element={<Proizvodi />} />
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminHome />} />
          <Route path="kategorije" element={<Kategorije />} />
          <Route path="proizvodi" element={<AdminProizvodi />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
