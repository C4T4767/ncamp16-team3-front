import React, { useState, useEffect, useContext, useRef } from "react";
import { Box, Typography, Button, Card, CardContent, IconButton, Link, Tooltip, Avatar, Chip } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import petEx from "/src/assets/images/User/pet_ex.svg";
import sitter from "/src/assets/images/User/petsit_req.svg";
import { WithdrawalModal, NicknameEditModal } from "./MyModal";
import PetSitterQuitModal from "./PetSitterQuitModal";
import { Context } from "../../context/Context.jsx";
import { useNavigate } from "react-router-dom";
import penIcon1 from "/src/assets/images/User/pen_1.svg";
import penIcon2 from "/src/assets/images/User/pen_2.svg";
import axios from "axios";

const MyPage = () => {
    const navigate = useNavigate();
    const [pets, setPets] = useState([]);
    const [sitterStatus, setSitterStatus] = useState({});
    const { user, setUser } = useContext(Context);
    const [hover, setHover] = useState({});
    const [openWithdrawalModal, setOpenWithdrawalModal] = useState(false);
    const [openNicknameModal, setOpenNicknameModal] = useState(false);
    const [openQuitPetsitterModal, setOpenQuitPetsitterModal] = useState(false);
    const [withdrawalInput, setWithdrawalInput] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const fileInputRef = useRef(null);

    // 마이페이지 데이터 가져오기
    useEffect(() => {
        const fetchMyPageData = async () => {
            setIsLoading(true);
            setError(null);
            try {
                // 사용자 정보 API 호출
                const response = await axios.get("/api/user/mypage", {
                    withCredentials: true,
                });

                console.log("마이페이지 응답 데이터:", response.data);

                // API에서 받아온 데이터로 상태 업데이트
                if (response.data) {
                    setUser((prevUser) => ({
                        ...prevUser,
                        nickname: response.data.nickname,
                        photo: response.data.profileImageUrl,
                        id: response.data.userId,
                        path: response.data.profileImageUrl,
                    }));

                    setPets(response.data.pets || []);

                    // 펫시터 상태 확인
                    if (response.data.petSitterStatus) {
                        setSitterStatus({
                            registered: response.data.petSitterStatus === "APPROVE",
                            isPending: response.data.petSitterStatus === "PENDING",
                            status: response.data.petSitterStatus,
                            age: response.data.petSitterInfo?.age,
                            petType: response.data.petSitterInfo?.petType,
                            petCount: response.data.petSitterInfo?.petCount,
                            houseType: response.data.petSitterInfo?.houseType,
                            experience: response.data.petSitterInfo?.sitterExp,
                            comment: response.data.petSitterInfo?.comment,
                            image: response.data.petSitterInfo?.imagePath,
                        });
                    } else {
                        setSitterStatus({
                            registered: false,
                            isPending: false,
                            status: "NONE",
                        });
                    }
                }
            } catch (err) {
                console.error("마이페이지 데이터 로드 실패:", err);
                setError("마이페이지 정보를 불러오는데 실패했습니다.");

                // 오류 시에도 로컬 스토리지의 펫시터 정보 확인
                try {
                    // 백엔드 펫시터 상태 조회 API 호출
                    const petSitterResponse = await axios.get("/api/petsitter/status", {
                        withCredentials: true,
                    });

                    if (petSitterResponse.data && petSitterResponse.data.data) {
                        const petSitterInfo = petSitterResponse.data.data;
                        setSitterStatus({
                            registered: petSitterInfo.status === "APPROVE",
                            isPending: petSitterInfo.status === "PENDING",
                            status: petSitterInfo.status,
                            age: petSitterInfo.age,
                            petType: petSitterInfo.petType,
                            petCount: petSitterInfo.petCount,
                            houseType: petSitterInfo.houseType,
                            experience: petSitterInfo.sitterExp,
                            comment: petSitterInfo.comment,
                            image: petSitterInfo.imagePath,
                        });
                    } else {
                        setSitterStatus({
                            registered: false,
                            isPending: false,
                            status: "NONE",
                        });
                    }
                } catch (petSitterErr) {
                    console.error("펫시터 정보 조회 실패:", petSitterErr);
                    setSitterStatus({
                        registered: false,
                        isPending: false,
                        status: "NONE",
                    });
                }

                // 401 오류인 경우 인증 문제로 간주하고 로그인 페이지로 리다이렉트
                if (err.response && err.response.status === 401) {
                    alert("로그인이 필요합니다.");
                    navigate("/login");
                }
            } finally {
                setIsLoading(false);
            }
        };

        fetchMyPageData();

        // 펫시터 등록 이벤트 리스너 추가
        const handlePetSitterRegistered = (event) => {
            setSitterStatus({
                registered: true,
                ...event.detail.info,
            });
        };

        window.addEventListener("petSitterRegistered", handlePetSitterRegistered);

        return () => {
            window.removeEventListener("petSitterRegistered", handlePetSitterRegistered);
        };
    }, [setUser, navigate]);

    const handleEditPet = (petId) => {
        navigate(`/pet/edit/${petId}`);
    };

    const handleHoverEnter = (id) => setHover((prev) => ({ ...prev, [id]: true }));
    const handleHoverLeave = (id) => setHover((prev) => ({ ...prev, [id]: false }));

    const handleOpenWithdrawalModal = () => setOpenWithdrawalModal(true);
    const handleCloseWithdrawalModal = () => {
        setOpenWithdrawalModal(false);
        setWithdrawalInput("");
    };

    const handleWithdrawalInputChange = (e) => setWithdrawalInput(e.target.value);

    const handleWithdrawal = async () => {
        if (withdrawalInput === "탈퇴합니다") {
            try {
                // 백엔드 API 호출 - 탈퇴 처리
                await axios.delete("/api/user/withdraw", {
                    withCredentials: true,
                });

                // 상태 및 스토리지 완전 초기화
                setUser(null); // 컨텍스트 사용자 정보 초기화
                setPets([]); // 펫 정보 초기화
                setSitterStatus({}); // 펫시터 정보 초기화

                // 로컬 스토리지 전체 클리어
                localStorage.clear();

                // 쿠키 삭제 시도 (주요 인증 쿠키)
                document.cookie = "accessToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";

                alert("회원 탈퇴가 완료되었습니다.");

                // 즉시 로그인 페이지로 이동
                window.location.href = "/login"; // navigate 대신 강제 리로드
            } catch (err) {
                console.error("회원 탈퇴 처리 실패:", err);
                console.error("오류 상세 정보:", err.response?.data);

                if (err.response?.status === 401) {
                    alert("회원탈퇴 되셨습니다.");
                    navigate("/login");
                } else {
                    alert(
                        "회원 탈퇴 처리 중 오류가 발생했습니다: " +
                            (err.response?.data?.error || err.message || "알 수 없는 오류")
                    );
                }
            }
            handleCloseWithdrawalModal();
        } else {
            alert("'탈퇴합니다'를 정확히 입력해주세요.");
        }
    };

    const handleOpenNicknameModal = () => setOpenNicknameModal(true);
    const handleCloseNicknameModal = () => setOpenNicknameModal(false);

    const handleNicknameSave = async (newNickname) => {
        try {
            const response = await axios.put(
                "/api/user/nickname",
                { nickname: newNickname },
                { withCredentials: true }
            );

            if (response.data && response.data.nickname) {
                setUser((prev) => ({ ...prev, nickname: response.data.nickname }));
                alert("닉네임이 성공적으로 변경되었습니다.");
            } else {
                throw new Error("닉네임 업데이트 응답 형식이 올바르지 않습니다.");
            }
        } catch (err) {
            console.error("닉네임 변경 실패:", err);
            alert(err.response?.data?.error || "닉네임 변경 중 오류가 발생했습니다.");
        }
    };

    const handleAddPet = () => {
        navigate("/add-pet");
    };

    const handleProfilePhotoUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (file.size > 5 * 1024 * 1024) {
            alert("이미지 크기는 5MB 이하여야 합니다.");
            return;
        }

        if (!file.type.startsWith("image/")) {
            alert("이미지 파일만 업로드 가능합니다.");
            return;
        }

        // 파일 미리보기
        const reader = new FileReader();
        reader.onload = (event) => {
            setUser((prev) => ({
                ...prev,
                photo: event.target.result,
                path: event.target.result,
            }));
        };
        reader.readAsDataURL(file);

        try {
            // FormData를 사용하여 파일 업로드
            const formData = new FormData();
            formData.append("file", file);

            // 파일 업로드 API 호출
            const uploadResponse = await axios.post("/api/file/upload", formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
                withCredentials: true,
            });

            if (uploadResponse.data && uploadResponse.data.fileId) {
                // 프로필 이미지 업데이트 API 호출 - 경로 수정
                const updateResponse = await axios.put(
                    "/api/user/profile-image",
                    { fileId: uploadResponse.data.fileId },
                    { withCredentials: true }
                );

                if (updateResponse.data && updateResponse.data.profileImageUrl) {
                    setUser((prev) => ({
                        ...prev,
                        photo: updateResponse.data.profileImageUrl,
                        path: updateResponse.data.profileImageUrl,
                    }));
                    alert("프로필 사진이 성공적으로 업데이트되었습니다.");
                }
            }
        } catch (err) {
            console.error("프로필 이미지 업데이트 실패:", err);
            alert("프로필 이미지 업데이트 중 오류가 발생했습니다.");
        }
    };

    const handleSitterAction = () => {
        // 이미 등록된 경우, 지금까지 저장된 정보와 함께 수정 모드로 이동
        if (sitterStatus && sitterStatus.registered) {
            // URL 파라미터로 수정 모드임을 알림
            navigate("/petsitter-register?mode=edit");
        } else {
            // 신규 등록
            navigate("/petsitter-register");
        }
    };

    const handleOpenQuitPetsitterModal = () => {
        setOpenQuitPetsitterModal(true);
    };

    const handleCloseQuitPetsitterModal = () => {
        setOpenQuitPetsitterModal(false);
    };

    const handleQuitPetsitter = async () => {
        try {
            // 펫시터 그만두기 API 호출
            const response = await axios.post(
                "/api/petsitter/quit",
                {},
                {
                    withCredentials: true,
                }
            );

            // 로컬 스토리지에서 펫시터 정보 삭제
            localStorage.removeItem("petSitterRegistrationCompleted");
            localStorage.removeItem("petSitterInfo");

            // 상태 업데이트
            setSitterStatus({
                registered: false,
            });

            // 모달 닫기
            setOpenQuitPetsitterModal(false);

            // 성공 메시지
            alert("펫시터 활동을 중단하였습니다.");
        } catch (error) {
            console.error("펫시터 그만두기 실패:", error);

            // 오류 메시지
            alert(error.response?.data?.message || "펫시터 그만두기 처리 중 오류가 발생했습니다.");
            setOpenQuitPetsitterModal(false);
        }
    };

    const handleProfileClick = () => {
        fileInputRef.current.click();
    };

    const handleDeletePet = async (petId) => {
        if (window.confirm("정말로 이 반려동물 정보를 삭제하시겠습니까?")) {
            try {
                await axios.delete(`/api/pet/${petId}`, {
                    withCredentials: true,
                });
                setPets(pets.filter((pet) => pet.id !== petId));
                alert("반려동물 정보가 삭제되었습니다.");
            } catch (err) {
                console.error("반려동물 삭제 실패:", err);
                alert("반려동물 정보 삭제 중 오류가 발생했습니다.");
            }
        }
    };

    if (isLoading) {
        return (
            <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "80vh" }}>
                <Typography>로딩 중...</Typography>
            </Box>
        );
    }

    if (error) {
        return (
            <Box
                sx={{
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    alignItems: "center",
                    height: "80vh",
                }}
            >
                <Typography color="error" sx={{ mb: 2 }}>
                    {error}
                </Typography>
                <Button
                    variant="contained"
                    onClick={() => window.location.reload()}
                    sx={{
                        bgcolor: "#E9A260",
                        "&:hover": { bgcolor: "#d0905a" },
                    }}
                >
                    다시 시도
                </Button>
            </Box>
        );
    }

    // 프로필 이미지 경로 처리
    const getProfileImageUrl = () => {
        if (!user || !user.path) {
            return "/src/assets/images/User/profile-pic.jpg"; // 기본 이미지
        }

        // 이미 전체 URL인 경우 그대로 사용
        if (user.path.startsWith("http") || user.path.startsWith("data:")) {
            return user.path;
        }

        // 상대 경로인 경우 처리
        return user.path;
    };

    return (
        <Box sx={{ width: "100%", p: 2, pb: 8 }}>
            {/* 상단 헤더 */}
            <Box
                sx={{
                    display: "flex",
                    alignItems: "center",
                    mb: 2,
                    justifyContent: "space-between",
                }}
            >
                <Typography variant="h6" fontWeight="bold">
                    회원정보
                </Typography>
            </Box>

            {/* 숨겨진 파일 입력 필드 */}
            <input
                type="file"
                accept="image/*"
                ref={fileInputRef}
                style={{ display: "none" }}
                onChange={handleProfilePhotoUpload}
            />

            {/* 프로필 섹션 */}
            <Box
                sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    mb: 3,
                    pb: 2,
                    borderBottom: "1px solid #F0F0F0",
                }}
            >
                <Box sx={{ display: "flex", alignItems: "center" }}>
                    {/* 프로필 사진 */}
                    <Box sx={{ position: "relative", mr: 2 }}>
                        <Avatar
                            src={getProfileImageUrl()}
                            alt="프로필"
                            sx={{
                                width: 60,
                                height: 60,
                                bgcolor: "#FF5C5C",
                            }}
                        />
                        <Box
                            sx={{
                                position: "absolute",
                                bottom: 0,
                                right: 0,
                                width: 12,
                                height: 12,
                                bgcolor: "#1877F2",
                                borderRadius: "50%",
                                border: "1px solid white",
                            }}
                        />

                        {/* 펜 아이콘 (편집 버튼) */}
                        <Box
                            onClick={handleProfileClick}
                            sx={{
                                position: "absolute",
                                bottom: 0,
                                right: -8,
                                width: 24,
                                height: 24,
                                bgcolor: "#1877F2",
                                borderRadius: "50%",
                                display: "flex",
                                justifyContent: "center",
                                alignItems: "center",
                                cursor: "pointer",
                                zIndex: 2,
                            }}
                        >
                            <img src={penIcon1} alt="Edit" width="15" height="13" />
                        </Box>
                    </Box>

                    {/* 사용자 이름과 편집 버튼 */}
                    <Box display="flex" alignItems="center">
                        <Typography sx={{ fontWeight: "bold", fontSize: "18px" }}>
                            {user?.nickname || "사용자"}
                        </Typography>
                        <IconButton size="small" onClick={handleOpenNicknameModal} sx={{ ml: 0.5, p: 0 }}>
                            <img src={penIcon2} alt="Edit" width="16" height="16" />
                        </IconButton>
                    </Box>
                </Box>

                <Button
                    variant="contained"
                    size="small"
                    onClick={handleAddPet}
                    sx={{
                        bgcolor: "#E9A260",
                        color: "white",
                        "&:hover": { bgcolor: "#d0905a" },
                        fontSize: "12px",
                        py: 0.5,
                        px: 1.5,
                        borderRadius: "4px",
                        boxShadow: "none",
                    }}
                >
                    동물 추가
                </Button>
            </Box>

            {/* 반려동물 목록 */}
            <Box sx={{ mb: 3 }}>
                {pets.length > 0 ? (
                    pets.map((pet) => (
                        <Card
                            key={pet.id}
                            sx={{
                                mb: 2,
                                borderRadius: "12px",
                                boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
                                position: "relative",
                                transition: "transform 0.2s ease",
                                transform: hover[pet.id] ? "scale(1.02)" : "scale(1)",
                            }}
                            onMouseEnter={() => handleHoverEnter(pet.id)}
                            onMouseLeave={() => handleHoverLeave(pet.id)}
                        >
                            <CardContent sx={{ display: "flex", p: 2.5, "&:last-child": { paddingBottom: 2.5 } }}>
                                <Box sx={{ position: "relative", display: "flex", alignItems: "center" }}>
                                    <Box
                                        component="img"
                                        src={pet.profileImageUrl || petEx}
                                        alt={pet.name}
                                        sx={{
                                            width: 50,
                                            height: 50,
                                            borderRadius: "50%",
                                            mr: 2,
                                            flexShrink: 0,
                                            objectFit: "cover",
                                        }}
                                    />
                                    <Tooltip title="수정하기">
                                        <IconButton
                                            size="small"
                                            onClick={() => handleEditPet(pet.id)}
                                            sx={{
                                                position: "absolute",
                                                right: 2,
                                                bottom: 2,
                                                background: "#f0f0f0",
                                                width: 20,
                                                height: 20,
                                                p: 0.3,
                                                opacity: hover[pet.id] ? 1 : 0.7,
                                            }}
                                        >
                                            <img src={penIcon2} alt="Edit" width="12" height="12" />
                                        </IconButton>
                                    </Tooltip>
                                </Box>
                                <Box sx={{ display: "flex", alignItems: "center", flexGrow: 1 }}>
                                    <Box>
                                        <Typography sx={{ fontSize: "14px", fontWeight: "bold" }}>
                                            {pet.name}
                                        </Typography>
                                        <Typography sx={{ fontSize: "12px", color: "#999" }}>
                                            {pet.type} · {pet.gender} · {pet.weight}kg
                                        </Typography>
                                    </Box>
                                </Box>
                                <IconButton
                                    size="small"
                                    sx={{ color: "#ccc", p: 0.3 }}
                                    onClick={() => handleDeletePet(pet.id)}
                                >
                                    <CloseIcon sx={{ fontSize: 16 }} />
                                </IconButton>
                            </CardContent>
                        </Card>
                    ))
                ) : (
                    <Box sx={{ textAlign: "center", py: 4 }}>
                        <Typography variant="body2" color="text.secondary">
                            등록된 반려동물이 없습니다
                        </Typography>
                        <Button
                            variant="contained"
                            size="small"
                            onClick={handleAddPet}
                            sx={{
                                mt: 2,
                                bgcolor: "#E9A260",
                                color: "white",
                                "&:hover": { bgcolor: "#d0905a" },
                                fontSize: "12px",
                                py: 0.5,
                                px: 1.5,
                                borderRadius: "4px",
                                boxShadow: "none",
                            }}
                        >
                            반려동물 등록하기
                        </Button>
                    </Box>
                )}
            </Box>

            <Box sx={{ mt: 4 }}>
                <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
                    펫시터
                </Typography>
                <Card sx={{ bgcolor: "#FDF1E5", borderRadius: "12px", boxShadow: "none", maxWidth: "90%", mx: "auto" }}>
                    <CardContent sx={{ p: 2 }}>
                        {sitterStatus.registered ? (
                            // 승인된 펫시터의 경우
                            <>
                                {/* 프로필 이미지 */}
                                <Box
                                    sx={{
                                        width: 120,
                                        height: 120,
                                        borderRadius: "50%",
                                        overflow: "hidden",
                                        mb: 3,
                                        mx: "auto",
                                    }}
                                >
                                    <Box
                                        component="img"
                                        src={sitterStatus.image || "/src/assets/images/User/profile-pic.jpg"}
                                        alt="프로필"
                                        sx={{
                                            width: "100%",
                                            height: "100%",
                                            objectFit: "cover",
                                        }}
                                    />
                                </Box>

                                {/* 등록 정보 테이블 */}
                                <Box
                                    sx={{
                                        width: "100%",
                                        display: "flex",
                                        flexDirection: "column",
                                        mb: 3,
                                    }}
                                >
                                    <Box
                                        sx={{
                                            display: "flex",
                                            justifyContent: "space-between",
                                            mb: 1,
                                        }}
                                    >
                                        <Typography fontWeight="bold">연령대</Typography>
                                        <Typography>{sitterStatus.age || "40대"}</Typography>
                                    </Box>

                                    <Box
                                        sx={{
                                            display: "flex",
                                            justifyContent: "space-between",
                                            mb: 1,
                                        }}
                                    >
                                        <Typography fontWeight="bold">반려동물</Typography>
                                        <Typography>
                                            {sitterStatus.petType || "강아지"} {sitterStatus.petCount || "1마리"}
                                        </Typography>
                                    </Box>

                                    <Box
                                        sx={{
                                            display: "flex",
                                            justifyContent: "space-between",
                                            mb: 1,
                                        }}
                                    >
                                        <Typography fontWeight="bold">펫시터 경험</Typography>
                                        <Typography>
                                            {sitterStatus.experience === true || sitterStatus.sitterExp
                                                ? "있음"
                                                : "없음"}
                                        </Typography>
                                    </Box>

                                    <Box
                                        sx={{
                                            display: "flex",
                                            justifyContent: "space-between",
                                            mb: 1,
                                        }}
                                    >
                                        <Typography fontWeight="bold">주거 형태</Typography>
                                        <Typography>{sitterStatus.houseType || "오피스텔"}</Typography>
                                    </Box>

                                    <Box
                                        sx={{
                                            display: "flex",
                                            justifyContent: "space-between",
                                            mb: 1,
                                        }}
                                    >
                                        <Typography fontWeight="bold">한마디</Typography>
                                        <Typography noWrap sx={{ maxWidth: "70%", textOverflow: "ellipsis" }}>
                                            {sitterStatus.comment || "제 아이라는 마음으로 돌봐드려요 😊"}
                                        </Typography>
                                    </Box>
                                </Box>

                                <Box sx={{ display: "flex", gap: 2 }}>
                                    <Button
                                        variant="contained"
                                        onClick={handleSitterAction}
                                        sx={{
                                            flex: 2,
                                            bgcolor: "#E9A260",
                                            "&:hover": { bgcolor: "#d0905a" },
                                            borderRadius: "4px",
                                            py: 0.7,
                                            fontSize: "0.9rem",
                                            boxShadow: "none",
                                        }}
                                    >
                                        펫시터 정보 수정
                                    </Button>
                                    <Button
                                        variant="contained"
                                        onClick={handleOpenQuitPetsitterModal}
                                        sx={{
                                            flex: 1,
                                            bgcolor: "#f44336",
                                            color: "white",
                                            "&:hover": { bgcolor: "#d32f2f" },
                                            borderRadius: "4px",
                                            py: 0.7,
                                            fontSize: "0.85rem",
                                            boxShadow: "none",
                                        }}
                                    >
                                        그만두기
                                    </Button>
                                </Box>
                            </>
                        ) : sitterStatus.isPending ? (
                            // 승인 대기 중인 펫시터의 경우
                            <>
                                <Box
                                    component="img"
                                    src={sitterStatus.image || "/src/assets/images/User/profile-pic.jpg"}
                                    alt="펫시터 프로필"
                                    sx={{
                                        width: 120,
                                        height: 120,
                                        borderRadius: "50%",
                                        objectFit: "cover",
                                        mb: 3,
                                        mx: "auto",
                                        display: "block",
                                    }}
                                />
                                <Box
                                    sx={{
                                        bgcolor: "rgba(255, 193, 7, 0.2)",
                                        p: 2,
                                        borderRadius: 2,
                                        mb: 2,
                                        border: "1px solid #FFC107",
                                    }}
                                >
                                    <Typography
                                        variant="body1"
                                        align="center"
                                        sx={{ color: "#856404", fontWeight: "bold" }}
                                    >
                                        승인 대기 중
                                    </Typography>
                                    <Typography variant="body2" align="center" sx={{ mt: 1, color: "#856404" }}>
                                        관리자가 신청 내용을 검토 중입니다.
                                        <br />
                                        승인이 완료되면 펫시터 활동이 가능합니다.
                                    </Typography>
                                </Box>
                                <Box
                                    sx={{
                                        width: "100%",
                                        display: "flex",
                                        flexDirection: "column",
                                        mb: 3,
                                    }}
                                >
                                    <Box
                                        sx={{
                                            display: "flex",
                                            justifyContent: "space-between",
                                            mb: 1,
                                        }}
                                    >
                                        <Typography fontWeight="bold">연령대</Typography>
                                        <Typography>{sitterStatus.age || "40대"}</Typography>
                                    </Box>

                                    <Box
                                        sx={{
                                            display: "flex",
                                            justifyContent: "space-between",
                                            mb: 1,
                                        }}
                                    >
                                        <Typography fontWeight="bold">반려동물</Typography>
                                        <Typography>
                                            {sitterStatus.petType || "강아지"} {sitterStatus.petCount || "1마리"}
                                        </Typography>
                                    </Box>

                                    <Box
                                        sx={{
                                            display: "flex",
                                            justifyContent: "space-between",
                                            mb: 1,
                                        }}
                                    >
                                        <Typography fontWeight="bold">펫시터 경험</Typography>
                                        <Typography>
                                            {sitterStatus.experience === true || sitterStatus.sitterExp
                                                ? "있음"
                                                : "없음"}
                                        </Typography>
                                    </Box>
                                </Box>
                            </>
                        ) : (
                            // 미등록 펫시터의 경우
                            <>
                                <Box
                                    component="img"
                                    src={sitter}
                                    alt="펫시터 이미지"
                                    sx={{
                                        width: "100%",
                                        height: "auto",
                                        mb: 2,
                                        maxWidth: "200px",
                                        mx: "auto",
                                        display: "block",
                                    }}
                                />
                                <Typography variant="body2" align="center" sx={{ mb: 1.5 }}>
                                    소중한 반려동물들에게
                                    <br />
                                    펫시터가 찾아갑니다!
                                </Typography>

                                <Button
                                    variant="contained"
                                    fullWidth
                                    onClick={handleSitterAction}
                                    sx={{
                                        bgcolor: "#E9A260",
                                        "&:hover": { bgcolor: "#d0905a" },
                                        borderRadius: "4px",
                                        py: 0.7,
                                        fontSize: "0.9rem",
                                        boxShadow: "none",
                                    }}
                                >
                                    펫시터 신청
                                </Button>
                            </>
                        )}
                    </CardContent>
                </Card>
            </Box>

            {/* 회원 탈퇴 링크 */}
            <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 4 }}>
                <Link
                    component="button"
                    underline="always"
                    onClick={handleOpenWithdrawalModal}
                    sx={{ color: "#888888", fontSize: "0.8rem", textAlign: "right" }}
                >
                    회원 탈퇴
                </Link>
            </Box>

            {/* 모달 */}
            <WithdrawalModal
                open={openWithdrawalModal}
                onClose={handleCloseWithdrawalModal}
                inputValue={withdrawalInput}
                onInputChange={handleWithdrawalInputChange}
                onWithdrawal={handleWithdrawal}
            />
            <NicknameEditModal
                open={openNicknameModal}
                onClose={handleCloseNicknameModal}
                currentNickname={user?.nickname || ""}
                onSave={handleNicknameSave}
            />
            <PetSitterQuitModal
                open={openQuitPetsitterModal}
                onClose={handleCloseQuitPetsitterModal}
                onConfirm={handleQuitPetsitter}
            />
        </Box>
    );
};
export default MyPage;
