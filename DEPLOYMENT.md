# GitHub + Vercel 배포

GitHub 저장소를 Vercel에서 Import하면 루트의 vercel.json 설정으로 배포합니다.
- Framework: Other (자동 설정)
- Root Directory: 저장소 루트
- Build: node scripts/build-vercel.mjs
- Output: dist-vercel
- 별도 환경 변수나 설치 명령 불필요

화면 소스는 experience/에 있습니다. 기존 Sites/Cloudflare 실행 구성도 유지합니다.
Vercel의 api/whispers.js는 기존 공개 Sites 대화 API로 서버에서 중계합니다.
기존 로그인 없는 대화, 서버 금칙어 검사와 D1 저장소를 그대로 이용합니다.
기존 Sites 서비스를 중단하면 Vercel의 대화도 중단됩니다.
중계 서버를 거치므로 기존 IP 기반 2초 전송 제한이 여러 이용자에게 함께 적용될 수 있습니다.
독립 서비스로 전환할 때에는 저장소와 분산 전송 제한을 Vercel용으로 이전해야 합니다.

로컬 화면 확인: python3 -m http.server 8791 --directory experience
로컬 정적 서버에는 /api/whispers가 없으므로 대화는 배포 환경에서 확인합니다.
검사: node tests/moderation.test.mjs

## 현재 접속 인원
상단의 인원은 두 사이트의 공유 D1 집계입니다. 무작위 브라우저 ID와 페이지별 탭 ID만 저장하며 이름이나 IP는 저장하지 않습니다. 같은 사이트/브라우저의 여러 탭을 한 명으로 묶습니다. 다른 브라우저·기기·도메인이나 시크릿 창은 별도로 집계됩니다.
30초마다 heartbeat를 전송하며 최근 90초 안에 응답한 브라우저를 셉니다. 숨겨진 탭은 갱신을 멈추고, 닫힌 탭은 가능한 경우 즉시 제거합니다. 네트워크 단절 시 90초 뒤 다음 요청에서 만료됩니다. 사람이 아닌 봇도 집계될 수 있어 정확한 사람 수나 수용 인원 보장은 아닙니다.
입장 정원 제한은 없습니다. 부하 시험을 통한 최대 동시접속 수는 측정하지 않았습니다.
검사: node tests/presence.test.mjs

내가 채팅 입력창에 포커스하거나 대화 UI를 조작할 때 안내가 숨겨집니다. 다른 사람의 메시지 수신은 안내 상태를 변경하지 않습니다. 기존 30초 자동 숨김은 유지합니다. 읽는 동안 입력/말풍선 조작은 안내를 다시 표시하지 않습니다. 상단 안내 보기 버튼으로 직접 다시 열 수 있습니다. 전송 간격은 클라이언트와 서버 모두 2초이며, 요청 응답 시간은 별도입니다.

## 모바일 BGM
Vercel은 public/audio/의 자체 제작 AAC 트랙 3개를 /audio/에 배포합니다. 버튼 탭에서 HTMLAudioElement.play()를 즉시 호출하며 성공 여부에 맞춰 버튼을 갱신합니다. 시작은 사용자 탭이 필요하고, 재생이 중단되면 다시 켜기를 제공합니다. 지원되는 브라우저에서는 Audio Session playback을 요청합니다. 카카오톡/인스타그램 자체 오디오 정책과 기기 미디어 음량까지 사이트가 제어할 수는 없습니다.
트랙 재생성: macOS에서 python3 scripts/generate-bgm.py (afconvert 필요). 배포에서는 커밋된 AAC 파일을 사용하므로 오디오 생성 도구가 필요하지 않습니다.

2026-11-07: Android/desktop without Audio Session API use the same direct-click native playback path. Failed loads and buffering timeouts reset the media resource on retry; returning to an interrupted session shows retry. Coarse-pointer controls have larger touch targets. Snow adds synthesized winter gusts and soft granular snow sounds; regenerate just this track with `python3 scripts/generate-bgm.py --theme snow`. Clear/rain audio is unchanged. Automated tests cover absent Audio Session API, blocked playback, stale weather requests, buffering and retry; physical iOS/Android in-app browsers still require device QA.
