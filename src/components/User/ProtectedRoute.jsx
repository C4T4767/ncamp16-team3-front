import React, { useEffect, useState } from "react";
import { Outlet, Navigate } from "react-router-dom";

const ProtectedRoute = () => {
    const [loading, setLoading] = useState(true);
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    useEffect(() => {
        const checkLogin = async () => {
            try {
                const isLocal = window.location.hostname === "localhost";
                const base = isLocal ? "http://localhost:8080" : "https://tailfriends.kro.kr";

                const res = await fetch(`${base}/api/auth/check`, {
                    credentials: "include",
                });
                if (res.ok) {
                    const data = await res.json();
                    console.log("🔐 ProtectedRoute 응답 데이터:", data);

                    // isNewUser === false이면 로그인된 상태로 간주
                    const isLogged = data?.isNewUser === false;
                    setIsLoggedIn(isLogged);
                } else {
                    setIsLoggedIn(false);
                }
            } catch (err) {
                console.error("🚨 로그인 체크 실패:", err);
                setIsLoggedIn(false);
            } finally {
                setLoading(false);
            }
        };

        checkLogin();
    }, []);

    if (loading) {
        return <div>로그인 상태 확인 중...</div>;
    }

    if (!isLoggedIn) {
        return <Navigate to="/login" replace />;
    }

    return <Outlet />;
};

export default ProtectedRoute;
