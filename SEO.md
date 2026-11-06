# 검색엔진 등록 및 도메인 관리

## 현재 구성
- 운영 주소: https://naeri-ivory.vercel.app/
- 공통 설정: config/site.mjs (URL, title, description, 소유권 인증 코드)
- Vercel 빌드가 실제 HTML head, /robots.txt, /sitemap.xml을 생성합니다.
- 현재 색인 대상은 홈페이지 한 개입니다. 날씨/달 선택은 별도 페이지가 아니며 익명 대화 API는 사이트맵에 넣지 않습니다.
- robots.txt는 홈페이지와 CSS/JS 수집을 허용하고 /api/는 제외합니다. robots.txt는 개인정보 접근 제어 수단이 아닙니다.
- 실제 화면(body), CSS 및 인터랙션 파일은 변경하지 않았습니다.

## Google Search Console
1. https://search.google.com/search-console 에 로그인하고 속성 추가 → **URL 접두어**에 https://naeri-ivory.vercel.app/ 를 입력합니다. vercel.app 전체 도메인 속성을 등록하지 마세요.
2. HTML 태그 방식의 google-site-verification 태그에서 content 값만 복사합니다.
3. config/site.mjs의 verification.google에 넣고 main에 반영하거나, Vercel 프로젝트의 Production 환경 변수 GOOGLE_SITE_VERIFICATION에 넣은 뒤 재배포합니다.
4. 홈페이지 소스의 head에 태그가 들어갔는지 확인하고 Search Console에서 소유권 확인을 누릅니다. 인증 후에도 값을 삭제하지 않습니다.
5. Sitemaps에 sitemap.xml을 제출합니다.
6. URL 검사에 홈페이지 주소를 넣고 실제 URL 테스트 후 색인 생성을 요청합니다.
공식 안내: https://support.google.com/webmasters/answer/9008080
사이트맵: https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap

## 네이버 서치어드바이저
1. https://searchadvisor.naver.com/ 의 웹마스터 도구에서 https://naeri-ivory.vercel.app/ 를 등록합니다.
2. HTML 태그 방식의 naver-site-verification에서 content 값만 복사합니다.
3. config/site.mjs의 verification.naver 또는 Vercel Production 환경 변수 NAVER_SITE_VERIFICATION에 넣고 재배포합니다.
4. 소유확인을 마칩니다. 인증 값은 이후에도 유지합니다.
5. 요청 → 사이트맵 제출에 https://naeri-ivory.vercel.app/sitemap.xml 을 제출합니다.
6. 웹 페이지 수집 요청/URL 검사로 홈페이지를 확인하고 robots.txt 검증에서 수집 허용을 확인합니다.
공식 안내: https://searchadvisor.naver.com/guide/faq-start-register

## 환경 변수 우선순위
SITE_URL, GOOGLE_SITE_VERIFICATION, NAVER_SITE_VERIFICATION이 있으면 config/site.mjs 값보다 우선합니다.
인증 태그 전체가 아니라 content 속성 값만 넣습니다. 비어 있으면 가짜 태그를 만들지 않습니다.
태그는 빌드 시 HTML에 들어가므로 JavaScript 실행 없이 검색엔진이 읽을 수 있습니다.
환경 변수 변경 후에는 반드시 재배포합니다.

## 독립 도메인 이전
1. Vercel에 새 도메인을 연결하고 DNS/HTTPS 동작을 확인합니다.
2. config/site.mjs의 url (또는 기존 SITE_URL 환경 변수)을 새 HTTPS 루트 주소로 변경하고 재배포합니다. canonical, og:url, robots의 Sitemap, sitemap의 loc가 함께 바뀝니다.
3. 기존 주소에서 새 도메인으로 Vercel의 영구 리디렉션(301/308)을 설정합니다. URL 설정만 바꾸어서는 DNS나 리디렉션이 자동 설정되지 않습니다.
4. Google/네이버에 새 사이트를 등록하고 인증값을 갱신한 뒤 새 사이트맵을 제출합니다. 해당되는 Google 주소 변경 도구도 확인합니다.
5. 기존 사이트/리디렉션은 유지하고 이전 주소를 robots.txt로 차단하지 마세요. 기존 Sites 주소는 대화/인원 서버로 계속 사용하므로 서버 전체를 리디렉션하거나 중단하지 마세요.

## 점검
node tests/seo.test.mjs
node scripts/build-vercel.mjs
빌드 결과의 head, robots.txt, sitemap.xml과 실제 배포 HTTP 상태/헤더를 확인합니다.
모바일 viewport, 확대 제한 없음, 반응형 레이아웃, HTML에 포함된 제목과 본문을 확인합니다. 기존 작은 글씨·버튼은 디자인 유지 요청에 따라 수정하지 않습니다. Lighthouse/Core Web Vitals 점수나 검색 노출을 보장하는 검사는 아닙니다.
소유권 인증 코드 발급, 계정 등록, 색인 요청은 별도 단계입니다. 준비만으로 등록/검색 노출이 완료되지 않습니다.
