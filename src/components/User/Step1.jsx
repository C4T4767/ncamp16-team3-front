import * as React from "react";
import Input from "@mui/material/Input";
import FormControl from "@mui/material/FormControl";
import { Box, Button, InputLabel, Typography, Grid } from "@mui/material";
import { useNavigate } from "react-router-dom";
import ReqUi from "./ReqUi.jsx";
import { useRegister } from "./RegisterContext.jsx";
import { useState, useEffect } from "react";
import dayjs from "dayjs";
import "dayjs/locale/ko"; // ✅ 한글 로케일 불러오기
dayjs.locale("ko"); // ✅ 한글 설정

const Step1 = () => {
    const { nextStep, nickname, setNickname, snsAccountId, snsTypeId } = useRegister(); // ✅ email, snsTypeId 가져오기
    const navigate = useNavigate();
    const [error, setError] = useState(false);
    const [loaded, setLoaded] = useState(false);

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []); // 화면 이동시 스크롤 맨 위로

    useEffect(() => {
        if (!snsAccountId || !snsTypeId) {
            return;
        }

        setLoaded(true);
    }, [snsAccountId, snsTypeId]);

    useEffect(() => {
        if (loaded && (!snsAccountId || !snsTypeId)) {
            navigate("/login");
        }
    }, [loaded, snsAccountId, snsTypeId]);

    const handleNext = () => {
        if (!nickname || nickname.trim().length < 2 || nickname.trim().length > 16) {
            setError(true);
            return;
        }
        setError(false);
        nextStep();
    };

    return (
        <>
            <Box
                display="flex"
                flexDirection="column"
                alignItems="left"
                width="90%"
                mx="auto"
                gap={2}
                sx={{
                    position: "relative",
                }}
            >
                <Typography variant="h6" fontWeight="bold" textAlign="center" mt={3}>
                    환영합니다
                </Typography>
                <Typography variant="body1" textAlign="center" mb={2}>
                    회원가입이 완료되었어요! 닉네임을 설정해주세요.
                </Typography>

                <FormControl variant="standard" fullWidth error={error}>
                    <InputLabel htmlFor="nickname">
                        {error ? (
                            <>
                                닉네임 <ReqUi /> (닉네임은 2~16자 이내로 입력해주세요.)
                            </>
                        ) : (
                            <>
                                닉네임 <ReqUi />
                            </>
                        )}
                    </InputLabel>
                    <Input
                        required
                        id="nickname"
                        name="nickname"
                        placeholder="2~16자 이내로 입력해주세요"
                        value={nickname}
                        onChange={(e) => setNickname(e.target.value)}
                    />
                </FormControl>
            </Box>

            <Box
                sx={{
                    position: "fixed",
                    maxWidth: "500px",
                    bottom: 0,
                    width: "100%", // 화면 전체
                    backgroundColor: "#fff",
                    zIndex: 1000,
                    paddingX: 1,
                    paddingBottom: 1,
                    display: "flex",
                    justifyContent: "center",
                }}
            >
                <Grid container spacing={2} sx={{ width: "95%" }}>
                    <Grid item size={6}>
                        <Button
                            fullWidth
                            variant="contained"
                            onClick={() => navigate("/login")}
                            sx={{
                                backgroundColor: "#fff",
                                color: "black",
                            }}
                        >
                            뒤로
                        </Button>
                    </Grid>
                    <Grid item size={6}>
                        <Button
                            fullWidth
                            variant="contained"
                            onClick={handleNext}
                            sx={{
                                backgroundColor: "#E9A260",
                            }}
                        >
                            다음
                        </Button>
                    </Grid>
                </Grid>
            </Box>
        </>
    );
};

export default Step1;
