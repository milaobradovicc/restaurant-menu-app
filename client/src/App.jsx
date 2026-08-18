import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Proizvodi from "./pages/Proizvodi";
import ProtectedRoute from "./admin/ProtectedRoute";

const AdminLayout = lazy(() => import("./admin/AdminLayout"));
const AdminHome = lazy(() => import("./admin/AdminHome"));
const Kategorije = lazy(() => import("./admin/AdminKategorije"));
const AdminProizvodi = lazy(() => import("./admin/AdminProizvodi"));
const AdminLogo = lazy(() => import("./admin/AdminLogo"));
const AdminLogin = lazy(() => import("./pages/AdminLogin"));

function App() {
  return <BrowserRouter><Suspense fallback={<p className="page-status">Ucitavanje...</p>}><Routes>
    <Route path="/" element={<Home />} />
    <Route path="/kategorija/:id" element={<Proizvodi />} />
    <Route path="/login" element={<AdminLogin />} />
    <Route element={<ProtectedRoute />}><Route path="/admin" element={<AdminLayout />}>
      <Route index element={<AdminHome />} />
      <Route path="kategorije" element={<Kategorije />} />
      <Route path="proizvodi" element={<AdminProizvodi />} />
      <Route path="logo" element={<AdminLogo />} />
    </Route></Route>
  </Routes></Suspense></BrowserRouter>;
}

export default App;
