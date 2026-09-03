
(() => {
  const $ = (sel, root=document) => root.querySelector(sel);
  const $$ = (sel, root=document) => [...root.querySelectorAll(sel)];
  const screenImg = $('#interactiveScreen');
  const hotspotLayer = $('#hotspotLayer');
  const selector = $('#screenSelector');
  const screenTitle = $('#screenTitle');
  const screenCaption = $('#screenCaption');
  const register = $('#objectRegister');
  const objectCount = $('#objectCount');
  const toggleHotspots = $('#toggleHotspots');
  const resetExplorer = $('#resetExplorer');
  if (!screenImg || !hotspotLayer || !selector) return;

  const screens = {
    main: {
      title:'Головний екран', image:'./assets/img/main.webp',
      caption:'Основна сторінка контролю тиску, станів насосів, діагностики та активної уставки.',
      objects:[
        {id:'status', code:'M-01', type:'view', x:11.5,y:20.5,w:49,h:10, title:'Верхня статусна панель', summary:'Ідентифікація користувача, службовий стан автоматики, загальний режим та час HMI.', purpose:'Швидко підтверджує контекст роботи системи та активний автоматичний режим.', operator:'Перевірити «РЕЖИМ АВТО», активного користувача та актуальність дати/часу.', access:'Перегляд — усі користувачі.', related:'2. Головний екран', href:'#main-screen'},
        {id:'pressure', code:'M-02', type:'view', x:11.5,y:30.3,w:51,h:24.5, title:'Фактичний тиск у системі (PV)', summary:'Поточне значення датчика тиску та візуальна шкала.', purpose:'Основний технологічний параметр для оцінки роботи насосної групи.', operator:'Порівнювати PV з активною уставкою SP та оцінювати напрямок зміни.', access:'Перегляд — усі користувачі.', related:'4. Параметри тиску', href:'#pressure'},
        {id:'diag', code:'M-03', type:'alarm', x:63.8,y:30.2,w:27,w2:0,h:16.5, title:'Діагностичні сигнали', summary:'Живлення, сухий хід та зв’язок із перетворювачем частоти.', purpose:'Швидке визначення блокуючих або аварійних причин.', operator:'У штатному стані сигнали не повинні вказувати проблему. При відхиленні перейти до журналу/аварій.', access:'Перегляд — усі користувачі.', related:'11. Первинна діагностика', href:'#diagnostics', warning:'Не форсувати запуск, якщо активний сухий хід або аварійний сигнал.'},
        {id:'setpoint', code:'M-04', type:'param', x:60.8,y:47.3,w:30,h:8.2, title:'Активна уставка / тижневий графік', summary:'Поточне завдання тиску, яке фактично використовує автоматика.', purpose:'Показує SP та активну часову зону профілю, якщо графік увімкнений.', operator:'Порівнювати фактичний тиск саме з цим значенням.', access:'Перегляд — усі; зміна базової уставки — відповідно до прав.', related:'4. Параметри тиску', href:'#pressure'},
        {id:'pump1', code:'M-05', type:'view', x:11.6,y:56.3,w:26,h:31, title:'Картка насоса №1', summary:'Стан, режим, мотогодини конкретного насоса.', purpose:'Визначає доступність насоса та спосіб його керування.', operator:'Спочатку прочитати текст стану, потім режим. Не оцінювати лише за кольором.', access:'Перегляд — усі користувачі.', related:'3. Стани насосів', href:'#pumps'},
        {id:'pump2', code:'M-06', type:'view', x:38.1,y:56.3,w:25.9,h:31, title:'Картка насоса №2 / ПЧ', summary:'Стан насоса та, під час роботи від ПЧ, фактичний струм I і частота f.', purpose:'Контроль насоса, який працює через перетворювач частоти.', operator:'Контролювати режим ПЧ-АВТО, струм та частоту разом із тиском.', access:'Перегляд — усі користувачі.', related:'3. Стани насосів', href:'#pumps'},
        {id:'pump3', code:'M-07', type:'view', x:64.2,y:56.3,w:27,h:31, title:'Картка насоса №3', summary:'Стан і режим третього насоса.', purpose:'Контроль участі насоса у каскаді або резерві.', operator:'Перевірити, чи стан відповідає фактичній роботі та потребі системи.', access:'Перегляд — усі користувачі.', related:'3. Стани насосів', href:'#pumps'},
        {id:'nav-schedule', code:'M-N1', type:'nav', x:28.3,y:89.2,w:20,h:9, title:'Перехід «ГРАФІК РОБОТИ»', summary:'Навігаційна кнопка переходу до тижневого профілю тиску.', purpose:'Відкриває екран контролю/редагування тижневого розкладу.', operator:'Натиснути для перевірки дня, активної зони та уставки.', access:'Перегляд — усі; редагування — за рівнем доступу.', related:'5. Тижневий графік', href:'#schedule', goto:'schedule'},
        {id:'nav-journal', code:'M-N2', type:'nav', x:48.5,y:89.2,w:19.5,h:9, title:'Перехід «ЖУРНАЛ»', summary:'Навігаційна кнопка журналу подій та аварій.', purpose:'Відкриває хронологію подій і вкладку активних аварій.', operator:'Використовувати при нештатній зупинці, зміні режиму або аварії.', access:'Перегляд — усі користувачі.', related:'7. Журнал подій', href:'#events', goto:'journal'},
        {id:'nav-settings', code:'M-N3', type:'nav', x:68.4,y:89.2,w:22.6,h:9, title:'Перехід «НАЛАШТУВАННЯ»', summary:'Навігаційна кнопка параметрів системи.', purpose:'Відкриває сторінки робочих і сервісних параметрів.', operator:'Оператор змінює тільки дозволені робочі параметри. Сервісні значення не коригувати.', access:'Залежить від групи параметрів і авторизації.', related:'4. Параметри тиску', href:'#pressure', goto:'settings', warning:'Наявність поля на екрані не означає дозвіл на його редагування.'}
      ]
    },
    settings: {
      title:'Налаштування — основні параметри', image:'./assets/img/settings.webp',
      caption:'Робочі параметри тиску, параметри ПЧ та навігація по групах налаштувань.',
      objects:[
        {id:'base-sp', code:'S-01', type:'param', x:1.2,y:20.5,w:32.5,h:8.5, title:'Базова уставка', summary:'Робоче значення тиску для звичайного режиму.', purpose:'Формує базове завдання тиску, коли тижневий графік не керує активною уставкою.', operator:'Перед зміною перевірити, чи тижневий графік не є активним джерелом SP.', access:'ОПЕРАТОР+ — відповідно до авторизації.', related:'4. Параметри тиску', href:'#pressure'},
        {id:'hyst', code:'S-02', type:'param', x:1.2,y:29.2,w:32.5,h:8.5, title:'Гістерезис', summary:'Допустима зона відхилення навколо активної уставки.', purpose:'Зменшує зайві перемикання при малих коливаннях тиску.', operator:'Не використовувати для компенсації явної несправності або нестабільного датчика.', access:'ОПЕРАТОР+ — відповідно до авторизації.', related:'4. Параметри тиску', href:'#pressure'},
        {id:'active-sp', code:'S-03', type:'view', x:1.2,y:46.9,w:32.5,h:8.5, title:'Активна уставка', summary:'Значення SP, яке PLC реально використовує у поточний момент.', purpose:'Контроль фактичного завдання регулятора.', operator:'Саме з цим значенням порівнювати фактичний тиск PV.', access:'Перегляд — усі користувачі.', related:'4. Параметри тиску', href:'#pressure'},
        {id:'pv', code:'S-04', type:'view', x:1.2,y:56.0,w:32.5,h:8.2, title:'Поточний тиск', summary:'Поточний сигнал датчика тиску.', purpose:'Контроль реакції гідросистеми.', operator:'Оцінювати достовірність значення та його реакцію на роботу насосів.', access:'Перегляд — усі користувачі.', related:'4. Параметри тиску', href:'#pressure'},
        {id:'start-f', code:'S-05', type:'param', x:35.5,y:20.5,w:33.5,h:8.5, title:'Стартова частота ПЧ', summary:'Сервісний параметр частотного перетворювача.', purpose:'Визначає початковий частотний рівень у відповідній логіці керування.', operator:'Для щоденної експлуатації не змінювати.', access:'СЕРВІС.', related:'Межі дій оператора', href:'#stop', warning:'Сервісний параметр. Оператор не коригує його для «покращення» роботи системи.'},
        {id:'unload-f', code:'S-06', type:'param', x:35.5,y:38.8,w:33.5,h:10, title:'Частота розвантаження', summary:'Пороговий параметр автоматичного зменшення каскаду.', purpose:'Використовується автоматикою під час оцінки потреби у відключенні додаткового насоса.', operator:'Спостерігати за результатом роботи, параметр не змінювати.', access:'СЕРВІС.', related:'9. Автоматичні режими', href:'#auto'},
        {id:'actual-f', code:'S-07', type:'view', x:35.5,y:61.7,w:33.5,h:9, title:'Фактична частота', summary:'Поточна вихідна частота ПЧ.', purpose:'Показує регулювальний вплив на насос.', operator:'Порівнювати з тиском і станом насоса ПЧ-АВТО.', access:'Перегляд — усі користувачі.', related:'6. Тренди', href:'#trends'},
        {id:'group-main', code:'S-N1', type:'nav', x:70.5,y:12.5,w:28.8,h:12, title:'Група «ОСНОВНІ»', summary:'Поточна група базових параметрів.', purpose:'Об’єднує робочі параметри тиску та базові параметри ПЧ.', operator:'Використовувати для перегляду дозволених робочих значень.', access:'Перегляд — ширше; редагування — за рівнем.', related:'4. Параметри тиску', href:'#pressure'},
        {id:'group-delay', code:'S-N2', type:'nav', x:70.5,y:25.0,w:28.8,h:12, title:'Група «ЗАТРИМКИ»', summary:'Часові затримки автоматичних переходів.', purpose:'Сервісна конфігурація послідовностей автоматики.', operator:'У щоденній роботі не змінювати.', access:'СЕРВІС для редагування.', related:'12. Межі дій оператора', href:'#stop'},
        {id:'group-vfd', code:'S-N3', type:'nav', x:70.5,y:38.0,w:28.8,h:12, title:'Група «ДВИГУН / ПЧ»', summary:'Параметри двигуна та поточні дані ПЧ.', purpose:'Контроль електропривода та сервісне налаштування.', operator:'Для оператора — лише контроль доступних поточних значень.', access:'СЕРВІС для редагування.', related:'6. Тренди', href:'#trends'},
        {id:'group-pid', code:'S-N4', type:'nav', x:70.5,y:51.0,w:28.8,h:12, title:'Група «PID РЕГУЛЮВАННЯ»', summary:'Параметри регулятора тиску.', purpose:'Сервісне налагодження динаміки регулювання.', operator:'Не змінювати PID за одиничним спостереженням або графіком.', access:'СЕРВІС.', related:'12. Межі дій оператора', href:'#stop', warning:'Зміна PID оператором не є штатною дією.'},
        {id:'group-service', code:'S-N5', type:'nav', x:70.5,y:64.0,w:28.8,h:12, title:'Група «СЕРВІС»', summary:'Діагностика, калібрування та сервісні команди.', purpose:'ПНР і технічне обслуговування.', operator:'Оператор не використовує сервісні команди без відповідного регламенту.', access:'СЕРВІС.', related:'12. Межі дій оператора', href:'#stop', warning:'Сервісна зона. Не змінювати параметри без технічного завдання.'},
        {id:'nav-main', code:'S-N6', type:'nav', x:.5,y:84.2,w:22,h:12, title:'Перехід «ГОЛОВНА»', summary:'Повернення на основний екран контролю.', purpose:'Швидке повернення до загального стану насосної групи.', operator:'Використовувати як базову точку навігації.', access:'Усі користувачі.', related:'2. Головний екран', href:'#main-screen', goto:'main'},
        {id:'nav-journal', code:'S-N7', type:'nav', x:47.4,y:84.2,w:23,h:12, title:'Перехід «ЖУРНАЛ»', summary:'Перехід до журналу подій.', purpose:'Аналіз хронології та аварій.', operator:'Відкрити при нештатній поведінці.', access:'Усі користувачі.', related:'7. Журнал подій', href:'#events', goto:'journal'}
      ]
    },
    schedule: {
      title:'Графік роботи — тижневий профіль', image:'./assets/img/schedule.webp',
      caption:'Контроль добового профілю T1–T4, активної зони, уставки та стану графіка.',
      objects:[
        {id:'days', code:'G-01', type:'param', x:1.4,y:15.8,w:36.2,h:7.8, title:'Вибір дня тижня', summary:'ПН–НД: вибір добового профілю для перегляду або редагування.', purpose:'Кожен день має власні часи переходів і уставки зон.', operator:'Перевірити, що відкритий потрібний день. Оператор не редагує профіль без відповідних прав.', access:'Перегляд — оператор; редагування — ТЕХНОЛОГ/СЕРВІС.', related:'5. Тижневий графік', href:'#schedule'},
        {id:'zones', code:'G-02', type:'param', x:1.0,y:31.7,w:36.7,h:54.2, title:'Зони T1–T4 та уставки', summary:'Час початку зон T2–T4 і значення тиску для T1–T4.', purpose:'Формує добовий профіль автоматичної зміни SP.', operator:'Для контролю звірити часи і значення з технологічним завданням.', access:'Перегляд — оператор; редагування — ТЕХНОЛОГ/СЕРВІС.', related:'5. Тижневий графік', href:'#schedule'},
        {id:'tabs', code:'G-03', type:'nav', x:41.5,y:12.3,w:44.5,h:10, title:'Вкладки графічного представлення', summary:'«ДОБОВИЙ ГРАФІК» та «ГРАФІК ТИСКУ».', purpose:'Перемикання між заданим профілем і трендом фактичної поведінки.', operator:'Для фактичного аналізу вибрати «ГРАФІК ТИСКУ».', access:'Усі користувачі.', related:'6. Тренди', href:'#trends', goto:'trends'},
        {id:'current', code:'G-04', type:'view', x:39.0,y:62.0,w:26.5,h:23.0, title:'Поточний розклад', summary:'Поточний день, активна зона та уставка.', purpose:'Показує, який елемент тижневого профілю реально діє зараз.', operator:'Звірити день, активну зону та SP із поточним часом.', access:'Перегляд — усі користувачі.', related:'5. Тижневий графік', href:'#schedule'},
        {id:'control', code:'G-05', type:'view', x:66.5,y:62.0,w:32.5,h:23.0, title:'Стан керування розкладом', summary:'Увімкнення/вимкнення графіка та індикатор «ПРОФІЛЬ КОРЕКТНИЙ».', purpose:'Підтверджує, чи графік керує уставкою і чи профіль пройшов перевірку.', operator:'Якщо графік вимкнений — робоче завдання визначається базовою уставкою.', access:'Перегляд — оператор; зміна — за рівнем.', related:'5. Тижневий графік', href:'#schedule'},
        {id:'nav-main', code:'G-N1', type:'nav', x:.6,y:87.2,w:21.5,h:11, title:'Перехід «ГОЛОВНА»', summary:'Повернення на основний екран.', purpose:'Контроль активної уставки та фактичного тиску після перевірки графіка.', operator:'Повернутися і звірити SP/PV.', access:'Усі користувачі.', related:'2. Головний екран', href:'#main-screen', goto:'main'},
        {id:'nav-journal', code:'G-N2', type:'nav', x:47.5,y:87.2,w:22.5,h:11, title:'Перехід «ЖУРНАЛ»', summary:'Перехід до хронології подій.', purpose:'Перевірка фактичного переходу між зонами за часом.', operator:'Порівняти час зміни активної зони з журналом.', access:'Усі користувачі.', related:'7. Журнал подій', href:'#events', goto:'journal'}
      ]
    },
    trends: {
      title:'Графік тиску — тренд', image:'./assets/img/trendtabs.webp',
      caption:'Графічне представлення зміни уставки, фактичного тиску, частоти та струму в часі.',
      objects:[
        {id:'trend-tabs', code:'T-01', type:'nav', x:8.5,y:4.0,w:40,h:13, title:'Вкладки «ДОБОВИЙ ГРАФІК / ГРАФІК ТИСКУ»', summary:'Перемикання між профілем і фактичним трендом.', purpose:'Вибір режиму аналізу.', operator:'Для оцінки поведінки системи використовувати «ГРАФІК ТИСКУ».', access:'Усі користувачі.', related:'6. Тренди', href:'#trends'},
        {id:'plot', code:'T-02', type:'view', x:8.0,y:17.5,w:82,h:71.0, title:'Область тренду', summary:'Графічна зміна технологічних параметрів у часі.', purpose:'Порівняння PV, SP, частоти ПЧ та струму під час технологічних переходів.', operator:'Шукати момент зміни, оцінювати напрямок PV та зіставляти з журналом.', access:'Перегляд — усі користувачі.', related:'6. Тренди', href:'#trends'},
        {id:'legend', code:'T-03', type:'view', x:71.5,y:18.5,w:18,h:24, title:'Легенда каналів', summary:'Назви каналів, що відображаються на тренді.', purpose:'Ідентифікація уставки, тиску, частоти та струму.', operator:'Орієнтуватися на назву каналу, а не лише на колір кривої.', access:'Усі користувачі.', related:'6. Тренди', href:'#trends'},
        {id:'time', code:'T-04', type:'view', x:10,y:82,w:80,h:10, title:'Шкала часу', summary:'Часова прив’язка графічної зміни.', purpose:'Синхронізація тренду з журналом подій.', operator:'Зафіксувати точний або приблизний час події для порівняння.', access:'Усі користувачі.', related:'7. Журнал подій', href:'#events'}
      ]
    },
    journal: {
      title:'Журнал подій', image:'./assets/img/journal.webp',
      caption:'Хронологічний журнал технологічних переходів. Для аналізу читають послідовність записів.',
      objects:[
        {id:'history-tab', code:'J-01', type:'nav', x:.8,y:12.5,w:50,h:9, title:'Вкладка «ІСТОРІЯ ПОДІЙ»', summary:'Хронологія запусків, зупинок, каскаду, режиму сну та інших подій.', purpose:'Відновлення послідовності роботи системи.', operator:'Знайти записи безпосередньо до і після потрібного моменту.', access:'Усі користувачі.', related:'7. Журнал подій', href:'#events'},
        {id:'alarm-tab', code:'J-02', type:'nav', x:52,y:12.5,w:47,h:9, title:'Вкладка «АВАРІЇ»', summary:'Перехід до активних аварій та попереджень.', purpose:'Перевірка поточної аварійної причини.', operator:'Відкрити, якщо в історії є аварійна подія або система має нештатний стан.', access:'Усі користувачі.', related:'8. Аварії та попередження', href:'#alarms', goto:'alarms'},
        {id:'table', code:'J-03', type:'view', x:1.6,y:22,w:96.5,h:55, title:'Таблиця подій', summary:'Дата, час, стан і текст події.', purpose:'Основне джерело хронології технологічних переходів.', operator:'Читайте декілька сусідніх записів, а не лише останній рядок.', access:'Усі користувачі.', related:'7. Журнал подій', href:'#events'},
        {id:'nav-main', code:'J-N1', type:'nav', x:1.2,y:85.2,w:21.5,h:11.5, title:'Перехід «ГОЛОВНА»', summary:'Повернення до фактичного стану системи.', purpose:'Після аналізу журналу перевірити поточні PV/SP і стани насосів.', operator:'Повернутися на головний екран.', access:'Усі користувачі.', related:'2. Головний екран', href:'#main-screen', goto:'main'},
        {id:'nav-schedule', code:'J-N2', type:'nav', x:23.5,y:85.2,w:24.3,h:11.5, title:'Перехід «ГРАФІК РОБОТИ»', summary:'Перехід до тижневого графіка.', purpose:'Звірка активної зони та технологічного профілю.', operator:'Використовувати, якщо подія пов’язана зі зміною SP за графіком.', access:'Усі користувачі.', related:'5. Тижневий графік', href:'#schedule', goto:'schedule'},
        {id:'nav-settings', code:'J-N3', type:'nav', x:72.2,y:85.2,w:26.3,h:11.5, title:'Перехід «НАЛАШТУВАННЯ»', summary:'Перехід до параметрів системи.', purpose:'Контроль дозволених параметрів після встановлення причини.', operator:'Не змінювати сервісні параметри для компенсації аварії.', access:'Залежить від авторизації.', related:'12. Межі дій оператора', href:'#stop', goto:'settings'}
      ]
    },
    alarms: {
      title:'Аварії та попередження', image:'./assets/img/alarms.webp',
      caption:'Поточні активні аварії та попереджувальні сигнали. Скидання виконують тільки після усунення причини.',
      objects:[
        {id:'history-tab', code:'A-01', type:'nav', x:.7,y:12.8,w:48.7,h:8.5, title:'Вкладка «ІСТОРІЯ ПОДІЙ»', summary:'Повернення до хронології.', purpose:'Визначення послідовності подій, що передувала аварії.', operator:'Перед скиданням перевірити, що сталося перед появою активної аварії.', access:'Усі користувачі.', related:'7. Журнал подій', href:'#events', goto:'journal'},
        {id:'active', code:'A-02', type:'alarm', x:1.4,y:30.5,w:48.2,h:49, title:'Активні аварії', summary:'Поточні блокуючі аварійні стани.', purpose:'Точна ідентифікація причини, яку система вважає активною.', operator:'Прочитати повний текст, усунути фізичну причину, лише потім виконувати штатне скидання.', access:'Перегляд — усі; скидання — за дозволеним рівнем.', related:'8. Аварії та попередження', href:'#alarms', warning:'Не виконувати багаторазове скидання, якщо аварія повторюється.'},
        {id:'warnings', code:'A-03', type:'alarm', x:50.5,y:30.5,w:48.1,h:49, title:'Попередження', summary:'Попереджувальні сигнали, що потребують уваги.', purpose:'Раннє інформування про умови, які можуть впливати на роботу.', operator:'Не ігнорувати; визначити, який саме сигнал присутній і чи потрібна дія.', access:'Усі користувачі.', related:'8. Аварії та попередження', href:'#alarms'},
        {id:'nav-main', code:'A-N1', type:'nav', x:.8,y:84.2,w:21.2,h:12, title:'Перехід «ГОЛОВНА»', summary:'Повернення до поточного стану системи.', purpose:'Контроль результату після усунення причини/скидання.', operator:'Перевірити, чи відновилися штатні стани.', access:'Усі користувачі.', related:'2. Головний екран', href:'#main-screen', goto:'main'},
        {id:'nav-journal', code:'A-N2', type:'nav', x:46.8,y:84.2,w:23.4,h:12, title:'Перехід «ЖУРНАЛ»', summary:'Повернення до журналу подій.', purpose:'Контроль хронології аварії та відновлення.', operator:'Порівняти час появи і відновлення.', access:'Усі користувачі.', related:'7. Журнал подій', href:'#events', goto:'journal'},
        {id:'nav-settings', code:'A-N3', type:'nav', x:70.6,y:84.2,w:28.4,h:12, title:'Перехід «НАЛАШТУВАННЯ»', summary:'Перехід до параметрів системи.', purpose:'Технічна перевірка параметрів після встановлення причини.', operator:'Не змінювати сервісні параметри як спосіб обходу аварії.', access:'Залежить від рівня авторизації.', related:'12. Межі дій оператора', href:'#stop', goto:'settings'}
      ]
    }
  };

  let currentScreen = 'main';
  let selectedId = null;

  const classLabel = {view:'КОНТРОЛЬНИЙ ОБ’ЄКТ', nav:'НАВІГАЦІЯ', param:'ПАРАМЕТР / УСТАВКА', alarm:'АВАРІЙНИЙ / ЗАХИСНИЙ ОБ’ЄКТ'};

  function updateInspector(obj){
    $('#objectCode').textContent = obj?.code || 'HMI-00';
    $('#objectClass').textContent = obj ? (classLabel[obj.type] || 'ОБ’ЄКТ ІНТЕРФЕЙСУ') : 'ОБ’ЄКТ ІНТЕРФЕЙСУ';
    $('#objectTitle').textContent = obj?.title || 'Оберіть об’єкт на екрані';
    $('#objectSummary').textContent = obj?.summary || 'Натисніть на будь-яку виділену область HMI, щоб отримати технічний опис та дії оператора.';
    $('#objectPurpose').textContent = obj?.purpose || '—';
    $('#objectOperator').textContent = obj?.operator || '—';
    $('#objectAccess').textContent = obj?.access || '—';
    $('#objectRelated').textContent = obj?.related || '—';
    const warning = $('#objectWarning');
    warning.hidden = !obj?.warning;
    warning.textContent = obj?.warning || '';
    const link = $('#relatedLink');
    link.href = obj?.href || '#main-screen';
    link.style.visibility = obj ? 'visible' : 'hidden';
  }

  function selectObject(id, opts={}){
    const screen = screens[currentScreen];
    const obj = screen.objects.find(o=>o.id===id);
    if(!obj) return;
    selectedId=id;
    $$('.hmi-hotspot', hotspotLayer).forEach(b=>b.classList.toggle('active', b.dataset.id===id));
    $$('button', register).forEach(b=>b.classList.toggle('active', b.dataset.id===id));
    updateInspector(obj);
    if(opts.navigate && obj.goto) setScreen(obj.goto);
  }

  function renderObjects(){
    const screen = screens[currentScreen];
    hotspotLayer.innerHTML=''; register.innerHTML=''; selectedId=null;
    screen.objects.forEach((obj,i)=>{
      const b=document.createElement('button');
      b.type='button'; b.className=`hmi-hotspot type-${obj.type}`; b.dataset.id=obj.id; b.dataset.index=String(i+1).padStart(2,'0');
      b.setAttribute('aria-label', `${i+1}. ${obj.title}`);
      Object.assign(b.style,{left:`${obj.x}%`,top:`${obj.y}%`,width:`${obj.w}%`,height:`${obj.h}%`});
      b.addEventListener('click',()=>selectObject(obj.id,{navigate:Boolean(obj.goto)}));
      hotspotLayer.appendChild(b);

      const r=document.createElement('button'); r.type='button'; r.dataset.id=obj.id;
      r.innerHTML=`<em>${String(i+1).padStart(2,'0')}</em><b>${obj.title}</b><span>${classLabel[obj.type]||''}</span>`;
      r.addEventListener('click',()=>selectObject(obj.id)); register.appendChild(r);
    });
    objectCount.textContent = `${screen.objects.length} об’єктів`;
    updateInspector(null);
  }

  function setScreen(key){
    if(!screens[key]) return;
    currentScreen=key;
    const screen=screens[key];
    screenImg.src=screen.image; screenImg.alt=screen.title;
    screenTitle.textContent=screen.title; screenCaption.textContent=screen.caption;
    $$('.screen-tab', selector).forEach(btn=>{
      const active=btn.dataset.screen===key; btn.classList.toggle('active',active); btn.setAttribute('aria-selected', active?'true':'false');
    });
    renderObjects();
  }

  selector.addEventListener('click',e=>{const b=e.target.closest('[data-screen]'); if(b) setScreen(b.dataset.screen);});
  toggleHotspots.addEventListener('click',()=>{
    const hidden=hotspotLayer.classList.toggle('hidden-hotspots');
    toggleHotspots.textContent=hidden?'Показати позначення':'Сховати позначення';
    toggleHotspots.classList.toggle('is-muted', hidden);
  });
  resetExplorer.addEventListener('click',()=>{hotspotLayer.classList.remove('hidden-hotspots');toggleHotspots.textContent='Сховати позначення';toggleHotspots.classList.remove('is-muted');setScreen('main');});

  // Keyboard navigation across hotspot buttons
  hotspotLayer.addEventListener('keydown',e=>{
    if(!['ArrowRight','ArrowLeft','ArrowUp','ArrowDown'].includes(e.key)) return;
    const items=$$('.hmi-hotspot',hotspotLayer); const idx=items.indexOf(document.activeElement); if(idx<0) return;
    e.preventDefault(); const step=(e.key==='ArrowRight'||e.key==='ArrowDown')?1:-1; items[(idx+step+items.length)%items.length].focus();
  });

  setScreen('main');
})();
