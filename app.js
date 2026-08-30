/* =========================================================================
   TRIP PLANNER — vanilla JS, no build step, works from file://
   Sections: STATE+PERSISTENCE / ITINERARY / BUDGET / CHECKLIST /
             TRIPS+COUNTDOWN / RENDER
   ========================================================================= */

/* =========================================================================
   SECTION: STATE + PERSISTENCE
   ========================================================================= */

const TRIPS_KEY = 'tp-trips-v2';
const DEFAULT_CURRENCY = '£';
const HE_WEEKDAYS = ['יום ראשון', 'יום שני', 'יום שלישי', 'יום רביעי', 'יום חמישי', 'יום שישי', 'יום שבת'];

const CATEGORY_LABELS = { transport: 'תחבורה', lodging: 'לינה', activity: 'אטרקציה', food: 'אוכל' };
const BUDGET_CATEGORY_LABELS = { food: 'אוכל', transport: 'תחבורה', activity: 'אטרקציות', shopping: 'קניות' };
const BUDGET_CATEGORY_COLOR = { food: 'var(--success)', transport: 'var(--primary)', activity: 'var(--warning)', shopping: 'var(--purple)' };

const ICO = {
  clock: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#AEB8E8" stroke-width="2"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3.5 2"/></svg>',
  trash: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18"/><path d="M8 6V4h8v2"/><path d="M6 6l1 14h10l1-14"/></svg>',
  trashSm: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18"/><path d="M8 6V4h8v2"/><path d="M6 6l1 14h10l1-14"/></svg>',
  trashXs: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18"/><path d="M8 6V4h8v2"/><path d="M6 6l1 14h10l1-14"/></svg>',
  pencil: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z"/></svg>',
  plus: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 5v14M5 12h14"/></svg>',
  send: '<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 2L11 13"/><path d="M22 2l-7 20-4-9-9-4 20-7z"/></svg>',
  check: '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="3"><path d="M5 13l4 4L19 7"/></svg>',
  navTodo: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="4" y="4" width="16" height="16" rx="3"/><path d="M8 12l2.5 2.5L16 9"/></svg>',
  navBudget: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="6" width="18" height="13" rx="2"/><path d="M3 10h18"/><circle cx="15" cy="14.5" r="1.5" fill="currentColor" stroke="none"/></svg>',
  navItin: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 21s-7-6.1-7-11a7 7 0 0 1 14 0c0 4.9-7 11-7 11z"/><circle cx="12" cy="10" r="2.5"/></svg>',
  swap: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M7 7h13l-4-4"/><path d="M17 17H4l4 4"/></svg>'
};
const ICON_PATHS = {
  transport: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="6" width="18" height="10" rx="2"/><circle cx="7.5" cy="18" r="1.5"/><circle cx="16.5" cy="18" r="1.5"/><path d="M3 11h18"/></svg>',
  lodging: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 18v-6a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v6"/><path d="M3 18h18"/><path d="M7 10V7a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v3"/></svg>',
  activity: '<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" stroke="none"><path d="M12 2l2.9 6.6 7.1.6-5.4 4.7 1.6 7-6.2-3.9-6.2 3.9 1.6-7L2 9.2l7.1-.6z"/></svg>',
  food: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 2v8a2 2 0 0 0 2 2v10"/><path d="M6 2v6M10 2v6"/><path d="M18 2c-2 0-3 2-3 5v3c0 1.5 1 2 2 2v10"/></svg>'
};

const SEED_START = '2027-07-24T08:00';

const SEED_DAYS = [
  { date: '24/7', weekday: 'יום שישי', title: 'נחיתה, סוהו, פיקדילי ואלאדין', items: [
    { time: '13:35', category: 'transport', title: 'נחיתה ונסיעה למלון', desc: 'נחיתה בשדה התעופה ומעבר לכיוון המלון NOVOTEL LONDON BLACKFRIARS.', price: '' },
    { time: 'אחה"צ', category: 'lodging', title: 'קבלת חדרים במלון Novotel London Blackfriars', desc: 'התארגנות מהירה בחדרים ויציאה לעיר.', price: '' },
    { time: 'אחה"צ', category: 'activity', title: 'רחוב Regent וכיכר פיקדילי (Piccadilly)', desc: 'צעדה על רחוב Regent היפייפה עד לכיכר פיקדילי, כולל עצירה בחנות של M&M.', price: '' },
    { time: 'אחה"צ', category: 'activity', title: 'סמטאות הסוהו ו-Carnaby Street', desc: 'סיבוב בסמטאות הסוהו עם דגש על Carnaby Street וחיפוש פינת Neal\'s Yard Square.', price: '' },
    { time: 'צהריים', category: 'food', title: 'ארוחת צהריים באיטלקית Princi', desc: 'איטלקיה מהירה אך מהודקת עם אחלה אוכל.', price: '45' },
    { time: 'אחה"צ', category: 'food', title: 'הפסקת תה בבית תה מקומי', desc: 'תה בטעמים בכלי פורצלן ועוגות פלצניות.', price: '' },
    { time: 'ערב', category: 'activity', title: 'קובנט גארדן (Covent Garden)', desc: 'התרגעות עם קפה קטן בשמש בזמן שהנוער מסתובב בסביבה.', price: '15' },
    { time: 'ערב', category: 'activity', title: 'לונדון איי (London Eye) ותצפית', desc: 'תצפית שמסתובבת באיטיות מעל העיר. כדאי להזמין כרטיסים מראש ובמחיר טוב יותר.', price: '27' },
    { time: 'ערב', category: 'activity', title: 'סיור ליד ביג בן', desc: 'הליכה לביג בן לצפייה מקרוב (כרגע בשיפוצים).', price: '' },
    { time: 'ערב', category: 'activity', title: 'מופע אלאדין בווסט אנד', desc: 'מופע מרהיב במיוחד מבחינת במה, תפאורה ותלבושות. כדאי לחפש כרטיסים במושבים טובים.', price: '58' }
  ]},
  { date: '25/7', weekday: 'יום שבת', title: 'סיור בעברית ושופינג באוקספורד סטריט', items: [
    { time: 'בוקר', category: 'food', title: 'ארוחת בוקר במלון', desc: 'התארגנות ליום מלא ויציאה לסיור.', price: '' },
    { time: 'בוקר', category: 'activity', title: 'סיור מודרך בעברית', desc: 'סיור קבוצתי בעברית של כ-3 שעות בעיר.', price: '' },
    { time: 'צהריים', category: 'activity', title: 'שופינג ברחוב אוקספורד (Oxford Street)', desc: 'שיטוט וקניות לאורך אחד מרחובות הקניות המרכזיים בעיר.', price: '' },
    { time: 'ערב', category: 'food', title: 'ארוחת ערב במסעדת Jamie\'s Italian', desc: 'מסעדה של השף ג\'יימי אוליבר, מחירים הוגנים ואוכל טעים.', price: '' }
  ]},
  { date: '26/7', weekday: 'יום ראשון', title: 'דנג\'ן של לונדון, סוהו וצ\'יינה טאון', items: [
    { time: 'בוקר', category: 'food', title: 'ארוחת בוקר במלון', desc: 'התארגנות ליום בעיר.', price: '' },
    { time: 'בוקר', category: 'activity', title: 'The London Dungeon', desc: 'אטרקציה מסע חווייתית דרך ההיסטוריה האפלה של לונדון.', price: '' },
    { time: 'צהריים', category: 'activity', title: 'סיבוב באיזור סוהו (Soho)', desc: 'שיטוט חופשי ברחובות הסוהו התוססים.', price: '' },
    { time: 'ערב', category: 'food', title: 'ארוחת ערב בצ\'יינה טאון', desc: 'ארוחה באזור צ\'יינה טאון הצבעוני.', price: '' }
  ]},
  { date: '27/7', weekday: 'יום שני', title: 'קובנט גארדן, לונדון איי ושייט בגריניץ\'', items: [
    { time: 'בוקר', category: 'food', title: 'ארוחת בוקר במלון', desc: 'התארגנות ליום מלא.', price: '' },
    { time: 'בוקר', category: 'activity', title: 'קובנט גארדן (Covent Garden)', desc: 'שיטוט בשוק ובאזור התוסס של קובנט גארדן.', price: '' },
    { time: 'צהריים', category: 'activity', title: 'לונדון איי ושייט מרציף London Eye Pier', desc: 'שייט לכיוון גריניץ\' לאורך התמזה.', price: '' },
    { time: 'ערב', category: 'activity', title: 'סיור בגריניץ\'', desc: 'מצפה הכוכבים המלכותי וסיבוב בספינה ההיסטורית Cutty Sark.', price: '' }
  ]},
  { date: '28/7', weekday: 'יום שלישי', title: 'שוק קמדן וקניון ווסטפילד', items: [
    { time: 'בוקר', category: 'food', title: 'ארוחת בוקר במלון', desc: 'התארגנות ליום קניות ושווקים.', price: '' },
    { time: 'בוקר', category: 'activity', title: 'שוק קמדן (Camden Market)', desc: 'שוטטות בשווקי הרחוב, המכורה והשוק התת-קרקעי, ומלא משאיות אוכל.', price: '' },
    { time: 'צהריים', category: 'activity', title: 'שופינג בקניון ווסטפילד (Westfield)', desc: 'קניון קניות ענק עם מגוון רחב של חנויות.', price: '' },
    { time: 'ערב', category: 'food', title: 'ארוחת ערב באזור הקניון', desc: 'ארוחה נינוחה לסיום יום הקניות.', price: '' }
  ]},
  { date: '29/7', weekday: 'יום רביעי', title: 'נוטינג היל, סקיי גארדן ומלך האריות', items: [
    { time: 'בוקר', category: 'food', title: 'ארוחת בוקר בשכונת נוטינג היל', desc: 'ארוחת בוקר וקניות בשכונה הציורית נוטינג היל.', price: '' },
    { time: '15:45', category: 'activity', title: 'סקיי גארדן (Sky Garden)', desc: 'תצפית פנורמית מרהיבה על העיר מגובה.', price: '' },
    { time: '19:30', category: 'activity', title: 'מופע מלך האריות (The Lion King)', desc: 'מופע ווסט אנד מרהיב עם תפאורה ותלבושות מרשימות.', price: '' }
  ]},
  { date: '30/7', weekday: 'יום חמישי', title: 'מוזיאון המדע, פארק וטיסה חזרה', items: [
    { time: 'בוקר', category: 'food', title: 'ארוחת בוקר במלון', desc: 'ארוחת בוקר אחרונה לפני יום היציאה.', price: '' },
    { time: 'בוקר', category: 'activity', title: 'מוזיאון המדע (Science Museum)', desc: 'מוזיאון אינטראקטיבי ומהנה לכל המשפחה.', price: '' },
    { time: 'צהריים', category: 'activity', title: 'ריג\'נט פארק או הייד פארק', desc: 'זמן חופשי ומנוחה באחד מהפארקים הגדולים של לונדון.', price: '' },
    { time: 'אחה"צ', category: 'food', title: 'קניות אחרונות בסופרמרקט', desc: 'קניות אחרונות של מתנות וממתקים לפני החזרה.', price: '' },
    { time: '19:00', category: 'transport', title: 'יציאה לשדה התעופה', desc: 'זמן הגעה מומלץ לפני הטיסה.', price: '' },
    { time: '22:00', category: 'transport', title: 'טיסה חזרה', desc: 'המראה חזרה הביתה.', price: '' }
  ]}
];
const SEED_EXPENSES = [
  { category: 'activity', amount: '27', note: 'כרטיסי לונדון איי' },
  { category: 'activity', amount: '58', note: 'כרטיסי מופע אלאדין' },
  { category: 'food', amount: '45', note: 'ארוחת צהריים Princi' },
  { category: 'activity', amount: '19.90', note: 'מאדאם טוסו' }
];
const SEED_TODO_BEFORE = [
  { text: 'הזמנת כרטיסים מראש (מופעים ואטרקציות)', done: true },
  { text: 'המרת מט"ח', done: false },
  { text: 'ביטוח נסיעות', done: false },
  { text: 'אריזה', done: false },
  { text: 'הורדת אפליקציית Citymapper / Tube Map', done: false }
];
const SEED_TODO_DURING = [
  { text: 'טעינת כרטיס Oyster / כרטיס אשראי לתחבורה', done: false },
  { text: 'שמירת צילום דרכון בענן', done: false },
  { text: 'בדיקת מזג אוויר יומית ולבוש מתאים', done: false }
];

let uidCounter = 1;
function nextId() { return 'id' + (uidCounter++); }
function clone(obj) { return JSON.parse(JSON.stringify(obj)); }
function esc(str) {
  return String(str == null ? '' : str).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}
function fmtNum(n) {
  if (!isFinite(n)) n = 0;
  return Number.isInteger(n) ? String(n) : n.toFixed(2);
}
/* some newly-added currencies (ARS, COP, PYG...) are worth a small fraction of a shekel/dollar —
   fmtNum's flat 2-decimal cap would round 1 unit of them down to "0.00". */
function fmtCurrencyResult(n) {
  if (!isFinite(n)) n = 0;
  return n !== 0 && Math.abs(n) < 1 ? n.toFixed(4) : fmtNum(n);
}
function emptyDraft() { return { time: '', category: 'activity', title: '', desc: '', price: '' }; }

function seedDays() { return SEED_DAYS.map(d => ({ ...clone(d), items: d.items.map(it => ({ ...it, id: nextId() })) })); }
function seedExpenses() { return SEED_EXPENSES.map(e => ({ ...e, id: nextId() })); }
function seedTodo(list) { return list.map(t => ({ ...t, id: nextId() })); }

const state = {
  trips: [],
  currentTripId: 'london',
  tripName: 'טיול לונדון',
  tripStart: SEED_START,
  editingTripInfo: false,
  tripNameDraft: '',
  tripDateDraft: '',
  activeTab: 'itinerary',
  activeDayIdx: 0,
  days: [],
  budgetTotal: '3000',
  expenses: [],
  todoBefore: [],
  todoDuring: [],
  addingItem: false,
  draft: emptyDraft(),
  draftError: false,
  editingItemId: null,
  editDraft: null,
  expenseDraft: { category: 'food', amount: '', note: '' },
  expenseError: false,
  todoPhase: 'before',
  newTodoText: '',
  todoError: false,
  newTripOpen: false,
  newTripDraft: { name: '', start: '', days: '7', budget: '3000' },
  newTripError: '',
  currencyModalOpen: false,
  currencyFrom: 'GBP',
  currencyTo: 'ILS',
  currencyAmount: '1',
  currencyResult: null,
  currencyRate: null,
  currencyDate: '',
  currencyLoading: false,
  currencyError: '',
  currencyDropdownOpen: null,
};

function loadStore() {
  let store = null;
  try { store = JSON.parse(localStorage.getItem(TRIPS_KEY) || 'null'); } catch (e) { store = null; }
  if (store && Array.isArray(store.trips) && store.trips.length) {
    const active = store.trips.find(t => t.id === store.currentTripId) || store.trips[0];
    state.trips = store.trips;
    applyTripToState(active);
  } else {
    const london = {
      id: 'london', name: 'טיול לונדון', startDate: SEED_START,
      days: seedDays(), budgetTotal: '3000', expenses: seedExpenses(),
      todoBefore: seedTodo(SEED_TODO_BEFORE), todoDuring: seedTodo(SEED_TODO_DURING)
    };
    state.trips = [london];
    applyTripToState(london);
    persist();
  }
}
function persist() {
  const payload = { trips: state.trips, currentTripId: state.currentTripId };
  try { localStorage.setItem(TRIPS_KEY, JSON.stringify(payload)); } catch (e) {}
}

/* =========================================================================
   SECTION: ITINERARY
   ========================================================================= */

function setActiveDay(idx) {
  state.activeDayIdx = idx;
  state.addingItem = false;
  state.editingItemId = null;
  state.editDraft = null;
  render();
}
function openAddItem() {
  state.addingItem = true;
  state.editingItemId = null;
  state.editDraft = null;
  state.draft = emptyDraft();
  state.draftError = false;
  render();
}
function cancelAdd() {
  state.addingItem = false;
  state.draftError = false;
  render();
}
function saveAddItem() {
  const d = state.draft;
  if (!d.title.trim()) { state.draftError = true; render(); return; }
  const day = state.days[state.activeDayIdx];
  if (!day) return;
  day.items.push({ id: nextId(), time: d.time.trim() || '—', category: d.category, title: d.title.trim(), desc: d.desc.trim(), price: d.price.trim() });
  state.addingItem = false;
  state.draftError = false;
  render();
}
function startEditItem(id) {
  const day = state.days[state.activeDayIdx];
  const item = day && day.items.find(i => i.id === id);
  if (!item) return;
  state.editingItemId = id;
  state.addingItem = false;
  state.editDraft = { time: item.time, category: item.category, title: item.title, desc: item.desc, price: item.price };
  state.draftError = false;
  render();
}
function cancelEditItem() {
  state.editingItemId = null;
  state.editDraft = null;
  state.draftError = false;
  render();
}
function saveEditItem() {
  const id = state.editingItemId;
  const d = state.editDraft;
  if (!d.title.trim()) { state.draftError = true; render(); return; }
  const day = state.days[state.activeDayIdx];
  const item = day && day.items.find(i => i.id === id);
  if (item) {
    item.time = d.time.trim() || '—';
    item.category = d.category;
    item.title = d.title.trim();
    item.desc = d.desc.trim();
    item.price = d.price.trim();
  }
  state.editingItemId = null;
  state.editDraft = null;
  state.draftError = false;
  render();
}
function deleteItem(id) {
  const day = state.days[state.activeDayIdx];
  if (!day) return;
  day.items = day.items.filter(i => i.id !== id);
  render();
}

/* =========================================================================
   SECTION: BUDGET
   ========================================================================= */

function totalSpent() {
  return state.expenses.reduce((sum, e) => sum + (parseFloat(e.amount) || 0), 0);
}
function categorySpent(cat) {
  return state.expenses.filter(e => e.category === cat).reduce((sum, e) => sum + (parseFloat(e.amount) || 0), 0);
}
function addExpense() {
  const d = state.expenseDraft;
  const amt = parseFloat(d.amount);
  if (!(amt > 0)) { state.expenseError = true; render(); return; }
  state.expenses.push({ id: nextId(), category: d.category, amount: d.amount.trim(), note: d.note.trim() });
  state.expenseDraft = { category: d.category, amount: '', note: '' };
  state.expenseError = false;
  render();
}
function deleteExpense(id) {
  state.expenses = state.expenses.filter(e => e.id !== id);
  render();
}

/* ---- currency converter (open.er-api.com — free, no API key, ~160 currencies, updates daily) ---- */
const CURRENCY_API = 'https://open.er-api.com/v6/latest';
/* maps to flag-icons (cdn.jsdelivr.net/npm/flag-icons) two-letter country classes — Windows has no
   color flag emoji glyphs, so flags are rendered as real SVG icons instead of Unicode emoji.
   Curated list: existing majors + South America, the Gulf states, and Eastern Europe. */
const CURRENCY_COUNTRY = {
  AUD: 'au', BRL: 'br', CAD: 'ca', CHF: 'ch', CNY: 'cn', CZK: 'cz', DKK: 'dk', EUR: 'eu',
  GBP: 'gb', HKD: 'hk', HUF: 'hu', IDR: 'id', ILS: 'il', INR: 'in', ISK: 'is', JPY: 'jp',
  KRW: 'kr', MXN: 'mx', MYR: 'my', NOK: 'no', NZD: 'nz', PHP: 'ph', PLN: 'pl', RON: 'ro',
  SEK: 'se', SGD: 'sg', THB: 'th', TRY: 'tr', USD: 'us', ZAR: 'za',
  // South America
  ARS: 'ar', CLP: 'cl', COP: 'co', PEN: 'pe', UYU: 'uy', BOB: 'bo', PYG: 'py',
  // Persian Gulf
  AED: 'ae', SAR: 'sa', QAR: 'qa', KWD: 'kw', BHD: 'bh', OMR: 'om',
  // Eastern Europe
  BGN: 'bg', RSD: 'rs', UAH: 'ua', ALL: 'al', BAM: 'ba', MKD: 'mk', RUB: 'ru'
};
const CURRENCY_NAMES = {
  AUD: 'Australian Dollar', BRL: 'Brazilian Real', CAD: 'Canadian Dollar', CHF: 'Swiss Franc',
  CNY: 'Chinese Yuan', CZK: 'Czech Koruna', DKK: 'Danish Krone', EUR: 'Euro', GBP: 'British Pound',
  HKD: 'Hong Kong Dollar', HUF: 'Hungarian Forint', IDR: 'Indonesian Rupiah', ILS: 'Israeli New Shekel',
  INR: 'Indian Rupee', ISK: 'Icelandic Króna', JPY: 'Japanese Yen', KRW: 'South Korean Won',
  MXN: 'Mexican Peso', MYR: 'Malaysian Ringgit', NOK: 'Norwegian Krone', NZD: 'New Zealand Dollar',
  PHP: 'Philippine Peso', PLN: 'Polish Złoty', RON: 'Romanian Leu', SEK: 'Swedish Krona',
  SGD: 'Singapore Dollar', THB: 'Thai Baht', TRY: 'Turkish Lira', USD: 'United States Dollar',
  ZAR: 'South African Rand',
  ARS: 'Argentine Peso', CLP: 'Chilean Peso', COP: 'Colombian Peso', PEN: 'Peruvian Sol',
  UYU: 'Uruguayan Peso', BOB: 'Bolivian Boliviano', PYG: 'Paraguayan Guaraní',
  AED: 'UAE Dirham', SAR: 'Saudi Riyal', QAR: 'Qatari Riyal', KWD: 'Kuwaiti Dinar',
  BHD: 'Bahraini Dinar', OMR: 'Omani Rial',
  BGN: 'Bulgarian Lev', RSD: 'Serbian Dinar', UAH: 'Ukrainian Hryvnia', ALL: 'Albanian Lek',
  BAM: 'Bosnia-Herzegovina Mark', MKD: 'Macedonian Denar', RUB: 'Russian Ruble'
};
/* heuristic destination -> currency guesser: matches free-text keywords (city/country names, as
   typed in the trip name, e.g. "טיול לונדון") against the currency the trip is most likely in.
   Keeps to currencies already in CURRENCY_NAMES/CURRENCY_COUNTRY above — no new currencies added.
   Longer/more specific keywords are listed first so e.g. "דרום אפריקה" doesn't get shadowed. */
const TRIP_DESTINATION_CURRENCY = [
  [['ניו יורק', 'לוס אנג\'לס', 'קליפורניה', 'שיקגו', 'מיאמי', 'לאס וגאס', 'וגאס', 'בוסטון', 'וושינגטון', 'ארה"ב', 'ארצות הברית', 'אמריקה'], 'USD'],
  [['לונדון', 'אנגליה', 'בריטניה', 'סקוטלנד', 'אדינבורו', 'מנצ\'סטר'], 'GBP'],
  [['פריז', 'צרפת', 'רומא', 'איטליה', 'מילאנו', 'ונציה', 'פירנצה', 'ספרד', 'ברצלונה', 'מדריד',
    'גרמניה', 'ברלין', 'מינכן', 'הולנד', 'אמסטרדם', 'פורטוגל', 'ליסבון', 'יוון', 'אתונה', 'כרתים',
    'אוסטריה', 'וינה', 'בלגיה', 'בריסל', 'אירלנד', 'דבלין', 'פינלנד', 'הלסינקי'], 'EUR'],
  [['שוויץ', 'ציריך', 'ז\'נבה'], 'CHF'],
  [['נורווגיה', 'אוסלו'], 'NOK'],
  [['שוודיה', 'שטוקהולם'], 'SEK'],
  [['דנמרק', 'קופנהגן'], 'DKK'],
  [['פולין', 'ורשה', 'קרקוב'], 'PLN'],
  [['צ\'כיה', 'פראג'], 'CZK'],
  [['הונגריה', 'בודפשט'], 'HUF'],
  [['טורקיה', 'איסטנבול', 'אנטליה'], 'TRY'],
  [['תאילנד', 'בנגקוק', 'פוקט'], 'THB'],
  [['יפן', 'טוקיו', 'אוסקה', 'קיוטו'], 'JPY'],
  [['סין', 'בייג\'ינג', 'שנגחאי'], 'CNY'],
  [['קוריאה', 'סיאול'], 'KRW'],
  [['הודו', 'דלהי', 'מומבאי'], 'INR'],
  [['אינדונזיה', 'באלי'], 'IDR'],
  [['מלזיה', 'קואלה לומפור'], 'MYR'],
  [['סינגפור'], 'SGD'],
  [['הונג קונג'], 'HKD'],
  [['דובאי', 'איחוד האמירויות', 'אבו דאבי'], 'AED'],
  [['ערב הסעודית', 'ריאד'], 'SAR'],
  [['קטר', 'דוחה'], 'QAR'],
  [['ישראל', 'תל אביב', 'ירושלים', 'אילת'], 'ILS'],
  [['דרום אפריקה', 'קייפטאון'], 'ZAR'],
  [['אוסטרליה', 'סידני', 'מלבורן'], 'AUD'],
  [['ניו זילנד', 'אוקלנד'], 'NZD'],
  [['קנדה', 'טורונטו', 'ונקובר', 'מונטריאול'], 'CAD'],
  [['ברזיל', 'ריו', 'סאו פאולו'], 'BRL'],
  [['ארגנטינה', 'בואנוס איירס'], 'ARS'],
  [['צ\'ילה', 'סנטיאגו'], 'CLP'],
  [['קולומביה', 'בוגוטה'], 'COP'],
  [['מקסיקו', 'קנקון'], 'MXN']
];
function guessTripCurrency(name) {
  if (!name) return null;
  for (const [keywords, code] of TRIP_DESTINATION_CURRENCY) {
    if (keywords.some(k => name.includes(k))) return code;
  }
  return null;
}
function openCurrencyConverter() {
  state.currencyModalOpen = true;
  state.currencyError = '';
  state.currencyDropdownOpen = null;
  const guess = guessTripCurrency(state.tripName);
  if (guess) state.currencyFrom = guess;
  convertCurrency();
}
function closeCurrencyConverter() {
  state.currencyModalOpen = false;
  state.currencyDropdownOpen = null;
  render();
}
function toggleCurrencyDropdown(which) {
  /* iOS Safari doesn't move focus to a tapped <button>, so without this the amount input
     (autofocused on modal open) stays focused, its keyboard stays up, and the dropdown gets
     positioned against the pre-keyboard window.innerHeight — appearing cut off or hidden
     under the keyboard. Blurring first dismisses the keyboard before we measure/position. */
  if (document.activeElement && document.activeElement.blur) document.activeElement.blur();
  state.currencyDropdownOpen = state.currencyDropdownOpen === which ? null : which;
  render();
}
function closeCurrencyDropdown() {
  state.currencyDropdownOpen = null;
  render();
}
/* the dropdown is position:fixed (to escape the modal's own overflow:auto clipping on mobile),
   opening whichever direction (up or down) currently has more visible room. */
function positionCurrencyDropdown() {
  if (!state.currencyDropdownOpen) return;
  const btn = document.querySelector(`.tp-currency-combobox[data-which="${state.currencyDropdownOpen}"]`);
  const panel = document.querySelector('.tp-currency-dropdown');
  if (!btn || !panel) return;
  const rect = btn.getBoundingClientRect();
  /* visualViewport tracks what's actually on screen (it shrinks and its offsetTop moves down when
     the iOS keyboard is up or the page auto-scrolls a focused input into view), while
     getBoundingClientRect()/fixed positioning both use the layout viewport's coordinate space —
     visualViewport.offsetTop is defined in that same space, so mixing them here is safe. Always
     opening upward (as before) broke once the row ended up scrolled near the top of the screen:
     there was barely any room above it, so the panel got clamped tiny or missed the visible area
     entirely. Instead pick whichever side actually has more visible room. */
  const vv = window.visualViewport;
  const viewTop = vv ? vv.offsetTop : 0;
  const viewBottom = vv ? vv.offsetTop + vv.height : window.innerHeight;
  const gap = 6, edgeSafe = 12;
  const spaceAbove = rect.top - viewTop - edgeSafe;
  const spaceBelow = viewBottom - rect.bottom - edgeSafe;

  panel.style.left = rect.left + 'px';
  panel.style.width = rect.width + 'px';
  if (spaceBelow >= spaceAbove) {
    panel.style.top = (rect.bottom + gap) + 'px';
    panel.style.bottom = 'auto';
    panel.style.maxHeight = Math.max(120, spaceBelow - gap) + 'px';
  } else {
    panel.style.top = 'auto';
    panel.style.bottom = (window.innerHeight - rect.top + gap) + 'px';
    panel.style.maxHeight = Math.max(120, spaceAbove - gap) + 'px';
  }
}
function selectCurrency(which, code) {
  if (which === 'from') state.currencyFrom = code;
  else state.currencyTo = code;
  state.currencyDropdownOpen = null;
  convertCurrency();
}
function swapCurrencies() {
  const f = state.currencyFrom;
  state.currencyFrom = state.currencyTo;
  state.currencyTo = f;
  state.currencyDropdownOpen = null;
  convertCurrency();
}
async function convertCurrency() {
  const amount = parseFloat(state.currencyAmount);
  if (!(amount > 0)) {
    state.currencyResult = null;
    state.currencyError = 'יש להזין סכום תקין (גדול מ-0).';
    render();
    return;
  }
  if (state.currencyFrom === state.currencyTo) {
    state.currencyResult = amount;
    state.currencyRate = 1;
    state.currencyDate = '';
    state.currencyLoading = false;
    render();
    return;
  }
  state.currencyLoading = true;
  state.currencyError = '';
  render();
  try {
    const res = await fetch(`${CURRENCY_API}/${state.currencyFrom}`);
    if (!res.ok) throw new Error('bad response');
    const data = await res.json();
    const rate = data.rates && data.rates[state.currencyTo];
    if (data.result !== 'success' || rate == null) throw new Error('bad data');
    state.currencyRate = rate;
    state.currencyResult = amount * rate;
    state.currencyDate = data.time_last_update_utc ? data.time_last_update_utc.slice(0, 16) : '';
  } catch (e) {
    state.currencyError = 'שגיאה בטעינת שער החליפין. יש לבדוק חיבור לאינטרנט ולנסות שוב.';
    state.currencyResult = null;
  }
  state.currencyLoading = false;
  render();
}

/* =========================================================================
   SECTION: CHECKLIST
   ========================================================================= */

function setTodoPhase(phase) {
  state.todoPhase = phase;
  render();
}
function addTodo() {
  const text = state.newTodoText.trim();
  if (!text) { state.todoError = true; render(); return; }
  const list = state.todoPhase === 'before' ? state.todoBefore : state.todoDuring;
  list.push({ id: nextId(), text, done: false });
  state.newTodoText = '';
  state.todoError = false;
  render();
}
function toggleTodo(listName, id) {
  const list = listName === 'before' ? state.todoBefore : state.todoDuring;
  const t = list.find(x => x.id === id);
  if (t) t.done = !t.done;
  render();
}
function deleteTodo(listName, id) {
  if (listName === 'before') state.todoBefore = state.todoBefore.filter(x => x.id !== id);
  else state.todoDuring = state.todoDuring.filter(x => x.id !== id);
  render();
}

/* =========================================================================
   SECTION: TRIPS + COUNTDOWN
   ========================================================================= */

function collectTrip() {
  return {
    id: state.currentTripId, name: state.tripName, startDate: state.tripStart,
    days: clone(state.days), budgetTotal: state.budgetTotal, expenses: clone(state.expenses),
    todoBefore: clone(state.todoBefore), todoDuring: clone(state.todoDuring)
  };
}
function applyTripToState(t) {
  state.currentTripId = t.id;
  state.tripName = t.name;
  state.tripStart = t.startDate;
  state.days = clone(t.days);
  state.budgetTotal = t.budgetTotal;
  state.expenses = clone(t.expenses);
  state.todoBefore = clone(t.todoBefore);
  state.todoDuring = clone(t.todoDuring);
  state.activeDayIdx = 0;
  state.addingItem = false;
  state.editingItemId = null;
  state.editDraft = null;
}
let autoSaveTimer = null;
function flushAutoSave() {
  clearTimeout(autoSaveTimer);
  autoSaveTimer = null;
  const cur = collectTrip();
  const exists = state.trips.some(t => t.id === cur.id);
  state.trips = exists ? state.trips.map(t => (t.id === cur.id ? cur : t)) : [...state.trips, cur];
  persist();
}
function scheduleAutoSave() {
  clearTimeout(autoSaveTimer);
  autoSaveTimer = setTimeout(flushAutoSave, 600);
}
function switchTrip(id) {
  if (id === state.currentTripId) return;
  const cur = collectTrip();
  state.trips = state.trips.map(t => (t.id === cur.id ? cur : t));
  const target = state.trips.find(t => t.id === id);
  if (!target) return;
  applyTripToState(target);
  state.activeTab = 'itinerary';
  persist();
  render();
}
function deleteTrip(id) {
  const target = state.trips.find(t => t.id === id);
  if (!target) return;
  if (state.trips.length <= 1) { alert('לא ניתן למחוק את הטיול היחיד'); return; }
  if (!confirm(`למחוק את הטיול "${target.name}"? הפעולה אינה הפיכה.`)) return;
  state.trips = state.trips.filter(t => t.id !== id);
  if (id === state.currentTripId) {
    applyTripToState(state.trips[0]);
  }
  persist();
  render();
}
function openNewTrip() {
  state.newTripOpen = true;
  state.newTripError = '';
  state.newTripDraft = { name: '', start: '', days: '7', budget: '3000' };
  render();
}
function cancelNewTrip() {
  state.newTripOpen = false;
  state.newTripError = '';
  render();
}
function relabelDaysFromStart() {
  const start = new Date(state.tripStart);
  state.days = state.days.map((day, idx) => {
    const dt = new Date(start.getTime() + idx * 86400000);
    return { ...day, date: `${dt.getDate()}/${dt.getMonth() + 1}`, weekday: HE_WEEKDAYS[dt.getDay()] };
  });
}
function startEditTripInfo() {
  state.editingTripInfo = true;
  state.tripNameDraft = state.tripName;
  state.tripDateDraft = state.tripStart.slice(0, 10);
  render();
}
function cancelEditTripInfo() { state.editingTripInfo = false; render(); }
function saveTripInfo() {
  const name = state.tripNameDraft.trim();
  const dateStr = state.tripDateDraft;
  if (!name || !dateStr || isNaN(new Date(dateStr).getTime())) return;
  state.tripName = name;
  const timePart = state.tripStart.length > 10 ? state.tripStart.slice(10) : 'T08:00';
  state.tripStart = dateStr + timePart;
  relabelDaysFromStart();
  const t = state.trips.find(x => x.id === state.currentTripId);
  if (t) t.name = name;
  state.editingTripInfo = false;
  render();
}
function blankDays(startStr, count) {
  const start = new Date(startStr);
  const out = [];
  for (let i = 0; i < count; i++) {
    const d = new Date(start.getTime() + i * 86400000);
    out.push({ date: `${d.getDate()}/${d.getMonth() + 1}`, weekday: HE_WEEKDAYS[d.getDay()], title: '', items: [] });
  }
  return out;
}
function createTrip() {
  const d = state.newTripDraft;
  if (!d.name.trim()) { state.newTripError = 'יש להזין שם לטיול'; render(); return; }
  if (!d.start || isNaN(new Date(d.start).getTime())) { state.newTripError = 'יש לבחור תאריך יציאה'; render(); return; }
  const count = Math.max(1, Math.min(30, parseInt(d.days, 10) || 1));
  const cur = collectTrip();
  const exists = state.trips.some(t => t.id === cur.id);
  const kept = exists ? state.trips.map(t => (t.id === cur.id ? cur : t)) : [...state.trips, cur];
  const startDate = d.start.length <= 10 ? `${d.start}T08:00` : d.start;
  const fresh = {
    id: 'trip-' + Date.now(), name: d.name.trim(), startDate,
    days: blankDays(startDate, count), budgetTotal: d.budget || '0',
    expenses: [], todoBefore: [], todoDuring: []
  };
  state.trips = [...kept, fresh];
  state.newTripOpen = false;
  state.newTripError = '';
  state.activeTab = 'itinerary';
  applyTripToState(fresh);
  persist();
  render();
}

function tripDatesLabel() {
  const start = state.days[0] ? state.days[0].date : '';
  const end = state.days.length ? state.days[state.days.length - 1].date : start;
  return `${end} - ${start}`;
}
function pad2(n) { return String(n).padStart(2, '0'); }
function computeCountdown() {
  const start = new Date(state.tripStart).getTime();
  const now = Date.now();
  const diff = start - now;
  if (diff > 0) {
    return {
      active: true,
      days: Math.floor(diff / 86400000),
      hours: Math.floor(diff / 3600000) % 24,
      mins: Math.floor(diff / 60000) % 60,
      secs: Math.floor(diff / 1000) % 60
    };
  }
  const sinceStart = now - start;
  const during = sinceStart <= 7 * 86400000;
  return { active: false, doneLabel: during ? 'הטיול בעיצומו! 🇬🇧' : 'הטיול הסתיים' };
}
function renderTimerBody() {
  const cd = computeCountdown();
  if (cd.active) {
    return `<div class="tp-timer-cells">
      <div class="tp-timer-cell d"><div class="tp-timer-num">${cd.days}</div><div class="tp-timer-label">ימים</div></div>
      <span class="tp-timer-sep">:</span>
      <div class="tp-timer-cell h"><div class="tp-timer-num">${pad2(cd.hours)}</div><div class="tp-timer-label">שעות</div></div>
      <span class="tp-timer-sep">:</span>
      <div class="tp-timer-cell m"><div class="tp-timer-num">${pad2(cd.mins)}</div><div class="tp-timer-label">דקות</div></div>
      <span class="tp-timer-sep">:</span>
      <div class="tp-timer-cell s"><div class="tp-timer-num">${pad2(cd.secs)}</div><div class="tp-timer-label">שניות</div></div>
    </div>`;
  }
  return `<div class="tp-timer-done">${esc(cd.doneLabel)}</div>`;
}
let tickInterval = null;
function updateTimerDom() {
  const el = document.getElementById('tpTimerBody');
  if (el) el.innerHTML = renderTimerBody();
}
function startTick() {
  tickInterval = setInterval(updateTimerDom, 1000);
}

/* =========================================================================
   SECTION: RENDER
   ========================================================================= */

function setTab(tab) {
  state.activeTab = tab;
  state.addingItem = false;
  state.editingItemId = null;
  state.editDraft = null;
  render();
}

function renderHeader() {
  const year = new Date(state.tripStart).getFullYear();
  return `
  <header class="tp-header">
    <div class="tp-headerrow1">
      <div class="tp-titleblock">
        <div>
          <div class="tp-apptitle">מתכנן הטיול הבא שלי</div>
          <div class="tp-titlerow">
            ${state.editingTripInfo ? `
              <input id="tripNameEditInput" type="text" class="tp-editname-input" value="${esc(state.tripNameDraft)}" data-autofocus>
              <span class="tp-yearbadge">${isNaN(year) ? '' : year}</span>
              <input id="tripDateEditInput" type="date" class="tp-editdate-input" value="${esc(state.tripDateDraft)}">
              <button class="tp-btn-icon" data-action="save-trip-info" title="שמירה">${ICO.check}</button>
              <button class="tp-btn-icon" data-action="cancel-trip-info" title="ביטול">✕</button>
            ` : `
              <h1 class="tp-title">${esc(state.tripName)}</h1>
              <span class="tp-yearbadge">${isNaN(year) ? '' : year}</span>
              <button class="tp-btn-icon" data-action="edit-trip-info" title="עריכת שם ותאריך הטיול">${ICO.pencil}</button>
            `}
          </div>
          <div class="tp-subline">${esc(tripDatesLabel())} • מסלול טיול אינטראקטיבי, תקציב וצ'ק-ליסט</div>
        </div>
      </div>
    </div>
    <div class="tp-headerrow2">
      <div class="tp-tripbar-col">
        <div class="tp-tripbar">
          <button class="tp-btn-new-icon" data-action="open-new-trip" title="טיול חדש">${ICO.plus}</button>
          <select id="tripSelect" class="tp-tripselect">
            ${state.trips.map(t => `<option value="${esc(t.id)}" ${t.id === state.currentTripId ? 'selected' : ''}>${esc(t.name)}</option>`).join('')}
          </select>
          <button class="tp-btn-icon tp-btn-delete-trip" data-action="delete-trip" data-id="${esc(state.currentTripId)}" title="מחיקת הטיול הנוכחי">${ICO.trashSm}</button>
        </div>
        <div class="tp-timer">
          ${ICO.clock}
          <div id="tpTimerBody">${renderTimerBody()}</div>
        </div>
      </div>
      <div class="tp-nav">
        <button class="tp-navbtn ${state.activeTab === 'itinerary' ? 'is-active' : ''}" data-action="set-tab" data-tab="itinerary">${ICO.navItin} מסלול יומי</button>
        <button class="tp-navbtn ${state.activeTab === 'budget' ? 'is-active' : ''}" data-action="set-tab" data-tab="budget">${ICO.navBudget} תקציב והוצאות</button>
        <button class="tp-navbtn ${state.activeTab === 'todo' ? 'is-active' : ''}" data-action="set-tab" data-tab="todo">${ICO.navTodo} צ'ק-ליסט</button>
        <button class="tp-printbtn" data-action="print" title="הדפסה / שיתוף">${ICO.send}</button>
      </div>
    </div>
  </header>`;
}

function renderAddItemForm() {
  const d = state.draft;
  return `
  <div class="tp-form-panel">
    <div class="tp-field-grid" style="margin-bottom:10px;">
      <input id="draftTime" class="tp-input" placeholder="שעה (לדוגמה 14:00)" value="${esc(d.time)}" data-autofocus>
      <select id="draftCategory" class="tp-select">
        <option value="transport" ${d.category === 'transport' ? 'selected' : ''}>תחבורה</option>
        <option value="lodging" ${d.category === 'lodging' ? 'selected' : ''}>לינה</option>
        <option value="activity" ${d.category === 'activity' ? 'selected' : ''}>אטרקציה / פעילות</option>
        <option value="food" ${d.category === 'food' ? 'selected' : ''}>אוכל / מסעדה</option>
      </select>
      <input id="draftPrice" class="tp-input" placeholder="מחיר (אופציונלי, £)" value="${esc(d.price)}">
    </div>
    <input id="draftTitle" class="tp-input" placeholder="כותרת" value="${esc(d.title)}" style="margin-bottom:10px;">
    <textarea id="draftDesc" class="tp-textarea" placeholder="תיאור קצר" style="margin-bottom:10px;">${esc(d.desc)}</textarea>
    ${state.draftError ? `<div class="tp-error" style="margin-bottom:10px;">יש להזין כותרת לפעילות.</div>` : ''}
    <div class="tp-form-actions">
      <button class="tp-btn-primary-form" data-action="save-add-item">שמירה</button>
      <button class="tp-btn-ghost" data-action="cancel-add-item">ביטול</button>
    </div>
  </div>`;
}
function renderEditItemForm() {
  const d = state.editDraft;
  return `
  <div class="tp-form-panel">
    <div class="tp-field-grid" style="margin-bottom:10px;">
      <input id="editTime" class="tp-input" value="${esc(d.time)}" data-autofocus>
      <select id="editCategory" class="tp-select">
        <option value="transport" ${d.category === 'transport' ? 'selected' : ''}>תחבורה</option>
        <option value="lodging" ${d.category === 'lodging' ? 'selected' : ''}>לינה</option>
        <option value="activity" ${d.category === 'activity' ? 'selected' : ''}>אטרקציה / פעילות</option>
        <option value="food" ${d.category === 'food' ? 'selected' : ''}>אוכל / מסעדה</option>
      </select>
      <input id="editPrice" class="tp-input" placeholder="מחיר £" value="${esc(d.price)}">
    </div>
    <input id="editTitle" class="tp-input" value="${esc(d.title)}" style="margin-bottom:10px;">
    <textarea id="editDesc" class="tp-textarea" style="margin-bottom:10px;">${esc(d.desc)}</textarea>
    ${state.draftError ? `<div class="tp-error" style="margin-bottom:10px;">יש להזין כותרת לפעילות.</div>` : ''}
    <div class="tp-form-actions">
      <button class="tp-btn-primary-form" data-action="save-edit-item">שמירה</button>
      <button class="tp-btn-ghost" data-action="cancel-edit-item">ביטול</button>
    </div>
  </div>`;
}
function renderItemRow(item) {
  const priceLabel = item.price ? `${DEFAULT_CURRENCY}${esc(item.price)}` : '';
  return `
  <div class="tp-item-row">
    <div class="tp-item-actions">
      <button class="tp-btn-icon" data-action="delete-item" data-id="${item.id}" title="מחיקה">${ICO.trash}</button>
      <button class="tp-btn-icon" data-action="edit-item" data-id="${item.id}" title="עריכה">${ICO.pencil}</button>
    </div>
    <div class="tp-item-body">
      <div class="tp-item-meta">
        <span class="tp-item-time">${esc(item.time)}</span>
        <span class="tp-item-tag">${esc(CATEGORY_LABELS[item.category] || item.category)}</span>
      </div>
      <div class="tp-item-title">${esc(item.title)}</div>
      ${item.desc ? `<div class="tp-item-desc">${esc(item.desc)}</div>` : ''}
      ${priceLabel ? `<div class="tp-item-price">${priceLabel}</div>` : ''}
    </div>
    <div class="tp-item-icon cat-${item.category}">${ICON_PATHS[item.category] || ''}</div>
  </div>`;
}
function renderItinerary() {
  const day = state.days[state.activeDayIdx] || { date: '', weekday: '', title: '', items: [] };
  return `
  <section>
    <div class="tp-section-head">
      <div>
        <h2 class="tp-h2">לוח זמנים ומסלול טיול יומי</h2>
        <p class="tp-lede">תכנון יומי מפורט: אתרים, אטרקציות, סיורים ומקומות לארוחות. ניתן להוסיף, לערוך ולמחוק פרטים.</p>
      </div>
    </div>

    <div class="tp-daypills">
      ${state.days.map((d, idx) => `<button class="tp-daypill ${idx === state.activeDayIdx ? 'is-active' : ''}" data-action="set-day" data-idx="${idx}">${esc(d.weekday)} (${esc(d.date)})</button>`).join('')}
    </div>

    <div class="tp-card tp-daycard">
      <div class="tp-daycard-head">
        <div>
          <div class="tp-daymeta">${esc(day.date)} • ${esc(day.weekday)}</div>
          <h3 class="tp-daytitle">${esc(day.title || '—')}</h3>
        </div>
        <button class="tp-btn-primary-sm" data-action="open-add-item">${ICO.plus} הוסף פריט ליום זה</button>
      </div>

      ${state.addingItem ? renderAddItemForm() : ''}

      ${day.items.map(item => (state.editingItemId === item.id ? renderEditItemForm() : renderItemRow(item))).join('')}
    </div>
  </section>`;
}

function renderCategoryPie(spentTotal) {
  const cx = 80, cy = 80, r = 62, sw = 24, circ = 2 * Math.PI * r;
  let offset = 0;
  const segments = spentTotal > 0
    ? Object.keys(BUDGET_CATEGORY_LABELS).map(cat => {
        const val = categorySpent(cat);
        if (val <= 0) return '';
        const dash = (val / spentTotal) * circ;
        const circle = `<circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${BUDGET_CATEGORY_COLOR[cat]}" stroke-width="${sw}" stroke-dasharray="${dash} ${circ - dash}" stroke-dashoffset="${-offset}"/>`;
        offset += dash;
        return circle;
      }).join('')
    : `<circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="var(--border-2)" stroke-width="${sw}"/>`;
  return `
  <div class="tp-piechart-wrap">
    <svg width="160" height="160" viewBox="0 0 160 160">
      <g transform="rotate(-90 ${cx} ${cy})">${segments}</g>
    </svg>
    <div class="tp-piechart-center">
      <span class="tp-piechart-total">${DEFAULT_CURRENCY}${fmtNum(spentTotal)}</span>
      <span class="tp-piechart-caption">סה"כ הוצאות</span>
    </div>
  </div>`;
}
function renderBudget() {
  const total = parseFloat(state.budgetTotal) || 0;
  const spent = totalSpent();
  const remaining = total - spent;
  const over = remaining < 0;
  return `
  <section>
    <div class="tp-budget-headrow">
      <div>
        <h2 class="tp-h2">מעקב תקציב והוצאות</h2>
        <p class="tp-lede">לוח בקרה פיננסי לניהול תקציב הטיול לפי קטגוריות.</p>
      </div>
      <button class="tp-btn-currency" data-action="open-currency-converter">${ICO.swap} המרת מטבע</button>
    </div>

    <div class="tp-stat-grid">
      <div class="tp-stat-card primary">
        <div class="tp-stat-label">תקציב כולל</div>
        <div class="tp-budgettotal-row">
          <input id="budgetTotalInput" class="tp-budgettotal-input" value="${esc(state.budgetTotal)}">
        </div>
      </div>
      <div class="tp-stat-card plain">
        <div class="tp-stat-label">סה"כ הוצאות</div>
        <div class="tp-stat-value">${fmtNum(spent)}</div>
      </div>
      <div class="tp-stat-card plain">
        <div class="tp-stat-label">נותר בתקציב</div>
        <div class="tp-stat-value ${over ? 'is-over' : ''}">${fmtNum(remaining)}</div>
      </div>
    </div>

    ${over ? `<div class="tp-overbudget-banner">חריגה מהתקציב הכולל בסך ${DEFAULT_CURRENCY}${fmtNum(Math.abs(remaining))}</div>` : ''}

    <div class="tp-card" style="margin-bottom:20px;">
      <h3 class="tp-h3" style="margin-bottom:16px;">פילוח הוצאות לפי קטגוריה</h3>
      <div class="tp-cat-breakdown">
        <div class="tp-cat-list">
          ${Object.keys(BUDGET_CATEGORY_LABELS).map(cat => {
            const catSpent = categorySpent(cat);
            const pct = spent > 0 ? (catSpent / spent) * 100 : 0;
            return `
            <div>
              <div class="tp-cat-row-head">
                <span class="tp-cat-name"><span class="tp-cat-dot" style="background:${BUDGET_CATEGORY_COLOR[cat]};"></span>${BUDGET_CATEGORY_LABELS[cat]}</span>
                <span class="tp-cat-amounts">${DEFAULT_CURRENCY}${fmtNum(catSpent)}</span>
              </div>
              <div class="tp-progress-track">
                <div class="tp-progress-fill" style="width:${pct}%; background:${BUDGET_CATEGORY_COLOR[cat]};"></div>
              </div>
            </div>`;
          }).join('')}
        </div>
        ${renderCategoryPie(spent)}
      </div>
    </div>

    <div class="tp-card">
      <h3 class="tp-h3" style="margin-bottom:14px;">הוספת הוצאה</h3>
      <div class="tp-field-grid" style="margin-bottom:10px;">
        <select id="expenseCategory" class="tp-select">
          <option value="food" ${state.expenseDraft.category === 'food' ? 'selected' : ''}>אוכל</option>
          <option value="transport" ${state.expenseDraft.category === 'transport' ? 'selected' : ''}>תחבורה</option>
          <option value="activity" ${state.expenseDraft.category === 'activity' ? 'selected' : ''}>אטרקציות</option>
          <option value="shopping" ${state.expenseDraft.category === 'shopping' ? 'selected' : ''}>קניות</option>
        </select>
        <input id="expenseAmount" class="tp-input" placeholder="סכום (${DEFAULT_CURRENCY})" value="${esc(state.expenseDraft.amount)}">
        <input id="expenseNote" class="tp-input" placeholder="הערה (לדוגמה: לונדון איי)" value="${esc(state.expenseDraft.note)}">
        <button class="tp-btn-primary-form" data-action="add-expense">הוספת הוצאה</button>
      </div>
      ${state.expenseError ? `<div class="tp-error" style="margin-bottom:10px;">יש להזין סכום הוצאה תקין (גדול מ-0).</div>` : ''}
      <div>
        ${state.expenses.map(exp => `
          <div class="tp-expense-row">
            <div class="tp-expense-left">
              <button class="tp-btn-icon" data-action="delete-expense" data-id="${exp.id}">${ICO.trashSm}</button>
              <span class="tp-item-tag">${esc(BUDGET_CATEGORY_LABELS[exp.category] || exp.category)}</span>
              <span class="tp-expense-note">${esc(exp.note)}</span>
            </div>
            <span class="tp-expense-amount">${DEFAULT_CURRENCY}${fmtNum(parseFloat(exp.amount) || 0)}</span>
          </div>`).join('')}
      </div>
    </div>
  </section>`;
}

function renderTodoRow(t, list) {
  return `
  <div class="tp-todo-row">
    <button class="tp-checkbox ${t.done ? 'is-done' : ''}" data-action="toggle-todo" data-list="${list}" data-id="${t.id}">${t.done ? ICO.check : ''}</button>
    <span class="tp-todo-text ${t.done ? 'is-done' : ''}">${esc(t.text)}</span>
    <button class="tp-todo-delete" data-action="delete-todo" data-list="${list}" data-id="${t.id}">${ICO.trashXs}</button>
  </div>`;
}
function renderChecklist() {
  const beforeDone = state.todoBefore.filter(t => t.done).length;
  const duringDone = state.todoDuring.filter(t => t.done).length;
  return `
  <section>
    <h2 class="tp-h2">רשימת משימות לטיול</h2>
    <p class="tp-lede" style="margin-bottom:18px;">צ'ק-ליסט לפני הנסיעה ובמהלך הטיול.</p>

    <div class="tp-card" style="margin-bottom:18px;">
      <div class="tp-phase-toggle">
        <button class="tp-phase-btn ${state.todoPhase === 'before' ? 'is-active' : ''}" data-action="set-phase" data-phase="before">לפני הנסיעה</button>
        <button class="tp-phase-btn ${state.todoPhase === 'during' ? 'is-active' : ''}" data-action="set-phase" data-phase="during">במהלך הטיול</button>
      </div>
      <div class="tp-addtodo-row">
        <input id="newTodoInput" class="tp-addtodo-input" placeholder="משימה חדשה..." value="${esc(state.newTodoText)}">
        <button class="tp-addtodo-btn" data-action="add-todo">הוספה</button>
      </div>
      ${state.todoError ? `<div class="tp-error" style="margin-top:8px;">יש להזין טקסט למשימה.</div>` : ''}
    </div>

    <div class="tp-todo-grid">
      <div class="tp-todo-panel">
        <h3 class="tp-h3">לפני הנסיעה</h3>
        <div class="tp-todo-count">${beforeDone} מתוך ${state.todoBefore.length} הושלמו</div>
        ${state.todoBefore.map(t => renderTodoRow(t, 'before')).join('')}
      </div>
      <div class="tp-todo-panel">
        <h3 class="tp-h3">במהלך הטיול</h3>
        <div class="tp-todo-count">${duringDone} מתוך ${state.todoDuring.length} הושלמו</div>
        ${state.todoDuring.map(t => renderTodoRow(t, 'during')).join('')}
      </div>
    </div>
  </section>`;
}

function renderNewTripModal() {
  const d = state.newTripDraft;
  return `
  <div class="tp-modal-overlay" data-action="modal-overlay-close">
    <div class="tp-modal">
      <h2>טיול חדש</h2>
      <p class="tp-modal-lede">הזן את פרטי הטיול. המסלול, ההוצאות והצ'ק-ליסט יתחילו ריקים.</p>
      <div class="tp-modal-grid">
        <label class="tp-modal-label">שם הטיול
          <input id="ntName" class="tp-modal-input" placeholder="לדוגמה: טיול פריז" value="${esc(d.name)}" data-autofocus>
        </label>
        <label class="tp-modal-label">תאריך יציאה
          <input id="ntStart" type="date" class="tp-modal-input" value="${esc(d.start)}">
        </label>
        <div class="tp-modal-subgrid">
          <label class="tp-modal-label">מספר ימים
            <input id="ntDays" type="number" min="1" max="30" class="tp-modal-input" value="${esc(d.days)}">
          </label>
          <label class="tp-modal-label">תקציב
            <input id="ntBudget" type="number" min="0" class="tp-modal-input" value="${esc(d.budget)}">
          </label>
        </div>
      </div>
      ${state.newTripError ? `<div class="tp-modal-error">${esc(state.newTripError)}</div>` : ''}
      <div class="tp-modal-actions">
        <button class="tp-modal-btn-primary" data-action="create-trip">צור טיול</button>
        <button class="tp-modal-btn-cancel" data-action="cancel-new-trip">ביטול</button>
      </div>
    </div>
  </div>`;
}

function renderCurrencyCombobox(which, codes) {
  const selected = which === 'from' ? state.currencyFrom : state.currencyTo;
  const open = state.currencyDropdownOpen === which;
  return `
  <div class="tp-currency-select-wrap">
    <button type="button" class="tp-currency-combobox ${open ? 'is-open' : ''}" data-action="toggle-currency-dropdown" data-which="${which}">
      <span class="fi fi-${CURRENCY_COUNTRY[selected] || 'xx'} tp-currency-flag"></span>
      <span class="tp-currency-combobox-code">${esc(selected)}</span>
      <span class="tp-currency-combobox-name">${esc(CURRENCY_NAMES[selected] || '')}</span>
    </button>
    ${open ? `
    <div class="tp-currency-dropdown">
      ${codes.map(c => `
        <button type="button" class="tp-currency-dropdown-row ${c === selected ? 'is-selected' : ''}" data-action="select-currency" data-which="${which}" data-code="${c}">
          <span class="fi fi-${CURRENCY_COUNTRY[c] || 'xx'} tp-currency-flag"></span>
          <span class="tp-currency-dropdown-code">${c}</span>
          <span class="tp-currency-dropdown-name">${esc(CURRENCY_NAMES[c] || '')}</span>
        </button>`).join('')}
    </div>` : ''}
  </div>`;
}
function renderCurrencyModal() {
  const codes = Object.keys(CURRENCY_NAMES).sort();
  return `
  <div class="tp-modal-overlay" data-action="modal-overlay-close">
    <div class="tp-modal">
      <h2>המרת מטבע</h2>
      <p class="tp-modal-lede">שערי חליפין חיים, מתעדכנים מדי יום.</p>
      <div class="tp-modal-grid">
        <label class="tp-modal-label">סכום
          <input id="currencyAmount" type="number" min="0" step="any" class="tp-modal-input" value="${esc(state.currencyAmount)}" data-autofocus>
        </label>
        <div class="tp-currency-row">
          <label class="tp-modal-label">מ-
            ${renderCurrencyCombobox('from', codes)}
          </label>
          <button type="button" class="tp-btn-icon tp-currency-swap" data-action="swap-currency" title="החלפת כיוון">${ICO.swap}</button>
          <label class="tp-modal-label">אל
            ${renderCurrencyCombobox('to', codes)}
          </label>
        </div>
      </div>
      ${state.currencyError ? `<div class="tp-modal-error">${esc(state.currencyError)}</div>` : ''}
      <div class="tp-currency-result">
        ${state.currencyLoading
          ? `<span class="tp-currency-loading">טוען שער חליפין...</span>`
          : state.currencyResult != null
            ? `<div class="tp-currency-result-value">${fmtNum(parseFloat(state.currencyAmount) || 0)} ${esc(state.currencyFrom)} = ${fmtCurrencyResult(state.currencyResult)} ${esc(state.currencyTo)}</div>
               <div class="tp-currency-result-rate">1 ${esc(state.currencyFrom)} = ${state.currencyRate != null ? state.currencyRate.toFixed(4) : ''} ${esc(state.currencyTo)}${state.currencyDate ? ' • עדכון: ' + esc(state.currencyDate) : ''}</div>`
            : ''}
      </div>
      <div class="tp-modal-actions">
        <button class="tp-modal-btn-primary" data-action="convert-currency">המרה</button>
        <button class="tp-modal-btn-cancel" data-action="close-currency-converter">סגירה</button>
      </div>
    </div>
  </div>`;
}

function focusMarked() {
  const el = document.querySelector('[data-autofocus]');
  if (!el) return;
  el.focus();
  if (el.setSelectionRange && typeof el.value === 'string') {
    try { el.setSelectionRange(el.value.length, el.value.length); } catch (e) {}
  }
}

function render() {
  const active = document.activeElement;
  const activeId = active && active.id ? active.id : null;
  const selStart = active && 'selectionStart' in active ? active.selectionStart : null;
  const selEnd = active && 'selectionEnd' in active ? active.selectionEnd : null;

  const root = document.getElementById('app');
  root.innerHTML = `
    <div class="tp-root">
      ${renderHeader()}
      ${state.newTripOpen ? renderNewTripModal() : ''}
      ${state.currencyModalOpen ? renderCurrencyModal() : ''}
      <main class="tp-main">
        ${state.activeTab === 'itinerary' ? renderItinerary() : ''}
        ${state.activeTab === 'budget' ? renderBudget() : ''}
        ${state.activeTab === 'todo' ? renderChecklist() : ''}
      </main>
    </div>`;

  if (activeId) {
    const el = document.getElementById(activeId);
    if (el) {
      el.focus();
      if (selStart != null && el.setSelectionRange) {
        try { el.setSelectionRange(selStart, selEnd); } catch (e) {}
      }
    }
  } else {
    focusMarked();
  }
  positionCurrencyDropdown();
  scheduleAutoSave();
}

/* ---- input/select bindings (update state, no DOM surgery needed — render() rebuilds) ---- */
const INPUT_BINDINGS = {
  budgetTotalInput: v => { state.budgetTotal = v; },
  expenseAmount: v => { state.expenseDraft.amount = v; },
  expenseNote: v => { state.expenseDraft.note = v; },
  expenseCategory: v => { state.expenseDraft.category = v; },
  newTodoInput: v => { state.newTodoText = v; },
  draftTime: v => { state.draft.time = v; },
  draftTitle: v => { state.draft.title = v; },
  draftDesc: v => { state.draft.desc = v; },
  draftPrice: v => { state.draft.price = v; },
  draftCategory: v => { state.draft.category = v; },
  editTime: v => { state.editDraft.time = v; },
  editTitle: v => { state.editDraft.title = v; },
  editDesc: v => { state.editDraft.desc = v; },
  editPrice: v => { state.editDraft.price = v; },
  editCategory: v => { state.editDraft.category = v; },
  ntName: v => { state.newTripDraft.name = v; },
  ntStart: v => { state.newTripDraft.start = v; },
  ntDays: v => { state.newTripDraft.days = v; },
  ntBudget: v => { state.newTripDraft.budget = v; },
  tripNameEditInput: v => { state.tripNameDraft = v; },
  tripDateEditInput: v => { state.tripDateDraft = v; },
  currencyAmount: v => { state.currencyAmount = v; }
};
const SUBMIT_ACTIONS = {
  'save-add-item': saveAddItem,
  'save-edit-item': saveEditItem,
  'add-expense': addExpense,
  'add-todo': addTodo,
  'create-trip': createTrip,
  'save-trip-info': saveTripInfo,
  'convert-currency': convertCurrency
};
const SUBMIT_ON_ENTER = {
  draftTime: 'save-add-item', draftTitle: 'save-add-item', draftPrice: 'save-add-item', draftCategory: 'save-add-item',
  editTime: 'save-edit-item', editTitle: 'save-edit-item', editPrice: 'save-edit-item', editCategory: 'save-edit-item',
  expenseAmount: 'add-expense', expenseNote: 'add-expense', expenseCategory: 'add-expense',
  newTodoInput: 'add-todo',
  ntName: 'create-trip', ntStart: 'create-trip', ntDays: 'create-trip', ntBudget: 'create-trip',
  tripNameEditInput: 'save-trip-info', tripDateEditInput: 'save-trip-info',
  currencyAmount: 'convert-currency'
};

function onRootClick(e) {
  if (state.currencyDropdownOpen && !e.target.closest('.tp-currency-select-wrap')) {
    closeCurrencyDropdown();
  }
  const actionEl = e.target.closest('[data-action]');
  if (!actionEl) return;
  const action = actionEl.dataset.action;
  switch (action) {
    case 'set-tab': setTab(actionEl.dataset.tab); break;
    case 'open-new-trip': openNewTrip(); break;
    case 'cancel-new-trip': cancelNewTrip(); break;
    case 'create-trip': createTrip(); break;
    case 'print': window.print(); break;
    case 'set-day': setActiveDay(parseInt(actionEl.dataset.idx, 10)); break;
    case 'open-add-item': openAddItem(); break;
    case 'cancel-add-item': cancelAdd(); break;
    case 'save-add-item': saveAddItem(); break;
    case 'edit-item': startEditItem(actionEl.dataset.id); break;
    case 'delete-item': deleteItem(actionEl.dataset.id); break;
    case 'save-edit-item': saveEditItem(); break;
    case 'cancel-edit-item': cancelEditItem(); break;
    case 'add-expense': addExpense(); break;
    case 'delete-expense': deleteExpense(actionEl.dataset.id); break;
    case 'set-phase': setTodoPhase(actionEl.dataset.phase); break;
    case 'add-todo': addTodo(); break;
    case 'toggle-todo': toggleTodo(actionEl.dataset.list, actionEl.dataset.id); break;
    case 'delete-todo': deleteTodo(actionEl.dataset.list, actionEl.dataset.id); break;
    case 'modal-overlay-close':
      if (e.target === actionEl) {
        if (state.newTripOpen) cancelNewTrip();
        else if (state.currencyModalOpen) closeCurrencyConverter();
      }
      break;
    case 'delete-trip': deleteTrip(actionEl.dataset.id); break;
    case 'edit-trip-info': startEditTripInfo(); break;
    case 'save-trip-info': saveTripInfo(); break;
    case 'cancel-trip-info': cancelEditTripInfo(); break;
    case 'open-currency-converter': openCurrencyConverter(); break;
    case 'close-currency-converter': closeCurrencyConverter(); break;
    case 'convert-currency': convertCurrency(); break;
    case 'swap-currency': swapCurrencies(); break;
    case 'toggle-currency-dropdown': toggleCurrencyDropdown(actionEl.dataset.which); break;
    case 'select-currency': selectCurrency(actionEl.dataset.which, actionEl.dataset.code); break;
  }
}
function onRootInputOrChange(e) {
  const id = e.target.id;
  if (id === 'tripSelect') { switchTrip(e.target.value); return; }
  const bind = INPUT_BINDINGS[id];
  if (bind) { bind(e.target.value); render(); }
}
function onRootKeydown(e) {
  if (e.key === 'Escape') {
    if (state.newTripOpen) cancelNewTrip();
    else if (state.currencyDropdownOpen) closeCurrencyDropdown();
    else if (state.currencyModalOpen) closeCurrencyConverter();
    else if (state.addingItem) cancelAdd();
    else if (state.editingItemId) cancelEditItem();
    else if (state.editingTripInfo) cancelEditTripInfo();
    return;
  }
  if (e.key !== 'Enter') return;
  if (e.target.tagName === 'TEXTAREA') return;
  const action = SUBMIT_ON_ENTER[e.target.id];
  if (action) { e.preventDefault(); SUBMIT_ACTIONS[action](); }
}

function init() {
  loadStore();
  render();
  startTick();
  const root = document.getElementById('app');
  root.addEventListener('click', onRootClick);
  root.addEventListener('input', onRootInputOrChange);
  root.addEventListener('change', onRootInputOrChange);
  root.addEventListener('keydown', onRootKeydown);
  window.addEventListener('beforeunload', flushAutoSave);
  /* keeps the currency dropdown aligned with its button while the iOS keyboard
     closes or the address bar shows/hides — both resize the viewport after the dropdown
     was already positioned once in render(). */
  if (window.visualViewport) {
    window.visualViewport.addEventListener('resize', positionCurrencyDropdown);
    window.visualViewport.addEventListener('scroll', positionCurrencyDropdown);
  }
}
document.addEventListener('DOMContentLoaded', init);
