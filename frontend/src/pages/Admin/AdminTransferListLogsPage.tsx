import {
    Pagination,
    TransferListLog,
    getTransferListLogs,
    getTransferListLogsByUser,
} from "../../api/admin.api";
import React, { useEffect, useState } from "react";

import { PageLink } from "./BankLogs";
import styled from "styled-components";

const Page = styled.div`
  padding: 20px;
  display: flex;
  justify-content: center;
`;

const Container = styled.div`
  width: 100%;
  max-width: 750px;
`;

const SearchBox = styled.div`
  background: #fff;
  border: 1px solid #dee2e6;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
`;

const SearchForm = styled.form`
  display: flex;
  gap: 10px;
  align-items: center;
`;

const Input = styled.input`
  flex: 1;
  padding: 10px 15px;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 14px;
`;

const Button = styled.button`
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  padding: 10px 24px;
  border-radius: 4px;
  font-weight: 600;
  cursor: pointer;
  font-size: 14px;

  &:hover {
    opacity: 0.9;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const ClearButton = styled(Button)`
  background: linear-gradient(135deg, #6c757d 0%, #495057 100%);
`;

const Table = styled.table`
  width: 700px;
  border-collapse: collapse;
  background: #fff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  text-align: center;
`;

const HeaderCell = styled.td`
  background-color: #fff;
  padding: 10px;
  border-bottom: 1px dashed #000;
  font-weight: bold;
  text-align: center;
`;

const UserCell = styled.td`
  background-color: #eee;
  font-weight: bold;
  padding: 8px;
  border-bottom: 1px solid #fff;

  a {
    color: #667eea;
    text-decoration: none;

    &:hover {
      text-decoration: underline;
    }
  }
`;

const InfoCell = styled.td`
  background-color: #cce792;
  padding: 8px;
  border-bottom: 1px solid #fff;
  font-weight: bold;
`;

const Spacer = styled.tr`
  height: 0;

  td {
    padding: 0;
    border: none;
  }
`;

const PaginationWrapper = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 5px;
`;

const Ellipsis = styled.span`
  padding: 6px 4px;
  color: #6c757d;
  font-size: 14px;
`;

const LoadingContainer = styled.div`
  padding: 60px 20px;
  text-align: center;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
`;

const LoadingText = styled.div`
  color: #6c757d;
  font-size: 16px;
  margin-top: 10px;
`;

const EmptyState = styled.div`
  padding: 60px 20px;
  text-align: center;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  color: #6c757d;
`;

const AdminTransferListLogsPage: React.FC = () => {
  const [logs, setLogs] = useState<TransferListLog[]>([]);
  const [pagination, setPagination] = useState<Pagination>({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 50,
    hasNext: false,
    hasPrev: false,
  });
  const [loading, setLoading] = useState(true);
  const [searchUsername, setSearchUsername] = useState("");
  const [activeFilter, setActiveFilter] = useState<string | null>(null);

  const loadData = async (page: number, username?: string) => {
    setLoading(true);
    try {
      const res = username
        ? await getTransferListLogsByUser(username, page)
        : await getTransferListLogs(page);

      if (res.success) {
        setLogs(res.logs);
        setPagination(res.pagination);
      }
    } catch (error) {
      console.error("Error loading transfer list logs:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData(1);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchUsername.trim()) {
      setActiveFilter(searchUsername.trim());
      loadData(1, searchUsername.trim());
    }
  };

  const handleClear = () => {
    setSearchUsername("");
    setActiveFilter(null);
    loadData(1);
  };

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= pagination.totalPages) {
      loadData(page, activeFilter || undefined);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const formatDateTime = (dateStr: string) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    const seconds = String(date.getSeconds()).padStart(2, "0");
    return `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;
  };

  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const { currentPage, totalPages } = pagination;

    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
      return pages;
    }

    pages.push(1);
    if (totalPages > 1) pages.push(2);

    const min = currentPage - 3;
    const max = currentPage + 3;
    let leftEllipsis = false;
    let rightEllipsis = false;

    for (let i = 3; i < totalPages - 1; i++) {
      if (i === currentPage || (i > min && i < max)) {
        pages.push(i);
      } else if (i < currentPage && !leftEllipsis) {
        pages.push("...");
        leftEllipsis = true;
      } else if (i > currentPage && !rightEllipsis) {
        pages.push("...");
        rightEllipsis = true;
      }
    }

    if (totalPages > 2) {
      if (totalPages > 3) pages.push(totalPages - 1);
      pages.push(totalPages);
    }

    return pages.filter((page, index, self) => self.indexOf(page) === index);
  };

  if (loading) {
    return (
      <Page>
        <Container>
          <LoadingContainer>
            <div style={{ fontSize: "48px" }}>⏳</div>
            <LoadingText>טוען נתונים...</LoadingText>
          </LoadingContainer>
        </Container>
      </Page>
    );
  }

  return (
    <Page>
      <Container>
        <SearchBox>
          <SearchForm onSubmit={handleSearch}>
            <Input
              type="text"
              value={searchUsername}
              onChange={(e) => setSearchUsername(e.target.value)}
              placeholder="חפש לפי שם משתמש (קונה או מוכר)..."
            />
            <Button type="submit" disabled={loading}>
              חפש
            </Button>
            {activeFilter && (
              <ClearButton type="button" onClick={handleClear}>
                נקה
              </ClearButton>
            )}
          </SearchForm>
        </SearchBox>

        {logs.length === 0 ? (
          <EmptyState>
            <div style={{ fontSize: "48px", marginBottom: "15px" }}>📦</div>
            <div style={{ fontSize: "16px", fontWeight: "600" }}>
              אין רשומות להצגה
            </div>
          </EmptyState>
        ) : (
          <Table>
            <tbody>
              {/* Header Row */}
              <tr>
                <HeaderCell style={{ width: "120px" }}>קונה</HeaderCell>
                <HeaderCell style={{ width: "80px" }}>מוכר</HeaderCell>
                <HeaderCell style={{ width: "150px" }}>מתי</HeaderCell>
                <HeaderCell style={{ width: "200px" }}>פוקימון</HeaderCell>
                <HeaderCell style={{ width: "200px" }}>מחיר</HeaderCell>
              </tr>
              <Spacer>
                <td colSpan={5} />
              </Spacer>

              {/* Data Rows */}
              {logs.map((log) => (
                <React.Fragment key={log.id}>
                  <tr>
                    <UserCell>
                      <a href={`/profile?player=${log.buyer}`}>{log.buyer}</a>
                    </UserCell>
                    <UserCell>
                      <a href={`/profile?player=${log.seller}`}>{log.seller}</a>
                    </UserCell>
                    <InfoCell>{formatDateTime(log.date)}</InfoCell>
                    <UserCell>
                      #{log.real_id} - {log.pokemon_name}
                      <br />
                      Level {log.level}
                    </UserCell>
                    <InfoCell>
                      Silver: {log.silver.toLocaleString()}
                      <br />
                      Gold: {log.gold}
                    </InfoCell>
                  </tr>
                  <Spacer>
                    <td colSpan={5} />
                  </Spacer>
                </React.Fragment>
              ))}

              {/* Pagination Row */}
              {pagination.totalPages > 1 && (
                <tr>
                  <td colSpan={4}>
                    <PaginationWrapper>
                      <PageLink
                        disabled={pagination.currentPage === 1}
                        onClick={() => handlePageChange(pagination.currentPage - 1)}
                      >
                        &lt;
                      </PageLink>

                      {getPageNumbers().map((page, index) =>
                        typeof page === "number" ? (
                          <PageLink
                            key={index}
                            active={page === pagination.currentPage}
                            onClick={() => handlePageChange(page)}
                          >
                            {page}
                          </PageLink>
                        ) : (
                          <Ellipsis key={index}>...</Ellipsis>
                        )
                      )}

                      <PageLink
                        disabled={pagination.currentPage === pagination.totalPages}
                        onClick={() => handlePageChange(pagination.currentPage + 1)}
                      >
                        &gt;
                      </PageLink>
                    </PaginationWrapper>
                  </td>
                </tr>
              )}
            </tbody>
          </Table>
        )}
      </Container>
    </Page>
  );
};

export default AdminTransferListLogsPage;