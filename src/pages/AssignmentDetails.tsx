import React, { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import {
  Table,
  TableCaption,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { useParams } from "react-router-dom";
import { get, post, patch } from "@/services/ApiHelper";
import { jwtDecode } from "jwt-decode";

interface AssignmentData {
  title: string;
  description: string;
  due_date: string;
}

interface SubmissionData {
  submission_id: number;
  student_id: number;
  submission_url: string;
  grade: number | null;
  submitted_at: string;
  name: string;
}

interface DecodedToken {
  user_id: string;
  role: string;
}

const AssignmentPage: React.FC = () => {
  const { assignmentId } = useParams<{ assignmentId: string }>();
  const [file, setFile] = useState<File | null>(null);
  const [assignmentData, setAssignmentData] = useState<AssignmentData | null>(
    null
  );
  const [submissions, setSubmissions] = useState<SubmissionData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<string>("");

  const [grades, setGrades] = useState<{ [key: number]: number }>({});

  useEffect(() => {
    const fetchAssignment = async () => {
      try {
        // Ödev verilerini almak için API isteği
        const data = await get(`/Assignments/${assignmentId}`);
        if (data) {
          setAssignmentData(data);
        } else {
          setError("Bu kurs için ödev bulunmamaktadır.");
        }
      } catch (error) {
        console.error("Ödev verileri yüklenirken hata oluştu:", error);
        setError("Ödev verileri yüklenirken bir hata oluştu.");
      } finally {
        setLoading(false);
      }
    };

    const fetchUserRole = () => {
      const token = localStorage.getItem("token");
      if (token) {
        const decodedToken: DecodedToken = jwtDecode(token);
        setUserRole(decodedToken.role);
      }
    };

    fetchUserRole();
    fetchAssignment();
  }, [assignmentId]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      setFile(event.target.files[0]);
    }
  };

  const handleSubmit = async () => {
    if (file) {
      try {
        const filePath = file.name;
        const token = localStorage.getItem("token");
        const decodedToken: DecodedToken = jwtDecode(token!);

        // API'ye gönderilecek veri
        const submissionData = {
          assignment_id: parseInt(assignmentId!, 10),
          student_id: parseInt(decodedToken.user_id),
          submission_url: filePath,
        };

        // Ödevi yüklemek için API isteği
        await post(`/AssignmentSubmissions`, submissionData);

        alert("Dosya başarıyla kaydedildi!");
      } catch (error) {
        console.error("Ödev yüklenirken hata oluştu:", error);
        alert("Dosya kaydedilemedi. Lütfen tekrar deneyin.");
      }
    }
  };

  const handleViewSubmissions = async () => {
    try {
      // Teslim edilen ödevleri almak için API isteği
      const data = await get(
        `/AssignmentSubmissions/assignment/${assignmentId}`
      );
      setSubmissions(data);
    } catch (error) {
      console.error("Teslim edilen ödevler yüklenirken hata oluştu:", error);
      alert("Teslim edilen ödevler yüklenemedi. Lütfen tekrar deneyin.");
    }
  };

  const handleGradeChange = (submissionId: number, newGrade: number) => {
    setGrades((prevGrades) => ({ ...prevGrades, [submissionId]: newGrade }));
  };

  const handleGradeSubmit = async (submissionId: number) => {
    const newGrade = grades[submissionId];
    try {
      await patch(`/AssignmentSubmissions`, {
        grade: newGrade,
        submission_id: submissionId,
      });
      alert("Not başarıyla güncellendi!");
      handleViewSubmissions();
    } catch (error) {
      console.error("Not güncellenirken hata oluştu:", error);
      alert("Not güncellenemedi. Lütfen tekrar deneyin.");
    }
  };

  if (loading) {
    return <p>Yükleniyor...</p>;
  }

  if (error) {
    return (
      <div>
        <Navbar />
        <div className="flex flex-col items-center justify-center min-h-screen p-8">
          <p className="text-red-500 text-lg font-bold">{error}</p>
        </div>
      </div>
    );
  }

  if (!assignmentData) {
    return (
      <div>
        <Navbar />
        <div className="flex flex-col items-center justify-center min-h-screen p-8">
          <p className="text-red-500 text-lg font-bold">Ödev bulunamadı.</p>
        </div>
      </div>
    );
  }

  // due_date'i formatla
  const formattedDueDate = new Date(assignmentData.due_date).toLocaleDateString(
    "tr-TR",
    {
      year: "numeric",
      month: "long",
      day: "numeric",
    }
  );

  return (
    <div>
      <Navbar />
      <div className="flex flex-col items-center justify-center min-h-screen p-8">
        <h1 className="text-3xl font-bold mb-4">{assignmentData.title}</h1>
        <p className="text-lg mb-8">Son tarih: {formattedDueDate}</p>
        <div className="bg-gray-800 text-white p-6 rounded-lg shadow-md w-full max-w-4xl">
          <h2 className="text-2xl font-semibold mb-4">Yönergeler</h2>
          <p className="mb-8">{assignmentData.description}</p>

          {userRole === "student" ? (
            <div className="flex flex-col gap-4">
              <label className="flex items-center gap-2">
                <span className="text-lg">Çalışmam:</span>
                <input
                  type="file"
                  onChange={handleFileChange}
                  className="text-white"
                />
              </label>
              <Button
                className="bg-blue-500 text-white p-4 rounded mt-4"
                onClick={handleSubmit}
                disabled={!file}
              >
                Teslim Et
              </Button>
            </div>
          ) : (
            <Button
              className="bg-green-500 text-white p-4 rounded mt-4"
              onClick={handleViewSubmissions}
            >
              Teslim Edenleri Görüntüle
            </Button>
          )}

          {userRole === "instructor" && submissions.length > 0 && (
            <Table className="shadow-md w-full max-w-4xl mt-8">
              <TableCaption>Teslim edilen ödevlerin listesi</TableCaption>
              <TableHeader>
                <TableRow>
                  <TableHead>Öğrenci Adı</TableHead>
                  <TableHead>Not</TableHead>
                  <TableHead>Ödev Linki</TableHead>
                  <TableHead>Gönderme Tarihi</TableHead>
                  <TableHead>Not Ver</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {submissions.map((submission) => (
                  <TableRow key={submission.submission_id}>
                    <TableCell className="font-medium">
                      {submission.name}
                    </TableCell>
                    <TableCell>
                      {submission.grade !== null ? submission.grade : "-"}
                    </TableCell>
                    <TableCell>
                      <a
                        href={submission.submission_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-400 underline"
                      >
                        Ödevi Görüntüle
                      </a>
                    </TableCell>
                    <TableCell>
                      {new Date(submission.submitted_at).toLocaleString(
                        "tr-TR"
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2 items-center">
                        <input
                          type="number"
                          min="0"
                          max="100"
                          placeholder="Not"
                          className="p-2 rounded"
                          value={grades[submission.submission_id] || ""}
                          onChange={(e) =>
                            handleGradeChange(
                              submission.submission_id,
                              parseInt(e.target.value)
                            )
                          }
                        />
                        <Button
                          className="bg-blue-500 text-white p-2 rounded"
                          onClick={() =>
                            handleGradeSubmit(submission.submission_id)
                          }
                        >
                          Notu Kaydet
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      </div>
    </div>
  );
};

export default AssignmentPage;
