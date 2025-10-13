import { BankLog, getBankLogs } from "../../api/admin.api";
import React, { useEffect, useState } from "react";

import styled from "styled-components";

const Page = styled.div`
  padding: 20px;
  max-width: 900px;
  margin: 0 auto;
`;

const Box = styled.div`
  background: #fff;
  border: 1px solid #dee2e6;
  border-radius: 8px;
  overflow: hidden;
  margin-bottom: 20px;
`;

const Table = styled.table`
  width: 670px;
  border-collapse: collapse;
  margin: 0 auto;

  td {
    padding: 5px;
    padding-right: 5px;
  }
`;

const TopRow = styled.td`
  background-color: #fff;
  border-bottom: 1px dashed #000;
  font-weight: bold;
`;

const UserCell = styled.td`
  background-color: #eee;
  font-weight: bold;
  border-bottom: 1px solid #fff;
  
  a {
    color: #667eea;
    text-decoration: none;
    
    &:hover {
      text-decoration: underline;
    }
  }
`;

const TitleCell = styled.td`
  background-color: #e7c692;
  font-weight: bold;
  border-bottom: 1px solid #fff;
`;

const MessageCell = styled.td`
  background-color: #cce792;
  border-bottom: 1px solid #fff;
  width: 320px;

  img {
    width: 16px;
    height: 16px;
    vertical-align: middle;
    margin-right: 5px;
  }
`;

const Pagination = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 5px;
  padding: 15px;
  background: #f8f9fa;
`;

export const PageLink = styled.a<{ active?: boolean; disabled?: boolean }>`
  padding: 5px 10px;
  text-decoration: none;
  color: ${(p) => (p.disabled ? "#999" : p.active ? "#fff" : "#667eea")};
  background: ${(p) => (p.active ? "#667eea" : "transparent")};
  border-radius: 4px;
  cursor: ${(p) => (p.disabled ? "default" : "pointer")};
  font-weight: ${(p) => (p.active ? "bold" : "normal")};

  &:hover {
    background: ${(p) => (p.disabled ? "transparent" : p.active ? "#667eea" : "#e9ecef")};
  }
`;

const Ellipsis = styled.span`
  padding: 5px;
  color: #999;
`;

const EmptyRow = styled.tr`
  td {
    padding: 0;
    height: 0;
  }
`;

const LoadingSpinner = styled.div`
  padding: 40px;
  text-align: center;
  color: #6c757d;
`;

const AdminBankLogsPage: React.FC = () => {
  const [bankLogs, setBankLogs] = useState<BankLog[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);

  const loadData = async (page: number) => {
    setLoading(true);
    try {
      const data = await getBankLogs(page, 50);

      if (data.success) {
        setBankLogs(data.bankLogs);
        setCurrentPage(data.pagination.currentPage);
        setTotalPages(data.pagination.totalPages);
      }
    } catch (error) {
      console.error("Error loading logs:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData(1);
  }, []);

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      loadData(page);
    }
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "";
    const [year, month, day] = dateStr.split('T')[0].split("-");
    return `${day}/${month}/${year}`;
  };

  const getPageNumbers = () => {
    const pages: (number | string)[] = [];

    if (totalPages <= 2) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
      return pages;
    }

    // Always show first 2 pages
    for (let i = 1; i <= Math.min(2, totalPages); i++) {
      pages.push(i);
    }

    // Show pages around current page
    const min = currentPage - 3;
    const max = currentPage + 3;
    let hasLeftEllipsis = false;
    let hasRightEllipsis = false;

    for (let i = 3; i <= totalPages - 2; i++) {
      if (i === currentPage || (i >= min && i <= max)) {
        pages.push(i);
      } else if (i < currentPage && !hasLeftEllipsis) {
        pages.push("...");
        hasLeftEllipsis = true;
      } else if (i > currentPage && !hasRightEllipsis) {
        pages.push("...");
        hasRightEllipsis = true;
      }
    }

    // Always show last 2 pages
    for (let i = Math.max(totalPages - 1, 3); i <= totalPages; i++) {
      if (!pages.includes(i)) {
        pages.push(i);
      }
    }

    return pages;
  };

  if (loading) {
    return (
      <Page>
        <LoadingSpinner>טוען נתונים...</LoadingSpinner>
      </Page>
    );
  }

  return (
    <Page>
      <Box>
        <Table>
          <tbody>
            <tr>
              <TopRow width="130">
                <b>מאת</b>
              </TopRow>
              <TopRow width="110">
                <b>אל</b>
              </TopRow>
              <TopRow width="150">
                <b>מתי</b>
              </TopRow>
              <TopRow width="280">
                <b>כמה</b>
              </TopRow>
            </tr>
            <EmptyRow>
              <td colSpan={4}></td>
            </EmptyRow>

            {bankLogs.map((log, index) => (
              <React.Fragment key={log.id}>
                <tr>
                  <UserCell>
                    <a href={`/profile?player=${log.sender}`}>{log.sender}</a>
                  </UserCell>
                  <UserCell>
                    <a href={`/profile?player=${log.reciever}`}>{log.reciever}</a>
                  </UserCell>
                  <TitleCell>
                    <b>{formatDate(log.date)}</b>
                  </TitleCell>
                  <MessageCell>
                    <table width="320" style={{ border: 0 }}>
                      <tbody>
                        <tr>
                          <td width="320">
                            <img
                              src={`/images/icons/${log.what}.png`}
                              alt={log.what}
                              onError={(e) => {
                                e.currentTarget.style.display = "none";
                              }}
                            />
                            {log.amount.toLocaleString()}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </MessageCell>
                </tr>
                <EmptyRow>
                  <td colSpan={4}></td>
                </EmptyRow>
              </React.Fragment>
            ))}

            {totalPages > 1 && (
              <tr>
                <td colSpan={4}>
                  <Pagination>
                    <PageLink
                      disabled={currentPage === 1}
                      onClick={() => handlePageChange(currentPage - 1)}
                    >
                      &lt;
                    </PageLink>

                    {getPageNumbers().map((page, index) =>
                      typeof page === "number" ? (
                        <PageLink
                          key={index}
                          active={page === currentPage}
                          onClick={() => handlePageChange(page)}
                        >
                          {page}
                        </PageLink>
                      ) : (
                        <Ellipsis key={index}>...</Ellipsis>
                      )
                    )}

                    <PageLink
                      disabled={currentPage === totalPages}
                      onClick={() => handlePageChange(currentPage + 1)}
                    >
                      &gt;
                    </PageLink>
                  </Pagination>
                </td>
              </tr>
            )}
          </tbody>
        </Table>
      </Box>
    </Page>
  );
};

export default AdminBankLogsPage;