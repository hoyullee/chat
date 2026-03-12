# Newchat2

카카오톡 스타일 채팅 앱 — chat-cli로 생성됨

## 시작하기

```bash
# 개발 서버 시작
chat-cli dev

# 특정 플랫폼만 시작
chat-cli dev mobile
chat-cli dev server

# 코드 생성
chat-cli generate screen MyScreen
chat-cli generate api my-feature
```

## 프로젝트 구조

```
apps/
  mobile/     # React Native + Expo (iOS / Android)
  desktop/    # Electron + React (Windows / macOS)
  server/     # NestJS 백엔드 + Socket.io

packages/
  shared-types/   # 공유 타입 정의
  ui-components/  # 공유 UI 컴포넌트
  config/         # 공유 설정
```

## 필수 기능

- ✅ 로그인 / 로그아웃 (JWT + Refresh Token)
- ✅ 친구 목록 / 친구 추가 / 친구 관리
- ✅ 채팅 목록
- ✅ 실시간 채팅 (Socket.io)
- ✅ 이모티콘


생성일: 2026-03-11T06:08:36.190Z
