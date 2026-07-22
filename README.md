# Mobile CSS Inspector (SillyTavern Extension)

모바일에서 SillyTavern의 커스텀 CSS를 꾸밀 때, 원하는 요소의 CSS 셀렉터와 계산된 스타일(computed style)을
데스크톱 개발자도구 없이 바로 확인할 수 있게 해주는 확장입니다.

## 기능

- 화면 우측 하단에 떠 있는 돋보기 버튼(FAB)으로 "검사 모드" on/off
- 검사 모드가 켜진 상태에서 화면의 아무 요소나 탭하면:
  - 실제 클릭/버튼 동작은 실행되지 않고 (탭이 가로채짐)
  - 해당 요소가 빨간 테두리로 하이라이트됨
  - 하단 패널에 다음 정보가 표시됨
    - **Selector**: 탭한 요소 자체의 셀렉터 (`tag#id.class1.class2`)
    - **Full Path**: 가장 가까운 id를 가진 조상부터 내려오는 전체 경로 셀렉터
    - 각 셀렉터 옆 복사 버튼으로 클립보드에 바로 복사
    - 주요 계산된 스타일 (color, background-color, font-size, padding, margin, border, display, position 등) — 체크박스로 켜고 끌 수 있음

## 설치 방법

1. 이 폴더(`mobile-css-inspector`) 전체를 SillyTavern 데이터 폴더 안의 확장 디렉토리에 복사합니다.
   - 경로: `data/<사용자 핸들>/extensions/mobile-css-inspector`
   - 예: 기본 사용자라면 보통 `data/default-user/extensions/mobile-css-inspector`
2. SillyTavern을 새로고침(또는 재시작)합니다.
3. 상단 바 → **Extensions** 패널 → **Manage Extensions**에서 "Mobile CSS Inspector"가 보이는지 확인하고 활성화합니다.

> 참고: GitHub 저장소로 올려두면 Extensions 패널의 **Install extension** 기능으로 git URL을 입력해 설치할 수도 있습니다.

## 사용법

1. 화면 우측 하단의 🔍 버튼을 탭해서 검사 모드를 켭니다 (버튼이 빨간색으로 바뀜).
2. 살펴보고 싶은 요소를 탭합니다. 실제 버튼 동작(전송, 메뉴 열기 등)은 실행되지 않습니다.
3. 하단에 뜨는 패널에서 셀렉터를 확인하고, 복사 아이콘으로 클립보드에 복사한 뒤 커스텀 CSS(User Settings → Custom CSS)에 붙여넣어 스타일을 적용하세요.
4. 다른 요소를 계속 탭하면 패널 내용이 바뀝니다. 패널의 X 버튼으로 닫거나, 🔍 버튼을 다시 눌러 검사 모드를 완전히 끕니다.

## 커스터마이징

- `index.js` 상단의 `STYLE_PROPS` 배열을 수정하면 패널에 표시되는 계산된 스타일 속성 목록을 바꿀 수 있습니다.
- `style.css`에서 FAB 버튼 위치(`bottom`, `right`)나 패널 색상을 원하는 대로 조정할 수 있습니다.

## 알려진 제한사항

- 검사 모드 중에는 페이지의 모든 클릭이 가로채집니다(스크롤은 그대로 가능). 검사가 끝나면 반드시 🔍 버튼을 다시 눌러 꺼주세요.
- 캔버스나 iframe 내부처럼 별도 렌더링 컨텍스트에 있는 요소는 감지되지 않을 수 있습니다.
