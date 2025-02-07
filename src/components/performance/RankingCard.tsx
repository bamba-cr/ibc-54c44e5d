
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";

interface ProjectRanking {
  student_id: string;
  student_name: string;
  average_grade: number;
  attendance_rate: number;
  grade_rank: number;
  attendance_rank: number;
}

interface RankingCardProps {
  title: string;
  icon: LucideIcon;
  iconColor: string;
  rankings: ProjectRanking[];
  type: 'grade' | 'attendance';
}

const RankingCard = ({ title, icon: Icon, iconColor, rankings, type }: RankingCardProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Icon className={`h-5 w-5 ${iconColor}`} />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px]">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Posição</TableHead>
                <TableHead>Aluno</TableHead>
                <TableHead>{type === 'grade' ? 'Média' : 'Frequência'}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rankings.map((student) => (
                <TableRow key={student.student_id}>
                  <TableCell>
                    <Badge
                      variant={
                        (type === 'grade' ? student.grade_rank : student.attendance_rank) <= 3
                          ? "default"
                          : "secondary"
                      }
                    >
                      {type === 'grade'
                        ? `${student.grade_rank}º`
                        : `${student.attendance_rank}º`}
                    </Badge>
                  </TableCell>
                  <TableCell>{student.student_name}</TableCell>
                  <TableCell>
                    {type === 'grade'
                      ? student.average_grade.toFixed(1)
                      : `${student.attendance_rate.toFixed(1)}%`}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default RankingCard;
