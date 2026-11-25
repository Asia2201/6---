const STORAGE_KEY = 'et_lesson_6_data_v3';
let memoryFallback = null;

function getDefaultState() {
    return {
        studentName: '',
        studentClass: '6-А',
        startTime: Date.now(),
        times: {
            page1: 0,
            page2: 0,
            page3_sim: 0,
            page3_prac: 0,
            page4_test: 0
        },
        scores: {
            simulator: 0,
            practice: 0,
            test: 0
        },
        simTasks: {
            t1: false,
            t2: false,
            t3: false
        },
        practiceAnswers: {
            p1: '',
            p2: '',
            p3: ''
        },
        practiceCompleted: false,
        testCompleted: false,
        testAnswers: {}
    };
}

function readRawStorage() {
    try {
        if (window.localStorage) {
            const v = window.localStorage.getItem(STORAGE_KEY);
            if (v) return v;
        }
    } catch (e) {}

    try {
        if (window.name && window.name.startsWith('ET_LESSON_V3:')) {
            return window.name.slice('ET_LESSON_V3:'.length);
        }
    } catch (e) {}

    return memoryFallback;
}

function writeRawStorage(jsonStr) {
    memoryFallback = jsonStr;
    try {
        if (window.localStorage) {
            window.localStorage.setItem(STORAGE_KEY, jsonStr);
        }
    } catch (e) {}

    try {
        window.name = 'ET_LESSON_V3:' + jsonStr;
    } catch (e) {}
}

function loadState() {
    const def = getDefaultState();
    const raw = readRawStorage();
    if (!raw) {
        writeRawStorage(JSON.stringify(def));
        return def;
    }
    try {
        const parsed = JSON.parse(raw);
        return {
            ...def,
            ...parsed,
            times: { ...def.times, ...(parsed.times || {}) },
            scores: { ...def.scores, ...(parsed.scores || {}) },
            simTasks: { ...def.simTasks, ...(parsed.simTasks || {}) },
            practiceAnswers: { ...def.practiceAnswers, ...(parsed.practiceAnswers || {}) },
            testAnswers: { ...(parsed.testAnswers || {}) }
        };
    } catch (e) {
        writeRawStorage(JSON.stringify(def));
        return def;
    }
}

function saveState(state) {
    writeRawStorage(JSON.stringify(state));
}

function resetState() {
    const def = getDefaultState();
    saveState(def);
    return def;
}

function formatSeconds(sec) {
    sec = Math.max(0, Math.floor(Number(sec) || 0));
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

let pageEnterTimestamp = Date.now();
let currentPageKey = null;

function initPageTimer(pageKey, timerElementId) {
    currentPageKey = pageKey;
    pageEnterTimestamp = Date.now();
    const state = loadState();

    const userBadge = document.getElementById('header-student-info');
    if (userBadge && state.studentName) {
        userBadge.textContent = `Учень: ${state.studentName} (${state.studentClass})`;
    }

    const timerEl = document.getElementById(timerElementId);
    if (timerEl) {
        const renderTime = () => {
            const s = loadState();
            const elapsedOnVisit = Math.floor((Date.now() - pageEnterTimestamp) / 1000);
            const totalPageSec = (Number(s.times[pageKey]) || 0) + elapsedOnVisit;
            timerEl.textContent = formatSeconds(totalPageSec);
        };
        renderTime();
        setInterval(renderTime, 500);
    }

    window.addEventListener('beforeunload', () => {
        commitCurrentPageTime();
    });
}

function commitCurrentPageTime() {
    if (!currentPageKey) return;
    const state = loadState();
    const now = Date.now();
    const elapsed = Math.floor((now - pageEnterTimestamp) / 1000);
    if (elapsed > 0) {
        state.times[currentPageKey] = (Number(state.times[currentPageKey]) || 0) + elapsed;
        pageEnterTimestamp = now;
        saveState(state);
    }
}

function convertToSchoolGrade(points22) {
    const pts = Number(points22) || 0;
    if (pts <= 0) return 1;
    const grade = Math.round(pts / 2);
    return Math.max(1, Math.min(11, grade));
}
