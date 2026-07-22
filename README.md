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

## 버튼이 안 보일 때 (트러블슈팅)

이번 버전부터는 스크립트가 실행되기만 하면 화면에 **"Mobile CSS Inspector script loaded"** 토스트 메시지가
무조건 뜨도록 만들어 두었습니다 (콘솔을 안 봐도 스크립트 실행 여부를 알 수 있게 하기 위함). 순서대로 확인하세요.

1. **토스트 메시지가 아예 안 뜬다** → 확장이 로드되지 않은 것입니다.
   - Extensions 패널 → Manage Extensions에서 "Mobile CSS Inspector"가 목록에 있는지, 활성화(체크/토글 on) 되어 있는지 확인하세요.
   - 폴더 구조를 확인하세요. `data/<사용자 핸들>/extensions/mobile-css-inspector/manifest.json` 처럼 `manifest.json`이
     바로 그 폴더 안에 있어야 합니다. (zip을 풀면서 `mobile-css-inspector/mobile-css-inspector/manifest.json`처럼
     폴더가 한 겹 더 생기는 실수가 흔합니다.)
   - 브라우저 캐시 때문에 예전 파일을 물고 있을 수 있으니, 완전 새로고침(캐시 삭제 후 새로고침)을 해보세요.

2. **토스트는 뜨는데 그 다음 빨간 에러 토스트(`... failed: ...`)가 뜬다** → 그 메시지에 어떤 단계에서 실패했는지와
   에러 내용이 그대로 나옵니다. 그 메시지를 알려주시면 바로 고쳐드릴 수 있습니다.

3. **에러 없이 로드는 됐다고 뜨는데 버튼이 안 보인다** → 다른 요소에 가려졌을 가능성이 있습니다.
   이번 버전에서 버튼의 z-index를 최댓값(2147483647)으로 올리고 위치도 조금 더 위(`bottom: 120px`)로 옮겼습니다.
   그래도 안 보이면 `style.css`의 `#mci-fab`에서 `bottom`, `right` 값을 바꿔보세요 (예: `top: 100px; right: 16px;`).

## 알려진 제한사항

- 검사 모드 중에는 페이지의 모든 클릭이 가로채집니다(스크롤은 그대로 가능). 검사가 끝나면 반드시 🔍 버튼을 다시 눌러 꺼주세요.
- 캔버스나 iframe 내부처럼 별도 렌더링 컨텍스트에 있는 요소는 감지되지 않을 수 있습니다.
