import { Navigate, Route, Routes } from "react-router-dom";
import Header from "./components/Header.jsx";
import HomePage from "./pages/HomePage.jsx";
import LoginPage from "./pages/LoginPage.jsx";
import SignUpPage from "./pages/SignUpPage.jsx";
import TransactionPage from "./pages/TransactionPage.jsx";
import NotFound from "./pages/NotFound.jsx";
import { useQuery } from "@apollo/client";
import { GET_AUTHENTICATED_USER } from "./graphql/queries/user.query.js";
import { Toaster } from "react-hot-toast";

export default function App() {
    const { loading, data, error } = useQuery(GET_AUTHENTICATED_USER)

    console.log("loading: ", loading)
    console.log("data: ", data)
    console.log("error: ", error)

    if (loading) return null

    return (
        <>
            {data?.authUser && <Header />}
            <Routes>
                <Route path='/' element={data?.authUser ? <HomePage /> : <Navigate to='/login' />} />
                <Route path='/login' element={!data?.authUser ? <LoginPage /> : <Navigate to='/' />} />
                <Route path='/signup' element={!data?.authUser ? <SignUpPage /> : <Navigate to='/' />} />
                <Route path='/transaction/:id' element={data?.authUser ? <TransactionPage /> : <Navigate to='/login' />} />
                <Route path='*' element={<NotFound />} />
            </Routes>
            <Toaster />
        </>
    );
}
