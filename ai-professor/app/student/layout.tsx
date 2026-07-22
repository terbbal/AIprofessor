import RoleGuard from "@/components/RoleGuard";

// /student/* 아래 모든 페이지를 학생 전용으로 보호한다.
export default function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <RoleGuard role="student">{children}</RoleGuard>;
}
