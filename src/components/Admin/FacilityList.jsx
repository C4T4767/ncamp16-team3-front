import React, { useEffect, useState } from "react";
import Layout from "./Layout";
import rows from "../../mock/Admin/facility.json";
import { useNavigate } from "react-router-dom";
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Button, Box } from "@mui/material";
import AdminHeader from "./AdminHeader.jsx";
import { useAdmin } from "./AdminContext.jsx";

function FacilityList() {
    const [searchTerm, setSearchTerm] = useState("");
    const [currentFilter, setCurrentFilter] = useAdmin();
    const [filteredRows, setFilteredRows] = useState(rows);

    // 편의시설 타입 매핑
    const facilityTypeMapping = {
        호텔: "HOTEL",
        미용실: "BEAUTY",
        카페: "CAFE",
    };

    useEffect(() => {
        if (currentFilter && currentFilter != "전체") {
            const filtered = rows.filter((row) => row.facilityType === facilityTypeMapping[currentFilter]);
            setFilteredRows(filtered);
        } else {
            setFilteredRows(rows);
        }
    }, [currentFilter]);

    // 각 열에 대한 스타일 객체를 미리 정의
    const cellStyles = {
        id: { width: 80, minWidth: 80, maxWidth: 80 },
        facilityType: { width: 100, minWidth: 100, maxWidth: 100 },
        starPoint: { width: 80, minWidth: 80, maxWidth: 80 },
        image: { width: 100, minWidth: 100, maxWidth: 100 },
        name: { width: 200, minWidth: 200, maxWidth: 200 },
        address: { width: 350, minWidth: 350, maxWidth: 350 },
        detailAddress: { width: 350, minWidth: 350, maxWidth: 350 },
        createdAt: { width: 200, minWidth: 200, maxWidth: 200 },
    };

    // 공통 스타일 (텍스트 오버플로우 처리)
    const commonCellStyle = {
        overflow: "hidden",
        textOverflow: "ellipsis",
        whiteSpace: "nowrap",
    };

    const navigate = useNavigate();

    const rowHref = (id) => {
        navigate(`/admin/facility/list/${id}`);
    };

    // 검색 핸들러
    const handleSearch = (term) => {
        setSearchTerm(term);

        if (!term) {
            setFilteredRows(rows);
            return;
        }

        const filtered = rows.filter(
            (row) =>
                row.title.toLowerCase().includes(term.toLowerCase()) ||
                row.content.toLowerCase().includes(term.toLowerCase())
        );

        setFilteredRows(filtered);
    };

    // 필터 핸들러
    const handleFilterChange = (filter) => {
        setCurrentFilter(filter);
        // 실제 필터링 로직 구현
        console.log(`필터 변경: ${filter}`);
    };

    // 편의시설 타입 매핑
    const getFacilityType = (type) => {
        const typeMap = {
            BEAUTY: "미용실",
            HOTEL: "호텔",
            CAFE: "카페",
        };
        return typeMap[type];
    };

    return (
        <Layout>
            <AdminHeader onSearch={handleSearch} onFilterChange={handleFilterChange} />

            {/* 테이블 부분 */}
            <Box>
                <TableContainer>
                    <Table sx={{ minWidth: 700 }} aria-label="게시글 테이블">
                        <TableHead>
                            <TableRow>
                                <TableCell sx={{ ...cellStyles.id, ...commonCellStyle }}>시설 번호</TableCell>
                                <TableCell sx={{ ...cellStyles.facilityType, ...commonCellStyle }}>업종</TableCell>
                                <TableCell sx={{ ...cellStyles.starPoint, ...commonCellStyle }}>별점</TableCell>
                                <TableCell sx={{ ...cellStyles.image, ...commonCellStyle }}>사진</TableCell>
                                <TableCell sx={{ ...cellStyles.name, ...commonCellStyle }}>이름</TableCell>
                                <TableCell sx={{ ...cellStyles.address, ...commonCellStyle }}>주소</TableCell>
                                <TableCell sx={{ ...cellStyles.detailAddress, ...commonCellStyle }}>상세주소</TableCell>
                                <TableCell sx={{ ...cellStyles.createdAt, ...commonCellStyle }}>등록일자</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {filteredRows.map((row) => (
                                <TableRow
                                    key={row.id}
                                    onClick={() => rowHref(row.id)}
                                    sx={{
                                        "&:last-child td, &:last-child th": {
                                            border: 0,
                                        },
                                        ":hover": {
                                            backgroundColor: "#eeeeee",
                                        },
                                    }}
                                >
                                    <TableCell component="th" scope="row" sx={{ ...cellStyles.id, ...commonCellStyle }}>
                                        {row.id}
                                    </TableCell>
                                    <TableCell sx={{ ...cellStyles.facilityType, ...commonCellStyle }}>
                                        {getFacilityType(row.facilityType)}
                                    </TableCell>
                                    <TableCell sx={{ ...cellStyles.starPoint, ...commonCellStyle }}>
                                        {row.starPoint}
                                    </TableCell>
                                    <TableCell sx={{ ...cellStyles.image }}>
                                        <Box
                                            component="img"
                                            sx={{
                                                height: 50,
                                                width: 60,
                                                objectFit: "cover",
                                                borderRadius: "4px",
                                            }}
                                            src={row.image}
                                            alt="썸네일"
                                        />
                                    </TableCell>
                                    <TableCell sx={{ ...cellStyles.name, ...commonCellStyle }}>{row.name}</TableCell>
                                    <TableCell sx={{ ...cellStyles.address, ...commonCellStyle }}>
                                        {row.address}
                                    </TableCell>
                                    <TableCell sx={{ ...cellStyles.detailAddress, ...commonCellStyle }}>
                                        {row.detailAddress}
                                    </TableCell>
                                    <TableCell sx={{ ...cellStyles.createdAt, ...commonCellStyle }}>
                                        {row.createdAt}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
                <Box sx={{ mt: 2, display: "flex", justifyContent: "center" }}>
                    <Button sx={{ mx: 1 }}>&lt;</Button>
                    <Button sx={{ mx: 1 }}>1</Button>
                    <Button sx={{ mx: 1 }}>2</Button>
                    <Button sx={{ mx: 1 }}>3</Button>
                    <Button sx={{ mx: 1 }}>&gt;</Button>
                </Box>
            </Box>
        </Layout>
    );
}

export default FacilityList;
