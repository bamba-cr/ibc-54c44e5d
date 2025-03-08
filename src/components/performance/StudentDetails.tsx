
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, BarChart } from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface StudentProject {
  project: {
    id: string;
    name: string;
  };
}

interface Grade {
  subject: string;
  grade: number;
  project_id: string;
}

interface Attendance {
  status: string;
  project_id: string;
}

interface StudentDetailsProps {
  student: {
    id: string;
    name: string;
    student_projects: StudentProject[];
    grades: Grade[];
    attendance: Attendance[];
  };
  stats: {
    averageGrade: number;
    attendanceRate: number;
  };
}

const StudentDetails = ({ student, stats }: StudentDetailsProps) => {
  // Organize grades by subject for better display
  const gradesBySubject = student.grades?.reduce((acc: Record<string, number[]>, grade) => {
    if (!acc[grade.subject]) {
      acc[grade.subject] = [];
    }
    acc[grade.subject].push(grade.grade);
    return acc;
  }, {});

  // Calculate subject averages
  const subjectAverages = Object.entries(gradesBySubject || {}).map(([subject, grades]) => {
    const average = grades.reduce((sum, grade) => sum + grade, 0) / grades.length;
    return { subject, average };
  });

  return (
    <Card className="mt-4 overflow-hidden border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
      <CardHeader className="bg-gray-50">
        <CardTitle className="flex items-center gap-2">
          <BookOpen className="h-5 w-5 text-primary" />
          {student.name}
        </CardTitle>
        <div className="flex flex-wrap gap-3 mt-2">
          <Badge variant="outline" className="flex items-center gap-1">
            <BarChart className="h-3 w-3" />
            Média Geral: {stats.averageGrade.toFixed(1)}
          </Badge>
          <Badge variant="outline" className="flex items-center gap-1">
            <div className="h-3 w-3 rounded-full bg-green-500"></div>
            Frequência: {stats.attendanceRate.toFixed(1)}%
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="p-4">
        <div className="space-y-6">
          <div>
            <h3 className="font-semibold mb-2 text-sm uppercase text-gray-500">Projetos Inscritos</h3>
            <div className="flex flex-wrap gap-2">
              {student.student_projects && student.student_projects.length > 0 ? (
                student.student_projects.map(({ project }) => (
                  <Badge key={project.id} variant="secondary">
                    {project.name}
                  </Badge>
                ))
              ) : (
                <p className="text-sm text-gray-500">Nenhum projeto inscrito</p>
              )}
            </div>
          </div>

          <div>
            <h3 className="font-semibold mb-3 text-sm uppercase text-gray-500">Desempenho por Disciplina</h3>
            {subjectAverages && subjectAverages.length > 0 ? (
              <div className="space-y-3">
                {subjectAverages.map(({ subject, average }) => (
                  <div key={subject} className="space-y-1">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">{subject}</span>
                      <span className="text-sm font-semibold">{average.toFixed(1)}</span>
                    </div>
                    <Progress 
                      value={average * 10} 
                      className="h-2"
                      // Add custom styling based on grade
                      style={{
                        backgroundColor: '#f1f5f9',
                        '--tw-progress-bar-color': average >= 7 
                          ? '#22c55e' // green for good grades
                          : average >= 5 
                            ? '#eab308' // yellow for average grades
                            : '#ef4444', // red for poor grades
                      } as React.CSSProperties}
                    />
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500">Nenhuma nota registrada</p>
            )}
          </div>

          {student.grades && student.grades.length > 0 && (
            <div>
              <h3 className="font-semibold mb-2 text-sm uppercase text-gray-500">Notas Detalhadas</h3>
              <div className="overflow-x-auto -mx-4 px-4">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Disciplina</TableHead>
                      <TableHead className="text-right">Nota</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {student.grades.map((grade, index) => (
                      <TableRow key={index}>
                        <TableCell>{grade.subject}</TableCell>
                        <TableCell className="text-right font-medium">
                          <Badge variant={
                            grade.grade >= 7 ? "success" : 
                            grade.grade >= 5 ? "warning" : "destructive"
                          }>
                            {grade.grade.toFixed(1)}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default StudentDetails;
