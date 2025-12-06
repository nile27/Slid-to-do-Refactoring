# 🔧 GitHub 협업 및 브랜치 관리 정책

## 📚 목차
1. [📌 Issue 관리](#1-📌-issue-관리)
2. [🎯 Milestone](#2-🎯-milestone)
3. [🗂 Projects (칸반 보드)](#3-🗂-projects-칸반-보드)
4. [🌱 브랜치 전략](#4-🌱-브랜치-전략)
5. [🛡 GitHub Branch Ruleset](#5-🛡-github-branch-ruleset)
6. [🚀 Pull Request (PR) 정책](#6-🚀-pull-request-pr-정책)
7. [📝 PR 제목 작성 규칙](#7-📝-pr-제목-작성-규칙)
8. [📎 기타 규칙](#8-📎-기타-규칙)


---

## 1. 📌 Issue 관리

- 기능 제안, 버그 제보, 질문 등을 등록할 수 있는 **작업 단위 카드** 입니다.
- 하나의 이슈는 가능하면 **하나의 커밋 또는 PR**에 매핑되도록 작성합니다.
- 이슈 제목 예시:
  - `[Feature] 로그인 기능 구현`
  - `[Bug] 모바일 환경에서 레이아웃 깨짐`

### 🔸 레이블 종류

| 레이블 | 설명 |
|--------|------|
| `feature` | 신규 기능 개발 |
| `bug` | 버그 수정 |
| `refactor` | 코드 리팩토링 |
| `design` | UI/UX 변경 |
| `qa` | 테스트/품질 확인 |
| `question` | 질문, 논의 |
| `docs` | 문서 수정 |

### 🔸 Issue 템플릿 종류
- `Feature Request` : 기능 추가 이슈
- `Bug Report` : 버그 리포트 이슈
- `Custom issue template` : 자유 양식 템플릿

&nbsp;
## 2. 🎯 Milestone
- 여러 이슈를 **목표 단위** 또는 **버전별 일정**으로 그룹화할 수 있습니다.
- 마일스톤을 통해 프로젝트 진행률을 시각적으로 추적합니다.
- 하나의 마일스톤은 티켓의 집합인 **에픽** 처럼 관리합니다.

&nbsp;
## 3. 🗂️ Projects (칸반 보드)
- 프로젝트 보드를 통해 업무 흐름 시각화 합니다.
- 기본 열 구성: `Todo` / `In Progress` / `Review` / `Done`
- 드래그 앤 드롭으로 이슈와 PR의 상태를 관리합니다.

&nbsp;
## 4. 🌱 브랜치 전략

### 🔸 브랜치 역할 및 정책
| 브랜치 | 역할 및 설명 |
|--------|---------------|
| **main** | 출시되는 제품 브랜치 |
| **develop** | 다음 출시 버전을 위한 통합 개발 브랜치 |
| **feature/** | 새로운 기능 개발 브랜치 (develop에서 파생) |
| **release/** | QA 및 배포 준비 브랜치 (develop에서 파생 후 main 병합) |
| **hotfix/** | 운영 중 긴급 수정 브랜치 (main에서 파생 후 main과 develop에 병합) |


### 🔸 브랜치 네이밍 규칙
> 브랜치는 **구조적 관리**와 **기능 파악의 용이성**을 위해  
> 슬래시(`/`)와 하이픈(`-`)을 조합하여 명명합니다.
- 구조 : [타입]/[주요기능] → [세부기능]-[이슈번호]
  - 예시
    - feature/signup → signup-layout-12
    - feature/chat → note-write-api-27

&nbsp;
## 5. 🛡 GitHub Branch Ruleset
- 모든 브랜치는 기본적으로 **force push 금지**

| 브랜치 | 규칙 요약 |
|--------|-----------|
| `main` | ✅ PR 병합만 허용<br>✅ 삭제 금지<br>✅ 리뷰어 2인 이상<br>✅ CI/CD 필수<br>✅ Squash merge만 허용 |
| `develop` | ✅ PR 병합만 허용<br>✅ 삭제 금지<br>✅ 리뷰어 2인 이상<br>✅ CI/CD 필수<br>✅ Squash merge만 허용<br>✅ `feature/*` → PR 권장 |
| `release/*` | ✅ PR 병합만 허용<br>✅ QA 완료 후 `main`에 병합<br>✅ 리뷰 1인 이상 |
| `hotfix/*` | ✅ 긴급 상황 시 PR 없이 머지 가능<br>✅ 이후 리뷰/기록 필수<br>✅ `main`과 `develop` 양쪽에 병합 |
| `feature/*` | ❌ 보호 규칙 없음, 자유롭게 생성/삭제 가능 |


---

## 6. 🚀 Pull Request (PR) 정책
- PR을 통해 코드 리뷰를 수행하며, 다음을 권장합니다:
  
### 🔸 Pull Request 템플릿
- 이슈 번호, 작업 내용, 리뷰 요구사항 등을 포함한 PR 서식

### 🔸 PR 머지 조건
| 항목 | 조건 |
|------|------|
| 리뷰 승인 | 기본 2인 (release 브랜치는 1인) |
| CI/CD | 필수 (예: 테스트, 빌드 성공) |
| 병합 방식 | ✅ Squash merge만 허용 (linear history 유지) |

## 7. 📝 PR 제목 작성 규칙 
- [타입] 주요 작업 요약 (#이슈번호)
  - 예시 :
    - `[Feature] 회원가입 폼 UI 구현 (#12)`
    - `[Fix] 로그인 시 토큰 오류 해결 (#34)`
- 타입의 종류는 [커밋 컨벤션](https://www.notion.so/22261be3ce8580199873caf4fc35d807)을 따릅니다.
- 이슈 번호가 없을 경우 생략 가능하지만, **가능하면 작성 권장**

---

## 8. 📎 기타 규칙
- 커밋 메시지, PR 제목 등은 **Conventional Commits** 컨벤션을 따릅니다.
- 이슈와 PR은 항상 **명확하고 구체적으로 작성**합니다.
- 리뷰는 적극 참여하며, 의견 충돌 시 **팀 협의로 해결**합니다.

