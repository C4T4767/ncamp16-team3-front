import React, { useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Context } from "../../context/Context.jsx";

const OAuth2Success = () => {
    const { user, setUser } = useContext(Context);
    const navigate = useNavigate();

    useEffect(() => {
        const checkLogin = async () => {
            try {
                const res = await fetch(`/api/auth/check`, {
                    credentials: "include",
                });

                if (!res.ok) {
                    throw new Error("인증 확인 실패");
                }

                const data = await res.json();
                console.log("🔍 로그인 체크 결과:", data);

                if (data.isNewUser) {
                    // SNS 로그인 성공 + 아직 회원가입 전
                    navigate("/register", { replace: true });
                } else {
                    // 이미 회원가입된 사용자
                    let newUser = {};
                    newUser.id = data.userId;
                    newUser.photo = data.userPhoto;
                    newUser.name = data.userName;
                    setUser(newUser);
                    navigate("/", { replace: true });
                }
            } catch (err) {
                console.error("🚨 로그인 체크 실패:", err);
                navigate("/login", { replace: true });
            }
        };

        checkLogin();
    }, [navigate]);

    return (
        <div style={{ textAlign: "center", marginTop: "100px" }}>
            <h2>로그인 처리 중입니다...</h2>
            <p>잠시만 기다려 주세요...</p>
        </div>
    );
};

export default OAuth2Success;
