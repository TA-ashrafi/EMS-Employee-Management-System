import { Toaster } from "react-hot-toast";
import { Route, Routes } from "react-router-dom";
import LoginLanding from "./pages/LoginLanding";
import { Layout } from "lucide-react";

const App = () => {
    return (
        <>
            <Toaster />
            <Routes>
                <Route path="/login" element={<LoginLanding />} />
                <Route element={<Layout/>}>
                

                </Route>
            </Routes>
        </>
    );
};

export default App;