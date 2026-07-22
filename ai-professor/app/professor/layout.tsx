import RoleGuard from "@/components/RoleGuard";

// /professor/* 아래 모든 페이지를 교수 전용으로 보호한다.
export default function ProfessorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <RoleGuard role="professor">{children}</RoleGuard>;
}
