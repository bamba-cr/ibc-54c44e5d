
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
import { BookOpen } from "lucide-react";

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
  return (
    <Card className="mt-4">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BookOpen className="h-5 w-5 text-primary" />
          {student.name}
        </CardTitle>
        <div className="flex gap-4">
          <Badge variant="outline">
            Média Geral: {stats.averageGrade.toFixed(1)}
          </Badge>
          <Badge variant="outline">
            Frequência Geral: {stats.attendanceRate.toFixed(1)}%
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div>
            <h3 className="font-semibold mb-2">Projetos Inscritos</h3>
            <div className="flex flex-wrap gap-2">
              {student.student_projects.map(({ project }) => (
                <Badge key={project.id} variant="secondary">
                  {project.name}
                </Badge>
              ))}
            </div>
          </div>

          <div>
            <h3 className="font-semibold mb-2">Notas por Disciplina</h3>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Disciplina</TableHead>
                  <TableHead>Nota</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {student.grades.map((grade, index) => (
                  <TableRow key={index}>
                    <TableCell>{grade.subject}</TableCell>
                    <TableCell>{grade.grade.toFixed(1)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default StudentDetails;
