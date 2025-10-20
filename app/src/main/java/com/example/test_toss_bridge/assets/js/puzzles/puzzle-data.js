export const puzzles = {
    'chair-puzzle': {
        title: '의자 배치',
        question: '의자들을 클릭해서 원형 탁자에 배치하세요!',
        type: 'drag-drop',
        successMessage: '창고에서 무슨 소리가 난 것 같다.',
        nextScene: 'storage-sound',
        answer: '10001000'
    },
    'cabinet-puzzle': {
        title: '캐비넷',
        question: '올바른 원소를 선택하여 캐비넷을 열어주세요.',
        type: 'cabinet-lock',
        answer: 'Ga',
        successMessage: '거울 주변에 단서가 생긴 것 같다. \n 확인해보자.',
        nextScene: 'show-paper'
    },
    'mirror-puzzle': {
        title: '거울',
        question: '각 원소의 원자번호를 순서대로 입력하세요.',
        type: 'mirror-code',
        answer: '3214',
        successMessage: '거울 속의 비밀을 풀었습니다!',
        nextScene: 'mirror-unlocked'
    },
    'storage-clue': {
        title: '창고',
        question: '의자 퍼즐을 완료한 후 창고에서 발견한 재료들을 확인해보세요.',
        type: 'storage-clue'
    },
    'paper-clue': {
        title: '거꾸로 쓰인 종이',
        question: '거울에 비춰보면 뭔가 보일지도...',
        type: 'paper-clue'
    }
};
