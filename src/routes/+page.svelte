<script lang="ts">
  import { onMount } from 'svelte';
  import {
    Button,
    Checkbox,
    InlineNotification,
    Select,
    SelectItem,
    Tag,
    TextArea,
    TextInput,
    Tile
  } from 'carbon-components-svelte';

  type ActivityType = '音素' | '单词' | '句子' | '练习';
  type ViewMode = 'compose' | 'path' | 'issues' | 'versions' | 'workbook';
  type PreviewWidth = 'phone' | 'tablet' | 'desktop';
  type IssueLevel = 'error' | 'warning' | 'info';

  interface Activity {
    id: string;
    type: ActivityType;
    title: string;
    content: string;
    phonemes: string[];
    dependencies: string[];
    difficulty: number;
    prompt: string;
    accessibility: string;
    duration: number;
    feedback: string;
  }

  interface CourseVersion {
    id: string;
    label: string;
    savedAt: string;
    note: string;
    activities: Activity[];
  }

  interface Course {
    id: string;
    title: string;
    level: string;
    ageRange: string;
    objective: string;
    activities: Activity[];
    versions: CourseVersion[];
    updatedAt: string;
  }

  interface Diagnostic {
    id: string;
    activityId: string;
    level: IssueLevel;
    category: string;
    title: string;
    detail: string;
  }

  interface VersionDiff {
    id: string;
    title: string;
    kind: 'added' | 'removed' | 'changed';
    detail: string;
  }

  interface PracticeAttempt {
    id: string;
    activityId: string;
    score: number;
    missedPhonemes: string[];
    practicedAt: string;
  }

  interface Assignment {
    activityId: string;
    assignedAt: string;
    snapshotTitle: string;
    snapshotType: ActivityType;
    snapshotPhonemes: string[];
  }

  interface Student {
    id: string;
    name: string;
    createdAt: string;
    assignments: Assignment[];
    attempts: PracticeAttempt[];
  }

  interface Blocker {
    id: string;
    title: string;
    reason: '未布置' | '未过关';
  }

  type WorkStatus = 'passed' | 'blocked' | 'ready' | 'removed';

  interface WorkbookRow {
    activityId: string;
    inCourse: boolean;
    title: string;
    type: ActivityType;
    phonemes: string[];
    assignedAt: string;
    status: WorkStatus;
    streak: number;
    needed: number;
    attemptCount: number;
    lastScore: number | null;
    bestScore: number | null;
    lastMissed: string[];
    blockers: Blocker[];
  }

  interface StudentSummary {
    assigned: number;
    passed: number;
    ready: number;
    blocked: number;
    removed: number;
    stuck: Array<{ activityId: string; title: string; blockers: Blocker[] }>;
    missedTop: Array<{ phoneme: string; count: number }>;
    recent: Array<{ id: string; title: string; score: number; missed: string[]; at: string }>;
  }

  const STORAGE_KEY = 'sologsb-1026-phonics-course-v1';
  const STUDENTS_KEY = 'sologsb-1026-phonics-students-v1';
  const PASS_SCORE = 80;
  const PASS_STREAK = 2;
  const confusablePairs = [
    ['/b/', '/p/'], ['/d/', '/t/'], ['/f/', '/v/'], ['/m/', '/n/'], ['/ɪ/', '/iː/'], ['/æ/', '/e/']
  ];

  const initialCourse = (): Course => ({
    id: 'course-phonics-1',
    title: 'Starter Phonics · 声音侦探',
    level: '启蒙一级',
    ageRange: '5–6 岁',
    objective: '建立音素意识，能听辨、拼读并书写短元音单词。',
    updatedAt: '2026-09-24T16:20:00+08:00',
    activities: [
      {
        id: 'a-1', type: '音素', title: '听音游戏：认识 /m/', content: '/m/',
        phonemes: ['/m/'], dependencies: [], difficulty: 1,
        prompt: '闭上嘴唇，轻轻发出 /m/，感受鼻子的震动。',
        accessibility: '提供口型示范图和可重复播放的低频音频。', duration: 6, feedback: ''
      },
      {
        id: 'a-2', type: '音素', title: '首音识别：/s/ 与 /m/', content: '/s/ /m/',
        phonemes: ['/s/', '/m/'], dependencies: ['a-1'], difficulty: 1,
        prompt: '听到单词时拍手，听到 /m/ 时把手放在鼻子上。',
        accessibility: '视觉提示使用不同形状，不只依赖颜色。', duration: 8, feedback: ''
      },
      {
        id: 'a-3', type: '单词', title: '拼读短词：sat', content: 's – a – t → sat',
        phonemes: ['/s/', '/æ/', '/t/'], dependencies: ['a-2'], difficulty: 2,
        prompt: '用手指依次点每个字母，再连起来读。',
        accessibility: '字母块支持键盘逐字聚焦和屏幕阅读器朗读。', duration: 10, feedback: '三条电缆拼在一起形成完整电路。'
      },
      {
        id: 'a-4', type: '练习', title: '听音选图：m / s 开头', content: 'moon, sun, mat, sock',
        phonemes: ['/m/', '/s/'], dependencies: ['a-2'], difficulty: 2,
        prompt: '先听单词，再从两张图片中选出正确首音。',
        accessibility: '所有图片均配替代文本，可只用键盘选择。', duration: 8, feedback: ''
      },
      {
        id: 'a-5', type: '音素', title: '短元音 /æ/ 的口型', content: '/æ/',
        phonemes: ['/æ/'], dependencies: ['a-1'], difficulty: 2,
        prompt: '嘴巴张大，舌尖放低，声音短而有力。',
        accessibility: '提供正面口型、侧面舌位和慢速音频。', duration: 6, feedback: ''
      },
      {
        id: 'a-6', type: '句子', title: '拼读句子：Mat sat.', content: 'Mat sat on the mat.',
        phonemes: ['/m/', '/æ/', '/s/', '/t/'], dependencies: ['a-3'], difficulty: 3,
        prompt: '先读每个单词，再按意群连读句子。',
        accessibility: '句子可按词高亮，并提供更大字号选项。', duration: 10, feedback: '读对了，再试试让声音更连贯。'
      },
      {
        id: 'a-7', type: '练习', title: '把单词和图片配对', content: 'mat · map · sun · sock',
        phonemes: ['/m/', '/æ/', '/s/'], dependencies: ['a-3', 'a-4'], difficulty: 3,
        prompt: '读出单词，然后把单词卡拖到对应图片。',
        accessibility: '支持键盘选择起点和终点，不使用拖拽也能完成。', duration: 12, feedback: '答对后播放该单词的分解音。'
      },
      {
        id: 'a-8', type: '句子', title: '迁移朗读：A man sat.', content: 'A man sat and had a nap.',
        phonemes: ['/m/', '/æ/', '/n/'], dependencies: ['a-6'], difficulty: 4,
        prompt: '观察 a 和 man 之间的联系，再完整朗读。',
        accessibility: '提供分句导航、朗读速度控制和高对比模式。', duration: 12, feedback: ''
      }
    ],
    versions: [
      {
        id: 'v-1', label: '初稿', savedAt: '2026-09-21T10:00:00+08:00', note: '完成音素和基础拼读活动。',
        activities: []
      },
      {
        id: 'v-2', label: '增加句子迁移', savedAt: '2026-09-24T15:30:00+08:00', note: '补充 A man sat and had a nap.',
        activities: [
          {
            id: 'a-1', type: '音素', title: '听音游戏：认识 /m/', content: '/m/', phonemes: ['/m/'], dependencies: [], difficulty: 1,
            prompt: '闭上嘴唇，轻轻发出 /m/。', accessibility: '口型示范和重复音频。', duration: 6, feedback: ''
          },
          {
            id: 'a-2', type: '音素', title: '首音识别：/s/ 与 /m/', content: '/s/ /m/', phonemes: ['/s/', '/m/'], dependencies: ['a-1'], difficulty: 1,
            prompt: '听到单词时拍手。', accessibility: '不同形状的视觉提示。', duration: 8, feedback: ''
          },
          {
            id: 'a-3', type: '单词', title: '拼读短词：sat', content: 's – a – t → sat', phonemes: ['/s/', '/æ/', '/t/'], dependencies: ['a-2'], difficulty: 2,
            prompt: '用手指依次点每个字母。', accessibility: '键盘逐字聚焦。', duration: 10, feedback: '形成完整电路。'
          },
          {
            id: 'a-6', type: '句子', title: '拼读句子：Mat sat.', content: 'Mat sat on the mat.', phonemes: ['/m/', '/æ/', '/s/', '/t/'], dependencies: ['a-3'], difficulty: 3,
            prompt: '先读每个单词，再按意群连读。', accessibility: '按词高亮。', duration: 10, feedback: '再试试更连贯。'
          }
        ]
      }
    ]
  });

  const initialStudents = (): Student[] => [
    {
      id: 's-1', name: '林小满', createdAt: '2026-09-24T17:00:00+08:00',
      assignments: [
        { activityId: 'a-1', assignedAt: '2026-09-24T17:05:00+08:00', snapshotTitle: '听音游戏：认识 /m/', snapshotType: '音素', snapshotPhonemes: ['/m/'] },
        { activityId: 'a-2', assignedAt: '2026-09-24T17:06:00+08:00', snapshotTitle: '首音识别：/s/ 与 /m/', snapshotType: '音素', snapshotPhonemes: ['/s/', '/m/'] },
        { activityId: 'a-3', assignedAt: '2026-09-24T17:07:00+08:00', snapshotTitle: '拼读短词：sat', snapshotType: '单词', snapshotPhonemes: ['/s/', '/æ/', '/t/'] },
        { activityId: 'a-4', assignedAt: '2026-09-24T17:08:00+08:00', snapshotTitle: '听音选图：m / s 开头', snapshotType: '练习', snapshotPhonemes: ['/m/', '/s/'] }
      ],
      attempts: [
        { id: 'at-1', activityId: 'a-1', score: 86, missedPhonemes: [], practicedAt: '2026-09-25T15:10:00+08:00' },
        { id: 'at-2', activityId: 'a-1', score: 91, missedPhonemes: [], practicedAt: '2026-09-25T15:40:00+08:00' },
        { id: 'at-3', activityId: 'a-2', score: 72, missedPhonemes: ['/s/'], practicedAt: '2026-09-25T16:05:00+08:00' },
        { id: 'at-4', activityId: 'a-2', score: 84, missedPhonemes: [], practicedAt: '2026-09-26T10:20:00+08:00' }
      ]
    },
    {
      id: 's-2', name: '陈一诺', createdAt: '2026-09-24T17:10:00+08:00',
      assignments: [
        { activityId: 'a-1', assignedAt: '2026-09-24T17:12:00+08:00', snapshotTitle: '听音游戏：认识 /m/', snapshotType: '音素', snapshotPhonemes: ['/m/'] },
        { activityId: 'a-2', assignedAt: '2026-09-24T17:13:00+08:00', snapshotTitle: '首音识别：/s/ 与 /m/', snapshotType: '音素', snapshotPhonemes: ['/s/', '/m/'] },
        { activityId: 'a-5', assignedAt: '2026-09-24T17:14:00+08:00', snapshotTitle: '短元音 /æ/ 的口型', snapshotType: '音素', snapshotPhonemes: ['/æ/'] }
      ],
      attempts: [
        { id: 'at-5', activityId: 'a-1', score: 90, missedPhonemes: [], practicedAt: '2026-09-25T14:00:00+08:00' },
        { id: 'at-6', activityId: 'a-1', score: 95, missedPhonemes: [], practicedAt: '2026-09-25T14:20:00+08:00' },
        { id: 'at-7', activityId: 'a-2', score: 83, missedPhonemes: ['/m/'], practicedAt: '2026-09-25T16:30:00+08:00' },
        { id: 'at-8', activityId: 'a-2', score: 88, missedPhonemes: [], practicedAt: '2026-09-26T09:10:00+08:00' },
        { id: 'at-9', activityId: 'a-5', score: 78, missedPhonemes: ['/æ/'], practicedAt: '2026-09-26T09:40:00+08:00' }
      ]
    }
  ];

  let course: Course = initialCourse();
  let selectedActivityId = course.activities[0]?.id ?? '';
  let activeView: ViewMode = 'compose';
  let previewWidth: PreviewWidth = 'desktop';
  let compareBaseId = course.versions[0]?.id ?? '';
  let compareTargetId = course.versions.at(-1)?.id ?? '';
  let hydrated = false;
  let online = true;
  let savedLabel = '等待载入';
  let showOfflineNotice = false;
  let history: Course[] = [];
  let future: Course[] = [];
  let selectedActivity: Activity | null = null;
  let diagnostics: Diagnostic[] = [];
  let versionDiff: VersionDiff[] = [];
  let students: Student[] = initialStudents();
  let selectedStudentId = students[0]?.id ?? '';
  let selectedPracticeActivityId = '';
  let assignPickerId = '';
  let newStudentName = '';
  let practiceScore = '85';
  let practiceMissed: string[] = [];
  let practiceMissedExtra = '';
  let practiceError = '';
  let confirmingStudentDelete = false;
  let selectedStudent: Student | null = null;
  let workbookRows: WorkbookRow[] = [];
  let studentSummary: StudentSummary | null = null;
  let assignableActivities: Activity[] = [];
  let practiceRow: WorkbookRow | null = null;

  $: selectedActivity = course.activities.find((activity) => activity.id === selectedActivityId) ?? course.activities[0] ?? null;
  $: diagnostics = analyzeCourse(course);
  $: versionDiff = compareCourseVersions(course, compareBaseId, compareTargetId);
  $: errorCount = diagnostics.filter((issue) => issue.level === 'error').length;
  $: warningCount = diagnostics.filter((issue) => issue.level === 'warning').length;
  $: totalMinutes = course.activities.reduce((sum, activity) => sum + activity.duration, 0);
  $: selectedStudent = students.find((student) => student.id === selectedStudentId) ?? students[0] ?? null;
  $: workbookRows = selectedStudent ? buildWorkbookRows(selectedStudent, course) : [];
  $: studentSummary = selectedStudent ? summarizeStudent(selectedStudent, course) : null;
  $: assignableActivities = selectedStudent
    ? course.activities.filter((activity) => !selectedStudent.assignments.some((item) => item.activityId === activity.id))
    : [];
  $: if (!assignableActivities.some((activity) => activity.id === assignPickerId)) assignPickerId = assignableActivities[0]?.id ?? '';
  $: practiceRow = workbookRows.find((row) => row.activityId === selectedPracticeActivityId) ?? null;
  $: if (workbookRows.length && !workbookRows.some((row) => row.activityId === selectedPracticeActivityId)) {
    selectedPracticeActivityId = (workbookRows.find((row) => row.status === 'ready') ?? workbookRows[0]).activityId;
  }

  onMount(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        course = migrateCourse(JSON.parse(stored) as Course);
        selectedActivityId = course.activities[0]?.id ?? '';
        compareBaseId = course.versions[0]?.id ?? '';
        compareTargetId = course.versions.at(-1)?.id ?? '';
        savedLabel = `已恢复 · ${formatTime(course.updatedAt)}`;
      } catch {
        localStorage.removeItem(STORAGE_KEY);
      }
    }
    const storedStudents = localStorage.getItem(STUDENTS_KEY);
    if (storedStudents) {
      try {
        students = migrateStudents(JSON.parse(storedStudents));
        selectedStudentId = students[0]?.id ?? '';
      } catch {
        localStorage.removeItem(STUDENTS_KEY);
      }
    }
    hydrated = true;
    const updateNetwork = () => {
      online = navigator.onLine;
      showOfflineNotice = !online;
    };
    updateNetwork();
    window.addEventListener('online', updateNetwork);
    window.addEventListener('offline', updateNetwork);
    return () => {
      window.removeEventListener('online', updateNetwork);
      window.removeEventListener('offline', updateNetwork);
    };
  });

  function migrateCourse(value: Course): Course {
    if (!value.id || !Array.isArray(value.activities)) return initialCourse();
    value.versions ??= [];
    return value;
  }

  function commit(recipe: (draft: Course) => void): void {
    history = [...history.slice(-49), structuredClone(course)];
    const next = structuredClone(course);
    recipe(next);
    next.updatedAt = new Date().toISOString();
    course = next;
    future = [];
    persist();
  }

  function persist(): void {
    if (!hydrated) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(course));
    savedLabel = `已保存 · ${formatTime(new Date().toISOString())}`;
  }

  function undo(): void {
    const previous = history.at(-1);
    if (!previous) return;
    future = [structuredClone(course), ...future].slice(0, 50);
    history = history.slice(0, -1);
    course = previous;
    selectedActivityId = course.activities[0]?.id ?? '';
    persist();
  }

  function redo(): void {
    const next = future[0];
    if (!next) return;
    history = [...history, structuredClone(course)].slice(-50);
    future = future.slice(1);
    course = next;
    selectedActivityId = course.activities[0]?.id ?? '';
    persist();
  }

  function saveNow(): void {
    persist();
  }

  function updateCourse(field: 'title' | 'level' | 'ageRange' | 'objective', value: string): void {
    commit((draft) => { draft[field] = value; });
  }

  function updateActivity(field: keyof Activity, value: unknown): void {
    if (!selectedActivity) return;
    const id = selectedActivity.id;
    commit((draft) => {
      const target = draft.activities.find((activity) => activity.id === id);
      if (target) (target as unknown as Record<string, unknown>)[field] = value;
    });
  }

  function readText(event: Event): string {
    const custom = event as CustomEvent<{ value?: string; text?: string } | string>;
    if (typeof custom.detail === 'string') return custom.detail;
    if (typeof custom.detail === 'number') return String(custom.detail);
    if (custom.detail?.value) return custom.detail.value;
    if (custom.detail?.text) return custom.detail.text;
    const target = (event.currentTarget ?? event.target) as HTMLInputElement | HTMLTextAreaElement | null;
    return target?.value ?? '';
  }

  function readNumber(event: Event): number {
    return Number(readText(event));
  }

  function readChecked(event: Event): boolean {
    const custom = event as CustomEvent<{ checked?: boolean } | boolean>;
    if (typeof custom.detail === 'boolean') return custom.detail;
    if (typeof custom.detail?.checked === 'boolean') return custom.detail.checked;
    const target = (event.currentTarget ?? event.target) as HTMLInputElement | null;
    return Boolean(target?.checked);
  }

  function addActivity(type: ActivityType = '练习'): void {
    const id = `a-${Date.now()}`;
    commit((draft) => {
      draft.activities.push({
        id, type, title: `新的${type}活动`, content: '', phonemes: [], dependencies: [],
        difficulty: 1, prompt: '请输入教师提示语。', accessibility: '请描述视觉、听觉或键盘无障碍支持。',
        duration: type === '练习' ? 10 : 8, feedback: type === '练习' ? '' : ''
      });
    });
    selectedActivityId = id;
    activeView = 'compose';
  }

  function deleteActivity(): void {
    if (!selectedActivity || course.activities.length <= 1) return;
    const id = selectedActivity.id;
    commit((draft) => {
      draft.activities = draft.activities.filter((activity) => activity.id !== id);
      draft.activities.forEach((activity) => {
        activity.dependencies = activity.dependencies.filter((dependency) => dependency !== id);
      });
    });
    selectedActivityId = course.activities[0]?.id ?? '';
  }

  function duplicateActivity(): void {
    if (!selectedActivity) return;
    const source = structuredClone(selectedActivity);
    source.id = `a-${Date.now()}`;
    source.title = `${source.title}（副本）`;
    source.dependencies = [...source.dependencies];
    commit((draft) => {
      const index = draft.activities.findIndex((activity) => activity.id === selectedActivity?.id);
      draft.activities.splice(index + 1, 0, source);
    });
    selectedActivityId = source.id;
  }

  function moveActivity(direction: -1 | 1): void {
    if (!selectedActivity) return;
    const id = selectedActivity.id;
    commit((draft) => {
      const index = draft.activities.findIndex((activity) => activity.id === id);
      const nextIndex = index + direction;
      if (nextIndex < 0 || nextIndex >= draft.activities.length) return;
      const [item] = draft.activities.splice(index, 1);
      draft.activities.splice(nextIndex, 0, item);
    });
  }

  function toggleDependency(dependencyId: string, checked: boolean): void {
    if (!selectedActivity || dependencyId === selectedActivity.id) return;
    const next = checked
      ? [...new Set([...selectedActivity.dependencies, dependencyId])]
      : selectedActivity.dependencies.filter((id) => id !== dependencyId);
    updateActivity('dependencies', next);
  }

  function updatePhonemes(value: string): void {
    updateActivity('phonemes', value.split(/[\s,，、]+/).map((item) => item.trim()).filter(Boolean));
  }

  function saveVersion(): void {
    const versionNumber = course.versions.length + 1;
    commit((draft) => {
      draft.versions.push({
        id: `v-${Date.now()}`, label: `版本 ${versionNumber}`, savedAt: new Date().toISOString(),
        note: `保存 ${draft.activities.length} 个活动，总计 ${draft.activities.reduce((sum, item) => sum + item.duration, 0)} 分钟。`,
        activities: structuredClone(draft.activities)
      });
    });
    const latest = course.versions.at(-1);
    compareTargetId = latest?.id ?? '';
    if (!compareBaseId) compareBaseId = course.versions.at(-2)?.id ?? '';
    savedLabel = `版本 ${versionNumber} 已存档`;
  }

  function copyCourse(): void {
    commit((draft) => {
      const copy = structuredClone(draft);
      copy.id = `course-${Date.now()}`;
      copy.title = `${copy.title} · 副本`;
      copy.versions = [];
      copy.activities.forEach((activity) => {
        activity.title = activity.title.replace('（副本）', '') + '（复制）';
      });
      draft.id = copy.id;
      draft.title = copy.title;
      draft.versions = copy.versions;
      draft.activities = copy.activities;
    });
    savedLabel = '课程已复制为新草稿';
  }

  function focusIssue(issue: Diagnostic): void {
    selectedActivityId = issue.activityId;
    activeView = 'compose';
  }

  function migrateStudents(value: unknown): Student[] {
    if (!Array.isArray(value)) return initialStudents();
    return value.filter((item): item is Student =>
      Boolean(item) && typeof item.id === 'string' && typeof item.name === 'string' &&
      Array.isArray(item.assignments) && Array.isArray(item.attempts)
    );
  }

  function commitStudents(recipe: (draft: Student[]) => void): void {
    const next = structuredClone(students);
    recipe(next);
    students = next;
    persistStudents();
  }

  function persistStudents(): void {
    if (!hydrated) return;
    localStorage.setItem(STUDENTS_KEY, JSON.stringify(students));
    savedLabel = `已保存 · ${formatTime(new Date().toISOString())}`;
  }

  function attemptsFor(student: Student, activityId: string): PracticeAttempt[] {
    return student.attempts
      .filter((attempt) => attempt.activityId === activityId)
      .sort((a, b) => a.practicedAt.localeCompare(b.practicedAt));
  }

  function passStreakFor(student: Student, activityId: string): number {
    const list = attemptsFor(student, activityId);
    let streak = 0;
    for (let index = list.length - 1; index >= 0; index -= 1) {
      if (list[index].score >= PASS_SCORE) streak += 1;
      else break;
    }
    return streak;
  }

  function activityTitleFor(student: Student, activityId: string, current: Course): string {
    return current.activities.find((activity) => activity.id === activityId)?.title
      ?? student.assignments.find((item) => item.activityId === activityId)?.snapshotTitle
      ?? '已删除的活动';
  }

  function blockersFor(student: Student, activityId: string, current: Course): Blocker[] {
    const activity = current.activities.find((item) => item.id === activityId);
    if (!activity) return [];
    return activity.dependencies
      .filter((dependency) => passStreakFor(student, dependency) < PASS_STREAK)
      .map((dependency) => ({
        id: dependency,
        title: activityTitleFor(student, dependency, current),
        reason: student.assignments.some((item) => item.activityId === dependency) ? '未过关' as const : '未布置' as const
      }));
  }

  function buildWorkbookRows(student: Student, current: Course): WorkbookRow[] {
    const order = new Map(current.activities.map((activity, index) => [activity.id, index]));
    return [...student.assignments]
      .sort((a, b) => {
        const ai = order.get(a.activityId) ?? Number.MAX_SAFE_INTEGER;
        const bi = order.get(b.activityId) ?? Number.MAX_SAFE_INTEGER;
        return ai !== bi ? ai - bi : a.assignedAt.localeCompare(b.assignedAt);
      })
      .map((assignment) => {
        const live = current.activities.find((activity) => activity.id === assignment.activityId);
        const attempts = attemptsFor(student, assignment.activityId);
        const streak = passStreakFor(student, assignment.activityId);
        const passed = streak >= PASS_STREAK;
        const blockers = passed || !live ? [] : blockersFor(student, assignment.activityId, current);
        const status: WorkStatus = !live ? 'removed' : passed ? 'passed' : blockers.length ? 'blocked' : 'ready';
        const scores = attempts.map((attempt) => attempt.score);
        return {
          activityId: assignment.activityId,
          inCourse: Boolean(live),
          title: live?.title ?? assignment.snapshotTitle,
          type: live?.type ?? assignment.snapshotType,
          phonemes: live?.phonemes.length ? live.phonemes : assignment.snapshotPhonemes,
          assignedAt: assignment.assignedAt,
          status,
          streak,
          needed: Math.max(0, PASS_STREAK - streak),
          attemptCount: attempts.length,
          lastScore: attempts.at(-1)?.score ?? null,
          bestScore: scores.length ? Math.max(...scores) : null,
          lastMissed: attempts.at(-1)?.missedPhonemes ?? [],
          blockers
        };
      });
  }

  function summarizeStudent(student: Student, current: Course): StudentSummary {
    const rows = buildWorkbookRows(student, current);
    const missed = new Map<string, number>();
    student.attempts.forEach((attempt) => attempt.missedPhonemes.forEach((phoneme) => missed.set(phoneme, (missed.get(phoneme) ?? 0) + 1)));
    return {
      assigned: rows.length,
      passed: rows.filter((row) => row.status === 'passed').length,
      ready: rows.filter((row) => row.status === 'ready').length,
      blocked: rows.filter((row) => row.status === 'blocked').length,
      removed: rows.filter((row) => row.status === 'removed').length,
      stuck: rows.filter((row) => row.status === 'blocked').map((row) => ({ activityId: row.activityId, title: row.title, blockers: row.blockers })),
      missedTop: [...missed.entries()].map(([phoneme, count]) => ({ phoneme, count })).sort((a, b) => b.count - a.count).slice(0, 8),
      recent: [...student.attempts]
        .sort((a, b) => b.practicedAt.localeCompare(a.practicedAt))
        .slice(0, 5)
        .map((attempt) => ({
          id: attempt.id,
          title: activityTitleFor(student, attempt.activityId, current),
          score: attempt.score,
          missed: attempt.missedPhonemes,
          at: attempt.practicedAt
        }))
    };
  }

  function statusLabel(status: WorkStatus): string {
    return status === 'passed' ? '已过关' : status === 'blocked' ? '被挡住' : status === 'removed' ? '已移出课程' : '可练习';
  }

  function statusTagType(status: WorkStatus): 'green' | 'red' | 'teal' | 'cool-gray' {
    return status === 'passed' ? 'green' : status === 'blocked' ? 'red' : status === 'removed' ? 'cool-gray' : 'teal';
  }

  function resetPracticeForm(): void {
    practiceScore = '85';
    practiceMissed = [];
    practiceMissedExtra = '';
    practiceError = '';
  }

  function selectStudent(id: string): void {
    selectedStudentId = id;
    confirmingStudentDelete = false;
    const student = students.find((item) => item.id === id);
    const firstReady = student ? buildWorkbookRows(student, course).find((row) => row.status === 'ready') : null;
    selectedPracticeActivityId = firstReady?.activityId ?? student?.assignments[0]?.activityId ?? '';
    resetPracticeForm();
  }

  function addStudent(): void {
    const name = newStudentName.trim();
    if (!name) return;
    const id = `s-${Date.now()}`;
    commitStudents((draft) => {
      draft.push({ id, name, createdAt: new Date().toISOString(), assignments: [], attempts: [] });
    });
    newStudentName = '';
    selectStudent(id);
  }

  function deleteStudent(): void {
    if (!selectedStudent) return;
    const id = selectedStudent.id;
    commitStudents((draft) => {
      const index = draft.findIndex((student) => student.id === id);
      if (index >= 0) draft.splice(index, 1);
    });
    confirmingStudentDelete = false;
    selectStudent(students[0]?.id ?? '');
  }

  function assignActivity(): void {
    if (!selectedStudent || !assignPickerId) return;
    const activity = course.activities.find((item) => item.id === assignPickerId);
    if (!activity) return;
    const studentId = selectedStudent.id;
    commitStudents((draft) => {
      const student = draft.find((item) => item.id === studentId);
      if (!student || student.assignments.some((item) => item.activityId === activity.id)) return;
      student.assignments.push({
        activityId: activity.id,
        assignedAt: new Date().toISOString(),
        snapshotTitle: activity.title,
        snapshotType: activity.type,
        snapshotPhonemes: [...activity.phonemes]
      });
    });
    selectedPracticeActivityId = activity.id;
    resetPracticeForm();
  }

  function openPractice(activityId: string): void {
    selectedPracticeActivityId = activityId;
    resetPracticeForm();
  }

  function toggleMissedPhoneme(phoneme: string): void {
    practiceMissed = practiceMissed.includes(phoneme)
      ? practiceMissed.filter((item) => item !== phoneme)
      : [...practiceMissed, phoneme];
  }

  function recordAttempt(): void {
    if (!selectedStudent || !practiceRow || practiceRow.status === 'blocked' || practiceRow.status === 'removed') return;
    const score = Number(practiceScore);
    if (practiceScore.trim() === '' || !Number.isFinite(score) || score < 0 || score > 100) {
      practiceError = '请输入 0–100 之间的分数。';
      return;
    }
    const extra = practiceMissedExtra.split(/[\s,，、]+/).map((item) => item.trim()).filter(Boolean);
    const missed = [...new Set([...practiceMissed, ...extra])];
    const studentId = selectedStudent.id;
    const activityId = practiceRow.activityId;
    commitStudents((draft) => {
      const student = draft.find((item) => item.id === studentId);
      student?.attempts.push({
        id: `at-${Date.now()}`,
        activityId,
        score: Math.round(score),
        missedPhonemes: missed,
        practicedAt: new Date().toISOString()
      });
    });
    practiceMissed = [];
    practiceMissedExtra = '';
    practiceError = '';
  }

  function analyzeCourse(current: Course): Diagnostic[] {
    const issues: Diagnostic[] = [];
    const learned = new Set<string>();
    const seenPhonemes: Array<{ activity: Activity; phoneme: string }> = [];

    current.activities.forEach((activity, index) => {
      activity.phonemes.forEach((phoneme) => {
        if (!learned.has(phoneme) && activity.type !== '音素') {
          issues.push({
            id: `early-${activity.id}-${phoneme}`, activityId: activity.id, level: 'error', category: '前置知识',
            title: `${activity.title} 提前使用 ${phoneme}`,
            detail: `第 ${index + 1} 个活动中使用了尚未单独教学的音素。请增加前置音素活动或调整顺序。`
          });
        }
        if (activity.type === '音素') learned.add(phoneme);
        seenPhonemes.push({ activity, phoneme });
      });

      if (activity.type === '句子') {
        const words = activity.content.trim().split(/\s+/).filter(Boolean);
        if (words.length > 12) issues.push({
          id: `long-${activity.id}`, activityId: activity.id, level: 'warning', category: '例句长度',
          title: `${activity.title} 包含 ${words.length} 个单词`,
          detail: '启蒙阶段建议控制在 12 个单词以内，或拆成两个意群。'
        });
      }

      if (activity.type === '练习' && !activity.feedback.trim()) issues.push({
        id: `feedback-${activity.id}`, activityId: activity.id, level: 'error', category: '练习反馈',
        title: `${activity.title} 缺少反馈`,
        detail: '答对或答错后需要给出可理解、可行动的学习反馈。'
      });

      if (!activity.accessibility.trim()) issues.push({
        id: `a11y-${activity.id}`, activityId: activity.id, level: 'error', category: '无障碍说明',
        title: `${activity.title} 缺少无障碍说明`,
        detail: '请说明视觉、听觉、运动或认知支持方式。'
      });

      activity.dependencies.forEach((dependency) => {
        if (!current.activities.some((item) => item.id === dependency)) issues.push({
          id: `missing-dep-${activity.id}-${dependency}`, activityId: activity.id, level: 'error', category: '依赖缺失',
          title: `${activity.title} 的依赖已不存在`, detail: '请移除失效依赖或重新选择前置活动。'
        });
      });
    });

    confusablePairs.forEach(([left, right]) => {
      const leftActivity = seenPhonemes.find((item) => item.phoneme === left)?.activity;
      const rightActivity = seenPhonemes.find((item) => item.phoneme === right)?.activity;
      if (leftActivity && rightActivity) issues.push({
        id: `confusable-${left}-${right}`, activityId: rightActivity.id, level: 'info', category: '相似音',
        title: `${left} 与 ${right} 可能混淆`,
        detail: `建议在“${leftActivity.title}”和“${rightActivity.title}”之间加入口型对比或辨音练习。`
      });
    });

    const cycle = findDependencyCycle(current.activities);
    if (cycle) issues.push({
      id: 'cycle', activityId: cycle[0], level: 'error', category: '依赖关系',
      title: '活动依赖形成循环', detail: cycle.join(' → ')
    });
    return issues;
  }

  function findDependencyCycle(activities: Activity[]): string[] | null {
    const byId = new Map(activities.map((activity) => [activity.id, activity]));
    const visiting = new Set<string>();
    const visited = new Set<string>();
    let cycle: string[] = [];
    const visit = (id: string, path: string[]): boolean => {
      if (visiting.has(id)) {
        cycle = [...path.slice(path.indexOf(id)), id];
        return true;
      }
      if (visited.has(id)) return false;
      visiting.add(id);
      const activity = byId.get(id);
      for (const dependency of activity?.dependencies ?? []) {
        if (visit(dependency, [...path, dependency])) return true;
      }
      visiting.delete(id);
      visited.add(id);
      return false;
    };
    for (const activity of activities) {
      if (visit(activity.id, [activity.id])) break;
    }
    return cycle.length ? cycle : null;
  }

  function compareCourseVersions(current: Course, baseId: string, targetId: string): VersionDiff[] {
    const base = current.versions.find((version) => version.id === baseId);
    const target = current.versions.find((version) => version.id === targetId);
    if (!base || !target) return [];
    const rows: VersionDiff[] = [];
    const baseMap = new Map(base.activities.map((activity) => [activity.id, activity]));
    const targetMap = new Map(target.activities.map((activity) => [activity.id, activity]));
    for (const activity of base.activities) {
      if (!targetMap.has(activity.id)) rows.push({ id: activity.id, title: activity.title, kind: 'removed', detail: '目标版本已删除该活动' });
    }
    for (const activity of target.activities) {
      const before = baseMap.get(activity.id);
      if (!before) {
        rows.push({ id: activity.id, title: activity.title, kind: 'added', detail: `${activity.type} · ${activity.duration} 分钟` });
        continue;
      }
      const fields: string[] = [];
      if (before.title !== activity.title) fields.push('标题');
      if (before.content !== activity.content) fields.push('内容');
      if (before.difficulty !== activity.difficulty) fields.push('难度');
      if (before.duration !== activity.duration) fields.push('时长');
      if (JSON.stringify(before.dependencies) !== JSON.stringify(activity.dependencies)) fields.push('依赖');
      if (before.prompt !== activity.prompt || before.accessibility !== activity.accessibility) fields.push('提示或无障碍');
      if (before.feedback !== activity.feedback) fields.push('练习反馈');
      if (fields.length) rows.push({ id: activity.id, title: activity.title, kind: 'changed', detail: `变化字段：${fields.join('、')}` });
    }
    return rows;
  }

  function formatTime(value: string): string {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    return new Intl.DateTimeFormat('zh-CN', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hour12: false }).format(date);
  }

  function activityIcon(type: ActivityType): string {
    return type === '音素' ? 'ear' : type === '单词' ? 'text-font' : type === '句子' ? 'text-align-left' : 'game-console';
  }

  function handleKeyboard(event: KeyboardEvent): void {
    const modifier = event.ctrlKey || event.metaKey;
    const tag = (event.target as HTMLElement)?.tagName;
    const editing = tag === 'INPUT' || tag === 'TEXTAREA' || (event.target as HTMLElement)?.isContentEditable;
    if (modifier && event.key.toLowerCase() === 'z') {
      event.preventDefault();
      event.shiftKey ? redo() : undo();
      return;
    }
    if (modifier && event.key.toLowerCase() === 'y') {
      event.preventDefault();
      redo();
      return;
    }
    if (modifier && event.key.toLowerCase() === 's') {
      event.preventDefault();
      saveNow();
      return;
    }
    if (event.altKey && event.key.toLowerCase() === 'n') {
      event.preventDefault();
      addActivity('练习');
      return;
    }
    if (!editing && event.altKey && (event.key === 'ArrowUp' || event.key === 'ArrowDown')) {
      event.preventDefault();
      moveActivity(event.key === 'ArrowUp' ? -1 : 1);
    }
  }
</script>

<svelte:window on:keydown={handleKeyboard} />

<div class="app-frame">
  <header class="app-header">
    <div class="brand">
      <div class="brand-symbol" aria-hidden="true"><span>a</span><i>+</i><span>m</span></div>
      <div>
        <h1>Phonics Studio</h1>
        <p>儿童自然拼读课程编排台</p>
      </div>
    </div>
    <div class="header-center">
      <span class:connected={online} class="network-dot"></span>
      <span>{online ? '本地离线编辑可用' : '当前离线，修改仍会保存'}</span>
      <strong>{savedLabel}</strong>
    </div>
    <div class="header-actions">
      <Button size="small" kind="ghost" disabled={history.length === 0} on:click={undo}>撤销</Button>
      <Button size="small" kind="ghost" disabled={future.length === 0} on:click={redo}>重做</Button>
      <Button size="small" kind="tertiary" on:click={saveNow}>保存</Button>
      <Button size="small" kind="primary" on:click={saveVersion}>存档版本</Button>
    </div>
  </header>

  {#if showOfflineNotice}
    <div class="offline-notice">
      <InlineNotification lowContrast kind="info" title="已切换到离线模式" subtitle="所有修改会先保存在本机浏览器，恢复网络后仍可继续编辑。" />
    </div>
  {/if}

  <section class="course-hero">
    <div class="hero-copy">
      <span class="kicker">COURSE BUILDER / {course.level}</span>
      <h2>{course.title}</h2>
      <p>{course.objective}</p>
    </div>
    <div class="hero-stats">
      <div><strong>{course.activities.length}</strong><span>活动</span></div>
      <div><strong>{totalMinutes}</strong><span>分钟</span></div>
      <div><strong class="critical">{errorCount}</strong><span>必修问题</span></div>
      <div><strong class="caution">{warningCount}</strong><span>建议调整</span></div>
    </div>
  </section>

  <nav class="workspace-tabs" aria-label="工作区">
    <button class:active={activeView === 'compose'} on:click={() => activeView = 'compose'}><span>01</span><b>课程编排</b><small>活动、依赖与教学说明</small></button>
    <button class:active={activeView === 'path'} on:click={() => activeView = 'path'}><span>02</span><b>学习路径</b><small>多屏幕顺序预览</small></button>
    <button class:active={activeView === 'issues'} on:click={() => activeView = 'issues'}><span>03</span><b>质量检查</b><small>音素、句子与反馈</small></button>
    <button class:active={activeView === 'versions'} on:click={() => activeView = 'versions'}><span>04</span><b>版本与复用</b><small>复制、存档与比较</small></button>
    <button class:active={activeView === 'workbook'} on:click={() => activeView = 'workbook'}><span>05</span><b>学生补练</b><small>布置、记录与过关</small></button>
  </nav>

  {#if activeView === 'compose'}
    <main class="compose-layout">
      <aside class="activity-sidebar">
        <div class="sidebar-heading">
          <div><span class="kicker">LESSON MAP</span><h3>学习活动</h3></div>
          <Button size="small" kind="ghost" on:click={() => addActivity('练习')}>添加</Button>
        </div>
        <div class="type-legend">
          {#each ['音素', '单词', '句子', '练习'] as type}
            <span><i class:practice={type === '练习'} class:phoneme={type === '音素'}></i>{type}</span>
          {/each}
        </div>
        <div class="activity-list">
          {#each course.activities as activity, index (activity.id)}
            <button class:selected={activity.id === selectedActivityId} class="activity-row" on:click={() => selectedActivityId = activity.id}>
              <span class="sequence">{String(index + 1).padStart(2, '0')}</span>
              <span class="activity-type {activity.type}">{activity.type}</span>
              <span class="activity-copy"><b>{activity.title}</b><small>{activity.duration} 分钟 · 难度 {activity.difficulty}/5</small></span>
              {#if activity.dependencies.length}<i title="有前置依赖">↳</i>{/if}
            </button>
          {/each}
        </div>
        <div class="sidebar-help">快捷键：Alt + N 新建 · Alt + ↑/↓ 调整顺序</div>
      </aside>

      <section class="editor-column">
        {#if selectedActivity}
          <div class="editor-toolbar">
            <div>
              <span class="kicker">ACTIVITY EDITOR</span>
              <h3>{selectedActivity.type}活动</h3>
            </div>
            <div>
              <Button size="small" kind="ghost" disabled={course.activities[0]?.id === selectedActivity.id} on:click={() => moveActivity(-1)}>上移</Button>
              <Button size="small" kind="ghost" disabled={course.activities.at(-1)?.id === selectedActivity.id} on:click={() => moveActivity(1)}>下移</Button>
              <Button size="small" kind="ghost" on:click={duplicateActivity}>复制</Button>
              <Button size="small" kind="danger-ghost" on:click={deleteActivity}>删除</Button>
            </div>
          </div>

          <Tile class="editor-card">
            <div class="form-grid">
              <TextInput labelText="活动标题" value={selectedActivity.title} on:input={(event) => updateActivity('title', readText(event))} />
              <Select labelText="活动类型" selected={selectedActivity.type} on:change={(event) => updateActivity('type', readText(event))}>
                <SelectItem value="音素" text="音素" />
                <SelectItem value="单词" text="单词" />
                <SelectItem value="句子" text="句子" />
                <SelectItem value="练习" text="练习活动" />
              </Select>
              <TextInput labelText="预计时长（分钟）" type="number" min="1" max="60" value={String(selectedActivity.duration)} on:input={(event) => updateActivity('duration', readNumber(event))} />
              <div class="difficulty-field">
                <label for="difficulty">难度：{selectedActivity.difficulty}/5</label>
                <input id="difficulty" type="range" min="1" max="5" value={selectedActivity.difficulty} on:input={(event) => updateActivity('difficulty', readNumber(event))} />
              </div>
            </div>
            <TextArea labelText={selectedActivity.type === '音素' ? '音素内容' : selectedActivity.type === '句子' ? '目标句子' : '教学内容'} rows={3} value={selectedActivity.content} on:input={(event) => updateActivity('content', readText(event))} />
            <TextInput labelText="涉及音素（用逗号或空格分隔）" value={selectedActivity.phonemes.join(', ')} on:input={(event) => updatePhonemes(readText(event))} />
            <TextArea labelText="教师提示语" rows={2} value={selectedActivity.prompt} on:input={(event) => updateActivity('prompt', readText(event))} />
            <TextArea labelText="无障碍说明" rows={2} value={selectedActivity.accessibility} on:input={(event) => updateActivity('accessibility', readText(event))} />
            <TextArea labelText={selectedActivity.type === '练习' ? '练习反馈（必填）' : '学习反馈'} rows={2} value={selectedActivity.feedback} on:input={(event) => updateActivity('feedback', readText(event))} />
          </Tile>

          <Tile class="dependency-card">
            <div class="section-title">
              <div><span class="kicker">PREREQUISITES</span><h3>前置活动与依赖关系</h3><p>只有完成选中的活动后，系统才会按当前顺序推荐本活动。</p></div>
              <Tag type="cool-gray">{selectedActivity.dependencies.length} 个依赖</Tag>
            </div>
            <div class="dependency-grid">
              {#each course.activities.filter((activity) => activity.id !== selectedActivity?.id) as activity (activity.id)}
                <Checkbox
                  labelText={`${activity.title} · ${activity.type}`}
                  checked={selectedActivity.dependencies.includes(activity.id)}
                  on:change={(event) => toggleDependency(activity.id, readChecked(event))}
                />
              {/each}
            </div>
          </Tile>
        {/if}
      </section>

      <aside class="inspector">
        <Tile class="compact-card">
          <span class="kicker">COURSE META</span><h3>课程信息</h3>
          <TextInput labelText="课程名称" value={course.title} on:input={(event) => updateCourse('title', readText(event))} />
          <TextInput labelText="课程等级" value={course.level} on:input={(event) => updateCourse('level', readText(event))} />
          <TextInput labelText="适用年龄" value={course.ageRange} on:input={(event) => updateCourse('ageRange', readText(event))} />
          <TextArea labelText="学习目标" rows={3} value={course.objective} on:input={(event) => updateCourse('objective', readText(event))} />
        </Tile>
        <Tile class="compact-card issue-peek">
          <div class="section-title"><div><span class="kicker">LIVE CHECK</span><h3>实时提示</h3></div><Tag type={errorCount ? 'red' : 'green'}>{errorCount ? `${errorCount} 项` : '通过'}</Tag></div>
          {#each diagnostics.slice(0, 4) as issue}
            <button on:click={() => focusIssue(issue)} class="peek-row">
              <i class:error={issue.level === 'error'} class:warning={issue.level === 'warning'}></i>
              <span><b>{issue.title}</b><small>{issue.category}</small></span>
            </button>
          {/each}
          {#if diagnostics.length === 0}<p class="empty-state">课程结构完整，没有发现提示。</p>{/if}
          <Button size="small" kind="ghost" on:click={() => activeView = 'issues'}>查看全部检查</Button>
        </Tile>
      </aside>
    </main>
  {/if}

  {#if activeView === 'path'}
    <main class="path-view">
      <div class="path-toolbar">
        <div><span class="kicker">RESPONSIVE SEQUENCE</span><h2>学习顺序预览</h2><p>按活动依赖和课程顺序生成，可切换设备宽度检查信息密度。</p></div>
        <div class="width-switcher">
          <button class:active={previewWidth === 'phone'} on:click={() => previewWidth = 'phone'}>手机</button>
          <button class:active={previewWidth === 'tablet'} on:click={() => previewWidth = 'tablet'}>平板</button>
          <button class:active={previewWidth === 'desktop'} on:click={() => previewWidth = 'desktop'}>桌面</button>
        </div>
      </div>
      <div class="preview-stage">
        <div class="device-preview {previewWidth}">
          <div class="device-bar"><span></span><b>{previewWidth === 'phone' ? '390 px' : previewWidth === 'tablet' ? '768 px' : '1200 px'}</b></div>
          <div class="lesson-preview">
            <header><span>今日学习</span><h3>{course.title}</h3><p>{course.objective}</p></header>
            {#each course.activities as activity, index (activity.id)}
              <article>
                <div class="lesson-number">{index + 1}</div>
                <div class="lesson-type {activity.type}">{activity.type}</div>
                <div class="lesson-content">
                  <h4>{activity.title}</h4>
                  <p>{activity.content}</p>
                  {#if activity.prompt}<blockquote>{activity.prompt}</blockquote>{/if}
                  <div class="lesson-tags">
                    {#each activity.phonemes as phoneme}<span>{phoneme}</span>{/each}
                    <em>{activity.duration} 分钟</em>
                  </div>
                  {#if activity.dependencies.length}<small>前置：{activity.dependencies.map((id) => course.activities.find((item) => item.id === id)?.title).filter(Boolean).join('、')}</small>{/if}
                </div>
              </article>
            {/each}
            <footer>课程结束 · 预计 {totalMinutes} 分钟</footer>
          </div>
        </div>
      </div>
    </main>
  {/if}

  {#if activeView === 'issues'}
    <main class="issues-view">
      <div class="view-heading">
        <div><span class="kicker">CURRICULUM QA</span><h2>课程质量检查</h2><p>检查前置知识、相似音、例句长度、练习反馈、无障碍说明和依赖完整性。</p></div>
        <div class="issue-summary"><span><b>{errorCount}</b> 必须处理</span><span><b>{warningCount}</b> 建议调整</span><span><b>{diagnostics.length}</b> 全部提示</span></div>
      </div>
      <div class="issue-board">
        {#each diagnostics as issue, index}
          <article class:critical={issue.level === 'error'} class:caution={issue.level === 'warning'} class:info={issue.level === 'info'}>
            <span class="issue-index">{String(index + 1).padStart(2, '0')}</span>
            <div><div class="issue-meta"><Tag type={issue.level === 'error' ? 'red' : issue.level === 'warning' ? 'magenta' : 'blue'}>{issue.category}</Tag><small>{issue.level === 'error' ? '必须处理' : issue.level === 'warning' ? '建议调整' : '教学提示'}</small></div><h3>{issue.title}</h3><p>{issue.detail}</p></div>
            <Button size="small" kind="ghost" on:click={() => focusIssue(issue)}>定位活动</Button>
          </article>
        {:else}
          <Tile class="all-clear"><h3>课程检查通过</h3><p>教学顺序、反馈与无障碍说明均已完成。</p></Tile>
        {/each}
        {#if diagnostics.length}
          <div class="rule-grid">
            <Tile><span>前置知识</span><strong>先教后用</strong><p>非音素活动使用未单独教学的音素时阻断。</p></Tile>
            <Tile><span>相似音</span><strong>对比教学</strong><p>发现 /b/-/p/、/f/-/v/ 等音对时建议增加辨音。</p></Tile>
            <Tile><span>例句</span><strong>≤ 12 词</strong><p>超过建议长度时提示拆分意群。</p></Tile>
            <Tile><span>练习</span><strong>必须有反馈</strong><p>每个练习活动都要提供可行动反馈。</p></Tile>
          </div>
        {/if}
      </div>
    </main>
  {/if}

  {#if activeView === 'versions'}
    <main class="versions-view">
      <div class="view-heading">
        <div><span class="kicker">REUSE & HISTORY</span><h2>版本与课程复用</h2><p>复制课程不会覆盖原课程；存档版本包含完整活动、依赖和教学说明。</p></div>
        <div class="version-actions"><Button kind="tertiary" on:click={copyCourse}>复制课程</Button><Button kind="primary" on:click={saveVersion}>保存新版本</Button></div>
      </div>
      <div class="version-layout-svelte">
        <Tile class="version-timeline">
          <div class="section-title"><div><span class="kicker">TIMELINE</span><h3>课程版本</h3></div><Tag type="cool-gray">{course.versions.length} 个快照</Tag></div>
          {#each course.versions as version, index (version.id)}
            <article class:latest={index === course.versions.length - 1}>
              <span class="timeline-dot"></span>
              <div><b>{version.label}</b><h4>{version.note}</h4><p>{formatTime(version.savedAt)} · {version.activities.length} 个活动</p></div>
            </article>
          {/each}
        </Tile>
        <Tile class="diff-card">
          <div class="section-title"><div><span class="kicker">COMPARE</span><h3>比较两个版本</h3></div></div>
          <div class="compare-pickers">
            <Select labelText="基准版本" selected={compareBaseId} on:change={(event) => compareBaseId = readText(event)}>
              {#each course.versions as version}<SelectItem value={version.id} text={`${version.label} · ${formatTime(version.savedAt)}`} />{/each}
            </Select>
            <Select labelText="目标版本" selected={compareTargetId} on:change={(event) => compareTargetId = readText(event)}>
              {#each course.versions as version}<SelectItem value={version.id} text={`${version.label} · ${formatTime(version.savedAt)}`} />{/each}
            </Select>
          </div>
          <div class="diff-list">
            {#each versionDiff as diff}
              <article class={diff.kind}><span>{diff.kind === 'added' ? '新增' : diff.kind === 'removed' ? '删除' : '修改'}</span><div><b>{diff.title}</b><p>{diff.detail}</p></div></article>
            {:else}
              <p class="empty-state">两个版本之间没有活动差异，或尚未选择版本。</p>
            {/each}
          </div>
        </Tile>
      </div>
    </main>
  {/if}

  {#if activeView === 'workbook'}
    <main class="workbook-layout">
      <aside class="student-sidebar">
        <div class="sidebar-heading">
          <div><span class="kicker">STUDENTS</span><h3>学生名单</h3></div>
          <Tag type="cool-gray">{students.length} 人</Tag>
        </div>
        <div class="student-add">
          <TextInput size="sm" labelText="新建学生" placeholder="输入学生姓名" value={newStudentName} on:input={(event) => newStudentName = readText(event)} on:keydown={(event) => event.key === 'Enter' && addStudent()} />
          <Button size="small" kind="primary" disabled={!newStudentName.trim()} on:click={addStudent}>建学生</Button>
        </div>
        <div class="student-list">
          {#each students as student (student.id)}
            {@const stats = summarizeStudent(student, course)}
            <button class:selected={student.id === selectedStudent?.id} class="student-row" on:click={() => selectStudent(student.id)}>
              <span class="student-avatar" aria-hidden="true">{student.name.slice(0, 1)}</span>
              <span class="student-copy"><b>{student.name}</b><small>过关 {stats.passed}/{stats.assigned}{stats.blocked ? ` · 卡住 ${stats.blocked} 项` : ''}</small></span>
              {#if stats.blocked}<i class="stuck-dot" title="有未过关的前置"></i>{/if}
            </button>
          {:else}
            <p class="empty-state student-empty">还没有学生。先建一个学生，再给TA布置课程活动。</p>
          {/each}
        </div>
        <div class="sidebar-help">连续两次练习 ≥ {PASS_SCORE} 分才算过关；记录保存在本机，关掉页面再回来可以接着练。</div>
      </aside>

      <section class="workbook-main">
        {#if selectedStudent && studentSummary}
          <Tile class="assign-card">
            <div class="section-title">
              <div><span class="kicker">ASSIGN</span><h3>给 {selectedStudent.name} 布置活动</h3><p>课程里新增的活动会先在这里等待布置，布置后才开始记录补练。</p></div>
              <Tag type="cool-gray">{assignableActivities.length} 项待布置</Tag>
            </div>
            <div class="assign-controls">
              <Select labelText="选择课程活动" selected={assignPickerId} on:change={(event) => assignPickerId = readText(event)}>
                {#each assignableActivities as activity (activity.id)}
                  <SelectItem value={activity.id} text={`${activity.title} · ${activity.type}`} />
                {/each}
              </Select>
              <Button size="small" kind="primary" disabled={!assignPickerId} on:click={assignActivity}>布置</Button>
            </div>
            {#if !assignableActivities.length}<p class="empty-state assign-done">课程活动都已布置给 {selectedStudent.name}；之后新增的课程活动会出现在这里。</p>{/if}
          </Tile>

          <div class="assignment-list">
            {#each workbookRows as row (row.activityId)}
              <article class:selected={row.activityId === selectedPracticeActivityId} class="assignment-card {row.status}">
                <div class="assignment-head">
                  <span class="activity-type {row.type}">{row.type}</span>
                  <b>{row.title}</b>
                  <Tag type={statusTagType(row.status)}>{statusLabel(row.status)}</Tag>
                </div>
                <div class="assignment-meta">
                  <span>布置于 {formatTime(row.assignedAt)}</span>
                  <span>练习 {row.attemptCount} 次</span>
                  {#if row.lastScore !== null}<span>最近 {row.lastScore} 分 · 最高 {row.bestScore} 分</span>{/if}
                </div>
                {#if row.status === 'passed'}
                  <p class="assignment-note pass">已连续 {row.streak} 次达到 {PASS_SCORE} 分，顺利过关。</p>
                {:else if row.status === 'ready'}
                  <p class="assignment-note">还需连续 {row.needed} 次达到 {PASS_SCORE} 分（当前连续 {row.streak} 次）。</p>
                {:else if row.status === 'blocked'}
                  <p class="assignment-note blocked-note">被前置挡住：{#each row.blockers as blocker}<span class="blocker-chip">{blocker.title} · {blocker.reason}</span>{/each}</p>
                {:else}
                  <p class="assignment-note muted">已移出课程，补练记录保留在历史中。</p>
                {/if}
                {#if row.lastMissed.length}
                  <div class="missed-line">上次读错：{#each row.lastMissed as phoneme}<span class="phoneme-chip static">{phoneme}</span>{/each}</div>
                {/if}
                <div class="assignment-actions">
                  <Button size="small" kind={row.activityId === selectedPracticeActivityId ? 'primary' : 'ghost'} on:click={() => openPractice(row.activityId)}>{row.status === 'blocked' ? '查看卡点' : row.status === 'removed' ? '查看历史' : '记录练习'}</Button>
                </div>
              </article>
            {:else}
              <Tile class="all-clear"><h3>还没有布置活动</h3><p>从上方选择课程活动布置给 {selectedStudent.name}，练习结果会记录在这里。</p></Tile>
            {/each}
          </div>
        {:else}
          <Tile class="all-clear"><h3>先建一个学生</h3><p>在左侧输入姓名建学生，然后给TA布置课程活动、记录练习结果。</p></Tile>
        {/if}
      </section>

      <aside class="workbook-inspector">
        {#if selectedStudent && studentSummary}
          <Tile class="compact-card">
            <div class="section-title">
              <div><span class="kicker">OVERVIEW</span><h3>{selectedStudent.name} 的补练概况</h3></div>
              <Button size="small" kind="danger-ghost" on:click={() => confirmingStudentDelete = true}>删除学生</Button>
            </div>
            {#if confirmingStudentDelete}
              <div class="confirm-bar">
                <span>确定删除 {selectedStudent.name}？全部补练记录将一并删除。</span>
                <div><Button size="small" kind="danger" on:click={deleteStudent}>确认删除</Button><Button size="small" kind="ghost" on:click={() => confirmingStudentDelete = false}>取消</Button></div>
              </div>
            {/if}
            <div class="progress-strip">
              <div><strong>{studentSummary.passed}</strong><span>已过关</span></div>
              <div><strong>{studentSummary.ready}</strong><span>可练习</span></div>
              <div><strong class:warn={studentSummary.blocked > 0}>{studentSummary.blocked}</strong><span>被挡住</span></div>
              <div><strong>{studentSummary.assigned}</strong><span>已布置</span></div>
            </div>
            {#if studentSummary.stuck.length}
              <div class="stuck-list">
                <span class="mini-kicker">卡在这些前置上</span>
                {#each studentSummary.stuck as item}
                  <p>《{item.title}》← {item.blockers.map((blocker) => `${blocker.title}（${blocker.reason}）`).join('、')}</p>
                {/each}
              </div>
            {/if}
            {#if studentSummary.missedTop.length}
              <div class="missed-summary">
                <span class="mini-kicker">常错音素 · 该补的重点</span>
                <div>{#each studentSummary.missedTop as item}<span class="phoneme-chip static">{item.phoneme} ×{item.count}</span>{/each}</div>
              </div>
            {/if}
            {#if studentSummary.recent.length}
              <div class="recent-list">
                <span class="mini-kicker">最近练习</span>
                {#each studentSummary.recent as item}
                  <div class="recent-row"><b>{item.score} 分</b><span>{item.title}</span><small>{formatTime(item.at)}</small></div>
                {/each}
              </div>
            {/if}
          </Tile>

          <Tile class="compact-card practice-desk">
            <div class="section-title"><div><span class="kicker">PRACTICE DESK</span><h3>练习台</h3></div></div>
            {#if practiceRow}
              <h4 class="desk-title">{practiceRow.title}</h4>
              <p class="desk-sub">{practiceRow.type} · 已连续达标 {practiceRow.streak}/{PASS_STREAK} 次 · 目标 ≥ {PASS_SCORE} 分</p>
              {#if practiceRow.status === 'blocked'}
                <p class="desk-blocked">先完成前置：{practiceRow.blockers.map((blocker) => `${blocker.title}（${blocker.reason}）`).join('、')}，过关后再来练这一项。</p>
              {:else if practiceRow.status === 'removed'}
                <p class="desk-blocked muted">该活动已移出课程，不能再记录新成绩，历史记录如下。</p>
              {:else}
                <TextInput labelText="本次得分（0–100）" type="number" min="0" max="100" value={practiceScore} invalid={Boolean(practiceError)} invalidText={practiceError} on:input={(event) => practiceScore = readText(event)} />
                <span class="mini-kicker">读错的音素（点选）</span>
                <div class="chip-row">
                  {#each practiceRow.phonemes as phoneme}
                    <button type="button" class:marked={practiceMissed.includes(phoneme)} class="phoneme-chip" on:click={() => toggleMissedPhoneme(phoneme)}>{phoneme}</button>
                  {:else}
                    <span class="empty-state">该活动没有登记音素，可在下方补充。</span>
                  {/each}
                </div>
                <TextInput size="sm" labelText="其他读错音素（逗号或空格分隔）" value={practiceMissedExtra} on:input={(event) => practiceMissedExtra = readText(event)} />
                <div class="desk-actions"><Button size="small" kind="primary" on:click={recordAttempt}>记下本次结果</Button></div>
              {/if}
              {#if practiceRow.attemptCount && selectedStudent}
                <div class="attempt-history">
                  <span class="mini-kicker">本活动练习记录</span>
                  {#each attemptsFor(selectedStudent, practiceRow.activityId).slice().reverse() as attempt (attempt.id)}
                    <div class="attempt-row">
                      <b class:low={attempt.score < PASS_SCORE}>{attempt.score}</b>
                      <span>{#if attempt.missedPhonemes.length}读错 {attempt.missedPhonemes.join(' ')}{:else}全部读对{/if}</span>
                      <small>{formatTime(attempt.practicedAt)}</small>
                    </div>
                  {/each}
                </div>
              {/if}
            {:else}
              <p class="empty-state">从中间列表选一项活动，在这里记录得分和读错的音素。</p>
            {/if}
          </Tile>
        {/if}
      </aside>
    </main>
  {/if}

  <footer class="app-footer">
    <span>所有数据保存在当前浏览器 localStorage</span>
    <span>Ctrl/Cmd + Z 撤销 · Ctrl/Cmd + Y 重做 · Alt + N 新建活动 · Ctrl/Cmd + S 保存</span>
  </footer>
</div>
