/** @type {import('next').NextConfig} */
const nextConfig = {
  // 개발 중 cloudflare 터널 도메인에서 /_next/* (HMR 등) 접근 허용.
  // (로컬에서 원격 서버를 터널로 미리보기 할 때 필요)
  allowedDevOrigins: ["*.trycloudflare.com"],
  // pdfjs-dist(ESM)를 Next가 직접 트랜스파일하게 해 webpack의 ESM 래핑 오류
  // ("Object.defineProperty called on non-object")를 회피한다.
  transpilePackages: ["pdfjs-dist"],
  webpack: (config) => {
    // pdfjs가 Node용 canvas를 옵셔널로 참조 → 브라우저 번들에선 무시.
    config.resolve.alias = { ...config.resolve.alias, canvas: false };
    return config;
  },
};

export default nextConfig;
