import { Navigate } from "react-router-dom";
import Auth from "./auth.tsx";
import React, { useEffect, useState } from "react";
import MatrixBackground from "../background_matrix.tsx";

interface Props {
    element: React.ReactElement;
}

const Protected = ({ element }: Props) => {
    const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

    useEffect(() => {
        const checkAuth = async () => {
            const authStatus = await Auth.CheckAuthenticated();
            setIsAuthenticated(authStatus);
        };
        checkAuth();
    }, []);

    if (isAuthenticated === null) {
        return <MatrixBackground />;
    }

    return isAuthenticated ? element : <Navigate to="/" />;
};

export default Protected;