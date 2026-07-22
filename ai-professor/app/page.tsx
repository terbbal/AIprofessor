import { redirect } from "next/navigation";

// 앱의 첫 관문은 로그인 화면.
export default function Home() {
  redirect("/login");
}
