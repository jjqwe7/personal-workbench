/**
 * ========================================
 * 个人工作台 PWA - 完整应用
 * ========================================
 * 模块： DataManager | Router | UI组件 | LinkageManager | PurchaseAdvisor | 全功能页面
 */

// ============================================
// 1. 数据管理器 DataManager
// ============================================
const DataManager = (() => {
  const STORAGE_KEY = 'workbench_data_v2';

  // 兼容旧版 WebView（vivo/低版本安卓）的深拷贝
  function deepClone(obj) {
    if (typeof structuredClone === 'function') {
      try { return structuredClone(obj); } catch(e) {}
    }
    return JSON.parse(JSON.stringify(obj));
  }

  const defaultData = {
    profile: {
      nickname: '',
      birthday: '',
      gender: '',
      height: '',
      weight: '',
      constitution: '平和质',
      allergies: [],
      createdAt: null,
      onboarded: false
    },

    dailyPlans: [],
    weeklyPlans: [],
    monthlyPlans: [],
    yearlyPlans: [],

    // 总结复盘
    dailyReviews: [],
    weeklyReviews: [],
    monthlyReviews: [],
    yearlyReviews: [],

    skincareRecords: [],
    skincareProducts: [],   // 产品库
    skincareRoutine: {      // 早晚护肤流程
      morning: [],
      evening: []
    },

    dietRecords: [],
    dietRecipes: [],        // 食谱库

    exerciseRecords: [],
    exercisePlan: {         // A/B训练计划
      planA: [],
      planB: [],
      currentPlan: 'A'
    },

    financeRecords: [],
    huabeiRecords: [],      // 花呗账单
    huabeiSettings: {
      totalQuota: 5000,
      billingDay: 1,        // 账单日
      repaymentDay: 10      // 还款日
    },

    purchaseRequests: [],   // 购买顾问记录

    studyRecords: [],
    studyWeekPlan: {        // 7周科研计划
      startDate: null,
      weeks: []
    },
    literatureRecords: [],  // 文献阅读记录

    milestoneProgress: [],
    fiveYearPlan: [],       // 五年计划
    riskPlans: [],          // 风险预案

    settings: {
      dailyBudget: 100,
      dailyCalorieTarget: 2000,
      dailyWaterTarget: 8,
      weeklyExerciseGoal: 5,
      studyHourGoal: 4,
      notificationsEnabled: true,
      themeMode: 'light'
    }
  };

  let _data = null;

  function init() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        _data = JSON.parse(stored);
        _data = deepMerge(deepClone(defaultData), _data);
      } else {
        // 尝试迁移旧数据
        const oldData = localStorage.getItem('workbench_data');
        if (oldData) {
          _data = deepMerge(deepClone(defaultData), JSON.parse(oldData));
        } else {
          _data = deepClone(defaultData);
          _data.profile.createdAt = new Date().toISOString();
        }
      }
      save();
    } catch (e) {
      console.error('[DataManager] 初始化失败:', e);
      _data = deepClone(defaultData);
    }
  }

  function deepMerge(target, source) {
    for (const key in source) {
      if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
        if (!target[key]) target[key] = {};
        deepMerge(target[key], source[key]);
      } else {
        target[key] = source[key];
      }
    }
    return target;
  }

  function save() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(_data));
    } catch (e) {
      console.error('[DataManager] 保存失败:', e);
      Toast.show('数据保存失败，存储空间可能已满', 'error');
    }
  }

  function get(path) {
    if (!path) return _data;
    return path.split('.').reduce((obj, key) => obj?.[key], _data);
  }

  function set(path, value) {
    const keys = path.split('.');
    let obj = _data;
    for (let i = 0; i < keys.length - 1; i++) {
      if (!obj[keys[i]]) obj[keys[i]] = {};
      obj = obj[keys[i]];
    }
    obj[keys[keys.length - 1]] = value;
    save();
  }

  function addRecord(category, record) {
    if (!_data[category]) _data[category] = [];
    if (!record.id) record.id = Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
    if (!record.createdAt) record.createdAt = new Date().toISOString();
    _data[category].push(record);
    save();
    return record;
  }

  function updateRecord(category, id, updates) {
    const arr = _data[category];
    if (!Array.isArray(arr)) return null;
    const idx = arr.findIndex(item => item.id === id);
    if (idx === -1) return null;
    Object.assign(arr[idx], updates, { updatedAt: new Date().toISOString() });
    save();
    return arr[idx];
  }

  function deleteRecord(category, id) {
    if (!Array.isArray(_data[category])) return false;
    const idx = _data[category].findIndex(item => item.id === id);
    if (idx === -1) return false;
    _data[category].splice(idx, 1);
    save();
    return true;
  }

  function getTodayRecords(category) {
    const today = new Date().toISOString().slice(0, 10);
    return (_data[category] || []).filter(r => r.date === today);
  }

  function getRecordsByDateRange(category, startDate, endDate) {
    return (_data[category] || []).filter(r => r.date >= startDate && r.date <= endDate);
  }

  function getMonthRecords(category, year, month) {
    const prefix = `${year}-${String(month).padStart(2, '0')}`;
    return (_data[category] || []).filter(r => r.date && r.date.startsWith(prefix));
  }

  function exportData() {
    return JSON.stringify(_data, null, 2);
  }

  function importData(jsonStr) {
    try {
      const imported = JSON.parse(jsonStr);
      _data = deepMerge(deepClone(defaultData), imported);
      save();
      return true;
    } catch (e) {
      console.error('[DataManager] 导入失败:', e);
      return false;
    }
  }

  function clear() {
    _data = deepClone(defaultData);
    _data.profile.createdAt = new Date().toISOString();
    save();
  }

  init();

  return {
    get, set, addRecord, updateRecord, deleteRecord,
    getTodayRecords, getRecordsByDateRange, getMonthRecords,
    exportData, importData, clear, save,
    get defaultData() { return deepClone(defaultData); }
  };
})();


// ============================================
// 2. 路由管理器 Router
// ============================================
const Router = (() => {
  const routes = {};
  let currentRoute = null;
  let beforeHooks = [];
  let afterHooks = [];

  function register(path, handler) {
    routes[path] = handler;
  }

  function beforeEach(hook) { beforeHooks.push(hook); }
  function afterEach(hook) { afterHooks.push(hook); }

  function navigate(path) {
    window.location.hash = '#' + path;
  }

  async function handleRouteChange() {
    const hash = window.location.hash.slice(1) || 'home';
    const path = hash.split('?')[0];
    const params = hash.includes('?') ? parseQuery(hash.split('?')[1]) : {};

    for (const hook of beforeHooks) {
      const result = await hook(path, currentRoute, params);
      if (result === false) return;
    }

    const handler = routes[path];
    if (handler) {
      currentRoute = path;
      handler(params);
      updateNavActive(path);
      // 滚动到顶部
      document.getElementById('app-content')?.scrollTo(0, 0);
      window.scrollTo(0, 0);
    } else {
      currentRoute = 'home';
      if (routes['home']) routes['home'](params);
    }

    for (const hook of afterHooks) {
      await hook(path, currentRoute, params);
    }
  }

  function parseQuery(queryStr) {
    const params = {};
    queryStr.split('&').forEach(pair => {
      const [key, val] = pair.split('=');
      if (key) params[decodeURIComponent(key)] = decodeURIComponent(val || '');
    });
    return params;
  }

  function updateNavActive(path) {
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => {
      const route = item.getAttribute('data-route');
      if (route === getMainTab(path)) {
        item.classList.add('active');
      } else {
        item.classList.remove('active');
      }
    });
  }

  function getMainTab(path) {
    const planPrefix = 'plan-';
    const reviewPrefix = 'review-';
    if (path.startsWith(planPrefix) || path.startsWith(reviewPrefix)) return 'strategy';
    if (path.startsWith('purchase') || path.startsWith('huabei')) return 'finance';
    if (path.startsWith('literature') || path.startsWith('study-plan')) return 'study';
    if (path.startsWith('skincare-')) return 'skincare';
    if (path.startsWith('diet-')) return 'diet';
    const tabMap = {
      'home': 'home', 'study': 'study', 'skincare': 'skincare',
      'diet': 'diet', 'exercise': 'exercise', 'finance': 'finance', 'strategy': 'strategy'
    };
    return tabMap[path] || 'home';
  }

  function init() {
    window.addEventListener('hashchange', handleRouteChange);
    handleRouteChange();
  }

  return {
    register, navigate, beforeEach, afterEach, init,
    get currentRoute() { return currentRoute; },
    getMainTab
  };
})();


// ============================================
// 3. 通用UI组件
// ============================================

// --- 3.1 Toast ---
const Toast = (() => {
  let container = null;

  function ensureContainer() {
    if (!container) {
      container = document.createElement('div');
      container.id = 'toast-container';
      container.className = 'toast-container';
      document.body.appendChild(container);
    }
    return container;
  }

  function show(message, type = 'info', duration = 2500) {
    const ct = ensureContainer();
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `<span class="toast-icon">${getIcon(type)}</span><span class="toast-text">${message}</span>`;
    ct.appendChild(toast);
    requestAnimationFrame(() => toast.classList.add('show'));
    setTimeout(() => {
      toast.classList.remove('show');
      toast.addEventListener('transitionend', () => toast.remove());
      setTimeout(() => toast.remove(), 400);
    }, duration);
  }

  function getIcon(type) {
    const icons = { success: '&#10003;', error: '&#10007;', warning: '&#9888;', info: '&#8505;' };
    return icons[type] || icons.info;
  }

  return { show };
})();


// --- 3.2 Modal ---
const Modal = (() => {
  let overlay = null;

  function open(options = {}) {
    const {
      title = '提示', content = '', confirmText = '确认', cancelText = '取消',
      onConfirm = null, onCancel = null, type = 'default',
      hideFooter = false
    } = options;

    close();

    overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    overlay.innerHTML = `
      <div class="modal-box modal-${type}">
        <div class="modal-header">
          <h3 class="modal-title">${title}</h3>
          <button class="modal-close">&times;</button>
        </div>
        <div class="modal-body">${content}</div>
        ${hideFooter ? '' : `
        <div class="modal-footer">
          <button class="btn btn-default modal-cancel">${cancelText}</button>
          <button class="btn modal-confirm ${type === 'danger' ? 'btn-danger' : 'btn-primary'}">${confirmText}</button>
        </div>`}
      </div>
    `;

    document.body.appendChild(overlay);
    requestAnimationFrame(() => overlay.classList.add('show'));

    overlay.querySelector('.modal-close').addEventListener('click', () => close());
    const cancelBtn = overlay.querySelector('.modal-cancel');
    if (cancelBtn) cancelBtn.addEventListener('click', () => { if (onCancel) onCancel(); close(); });
    const confirmBtn = overlay.querySelector('.modal-confirm');
    if (confirmBtn) confirmBtn.addEventListener('click', () => {
      const currentOverlay = overlay;
      if (onConfirm) onConfirm();
      // 仅当回调未重新打开新弹窗时才关闭当前弹窗
      if (overlay === currentOverlay) close();
    });
    overlay.addEventListener('click', (e) => { if (e.target === overlay) close(); });
  }

  function openForm(options = {}) {
    const { title = '填写信息', fields = [], onConfirm = null, confirmText = '保存' } = options;

    let formHtml = '<form class="modal-form" id="modal-form-inner">';
    fields.forEach(f => {
      const req = f.required ? 'required' : '';
      const labelStar = f.required ? ' <span class="required">*</span>' : '';
      if (f.type === 'select') {
        formHtml += `
          <div class="form-group">
            <label class="form-label">${f.label}${labelStar}</label>
            <select name="${f.name}" class="form-control" ${req}>
              <option value="">请选择</option>
              ${(f.options || []).map(opt => {
                const val = typeof opt === 'object' ? opt.value : opt;
                const txt = typeof opt === 'object' ? opt.label : opt;
                return `<option value="${val}" ${f.value == val ? 'selected' : ''}>${txt}</option>`;
              }).join('')}
            </select>
          </div>`;
      } else if (f.type === 'textarea') {
        formHtml += `
          <div class="form-group">
            <label class="form-label">${f.label}${labelStar}</label>
            <textarea name="${f.name}" class="form-control" rows="${f.rows || 3}" placeholder="${f.placeholder || ''}" ${req}>${f.value || ''}</textarea>
          </div>`;
      } else if (f.type === 'checkbox') {
        formHtml += `
          <div class="form-group form-check-group">
            <label class="form-label">${f.label}</label>
            <div class="checkbox-list">
              ${(f.options || []).map(opt => `
                <label class="checkbox-item">
                  <input type="checkbox" name="${f.name}" value="${opt}" ${(f.value || []).includes(opt) ? 'checked' : ''}>
                  <span>${opt}</span>
                </label>
              `).join('')}
            </div>
          </div>`;
      } else {
        formHtml += `
          <div class="form-group">
            <label class="form-label">${f.label}${labelStar}</label>
            <input type="${f.type || 'text'}" name="${f.name}" class="form-control"
              placeholder="${f.placeholder || ''}" value="${f.value || ''}" ${req} ${f.min !== undefined ? `min="${f.min}"` : ''} ${f.max !== undefined ? `max="${f.max}"` : ''} ${f.step ? `step="${f.step}"` : ''}>
          </div>`;
      }
    });
    formHtml += '</form>';

    open({
      title, content: formHtml, confirmText,
      onConfirm: () => {
        const form = overlay?.querySelector('#modal-form-inner');
        if (!form) return;
        const data = {};
        fields.forEach(f => {
          if (f.type === 'checkbox') {
            data[f.name] = Array.from(form.querySelectorAll(`input[name="${f.name}"]:checked`)).map(el => el.value);
          } else {
            const el = form.querySelector(`[name="${f.name}"]`);
            data[f.name] = el ? el.value : '';
          }
        });
        let valid = true;
        fields.forEach(f => {
          if (f.required && !data[f.name]) {
            valid = false;
            Toast.show(`请填写${f.label}`, 'warning');
          }
        });
        if (valid && onConfirm) onConfirm(data);
      }
    });
  }

  function close() {
    if (overlay) {
      overlay.classList.remove('show');
      const ref = overlay;
      overlay = null;
      ref.addEventListener('transitionend', () => ref.remove());
      setTimeout(() => ref.remove(), 300);
    }
  }

  return { open, openForm, close };
})();


// --- 3.3 底部导航栏 ---
const BottomNav = (() => {
  const tabs = [
    { route: 'home',     label: '首页', icon: '&#9750;' },
    { route: 'study',    label: '学习', icon: '&#9998;' },
    { route: 'skincare', label: '护肤', icon: '&#10024;' },
    { route: 'diet',     label: '饮食', icon: '&#9749;' },
    { route: 'finance',  label: '财务', icon: '&#9878;' },
    { route: 'strategy', label: '战略', icon: '&#9733;' }
  ];

  function render() {
    const nav = document.createElement('nav');
    nav.className = 'bottom-nav';
    nav.innerHTML = tabs.map(tab => `
      <div class="nav-item ${tab.route === 'home' ? 'active' : ''}" data-route="${tab.route}">
        <span class="nav-icon">${tab.icon}</span>
        <span class="nav-label">${tab.label}</span>
      </div>
    `).join('');

    nav.querySelectorAll('.nav-item').forEach(item => {
      item.addEventListener('click', () => {
        Router.navigate(item.getAttribute('data-route'));
      });
    });

    return nav;
  }

  return { render, tabs };
})();


// ============================================
// 4. 模块联动管理器 LinkageManager
// ============================================
const LinkageManager = (() => {

  const solarTerms = [
    { name: '小寒', tea: '红枣桂圆茶', desc: '温阳散寒，补气养血', avoid: ['冷饮', '生冷'] },
    { name: '大寒', tea: '姜枣红茶', desc: '温中散寒，暖胃驱寒', avoid: ['冰饮', '寒凉水果'] },
    { name: '立春', tea: '玫瑰花茶', desc: '疏肝理气，活血养颜', avoid: ['油腻', '辛辣'] },
    { name: '雨水', tea: '陈皮茯苓茶', desc: '健脾祛湿，理气化痰', avoid: ['甜腻', '生冷'] },
    { name: '惊蛰', tea: '菊花枸杞茶', desc: '清肝明目，滋阴润肺', avoid: ['辛辣', '油炸'] },
    { name: '春分', tea: '茉莉花茶', desc: '理气开郁，辟秽和中', avoid: ['寒凉', '油腻'] },
    { name: '清明', tea: '明前龙井', desc: '清热提神，生津止渴', avoid: ['辛辣', '羊肉'] },
    { name: '谷雨', tea: '薏米红豆茶', desc: '健脾祛湿，利水消肿', avoid: ['甜食', '生冷'] },
    { name: '立夏', tea: '薄荷绿茶', desc: '清热解暑，提神醒脑', avoid: ['油炸', '热性食物'] },
    { name: '小满', tea: '山楂麦冬茶', desc: '消食化积，养阴生津', avoid: ['油腻', '过咸'] },
    { name: '芒种', tea: '酸梅汤', desc: '生津止渴，消食解暑', avoid: ['辛辣', '热性'] },
    { name: '夏至', tea: '金银花茶', desc: '清热解毒，疏散风热', avoid: ['热性食物', '烈酒'] },
    { name: '小暑', tea: '荷叶冬瓜茶', desc: '清热消暑，利尿消肿', avoid: ['油腻', '烧烤'] },
    { name: '大暑', tea: '莲子芯茶', desc: '清心去热，安神降压', avoid: ['辛辣', '油炸'] },
    { name: '立秋', tea: '百合银耳茶', desc: '滋阴润肺，养胃生津', avoid: ['辛辣', '煎炸'] },
    { name: '处暑', tea: '蜂蜜柚子茶', desc: '润肺止咳，清热化痰', avoid: ['生冷', '油腻'] },
    { name: '白露', tea: '桂花乌龙茶', desc: '温中散寒，暖胃止痛', avoid: ['寒凉', '生冷'] },
    { name: '秋分', tea: '铁观音', desc: '润燥生津，清热利湿', avoid: ['辛辣', '油炸'] },
    { name: '寒露', tea: '当归红枣茶', desc: '补血活血，温经散寒', avoid: ['冷饮', '寒凉'] },
    { name: '霜降', tea: '杜仲核桃茶', desc: '补肾强腰，温阳散寒', avoid: ['寒凉', '生冷'] },
    { name: '立冬', tea: '人参麦冬茶', desc: '补气养阴，润肺清心', avoid: ['冷饮', '寒性食物'] },
    { name: '小雪', tea: '红茶加奶', desc: '温阳驱寒，暖胃护脾', avoid: ['生冷', '寒凉水果'] },
    { name: '大雪', tea: '桂圆红茶', desc: '温补心脾，养血安神', avoid: ['冷饮', '凉性食物'] },
    { name: '冬至', tea: '当归生姜羊肉汤', desc: '温阳补血，祛寒止痛', avoid: ['生冷', '寒凉'] }
  ];

  const constitutions = {
    '平和质': { desc: '阴阳气血调和，体态适中', dietAdvice: '饮食均衡，不偏不倚', recommendFoods: ['五谷杂粮', '蔬菜水果', '瘦肉蛋奶'], avoidFoods: ['过寒过热食物'] },
    '气虚质': { desc: '元气不足，易疲乏', dietAdvice: '补气健脾，温和调理', recommendFoods: ['山药', '黄芪', '大枣', '小米', '鸡肉'], avoidFoods: ['生冷', '萝卜', '空心菜'] },
    '阳虚质': { desc: '阳气不足，畏寒怕冷', dietAdvice: '温补阳气，驱寒暖体', recommendFoods: ['羊肉', '生姜', '桂圆', '核桃', '韭菜'], avoidFoods: ['冷饮', '西瓜', '苦瓜', '螃蟹'] },
    '阴虚质': { desc: '阴液亏少，口燥咽干', dietAdvice: '滋阴降火，润燥养津', recommendFoods: ['银耳', '百合', '鸭肉', '枸杞', '黑芝麻'], avoidFoods: ['辛辣', '煎炸', '羊肉', '韭菜'] },
    '痰湿质': { desc: '痰湿凝聚，体形肥胖', dietAdvice: '健脾化痰，祛湿降脂', recommendFoods: ['薏米', '冬瓜', '荷叶', '山楂', '陈皮'], avoidFoods: ['甜食', '油腻', '酒类', '糯米'] },
    '湿热质': { desc: '湿热内蕴，面垢油腻', dietAdvice: '清热利湿，清淡饮食', recommendFoods: ['绿豆', '苦瓜', '冬瓜', '莲子', '黄瓜'], avoidFoods: ['辛辣', '油腻', '甜食', '酒类'] },
    '血瘀质': { desc: '血行不畅，肤色暗沉', dietAdvice: '活血化瘀，通络养生', recommendFoods: ['山楂', '玫瑰花', '黑木耳', '醋', '红花'], avoidFoods: ['油腻', '高盐', '寒凉'] },
    '气郁质': { desc: '气机郁滞，情绪低落', dietAdvice: '疏肝理气，调畅情志', recommendFoods: ['玫瑰花', '佛手', '柑橘', '荞麦', '绿茶'], avoidFoods: ['咖啡', '浓茶', '辛辣'] },
    '特禀质': { desc: '先天禀赋不足，易过敏', dietAdvice: '益气固表，避免过敏原', recommendFoods: ['黄芪', '大枣', '山药', '南瓜'], avoidFoods: ['海鲜', '花粉类', '辛辣刺激'] }
  };

  const skinDietMap = {
    '出油': { avoid: ['油炸', '高糖', '辛辣'], recommend: ['绿叶蔬菜', '富含维生素B的食物', '绿豆'] },
    '干燥': { avoid: ['辛辣', '咖啡', '酒精'], recommend: ['银耳', '蜂蜜', '坚果', '富含维E的食物'] },
    '敏感': { avoid: ['辛辣', '海鲜', '酒精', '芒果'], recommend: ['山药', '小米', '薏米', '冬瓜'] },
    '暗沉': { avoid: ['油炸', '熬夜零食', '高糖'], recommend: ['番茄', '猕猴桃', '红枣', '玫瑰花茶'] },
    '长痘': { avoid: ['甜食', '奶制品', '油炸', '辛辣'], recommend: ['苦瓜', '绿豆', '芹菜', '薏米'] },
    '过敏': { avoid: ['海鲜', '辛辣', '酒精', '芒果'], recommend: ['山药', '冬瓜', '红豆', '小米粥'] },
    '正常': { avoid: [], recommend: ['均衡饮食', '多蔬果', '充足水分'] }
  };

  const exerciseCalorieMap = {
    '有氧运动': { baseAdjust: 1.2, proteinExtra: 10 },
    '力量训练': { baseAdjust: 1.3, proteinExtra: 20 },
    '瑜伽':     { baseAdjust: 1.1, proteinExtra: 5 },
    '游泳':     { baseAdjust: 1.25, proteinExtra: 15 },
    '跑步':     { baseAdjust: 1.2, proteinExtra: 10 },
    '骑行':     { baseAdjust: 1.2, proteinExtra: 10 },
    '休息日':   { baseAdjust: 1.0, proteinExtra: 0 }
  };

  function getSolarTermRecommend() {
    const now = new Date();
    const dayOfYear = Math.floor((now - new Date(now.getFullYear(), 0, 0)) / 86400000);
    const termIndex = Math.min(Math.floor((dayOfYear - 5) / 15), solarTerms.length - 1);
    const term = solarTerms[Math.max(0, termIndex)];
    return { name: term.name, tea: term.tea, desc: term.desc, avoid: term.avoid };
  }

  function getConstitutionAdvice(constitutionType) {
    return constitutions[constitutionType] || constitutions['平和质'];
  }

  function getFinanceDietRecommendation() {
    const todayExpenses = DataManager.getTodayRecords('financeRecords')
      .filter(r => r.type === 'expense')
      .reduce((sum, r) => sum + (parseFloat(r.amount) || 0), 0);
    const dailyBudget = DataManager.get('settings.dailyBudget') || 100;
    const remaining = Math.max(0, dailyBudget - todayExpenses);
    const utilizationRate = todayExpenses / dailyBudget;

    let recommend = { level: 'good', meals: [], tips: '' };
    if (remaining <= 0) {
      recommend.level = 'warning';
      recommend.tips = '今日预算已用完，建议食用家中现有食材';
      recommend.meals = ['清汤面', '白粥+咸菜', '蛋炒饭'];
    } else if (utilizationRate > 0.7) {
      recommend.level = 'caution';
      recommend.tips = `今日剩余 ¥${remaining.toFixed(0)}，建议节省用餐`;
      recommend.meals = ['便当/食堂', '面条', '家常简餐'];
    } else if (utilizationRate > 0.4) {
      recommend.level = 'normal';
      recommend.tips = `今日剩余 ¥${remaining.toFixed(0)}，正常用餐即可`;
      recommend.meals = ['正常午餐', '均衡晚餐'];
    } else {
      recommend.level = 'good';
      recommend.tips = `今日剩余 ¥${remaining.toFixed(0)}，可以适当犒劳自己`;
      recommend.meals = ['品质午餐', '健康加餐'];
    }
    return recommend;
  }

  function getSkincareDietAdvice(skinCondition) {
    const mapping = skinDietMap[skinCondition] || skinDietMap['正常'];
    return { condition: skinCondition, avoid: mapping.avoid, recommend: mapping.recommend };
  }

  function getExerciseDietAdjustment(exerciseType) {
    const mapping = exerciseCalorieMap[exerciseType] || exerciseCalorieMap['休息日'];
    const baseCalorie = DataManager.get('settings.dailyCalorieTarget') || 2000;
    const adjustedCalories = Math.round(baseCalorie * mapping.baseAdjust);
    return {
      exerciseType, adjustedCalories, baseCalories: baseCalorie, extraProtein: mapping.proteinExtra,
      tips: mapping.baseAdjust > 1
        ? `训练日建议摄入 ${adjustedCalories} 千卡，增加蛋白质 ${mapping.proteinExtra}g`
        : '休息日维持基础热量即可，注意控制碳水'
    };
  }

  function getDailyLinkageReport() {
    const solarTerm = getSolarTermRecommend();
    const constitution = DataManager.get('profile.constitution') || '平和质';
    const constitutionAdvice = getConstitutionAdvice(constitution);
    const financeDiet = getFinanceDietRecommendation();

    const todayExercise = DataManager.getTodayRecords('exerciseRecords');
    const exerciseType = todayExercise.length > 0 ? todayExercise[0].type : '休息日';
    const exerciseDiet = getExerciseDietAdjustment(exerciseType);

    const todaySkincare = DataManager.getTodayRecords('skincareRecords');
    const skinCondition = todaySkincare.length > 0 ? (todaySkincare[0].skinCondition || '正常') : '正常';
    const skincareDiet = getSkincareDietAdvice(skinCondition);

    return {
      solarTerm, constitution: constitutionAdvice, financeDiet, exerciseDiet, skincareDiet,
      summary: `今日节气「${solarTerm.name}」，推荐${solarTerm.tea}。${financeDiet.tips}。` +
        (skinCondition !== '正常' ? `皮肤状态「${skinCondition}」，注意${skincareDiet.avoid.join('、')}。` : '') +
        (exerciseType !== '休息日' ? `${exerciseDiet.tips}。` : '')
    };
  }

  // 获取今日打卡概览
  function getTodayCheckinStatus() {
    const today = new Date().toISOString().slice(0, 10);
    return {
      study: DataManager.getTodayRecords('studyRecords').length > 0,
      skincareMorning: DataManager.getTodayRecords('skincareRecords').some(r => r.period === 'morning'),
      skincareEvening: DataManager.getTodayRecords('skincareRecords').some(r => r.period === 'evening'),
      diet: DataManager.getTodayRecords('dietRecords').length > 0,
      exercise: DataManager.getTodayRecords('exerciseRecords').length > 0,
      water: DataManager.getTodayRecords('dietRecords').reduce((sum, r) => sum + (parseInt(r.waterCups) || 0), 0),
      waterGoal: DataManager.get('settings.dailyWaterTarget') || 8
    };
  }

  return {
    getSolarTermRecommend, getConstitutionAdvice, getFinanceDietRecommendation,
    getSkincareDietAdvice, getExerciseDietAdjustment, getDailyLinkageReport,
    getTodayCheckinStatus,
    get constitutions() { return constitutions; },
    get solarTerms() { return solarTerms; }
  };
})();


// ============================================
// 5. 购买顾问 PurchaseAdvisor
// ============================================
const PurchaseAdvisor = (() => {

  // 决策框架维度
  const dimensions = [
    { key: 'need', label: '需求程度', desc: '是否真正需要，而非想要' },
    { key: 'budget', label: '预算匹配', desc: '购买后是否影响本月基本生活' },
    { key: 'frequency', label: '使用频率', desc: '多久用一次，低频可借/租' },
    { key: 'alternative', label: '替代方案', desc: '是否有更便宜的替代品' },
    { key: 'urgency', label: '紧急程度', desc: '是否必须现在买' },
    { key: 'value', label: '性价比', desc: '价格与品质是否匹配' }
  ];

  /**
   * 分析购买请求，给出建议
   */
  function analyze(request) {
    const { itemName, price, reason, category, urgency, monthlyIncome } = request;
    const monthlyBudget = DataManager.get('settings.dailyBudget') * 30;
    const income = monthlyIncome || monthlyBudget;

    // 今日已支出
    const todayExpense = DataManager.getTodayRecords('financeRecords')
      .filter(r => r.type === 'expense')
      .reduce((s, r) => s + (parseFloat(r.amount) || 0), 0);

    // 本月已支出
    const now = new Date();
    const monthExpenses = DataManager.getMonthRecords('financeRecords', now.getFullYear(), now.getMonth() + 1)
      .filter(r => r.type === 'expense')
      .reduce((s, r) => s + (parseFloat(r.amount) || 0), 0);

    // 花呗待还
    const huabeiPending = (DataManager.get('huabeiRecords') || [])
      .filter(r => !r.paid)
      .reduce((s, r) => s + (parseFloat(r.amount) || 0), 0);

    // 决策评分 (0-100, 越高越不建议买)
    let score = 0;
    const reasons = [];
    const againstReasons = [];  // 不支持买的理由
    const forReasons = [];      // 支持买的理由

    // 1. 预算分析
    const priceRatio = price / income;
    if (priceRatio > 0.3) {
      score += 25;
      againstReasons.push(`商品价格占月收入的 ${(priceRatio * 100).toFixed(0)}%，占比过高`);
    } else if (priceRatio > 0.15) {
      score += 15;
      againstReasons.push(`商品价格占月收入的 ${(priceRatio * 100).toFixed(0)}%，需谨慎考虑`);
    } else {
      score += 5;
      forReasons.push(`价格在可承受范围内（占月收入 ${(priceRatio * 100).toFixed(0)}%）`);
    }

    // 2. 本月已支出
    const monthSpentRatio = monthExpenses / income;
    if (monthSpentRatio > 0.7) {
      score += 20;
      againstReasons.push(`本月已支出 ¥${monthExpenses.toFixed(0)}，占月收入 ${monthSpentRatio * 100}%，预算紧张`);
    } else if (monthSpentRatio > 0.5) {
      score += 10;
      againstReasons.push(`本月已支出 ${monthSpentRatio * 100}%，需注意控制`);
    }

    // 3. 花呗负债
    if (huabeiPending > 0) {
      score += 10;
      againstReasons.push(`花呗待还 ¥${huabeiPending.toFixed(0)}，增加负债将加重还款压力`);
    }

    // 4. 紧急程度
    if (urgency === 'low') {
      score += 15;
      againstReasons.push('紧急程度低，可以延后购买或等待促销');
    } else if (urgency === 'medium') {
      score += 5;
    } else {
      score -= 10;
      forReasons.push('紧急程度高，确实需要尽快解决');
    }

    // 5. 需求分析 - 关键词检测
    const wantKeywords = ['想要', '喜欢', '好看', '新款', '流行', '种草', '冲动', '必须买', '特别想', '超级想', '做梦都想', '馋', '忍不了', '受不了'];
    const needKeywords = ['需要', '必须', '坏了', '没了', '替换', '学习用', '工作用', '消耗品'];
    const reasonLower = (reason || '').toLowerCase();
    let isWant = wantKeywords.some(k => reasonLower.includes(k));
    let isNeed = needKeywords.some(k => reasonLower.includes(k));
    // 检测强烈购买欲望
    const strongDesireKeywords = ['必须买', '特别想', '超级想', '做梦都想', '忍不了', '受不了', '一定要', '非买不可', '太想要了'];
    const hasStrongDesire = strongDesireKeywords.some(k => reasonLower.includes(k));

    if (isWant && !isNeed) {
      score += 15;
      againstReasons.push('购买理由偏向「想要」而非「需要」，建议冷静 48 小时后再决定');
    } else if (isNeed) {
      score -= 5;
      forReasons.push('购买理由属于实际需求');
    }
    if (hasStrongDesire) {
      score += 10;
      againstReasons.push('检测到强烈的购买冲动，情绪化决策风险高，强烈建议冷静至少 72 小时');
    }

    // 6. 价格阈值
    if (price > 500) {
      score += 5;
      againstReasons.push(`价格超过 ¥500，属于较大支出，建议三思`);
    }
    if (price > 2000) {
      score += 10;
      againstReasons.push(`价格超过 ¥2000，属于高额消费，建议分摊到多月预算评估`);
    }

    // 7. 今日预算影响
    const dailyBudget = DataManager.get('settings.dailyBudget') || 100;
    if (price > dailyBudget * 3) {
      score += 5;
      againstReasons.push(`单笔支出超过 3 天的日常预算（¥${dailyBudget * 3}）`);
    }

    // 8. 机会成本分析
    const opportunityCost = `购买此物 ¥${price} 等于 ${Math.round(price / dailyBudget)} 天的生活费，或 ${price > 100 ? Math.round(price / 30) + ' 杯奶茶' : '不到一杯奶茶'}`;
    againstReasons.push(`机会成本：${opportunityCost}`);

    score = Math.max(0, Math.min(100, score));

    // 决策结果
    let recommendation = '';
    let action = '';
    if (score >= 60) {
      recommendation = '不建议购买';
      action = 'reject';
    } else if (score >= 35) {
      recommendation = '谨慎考虑，建议延后';
      action = 'delay';
    } else {
      recommendation = '可以考虑购买';
      action = 'approve';
    }

    // 生成替代品建议 - 不建议或谨慎考虑时都生成；强烈欲望时也生成
    let alternatives = [];
    if (action !== 'approve' || hasStrongDesire) {
      alternatives = generateAlternatives(category, price, itemName, reason);
    }

    // 生成总结性建议
    let finalAdvice = '';
    if (action === 'reject') {
      finalAdvice = hasStrongDesire
        ? '我理解你非常想买，但综合分析后不建议现在购买。如果你确实有刚需，请参考下方替代品方案，能帮你省下不少钱。'
        : '综合财务状况和需求分析，不建议购买此商品。如果确实有实际需求，可参考替代品。';
    } else if (action === 'delay') {
      finalAdvice = '建议先冷静 48-72 小时，如果届时仍然觉得需要，再考虑购买或选择替代品。';
    } else {
      finalAdvice = '当前财务状况允许，但请注意控制后续支出。';
    }

    return {
      score,
      recommendation,
      action,
      againstReasons,
      forReasons,
      alternatives,
      hasStrongDesire,
      finalAdvice,
      financeSummary: {
        price, income, monthExpenses, huabeiPending, todayExpense,
        priceRatio: (priceRatio * 100).toFixed(1) + '%',
        monthSpentRatio: (monthSpentRatio * 100).toFixed(1) + '%'
      }
    };
  }

  /**
   * 根据类别生成替代品建议（含详细对比维度）
   */
  function generateAlternatives(category, price, itemName, reason) {
    const alternatives = {
      '电子产品': [
        { name: '上一代型号', desc: '功能差异通常极小（10-15%），性能足以满足日常需求', saveRatio: 0.4, pros: ['性能接近', '系统成熟稳定', '配件丰富便宜'], cons: ['外观可能旧款', '部分新功能缺失'], quality: '90%', suitableFor: '追求性价比、不追新的人' },
        { name: '二手/官翻机', desc: '官方认证翻新，享受质保，成色接近全新', saveRatio: 0.5, pros: ['价格大幅降低', '官方质保', '环保'], cons: ['包装非原封', '心理门槛'], quality: '85%', suitableFor: '预算有限、注重实用的人' },
        { name: '竞品平替', desc: '同价位其他品牌，核心功能相近', saveRatio: 0.25, pros: ['品牌选择多', '部分功能更强', '售后方便'], cons: ['系统生态不同', '学习成本'], quality: '85%', suitableFor: '不执着于单一品牌的人' }
      ],
      '护肤美容': [
        { name: '平价替代（成分党）', desc: '核心功效成分相近的平价产品，效果可达80%', saveRatio: 0.6, pros: ['价格大幅降低', '成分透明', '可多次尝试'], cons: ['品牌体验感差', '包装简陋', '质地可能不同'], quality: '80%', suitableFor: '注重成分效果、不追求品牌的人' },
        { name: '小样/旅行装试用', desc: '先买小样确认适合自己，避免浪费', saveRatio: 0.85, pros: ['试错成本极低', '确认适合再入手', '便于旅行携带'], cons: ['单位价格略高', '量少需频繁购买'], quality: '同正装', suitableFor: '未用过此产品、怕过敏的人' },
        { name: '国货新锐品牌', desc: '近年国货护肤品质大幅提升，价格更亲民', saveRatio: 0.5, pros: ['性价比高', '适合亚洲肤质', '成分创新'], cons: ['品牌知名度低', '品控偶有波动'], quality: '82%', suitableFor: '愿意尝试国货、注重性价比的人' }
      ],
      '服饰鞋包': [
        { name: '过季/折扣款', desc: '上一季或去年的款式，材质工艺完全相同', saveRatio: 0.4, pros: ['品质完全相同', '经典款不过时', '打折力度大'], cons: ['尺码可能不全', '颜色选择少'], quality: '100%', suitableFor: '不追当季新款、注重品质的人' },
        { name: '基础百搭款替代', desc: '去掉logo和设计溢价的同类基础款', saveRatio: 0.5, pros: ['百搭实用', '性价比高', '不易过时'], cons: ['无品牌标识', '面料可能略差'], quality: '85%', suitableFor: '追求实用、不追求品牌的人' },
        { name: '二手平台（95新）', desc: '几乎全新的二手商品，成色好', saveRatio: 0.6, pros: ['价格大幅降低', '可淘到好货', '环保'], cons: ['需鉴别真伪', '有使用痕迹', '无退换'], quality: '90%', suitableFor: '有鉴别能力、不怕二手的人' }
      ],
      '书籍文具': [
        { name: '电子书/Kindle版', desc: '电子版通常更便宜，且便于携带标注', saveRatio: 0.7, pros: ['便宜', '便携', '可搜索', '不占空间'], cons: ['无实体感', '不适合收藏', '需要设备'], quality: '内容相同', suitableFor: '注重内容、频繁阅读的人' },
        { name: '图书馆借阅', desc: '免费借阅，到期归还', saveRatio: 1.0, pros: ['完全免费', '环保', '不占空间'], cons: ['需按时归还', '可能需排队', '不能标注'], quality: '内容相同', suitableFor: '阅读速度快、不反复翻阅的人' },
        { name: '二手书平台', desc: '多抓鱼/孔夫子等二手平台，品相良好', saveRatio: 0.6, pros: ['价格低', '有实体感', '可收藏'], cons: ['有使用痕迹', '可能有笔记'], quality: '90%', suitableFor: '想要实体书但预算有限的人' }
      ],
      '生活用品': [
        { name: '囤货装/大包装', desc: '单位价格更低，适合常用消耗品', saveRatio: 0.3, pros: ['单价低', '减少购买频次', '不易断货'], cons: ['一次性支出大', '占用存储空间', '可能过期'], quality: '100%', suitableFor: '常用物品、有存储空间的人' },
        { name: '白牌/工厂直供', desc: '无品牌溢价，功能完全相同', saveRatio: 0.5, pros: ['价格低', '功能相同', '性价比高'], cons: ['无品牌保障', '售后可能不便'], quality: '90%', suitableFor: '注重功能、不追求品牌的人' },
        { name: '等待大促（618/双11）', desc: '大促期间通常有20-30%折扣', saveRatio: 0.25, pros: ['正品保障', '价格优惠', '售后完善'], cons: ['需等待时间', '可能冲动加购其他商品'], quality: '100%', suitableFor: '不急需、能等的人' }
      ],
      '其他': [
        { name: '延迟购买（72小时冷静期）', desc: '冷静72小时后再决定，避免冲动消费', saveRatio: 0, pros: ['避免冲动消费', '重新评估需求', '可能发现不需要'], cons: ['如果确实需要会耽误'], quality: '-', suitableFor: '所有非紧急购买' },
        { name: '租赁代替', desc: '低频使用物品可考虑短期租赁', saveRatio: 0.8, pros: ['大幅省钱', '不占空间', '可用高端设备'], cons: ['非自有', '需按时归还', '有押金'], quality: '同品质', suitableFor: '低频使用、临时需求的人' },
        { name: '借用/共享', desc: '向朋友借用或使用共享服务', saveRatio: 1.0, pros: ['完全免费', '社交互动', '环保'], cons: ['需还', '可能不方便', '欠人情'], quality: '取决于对方', suitableFor: '偶尔使用、有资源的人' }
      ]
    };

    return (alternatives[category] || alternatives['其他']).map(alt => ({
      ...alt,
      originalPrice: price,
      suggestedPrice: Math.round(price * (1 - alt.saveRatio)),
      savings: Math.round(price * alt.saveRatio)
    }));
  }

  /**
   * 保存购买请求和分析结果
   */
  function saveRequest(request, analysis) {
    const record = {
      ...request,
      analysis,
      date: new Date().toISOString().slice(0, 10),
      status: analysis.action // reject | delay | approve
    };
    DataManager.addRecord('purchaseRequests', record);
    return record;
  }

  return { dimensions, analyze, saveRequest, generateAlternatives };
})();


// ============================================
// 6. 工具函数
// ============================================
function escapeHtml(str) {
  if (!str) return '';
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

function formatDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return `${d.getMonth() + 1}月${d.getDate()}日`;
}

function getWeekNumber(date) {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil(((d - yearStart) / 86400000 + 1) / 7);
}

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 6) return '夜深了';
  if (hour < 11) return '早上好';
  if (hour < 14) return '中午好';
  if (hour < 18) return '下午好';
  if (hour < 22) return '晚上好';
  return '夜深了';
}


// ============================================
// 7. Service Worker 注册
// ============================================
function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./sw.js')
      .then(reg => {
        console.log('[App] Service Worker 注册成功');
        reg.onupdatefound = () => {
          const newWorker = reg.installing;
          newWorker.onstatechange = () => {
            if (newWorker.state === 'activated') {
              Toast.show('应用已更新到最新版本', 'success');
            }
          };
        };
      })
      .catch(err => console.warn('[App] Service Worker 注册失败:', err));
  }
}


// ============================================
// 8. 应用主体 App
// ============================================
const App = (() => {

  function init() {
    // 渲染底部导航栏
    const navContainer = document.getElementById('nav-container');
    if (navContainer) {
      navContainer.innerHTML = '';
      navContainer.appendChild(BottomNav.render());
    }

    // 注册路由
    registerRoutes();

    // 初始化路由
    Router.init();

    // 注册Service Worker
    registerServiceWorker();

    document.title = '个人工作台';
    console.log('[App] 个人工作台初始化完成');
  }

  function registerRoutes() {
    Router.register('home', renderHome);
    Router.register('onboarding', renderOnboarding);
    Router.register('study', renderStudy);
    Router.register('study-plan', renderStudyPlan);
    Router.register('literature', renderLiterature);
    Router.register('skincare', renderSkincare);
    Router.register('skincare-products', renderSkincareProducts);
    Router.register('skincare-routine', renderSkincareRoutine);
    Router.register('diet', renderDiet);
    Router.register('diet-recipes', renderDietRecipes);
    Router.register('exercise', renderExercise);
    Router.register('finance', renderFinance);
    Router.register('huabei', renderHuabei);
    Router.register('purchase', renderPurchaseAdvisor);
    Router.register('strategy', renderStrategy);
    Router.register('strategy-five-year', renderFiveYearPlan);
    Router.register('strategy-risk', renderRiskPlans);
    Router.register('plan-daily', renderPlanDaily);
    Router.register('plan-weekly', renderPlanWeekly);
    Router.register('plan-monthly', renderPlanMonthly);
    Router.register('plan-yearly', renderPlanYearly);
    Router.register('review-daily', renderReviewDaily);
    Router.register('review-weekly', renderReviewWeekly);
    Router.register('review-monthly', renderReviewMonthly);
    Router.register('review-yearly', renderReviewYearly);
    Router.register('settings', renderSettings);
    Router.register('skincare-strategy', renderSkinStrategy);
    Router.register('strategy-five-year-detail', renderFiveYearPlanDetail);
    Router.register('study-research-plan', renderResearchPlan);
  }

  // 路由前置守卫：检查是否已引导
  Router.beforeEach((path) => {
    const onboarded = DataManager.get('profile.onboarded');
    if (!onboarded && path !== 'onboarding' && path !== 'home') {
      Router.navigate('onboarding');
      return false;
    }
    return true;
  });


  // ============================================
  // 引导页
  // ============================================
  function renderOnboarding() {
    const content = document.getElementById('app-content');
    content.innerHTML = `
      <div class="page onboarding-page">
        <div class="onboarding-hero">
          <div class="onboarding-icon">&#127793;</div>
          <h2>欢迎来到个人工作台</h2>
          <p>集成学习、护肤、饮食、运动、财务与战略规划<br>中医药融合，智慧生活</p>
        </div>

        <div class="card">
          <div class="card-header"><span class="card-title">&#128100; 基本信息设置</span></div>
          <div class="form-group">
            <label class="form-label">昵称</label>
            <input type="text" class="form-control" id="ob-nickname" placeholder="你的名字">
          </div>
          <div class="form-group">
            <label class="form-label">生日</label>
            <input type="date" class="form-control" id="ob-birthday">
          </div>
          <div class="form-group">
            <label class="form-label">性别</label>
            <select class="form-control" id="ob-gender">
              <option value="">请选择</option>
              <option value="男">男</option>
              <option value="女">女</option>
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">身高(cm)</label>
            <input type="number" class="form-control" id="ob-height" placeholder="170">
          </div>
          <div class="form-group">
            <label class="form-label">体重(kg)</label>
            <input type="number" class="form-control" id="ob-weight" placeholder="60">
          </div>
        </div>

        <div class="card">
          <div class="card-header"><span class="card-title">&#129491; 体质辨识（中医药）</span></div>
          <p class="card-desc">选择你的体质类型，获取个性化饮食建议</p>
          <div class="tag-group" id="ob-constitution-group">
            ${Object.entries(LinkageManager.constitutions).map(([name, info]) => `
              <span class="tag tag-clickable tag-constitution-option" data-name="${name}">${name}</span>
            `).join('')}
          </div>
          <p class="card-note" id="ob-constitution-desc"></p>
        </div>

        <div class="card">
          <div class="card-header"><span class="card-title">&#9881; 日常目标设置</span></div>
          <div class="form-group">
            <label class="form-label">每日预算(元)</label>
            <input type="number" class="form-control" id="ob-budget" value="100">
          </div>
          <div class="form-group">
            <label class="form-label">每日热量目标(千卡)</label>
            <input type="number" class="form-control" id="ob-calorie" value="2000">
          </div>
          <div class="form-group">
            <label class="form-label">每日饮水目标(杯)</label>
            <input type="number" class="form-control" id="ob-water" value="8">
          </div>
          <div class="form-group">
            <label class="form-label">每周运动目标(次)</label>
            <input type="number" class="form-control" id="ob-exercise" value="5">
          </div>
          <div class="form-group">
            <label class="form-label">每日学习目标(小时)</label>
            <input type="number" class="form-control" id="ob-study" value="4">
          </div>
        </div>

        <button class="btn btn-primary btn-block" id="ob-finish">开始使用</button>
      </div>
    `;

    let selectedConstitution = '平和质';

    content.querySelectorAll('.tag-constitution-option').forEach(tag => {
      tag.addEventListener('click', () => {
        const name = tag.getAttribute('data-name');
        selectedConstitution = name;
        const info = LinkageManager.getConstitutionAdvice(name);
        document.getElementById('ob-constitution-desc').textContent = `${info.desc} - ${info.dietAdvice}`;
        content.querySelectorAll('.tag-constitution-option').forEach(t => t.classList.remove('active'));
        tag.classList.add('active');
      });
    });

    document.getElementById('ob-finish').addEventListener('click', () => {
      const nickname = document.getElementById('ob-nickname').value.trim();
      if (!nickname) { Toast.show('请输入昵称', 'warning'); return; }

      DataManager.set('profile.nickname', nickname);
      DataManager.set('profile.birthday', document.getElementById('ob-birthday').value);
      DataManager.set('profile.gender', document.getElementById('ob-gender').value);
      DataManager.set('profile.height', document.getElementById('ob-height').value);
      DataManager.set('profile.weight', document.getElementById('ob-weight').value);
      DataManager.set('profile.constitution', selectedConstitution);
      DataManager.set('profile.onboarded', true);

      DataManager.set('settings.dailyBudget', parseInt(document.getElementById('ob-budget').value) || 100);
      DataManager.set('settings.dailyCalorieTarget', parseInt(document.getElementById('ob-calorie').value) || 2000);
      DataManager.set('settings.dailyWaterTarget', parseInt(document.getElementById('ob-water').value) || 8);
      DataManager.set('settings.weeklyExerciseGoal', parseInt(document.getElementById('ob-exercise').value) || 5);
      DataManager.set('settings.studyHourGoal', parseInt(document.getElementById('ob-study').value) || 4);

      Toast.show('设置完成，欢迎使用！', 'success');
      Router.navigate('home');
    });
  }


  // ============================================
  // 首页 - 仪表盘
  // ============================================
  function renderHome() {
    const content = document.getElementById('app-content');
    const report = LinkageManager.getDailyLinkageReport();
    const checkin = LinkageManager.getTodayCheckinStatus();
    const nickname = DataManager.get('profile.nickname') || '用户';
    const today = new Date();
    const dateStr = `${today.getFullYear()}年${today.getMonth() + 1}月${today.getDate()}日`;
    const weekdays = ['日', '一', '二', '三', '四', '五', '六'];
    const weekDay = `星期${weekdays[today.getDay()]}`;

    // 今日待办
    const dailyPlans = DataManager.get('dailyPlans');
    const todayPlans = dailyPlans.filter(p => !p.done).slice(0, 5);

    // 快速入口
    const quickLinks = [
      { label: '购买顾问', icon: '&#128722;', route: 'purchase' },
      { label: '花呗', icon: '&#128179;', route: 'huabei' },
      { label: '文献', icon: '&#128214;', route: 'literature' },
      { label: '食谱', icon: '&#127859;', route: 'diet-recipes' },
      { label: '护肤流程', icon: '&#9888;', route: 'skincare-routine' },
      { label: '设置', icon: '&#9881;', route: 'settings' }
    ];

    content.innerHTML = `
      <div class="page home-page">
        <div class="home-header">
          <div class="greeting">
            <h2>${getGreeting()}，${nickname}</h2>
            <p class="date-text">${dateStr} ${weekDay}</p>
          </div>
          <button class="btn btn-outline btn-sm" onclick="Router.navigate('settings')">&#9881;</button>
        </div>

        <!-- 今日打卡 -->
        <div class="card checkin-card">
          <div class="card-header">
            <span class="card-title">&#9989; 今日打卡</span>
          </div>
          <div class="checkin-grid">
            <div class="checkin-item ${checkin.study ? 'done' : ''}" data-route="study">
              <span class="checkin-icon">${checkin.study ? '&#10003;' : '&#9998;'}</span>
              <span class="checkin-label">学习</span>
            </div>
            <div class="checkin-item ${checkin.skincareMorning ? 'done' : ''}" data-route="skincare">
              <span class="checkin-icon">${checkin.skincareMorning ? '&#10003;' : '&#9728;'}</span>
              <span class="checkin-label">早护肤</span>
            </div>
            <div class="checkin-item ${checkin.skincareEvening ? 'done' : ''}" data-route="skincare">
              <span class="checkin-icon">${checkin.skincareEvening ? '&#10003;' : '&#9789;'}</span>
              <span class="checkin-label">晚护肤</span>
            </div>
            <div class="checkin-item ${checkin.diet ? 'done' : ''}" data-route="diet">
              <span class="checkin-icon">${checkin.diet ? '&#10003;' : '&#9749;'}</span>
              <span class="checkin-label">饮食</span>
            </div>
            <div class="checkin-item ${checkin.exercise ? 'done' : ''}" data-route="exercise">
              <span class="checkin-icon">${checkin.exercise ? '&#10003;' : '&#9917;'}</span>
              <span class="checkin-label">运动</span>
            </div>
            <div class="checkin-item water-checkin">
              <span class="checkin-icon">&#128167;</span>
              <span class="checkin-label">${checkin.water}/${checkin.waterGoal}</span>
            </div>
          </div>
        </div>

        <!-- 快速入口 -->
        <div class="quick-links">
          ${quickLinks.map(link => `
            <div class="quick-link" data-route="${link.route}">
              <span class="quick-link-icon">${link.icon}</span>
              <span class="quick-link-label">${link.label}</span>
            </div>
          `).join('')}
        </div>

        <!-- 今日待办 -->
        <div class="card">
          <div class="card-header">
            <span class="card-title">&#128203; 今日待办</span>
            <button class="btn btn-outline btn-sm" onclick="Router.navigate('plan-daily')">全部</button>
          </div>
          ${todayPlans.length === 0
            ? '<div class="empty-state-sm">暂无待办，去添加计划吧</div>'
            : todayPlans.map(p => `
              <div class="todo-item">
                <span class="todo-dot tag-priority-${p.priority || 'low'}"></span>
                <span class="todo-text">${escapeHtml(p.title)}</span>
              </div>
            `).join('')
          }
        </div>

        <!-- 节气茶饮 -->
        <div class="card solar-term-card">
          <div class="card-header">
            <span class="card-title">&#127793; ${report.solarTerm.name}</span>
            <span class="tag tag-tea">${report.solarTerm.tea}</span>
          </div>
          <p class="card-desc">${report.solarTerm.desc}</p>
          ${report.solarTerm.avoid.length ? `<p class="card-note">忌食：${report.solarTerm.avoid.join('、')}</p>` : ''}
        </div>

        <!-- 预算概览 -->
        <div class="card finance-card">
          <div class="card-header">
            <span class="card-title">&#9878; 今日预算</span>
            <span class="tag tag-${report.financeDiet.level}">${report.financeDiet.level === 'good' ? '充裕' : report.financeDiet.level === 'warning' ? '超支' : '注意'}</span>
          </div>
          <p class="card-desc">${report.financeDiet.tips}</p>
        </div>

        <!-- 热量建议 -->
        <div class="card exercise-card">
          <div class="card-header">
            <span class="card-title">&#9917; 热量建议</span>
            <span class="tag tag-info">${report.exerciseDiet.exerciseType}</span>
          </div>
          <p class="card-desc">${report.exerciseDiet.tips}</p>
        </div>

        <!-- 护肤饮食 -->
        ${report.skincareDiet.condition !== '正常' ? `
        <div class="card skin-card">
          <div class="card-header">
            <span class="card-title">&#10024; 护肤饮食</span>
            <span class="tag tag-skin">${report.skincareDiet.condition}</span>
          </div>
          <p class="card-desc">推荐：${report.skincareDiet.recommend.join('、')}</p>
          <p class="card-note">忌口：${report.skincareDiet.avoid.join('、')}</p>
        </div>` : ''}

        <!-- 体质调理 -->
        <div class="card constitution-card">
          <div class="card-header">
            <span class="card-title">&#129491; 体质调理</span>
            <span class="tag tag-constitution">${report.constitution.desc.slice(0, 4)}</span>
          </div>
          <p class="card-desc">${report.constitution.dietAdvice}</p>
          <p class="card-note">推荐：${report.constitution.recommendFoods.join('、')}</p>
        </div>
      </div>
    `;

    // 绑定打卡事件
    content.querySelectorAll('.checkin-item[data-route]').forEach(item => {
      item.addEventListener('click', () => Router.navigate(item.getAttribute('data-route')));
    });

    // 绑定快速入口
    content.querySelectorAll('.quick-link').forEach(link => {
      link.addEventListener('click', () => Router.navigate(link.getAttribute('data-route')));
    });
  }


  // ============================================
  // 学习科研模块
  // ============================================
  function renderStudy() {
    const content = document.getElementById('app-content');
    const records = DataManager.get('studyRecords');
    const todayRecords = DataManager.getTodayRecords('studyRecords');
    const todayMinutes = todayRecords.reduce((sum, r) => sum + (parseInt(r.duration) || 0), 0);
    const goalMinutes = (DataManager.get('settings.studyHourGoal') || 4) * 60;
    const literature = DataManager.get('literatureRecords');

    // 7周计划进度
    const studyPlan = DataManager.get('studyWeekPlan');
    const weekProgress = studyPlan.weeks || [];

    content.innerHTML = `
      <div class="page study-page">
        <div class="page-header">
          <h2>&#9998; 学习中心</h2>
          <button class="btn btn-primary btn-sm" id="btn-add-study">+ 记录</button>
        </div>

        <div class="stat-cards">
          <div class="stat-card">
            <div class="stat-value">${todayMinutes}</div>
            <div class="stat-label">今日(分钟)</div>
            <div class="stat-bar"><div class="stat-bar-fill" style="width:${Math.min(100, todayMinutes / goalMinutes * 100)}%"></div></div>
          </div>
          <div class="stat-card">
            <div class="stat-value">${records.length}</div>
            <div class="stat-label">累计记录</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">${literature.length}</div>
            <div class="stat-label">文献阅读</div>
          </div>
        </div>

        <!-- 7周科研计划 -->
        <div class="card">
          <div class="card-header">
            <span class="card-title">&#128202; 7周科研计划</span>
            <button class="btn btn-outline btn-sm" onclick="Router.navigate('study-plan')">管理</button>
          </div>
          ${weekProgress.length === 0
            ? '<div class="empty-state-sm">尚未创建7周计划</div>'
            : `<div class="week-progress-list">
              ${weekProgress.slice(0, 7).map((w, i) => `
                <div class="week-progress-item ${w.done ? 'done' : ''} ${w.current ? 'current' : ''}">
                  <span class="week-num">W${i + 1}</span>
                  <span class="week-title">${escapeHtml(w.title || '未命名')}</span>
                  <span class="week-status">${w.done ? '&#10003;' : w.current ? '进行中' : ''}</span>
                </div>
              `).join('')}
            </div>`
          }
        </div>

        <!-- 快速入口 -->
        <div class="quick-links">
          <div class="quick-link" data-route="literature">
            <span class="quick-link-icon">&#128214;</span>
            <span class="quick-link-label">文献管理</span>
          </div>
          <div class="quick-link" data-route="study-plan">
            <span class="quick-link-icon">&#128202;</span>
            <span class="quick-link-label">周计划</span>
          </div>
          <div class="quick-link" data-route="study-research-plan">
            <span class="quick-link-icon">&#128218;</span>
            <span class="quick-link-label">7周科研计划</span>
          </div>
        </div>

        <!-- 学习记录 -->
        <div class="card-list" id="study-list">
          ${records.length === 0 ? '<div class="empty-state">暂无学习记录，点击右上角开始记录</div>' :
            records.slice(-10).reverse().map(r => `
              <div class="card record-card">
                <div class="record-header">
                  <span class="record-title">${escapeHtml(r.subject || '未分类')}</span>
                  <span class="record-date">${r.date || ''}</span>
                </div>
                <p class="record-content">${escapeHtml(r.content || '无详情')}</p>
                <div class="record-tags">
                  <span class="tag tag-study">${r.duration || 0}分钟</span>
                  ${r.progress ? `<span class="tag tag-progress">进度 ${r.progress}%</span>` : ''}
                </div>
              </div>
            `).join('')}
        </div>
      </div>
    `;

    document.getElementById('btn-add-study').addEventListener('click', () => {
      Modal.openForm({
        title: '添加学习记录',
        fields: [
          { name: 'subject', label: '学科/主题', type: 'select', required: true,
            options: ['英语', '专业课', '文献阅读', '实验', '论文写作', '综述', '其他'] },
          { name: 'duration', label: '学习时长(分钟)', type: 'number', placeholder: '30', required: true },
          { name: 'content', label: '学习内容', type: 'textarea', placeholder: '今天学了什么...' },
          { name: 'progress', label: '完成进度(%)', type: 'number', placeholder: '0-100', min: 0, max: 100 }
        ],
        onConfirm: (data) => {
          data.date = new Date().toISOString().slice(0, 10);
          DataManager.addRecord('studyRecords', data);
          Toast.show('学习记录已保存', 'success');
          renderStudy();
        }
      });
    });

    content.querySelectorAll('.quick-link').forEach(link => {
      link.addEventListener('click', () => Router.navigate(link.getAttribute('data-route')));
    });
  }

  // 7周计划管理
  function renderStudyPlan() {
    const content = document.getElementById('app-content');
    const studyPlan = DataManager.get('studyWeekPlan');
    const weeks = studyPlan.weeks || [];

    content.innerHTML = `
      <div class="page">
        <div class="page-header">
          <button class="btn btn-outline btn-sm" onclick="Router.navigate('study')">&#8592; 返回</button>
          <h2>&#128202; 7周科研计划</h2>
          <button class="btn btn-primary btn-sm" id="btn-add-week">+ 周计划</button>
        </div>

        ${weeks.length === 0
          ? '<div class="empty-state">尚未创建7周计划<br>建议按科研阶段划分：<br>文献调研 → 实验设计 → 数据采集 → 分析写作</div>'
          : weeks.map((w, i) => `
            <div class="card record-card week-card ${w.current ? 'week-current' : ''}">
              <div class="record-header">
                <span class="record-title">第 ${i + 1} 周：${escapeHtml(w.title || '未命名')}</span>
                <span class="tag tag-${w.done ? 'good' : w.current ? 'info' : 'normal'}">${w.done ? '已完成' : w.current ? '进行中' : '未开始'}</span>
              </div>
              ${w.goal ? `<p class="record-content">目标：${escapeHtml(w.goal)}</p>` : ''}
              ${w.tasks ? `<p class="record-content">任务：${escapeHtml(w.tasks)}</p>` : ''}
              <div class="record-tags">
                <button class="btn btn-outline btn-sm btn-toggle-current" data-index="${i}">${w.current ? '取消当前' : '设为当前'}</button>
                <button class="btn btn-outline btn-sm btn-toggle-done" data-index="${i}">${w.done ? '取消完成' : '标记完成'}</button>
                <button class="btn-delete btn-sm" data-index="${i}">删除</button>
              </div>
            </div>
          `).join('')
        }
      </div>
    `;

    document.getElementById('btn-add-week').addEventListener('click', () => {
      Modal.openForm({
        title: `添加第 ${weeks.length + 1} 周计划`,
        fields: [
          { name: 'title', label: '本周主题', type: 'text', placeholder: '如：文献调研', required: true },
          { name: 'goal', label: '本周目标', type: 'textarea', placeholder: '要达成的目标' },
          { name: 'tasks', label: '具体任务', type: 'textarea', placeholder: '每行一个任务' }
        ],
        onConfirm: (data) => {
          weeks.push({ ...data, done: false, current: weeks.length === 0 });
          DataManager.set('studyWeekPlan.weeks', weeks);
          if (!DataManager.get('studyWeekPlan.startDate')) {
            DataManager.set('studyWeekPlan.startDate', new Date().toISOString().slice(0, 10));
          }
          Toast.show('周计划已添加', 'success');
          renderStudyPlan();
        }
      });
    });

    content.querySelectorAll('.btn-toggle-current').forEach(btn => {
      btn.addEventListener('click', () => {
        const idx = parseInt(btn.getAttribute('data-index'));
        weeks.forEach((w, i) => w.current = (i === idx ? !w.current : false));
        DataManager.set('studyWeekPlan.weeks', weeks);
        renderStudyPlan();
      });
    });

    content.querySelectorAll('.btn-toggle-done').forEach(btn => {
      btn.addEventListener('click', () => {
        const idx = parseInt(btn.getAttribute('data-index'));
        weeks[idx].done = !weeks[idx].done;
        DataManager.set('studyWeekPlan.weeks', weeks);
        renderStudyPlan();
      });
    });

    content.querySelectorAll('.btn-delete').forEach(btn => {
      btn.addEventListener('click', () => {
        const idx = parseInt(btn.getAttribute('data-index'));
        Modal.open({
          title: '确认删除', content: '<p>确定要删除这个周计划吗？</p>', type: 'danger',
          onConfirm: () => {
            weeks.splice(idx, 1);
            DataManager.set('studyWeekPlan.weeks', weeks);
            Toast.show('已删除', 'info');
            renderStudyPlan();
          }
        });
      });
    });
  }

  // 文献管理
  function renderLiterature() {
    const content = document.getElementById('app-content');
    const records = DataManager.get('literatureRecords');

    content.innerHTML = `
      <div class="page">
        <div class="page-header">
          <button class="btn btn-outline btn-sm" onclick="Router.navigate('study')">&#8592; 返回</button>
          <h2>&#128214; 文献管理</h2>
          <button class="btn btn-primary btn-sm" id="btn-add-lit">+ 文献</button>
        </div>

        <div class="stat-cards stat-cards-2">
          <div class="stat-card">
            <div class="stat-value">${records.length}</div>
            <div class="stat-label">总文献数</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">${records.filter(r => r.status === '已读').length}</div>
            <div class="stat-label">已读</div>
          </div>
        </div>

        <div class="card-list">
          ${records.length === 0 ? '<div class="empty-state">暂无文献记录</div>' :
            records.slice(-20).reverse().map(r => `
              <div class="card record-card">
                <div class="record-header">
                  <span class="record-title">${escapeHtml(r.title || '无标题')}</span>
                  <span class="tag tag-${r.status === '已读' ? 'good' : r.status === '在读' ? 'info' : 'normal'}">${r.status || '未读'}</span>
                </div>
                ${r.authors ? `<p class="record-content">${escapeHtml(r.authors)}</p>` : ''}
                ${r.journal ? `<p class="record-note">${escapeHtml(r.journal)} ${r.year || ''}</p>` : ''}
                ${r.notes ? `<p class="record-note">${escapeHtml(r.notes)}</p>` : ''}
                <div class="record-tags">
                  ${r.tags ? r.tags.split(/[,，]/).map(t => `<span class="tag tag-category">${escapeHtml(t.trim())}</span>`).join('') : ''}
                </div>
              </div>
            `).join('')}
        </div>
      </div>
    `;

    document.getElementById('btn-add-lit').addEventListener('click', () => {
      Modal.openForm({
        title: '添加文献',
        fields: [
          { name: 'title', label: '标题', type: 'text', required: true, placeholder: '文献标题' },
          { name: 'authors', label: '作者', type: 'text', placeholder: '作者列表' },
          { name: 'journal', label: '期刊', type: 'text', placeholder: '期刊名' },
          { name: 'year', label: '年份', type: 'number', placeholder: '2025' },
          { name: 'status', label: '阅读状态', type: 'select', options: ['未读', '在读', '已读'] },
          { name: 'tags', label: '标签(逗号分隔)', type: 'text', placeholder: '综述,实验方法' },
          { name: 'notes', label: '笔记', type: 'textarea', placeholder: '关键发现、方法要点' }
        ],
        onConfirm: (data) => {
          data.date = new Date().toISOString().slice(0, 10);
          DataManager.addRecord('literatureRecords', data);
          Toast.show('文献已添加', 'success');
          renderLiterature();
        }
      });
    });
  }


  // ============================================
  // 护肤管理模块
  // ============================================
  function renderSkincare() {
    const content = document.getElementById('app-content');
    const records = DataManager.get('skincareRecords');
    const todayRecords = DataManager.getTodayRecords('skincareRecords');
    const morningDone = todayRecords.some(r => r.period === 'morning');
    const eveningDone = todayRecords.some(r => r.period === 'evening');

    content.innerHTML = `
      <div class="page skincare-page">
        <div class="page-header">
          <h2>&#10024; 护肤管理</h2>
          <button class="btn btn-primary btn-sm" id="btn-add-skincare">+ 打卡</button>
        </div>

        <!-- 今日打卡状态 -->
        <div class="card">
          <div class="card-header"><span class="card-title">&#128197; 今日护肤</span></div>
          <div class="skincare-period-grid">
            <div class="skincare-period ${morningDone ? 'done' : ''}" id="morning-checkin">
              <span class="period-icon">&#9728;</span>
              <span class="period-label">晨间护肤</span>
              <span class="period-status">${morningDone ? '&#10003; 已完成' : '未打卡'}</span>
            </div>
            <div class="skincare-period ${eveningDone ? 'done' : ''}" id="evening-checkin">
              <span class="period-icon">&#9789;</span>
              <span class="period-label">晚间护肤</span>
              <span class="period-status">${eveningDone ? '&#10003; 已完成' : '未打卡'}</span>
            </div>
          </div>
        </div>

        <!-- 快速入口 -->
        <div class="quick-links">
          <div class="quick-link" data-route="skincare-products">
            <span class="quick-link-icon">&#129532;</span>
            <span class="quick-link-label">产品库</span>
          </div>
          <div class="quick-link" data-route="skincare-routine">
            <span class="quick-link-icon">&#9881;</span>
            <span class="quick-link-label">护肤流程</span>
          </div>
          <div class="quick-link" data-route="skincare-strategy">
            <span class="quick-link-icon">&#128138;</span>
            <span class="quick-link-label">皮肤战略</span>
          </div>
        </div>

        <!-- 皮肤状态与饮食 -->
        <div class="card skin-advice-card">
          <div class="card-header"><span class="card-title">&#127822; 皮肤与饮食</span></div>
          <p class="card-desc">选择皮肤状态获取饮食建议</p>
          <div class="tag-group">
            ${['出油', '干燥', '敏感', '暗沉', '长痘', '过敏', '正常'].map(c => `
              <span class="tag tag-clickable tag-skin-condition" data-condition="${c}">${c}</span>
            `).join('')}
          </div>
          <div id="skin-diet-advice"></div>
        </div>

        <!-- 痘痘急救 -->
        <div class="card acne-emergency-card">
          <div class="card-header"><span class="card-title">&#9888; 痘痘急救指南</span></div>
          <div class="acne-steps">
            <div class="acne-step"><strong>1. 不要挤</strong> - 挤压会导致感染扩散和留疤</div>
            <div class="acne-step"><strong>2. 局部点涂</strong> - 使用含水杨酸/过氧化苯甲酰的产品点涂</div>
            <div class="acne-step"><strong>3. 精简护肤</strong> - 停用功效型产品，只保留基础清洁保湿</div>
            <div class="acne-step"><strong>4. 饮食忌口</strong> - 忌甜食、奶制品、油炸、辛辣</div>
            <div class="acne-step"><strong>5. 规律作息</strong> - 11点前入睡，避免熬夜</div>
          </div>
        </div>

        <!-- 护肤记录 -->
        <div class="card-list" id="skincare-list">
          ${records.length === 0 ? '<div class="empty-state">暂无护肤记录</div>' :
            records.slice(-10).reverse().map(r => `
              <div class="card record-card">
                <div class="record-header">
                  <span class="record-title">${r.date || ''} ${r.period === 'morning' ? '晨间' : r.period === 'evening' ? '晚间' : ''}</span>
                  <span class="tag tag-skin-condition-small">${r.skinCondition || '未记录'}</span>
                </div>
                ${r.items?.length ? `<p class="record-content">步骤：${escapeHtml(r.items.join(' → '))}</p>` : ''}
                ${r.notes ? `<p class="record-note">${escapeHtml(r.notes)}</p>` : ''}
              </div>
            `).join('')}
        </div>
      </div>
    `;

    // 打卡按钮
    document.getElementById('morning-checkin').addEventListener('click', () => {
      if (morningDone) { Toast.show('今日晨间护肤已打卡', 'info'); return; }
      doSkincareCheckin('morning');
    });
    document.getElementById('evening-checkin').addEventListener('click', () => {
      if (eveningDone) { Toast.show('今日晚间护肤已打卡', 'info'); return; }
      doSkincareCheckin('evening');
    });

    document.getElementById('btn-add-skincare').addEventListener('click', () => {
      doSkincareCheckin('morning');
    });

    // 皮肤状态点击
    document.querySelectorAll('.tag-skin-condition').forEach(tag => {
      tag.addEventListener('click', () => {
        const condition = tag.getAttribute('data-condition');
        const advice = LinkageManager.getSkincareDietAdvice(condition);
        document.getElementById('skin-diet-advice').innerHTML = `
          <div class="advice-box">
            <p><strong>推荐食物：</strong>${advice.recommend.join('、')}</p>
            <p><strong>忌口食物：</strong>${advice.avoid.length ? advice.avoid.join('、') : '无特殊忌口'}</p>
          </div>
        `;
        document.querySelectorAll('.tag-skin-condition').forEach(t => t.classList.remove('active'));
        tag.classList.add('active');
      });
    });

    content.querySelectorAll('.quick-link').forEach(link => {
      link.addEventListener('click', () => Router.navigate(link.getAttribute('data-route')));
    });
  }

  function doSkincareCheckin(period) {
    const routine = DataManager.get(`skincareRoutine.${period}`) || [];
    Modal.openForm({
      title: `${period === 'morning' ? '晨间' : '晚间'}护肤打卡`,
      fields: [
        { name: 'skinCondition', label: '皮肤状态', type: 'select', required: true,
          options: ['出油', '干燥', '敏感', '暗沉', '长痘', '过敏', '正常'] },
        { name: 'items', label: '使用产品', type: 'textarea',
          placeholder: routine.length ? `建议流程：\n${routine.join('\n')}` : '每行一个产品名' },
        { name: 'notes', label: '备注', type: 'textarea', placeholder: '皮肤反应、感受等' }
      ],
      onConfirm: (data) => {
        data.date = new Date().toISOString().slice(0, 10);
        data.period = period;
        data.items = data.items ? data.items.split('\n').filter(Boolean) : [];
        DataManager.addRecord('skincareRecords', data);
        Toast.show(`${period === 'morning' ? '晨间' : '晚间'}护肤打卡成功`, 'success');
        renderSkincare();
      }
    });
  }

  // 产品库
  function renderSkincareProducts() {
    const content = document.getElementById('app-content');
    const products = DataManager.get('skincareProducts');

    content.innerHTML = `
      <div class="page">
        <div class="page-header">
          <button class="btn btn-outline btn-sm" onclick="Router.navigate('skincare')">&#8592; 返回</button>
          <h2>&#129532; 产品库</h2>
          <button class="btn btn-primary btn-sm" id="btn-add-product">+ 产品</button>
        </div>

        ${products.length === 0 ? '<div class="empty-state">暂无产品记录<br>添加你的护肤品，建立产品审计档案</div>' :
          products.map(p => `
            <div class="card record-card">
              <div class="record-header">
                <span class="record-title">${escapeHtml(p.name)}</span>
                <span class="tag tag-${p.status === '在用' ? 'good' : p.status === '闲置' ? 'normal' : 'warning'}">${p.status || '在用'}</span>
              </div>
              <div class="record-tags">
                <span class="tag tag-category">${escapeHtml(p.category || '未分类')}</span>
                <span class="tag tag-category">${escapeHtml(p.brand || '')}</span>
                ${p.price ? `<span class="tag tag-expense">¥${p.price}</span>` : ''}
                ${p.expiry ? `<span class="tag tag-date-small">到期 ${p.expiry}</span>` : ''}
              </div>
              ${p.notes ? `<p class="record-note">${escapeHtml(p.notes)}</p>` : ''}
            </div>
          `).join('')
        }
      </div>
    `;

    document.getElementById('btn-add-product').addEventListener('click', () => {
      Modal.openForm({
        title: '添加护肤产品',
        fields: [
          { name: 'name', label: '产品名称', type: 'text', required: true, placeholder: '如：雅诗兰黛小棕瓶' },
          { name: 'brand', label: '品牌', type: 'text', placeholder: '品牌名' },
          { name: 'category', label: '类别', type: 'select',
            options: ['洁面', '爽肤水', '精华', '乳液', '面霜', '防晒', '眼霜', '面膜', '去角质', '其他'] },
          { name: 'price', label: '价格(元)', type: 'number', placeholder: '0' },
          { name: 'status', label: '状态', type: 'select', options: ['在用', '闲置', '已用完', '过敏停用'] },
          { name: 'expiry', label: '保质期到期', type: 'date' },
          { name: 'notes', label: '使用感受', type: 'textarea', placeholder: '效果、是否过敏等' }
        ],
        onConfirm: (data) => {
          DataManager.addRecord('skincareProducts', data);
          Toast.show('产品已添加', 'success');
          renderSkincareProducts();
        }
      });
    });
  }

  // 护肤流程设置
  function renderSkincareRoutine() {
    const content = document.getElementById('app-content');
    const morning = DataManager.get('skincareRoutine.morning') || [];
    const evening = DataManager.get('skincareRoutine.evening') || [];

    content.innerHTML = `
      <div class="page">
        <div class="page-header">
          <button class="btn btn-outline btn-sm" onclick="Router.navigate('skincare')">&#8592; 返回</button>
          <h2>&#9881; 护肤流程</h2>
        </div>

        <div class="card">
          <div class="card-header">
            <span class="card-title">&#9728; 晨间流程</span>
            <button class="btn btn-outline btn-sm" id="btn-add-morning">+ 步骤</button>
          </div>
          ${morning.length === 0 ? '<div class="empty-state-sm">暂未设置</div>' :
            morning.map((step, i) => `
              <div class="routine-step">
                <span class="step-num">${i + 1}</span>
                <span class="step-text">${escapeHtml(step)}</span>
                <button class="btn-delete btn-sm" data-period="morning" data-index="${i}">&#10007;</button>
              </div>
            `).join('')
          }
        </div>

        <div class="card">
          <div class="card-header">
            <span class="card-title">&#9789; 晚间流程</span>
            <button class="btn btn-outline btn-sm" id="btn-add-evening">+ 步骤</button>
          </div>
          ${evening.length === 0 ? '<div class="empty-state-sm">暂未设置</div>' :
            evening.map((step, i) => `
              <div class="routine-step">
                <span class="step-num">${i + 1}</span>
                <span class="step-text">${escapeHtml(step)}</span>
                <button class="btn-delete btn-sm" data-period="evening" data-index="${i}">&#10007;</button>
              </div>
            `).join('')
          }
        </div>

        <div class="card">
          <div class="card-header"><span class="card-title">&#128221; 护肤三阶段建议</span></div>
          <div class="advice-box">
            <p><strong>第一阶段：基础护理</strong></p>
            <p>洁面 → 爽肤水 → 保湿 → 防晒(晨)</p>
            <p><strong>第二阶段：功效进阶</strong></p>
            <p>精华 → 眼霜 → 面膜(每周2-3次)</p>
            <p><strong>第三阶段：问题修复</strong></p>
            <p>痘痘点涂 → 美白淡斑 → 抗老修护</p>
          </div>
        </div>
      </div>
    `;

    function addStep(period) {
      Modal.openForm({
        title: `添加${period === 'morning' ? '晨间' : '晚间'}步骤`,
        fields: [
          { name: 'step', label: '步骤名称', type: 'text', required: true, placeholder: '如：洁面' }
        ],
        onConfirm: (data) => {
          const steps = DataManager.get(`skincareRoutine.${period}`) || [];
          steps.push(data.step);
          DataManager.set(`skincareRoutine.${period}`, steps);
          Toast.show('步骤已添加', 'success');
          renderSkincareRoutine();
        }
      });
    }

    document.getElementById('btn-add-morning').addEventListener('click', () => addStep('morning'));
    document.getElementById('btn-add-evening').addEventListener('click', () => addStep('evening'));

    content.querySelectorAll('.btn-delete[data-period]').forEach(btn => {
      btn.addEventListener('click', () => {
        const period = btn.getAttribute('data-period');
        const idx = parseInt(btn.getAttribute('data-index'));
        const steps = DataManager.get(`skincareRoutine.${period}`) || [];
        steps.splice(idx, 1);
        DataManager.set(`skincareRoutine.${period}`, steps);
        renderSkincareRoutine();
      });
    });
  }


  // ============================================
  // 饮食模块
  // ============================================
  function renderDiet() {
    const content = document.getElementById('app-content');
    const records = DataManager.get('dietRecords');
    const todayRecords = DataManager.getTodayRecords('dietRecords');
    const todayCalories = todayRecords.reduce((sum, r) => {
      if (r.meals) return sum + r.meals.reduce((s, m) => s + (parseInt(m.calories) || 0), 0);
      return sum;
    }, 0);
    const calorieTarget = DataManager.get('settings.dailyCalorieTarget') || 2000;
    const todayWater = todayRecords.reduce((sum, r) => sum + (parseInt(r.waterCups) || 0), 0);
    const waterGoal = DataManager.get('settings.dailyWaterTarget') || 8;

    // 联动建议
    const financeDiet = LinkageManager.getFinanceDietRecommendation();
    const skinCondition = todayRecords.length > 0 ? (todayRecords[0].skinCondition || '正常') : '正常';

    content.innerHTML = `
      <div class="page diet-page">
        <div class="page-header">
          <h2>&#9749; 饮食记录</h2>
          <button class="btn btn-primary btn-sm" id="btn-add-diet">+ 记录</button>
        </div>

        <div class="stat-cards">
          <div class="stat-card">
            <div class="stat-value">${todayCalories}</div>
            <div class="stat-label">热量(千卡)</div>
            <div class="stat-bar"><div class="stat-bar-fill" style="width:${Math.min(100, todayCalories / calorieTarget * 100)}%"></div></div>
          </div>
          <div class="stat-card">
            <div class="stat-value">${todayWater}/${waterGoal}</div>
            <div class="stat-label">饮水(杯)</div>
            <div class="stat-bar"><div class="stat-bar-fill" style="width:${Math.min(100, todayWater / waterGoal * 100)}%"></div></div>
          </div>
          <div class="stat-card">
            <div class="stat-value">${calorieTarget}</div>
            <div class="stat-label">目标(千卡)</div>
          </div>
        </div>

        <!-- 智能建议 -->
        <div class="card">
          <div class="card-header"><span class="card-title">&#129504; 智能饮食建议</span></div>
          <div class="advice-box">
            <p><strong>预算联动：</strong>${financeDiet.tips}</p>
            <p><strong>推荐餐食：</strong>${financeDiet.meals.join('、')}</p>
          </div>
        </div>

        <!-- 快速入口 -->
        <div class="quick-links">
          <div class="quick-link" data-route="diet-recipes">
            <span class="quick-link-icon">&#127859;</span>
            <span class="quick-link-label">食谱库</span>
          </div>
        </div>

        <!-- 饮食记录 -->
        <div class="card-list" id="diet-list">
          ${records.length === 0 ? '<div class="empty-state">暂无饮食记录</div>' :
            records.slice(-10).reverse().map(r => `
              <div class="card record-card">
                <div class="record-header">
                  <span class="record-title">${r.date || ''}</span>
                  ${r.waterCups ? `<span class="tag tag-water">&#128167; ${r.waterCups}杯</span>` : ''}
                </div>
                ${r.meals?.length ? r.meals.map(m => `
                  <div class="meal-item">
                    <span class="meal-time">${m.time || ''}</span>
                    <span class="meal-foods">${escapeHtml(m.foods || '')}</span>
                    ${m.calories ? `<span class="meal-cal">${m.calories}千卡</span>` : ''}
                  </div>
                `).join('') : ''}
              </div>
            `).join('')}
        </div>
      </div>
    `;

    document.getElementById('btn-add-diet').addEventListener('click', () => {
      Modal.openForm({
        title: '添加饮食记录',
        fields: [
          { name: 'time', label: '用餐时间', type: 'select', required: true,
            options: ['早餐', '午餐', '晚餐', '加餐'] },
          { name: 'foods', label: '食物内容', type: 'textarea', required: true, placeholder: '如：米饭、炒青菜、红烧肉' },
          { name: 'calories', label: '热量估算(千卡)', type: 'number', placeholder: '500' },
          { name: 'waterCups', label: '今日饮水(杯)', type: 'number', placeholder: '8' }
        ],
        onConfirm: (data) => {
          const today = new Date().toISOString().slice(0, 10);
          const waterCups = parseInt(data.waterCups) || 0;
          const todayRec = DataManager.getTodayRecords('dietRecords');
          if (todayRec.length > 0) {
            const existing = todayRec[0];
            existing.meals = existing.meals || [];
            existing.meals.push({ time: data.time, foods: data.foods, calories: data.calories });
            if (waterCups) existing.waterCups = waterCups;
            DataManager.updateRecord('dietRecords', existing.id, existing);
          } else {
            DataManager.addRecord('dietRecords', {
              date: today,
              meals: [{ time: data.time, foods: data.foods, calories: data.calories }],
              waterCups
            });
          }
          Toast.show('饮食记录已保存', 'success');
          renderDiet();
        }
      });
    });

    content.querySelectorAll('.quick-link').forEach(link => {
      link.addEventListener('click', () => Router.navigate(link.getAttribute('data-route')));
    });
  }

  // 食谱库
  function renderDietRecipes() {
    const content = document.getElementById('app-content');
    const recipes = DataManager.get('dietRecipes');

    content.innerHTML = `
      <div class="page">
        <div class="page-header">
          <button class="btn btn-outline btn-sm" onclick="Router.navigate('diet')">&#8592; 返回</button>
          <h2>&#127859; 食谱库</h2>
          <button class="btn btn-primary btn-sm" id="btn-add-recipe">+ 食谱</button>
        </div>

        ${recipes.length === 0 ? '<div class="empty-state">暂无食谱<br>添加你的常吃食谱，方便快速记录</div>' :
          recipes.map(r => `
            <div class="card record-card">
              <div class="record-header">
                <span class="record-title">${escapeHtml(r.name)}</span>
                <span class="tag tag-cal">${r.calories || 0}千卡</span>
              </div>
              <div class="record-tags">
                <span class="tag tag-category">${escapeHtml(r.mealType || '')}</span>
                <span class="tag tag-expense">¥${r.cost || 0}</span>
              </div>
              ${r.ingredients ? `<p class="record-content">食材：${escapeHtml(r.ingredients)}</p>` : ''}
              ${r.notes ? `<p class="record-note">${escapeHtml(r.notes)}</p>` : ''}
            </div>
          `).join('')
        }
      </div>
    `;

    document.getElementById('btn-add-recipe').addEventListener('click', () => {
      Modal.openForm({
        title: '添加食谱',
        fields: [
          { name: 'name', label: '菜名', type: 'text', required: true, placeholder: '如：番茄炒蛋' },
          { name: 'mealType', label: '餐类', type: 'select', options: ['早餐', '午餐', '晚餐', '加餐'] },
          { name: 'calories', label: '热量(千卡)', type: 'number', placeholder: '300' },
          { name: 'cost', label: '成本(元)', type: 'number', placeholder: '10' },
          { name: 'ingredients', label: '食材', type: 'textarea', placeholder: '番茄2个，鸡蛋3个' },
          { name: 'notes', label: '备注', type: 'textarea', placeholder: '做法要点' }
        ],
        onConfirm: (data) => {
          DataManager.addRecord('dietRecipes', data);
          Toast.show('食谱已添加', 'success');
          renderDietRecipes();
        }
      });
    });
  }


  // ============================================
  // 运动模块
  // ============================================
  function renderExercise() {
    const content = document.getElementById('app-content');
    const records = DataManager.get('exerciseRecords');
    const todayRecords = DataManager.getTodayRecords('exerciseRecords');
    const weekGoal = DataManager.get('settings.weeklyExerciseGoal') || 5;
    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - weekStart.getDay());
    const weekRecords = DataManager.getRecordsByDateRange('exerciseRecords',
      weekStart.toISOString().slice(0, 10), new Date().toISOString().slice(0, 10));

    const exercisePlan = DataManager.get('exercisePlan');
    const currentPlan = exercisePlan.currentPlan || 'A';
    const currentExercises = exercisePlan[`plan${currentPlan}`] || [];

    // 每日推荐动作
    const dailyRecommendations = [
      { name: '深蹲', desc: '3组×15次', target: '臀腿' },
      { name: '俯卧撑', desc: '3组×12次', target: '胸臂' },
      { name: '平板支撑', desc: '3组×30秒', target: '核心' },
      { name: '卷腹', desc: '3组×20次', target: '腹肌' },
      { name: '弓步蹲', desc: '3组×12次/腿', target: '臀腿' }
    ];

    content.innerHTML = `
      <div class="page exercise-page">
        <div class="page-header">
          <h2>&#9917; 运动记录</h2>
          <button class="btn btn-primary btn-sm" id="btn-add-exercise">+ 记录</button>
        </div>

        <div class="stat-cards">
          <div class="stat-card">
            <div class="stat-value">${weekRecords.length}/${weekGoal}</div>
            <div class="stat-label">本周(次)</div>
            <div class="stat-bar"><div class="stat-bar-fill" style="width:${Math.min(100, weekRecords.length / weekGoal * 100)}%"></div></div>
          </div>
          <div class="stat-card">
            <div class="stat-value">${todayRecords.length > 0 ? '已完成' : '未完成'}</div>
            <div class="stat-label">今日运动</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">${records.length}</div>
            <div class="stat-label">累计(次)</div>
          </div>
        </div>

        <!-- A/B训练计划 -->
        <div class="card">
          <div class="card-header">
            <span class="card-title">&#128203; 训练计划</span>
            <div class="plan-toggle">
              <button class="btn btn-sm ${currentPlan === 'A' ? 'btn-primary' : 'btn-outline'}" id="btn-plan-a">A计划</button>
              <button class="btn btn-sm ${currentPlan === 'B' ? 'btn-primary' : 'btn-outline'}" id="btn-plan-b">B计划</button>
            </div>
          </div>
          ${currentExercises.length === 0
            ? '<div class="empty-state-sm">暂未设置，建议：A计划=上肢+核心，B计划=下肢+有氧</div>'
            : currentExercises.map((ex, i) => `
              <div class="routine-step">
                <span class="step-num">${i + 1}</span>
                <span class="step-text">${escapeHtml(ex.name)} - ${escapeHtml(ex.sets || '')}</span>
              </div>
            `).join('')
          }
        </div>

        <!-- 每日推荐 -->
        <div class="card">
          <div class="card-header"><span class="card-title">&#128170; 每日推荐动作</span></div>
          <div class="exercise-recommend-list">
            ${dailyRecommendations.map(ex => `
              <div class="exercise-recommend-item">
                <div>
                  <span class="exercise-name">${ex.name}</span>
                  <span class="exercise-desc">${ex.desc}</span>
                </div>
                <span class="tag tag-category">${ex.target}</span>
              </div>
            `).join('')}
          </div>
        </div>

        <!-- 运动记录 -->
        <div class="card-list" id="exercise-list">
          ${records.length === 0 ? '<div class="empty-state">暂无运动记录</div>' :
            records.slice(-10).reverse().map(r => `
              <div class="card record-card">
                <div class="record-header">
                  <span class="record-title">${escapeHtml(r.type || '运动')}</span>
                  <span class="record-date">${r.date || ''}</span>
                </div>
                <div class="record-tags">
                  <span class="tag tag-exercise">${r.duration || 0}分钟</span>
                  ${r.calories ? `<span class="tag tag-cal">${r.calories}千卡</span>` : ''}
                </div>
                ${r.notes ? `<p class="record-note">${escapeHtml(r.notes)}</p>` : ''}
              </div>
            `).join('')}
        </div>
      </div>
    `;

    document.getElementById('btn-add-exercise').addEventListener('click', () => {
      Modal.openForm({
        title: '添加运动记录',
        fields: [
          { name: 'type', label: '运动类型', type: 'select', required: true,
            options: ['有氧运动', '力量训练', '瑜伽', '游泳', '跑步', '骑行', '散步', '其他'] },
          { name: 'duration', label: '运动时长(分钟)', type: 'number', placeholder: '30', required: true },
          { name: 'calories', label: '消耗热量(千卡)', type: 'number', placeholder: '200' },
          { name: 'notes', label: '备注', type: 'textarea', placeholder: '运动感受、身体反应等' }
        ],
        onConfirm: (data) => {
          data.date = new Date().toISOString().slice(0, 10);
          DataManager.addRecord('exerciseRecords', data);
          Toast.show('运动记录已保存', 'success');
          renderExercise();
        }
      });
    });

    document.getElementById('btn-plan-a')?.addEventListener('click', () => {
      DataManager.set('exercisePlan.currentPlan', 'A');
      renderExercise();
    });
    document.getElementById('btn-plan-b')?.addEventListener('click', () => {
      DataManager.set('exercisePlan.currentPlan', 'B');
      renderExercise();
    });
  }


  // ============================================
  // 财务模块
  // ============================================
  function renderFinance() {
    const content = document.getElementById('app-content');
    const records = DataManager.get('financeRecords');
    const todayRecords = DataManager.getTodayRecords('financeRecords');
    const todayIncome = todayRecords.filter(r => r.type === 'income').reduce((s, r) => s + (parseFloat(r.amount) || 0), 0);
    const todayExpense = todayRecords.filter(r => r.type === 'expense').reduce((s, r) => s + (parseFloat(r.amount) || 0), 0);
    const budget = DataManager.get('settings.dailyBudget') || 100;

    // 本月统计
    const now = new Date();
    const monthRecords = DataManager.getMonthRecords('financeRecords', now.getFullYear(), now.getMonth() + 1);
    const monthExpense = monthRecords.filter(r => r.type === 'expense').reduce((s, r) => s + (parseFloat(r.amount) || 0), 0);
    const monthIncome = monthRecords.filter(r => r.type === 'income').reduce((s, r) => s + (parseFloat(r.amount) || 0), 0);

    // 花呗待还
    const huabeiPending = (DataManager.get('huabeiRecords') || []).filter(r => !r.paid).reduce((s, r) => s + (parseFloat(r.amount) || 0), 0);

    content.innerHTML = `
      <div class="page finance-page">
        <div class="page-header">
          <h2>&#9878; 财务管理</h2>
          <button class="btn btn-primary btn-sm" id="btn-add-finance">+ 记账</button>
        </div>

        <div class="stat-cards">
          <div class="stat-card">
            <div class="stat-value stat-expense">-${todayExpense.toFixed(0)}</div>
            <div class="stat-label">今日支出</div>
          </div>
          <div class="stat-card">
            <div class="stat-value stat-income">+${todayIncome.toFixed(0)}</div>
            <div class="stat-label">今日收入</div>
          </div>
          <div class="stat-card">
            <div class="stat-value ${todayExpense > budget ? 'stat-over' : ''}">${Math.max(0, budget - todayExpense).toFixed(0)}</div>
            <div class="stat-label">剩余预算</div>
          </div>
        </div>

        <!-- 本月概览 -->
        <div class="card">
          <div class="card-header"><span class="card-title">&#128202; ${now.getMonth() + 1}月概览</span></div>
          <div class="finance-summary">
            <div class="finance-summary-item">
              <span class="finance-label">收入</span>
              <span class="finance-value amount-income">+¥${monthIncome.toFixed(0)}</span>
            </div>
            <div class="finance-summary-item">
              <span class="finance-label">支出</span>
              <span class="finance-value amount-expense">-¥${monthExpense.toFixed(0)}</span>
            </div>
            <div class="finance-summary-item">
              <span class="finance-label">结余</span>
              <span class="finance-value ${(monthIncome - monthExpense) >= 0 ? 'amount-income' : 'amount-expense'}">${monthIncome - monthExpense >= 0 ? '+' : ''}¥${(monthIncome - monthExpense).toFixed(0)}</span>
            </div>
            ${huabeiPending > 0 ? `
            <div class="finance-summary-item">
              <span class="finance-label">花呗待还</span>
              <span class="finance-value amount-expense">-¥${huabeiPending.toFixed(0)}</span>
            </div>` : ''}
          </div>
        </div>

        <!-- 快速入口 -->
        <div class="quick-links">
          <div class="quick-link" data-route="purchase">
            <span class="quick-link-icon">&#128722;</span>
            <span class="quick-link-label">购买顾问</span>
          </div>
          <div class="quick-link" data-route="huabei">
            <span class="quick-link-icon">&#128179;</span>
            <span class="quick-link-label">花呗管理</span>
          </div>
        </div>

        <!-- 财务记录 -->
        <div class="card-list" id="finance-list">
          ${records.length === 0 ? '<div class="empty-state">暂无财务记录</div>' :
            records.slice(-15).reverse().map(r => `
              <div class="card record-card">
                <div class="record-header">
                  <span class="record-title">${escapeHtml(r.note || r.category || '未分类')}</span>
                  <span class="record-amount ${r.type === 'income' ? 'amount-income' : 'amount-expense'}">
                    ${r.type === 'income' ? '+' : '-'}${parseFloat(r.amount || 0).toFixed(2)}
                  </span>
                </div>
                <div class="record-tags">
                  <span class="tag tag-${r.type}">${r.type === 'income' ? '收入' : '支出'}</span>
                  <span class="tag tag-category">${escapeHtml(r.category || '')}</span>
                  <span class="tag tag-date-small">${r.date || ''}</span>
                </div>
              </div>
            `).join('')}
        </div>
      </div>
    `;

    document.getElementById('btn-add-finance').addEventListener('click', () => {
      Modal.openForm({
        title: '添加财务记录',
        fields: [
          { name: 'type', label: '类型', type: 'select', required: true,
            options: [{ value: 'expense', label: '支出' }, { value: 'income', label: '收入' }] },
          { name: 'amount', label: '金额(元)', type: 'number', placeholder: '0.00', required: true, step: '0.01' },
          { name: 'category', label: '分类', type: 'select',
            options: ['餐饮', '交通', '购物', '娱乐', '学习', '医疗', '护肤', '运动', '住房', '其他'] },
          { name: 'note', label: '备注', type: 'textarea', placeholder: '消费说明' },
          { name: 'huabei', label: '是否花呗支付', type: 'select', options: ['否', '是'] }
        ],
        onConfirm: (data) => {
          data.date = new Date().toISOString().slice(0, 10);
          data.amount = parseFloat(data.amount) || 0;
          DataManager.addRecord('financeRecords', data);
          // 如果是花呗支付，同步到花呗记录
          if (data.huabei === '是' && data.type === 'expense') {
            DataManager.addRecord('huabeiRecords', {
              date: data.date,
              amount: data.amount,
              desc: data.note || data.category || '消费',
              paid: false
            });
          }
          Toast.show('财务记录已保存', 'success');
          renderFinance();
        }
      });
    });

    content.querySelectorAll('.quick-link').forEach(link => {
      link.addEventListener('click', () => Router.navigate(link.getAttribute('data-route')));
    });
  }

  // 花呗管理
  function renderHuabei() {
    const content = document.getElementById('app-content');
    const records = DataManager.get('huabeiRecords');
    const settings = DataManager.get('huabeiSettings');
    const pending = records.filter(r => !r.paid);
    const pendingTotal = pending.reduce((s, r) => s + (parseFloat(r.amount) || 0), 0);
    const paidTotal = records.filter(r => r.paid).reduce((s, r) => s + (parseFloat(r.amount) || 0), 0);

    content.innerHTML = `
      <div class="page">
        <div class="page-header">
          <button class="btn btn-outline btn-sm" onclick="Router.navigate('finance')">&#8592; 返回</button>
          <h2>&#128179; 花呗管理</h2>
          <button class="btn btn-primary btn-sm" id="btn-add-huabei">+ 记录</button>
        </div>

        <div class="stat-cards">
          <div class="stat-card">
            <div class="stat-value stat-expense">¥${pendingTotal.toFixed(0)}</div>
            <div class="stat-label">待还</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">¥${paidTotal.toFixed(0)}</div>
            <div class="stat-label">已还</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">¥${settings.totalQuota}</div>
            <div class="stat-label">额度</div>
          </div>
        </div>

        <div class="card">
          <div class="card-header"><span class="card-title">&#9881; 花呗设置</span></div>
          <div class="huabei-settings">
            <p>账单日：每月 ${settings.billingDay} 日</p>
            <p>还款日：每月 ${settings.repaymentDay} 日</p>
            <p>可用额度：¥${(settings.totalQuota - pendingTotal).toFixed(0)}</p>
            ${pendingTotal > 0 ? `<p class="huabei-warning">&#9888; 待还 ¥${pendingTotal.toFixed(2)}，请及时还款</p>` : ''}
          </div>
        </div>

        <div class="card-list">
          ${records.length === 0 ? '<div class="empty-state">暂无花呗记录</div>' :
            records.slice(-15).reverse().map(r => `
              <div class="card record-card">
                <div class="record-header">
                  <span class="record-title">${escapeHtml(r.desc || '消费')}</span>
                  <span class="record-amount amount-expense">¥${parseFloat(r.amount || 0).toFixed(2)}</span>
                </div>
                <div class="record-tags">
                  <span class="tag tag-date-small">${r.date || ''}</span>
                  <span class="tag tag-${r.paid ? 'good' : 'warning'}">${r.paid ? '已还' : '待还'}</span>
                  ${!r.paid ? `<button class="btn btn-outline btn-sm btn-mark-paid" data-id="${r.id}">标记已还</button>` : ''}
                </div>
              </div>
            `).join('')}
        </div>
      </div>
    `;

    document.getElementById('btn-add-huabei').addEventListener('click', () => {
      Modal.openForm({
        title: '添加花呗记录',
        fields: [
          { name: 'desc', label: '消费描述', type: 'text', required: true, placeholder: '如：网购衣服' },
          { name: 'amount', label: '金额(元)', type: 'number', required: true, step: '0.01', placeholder: '0.00' },
          { name: 'date', label: '日期', type: 'date', value: new Date().toISOString().slice(0, 10) }
        ],
        onConfirm: (data) => {
          data.paid = false;
          DataManager.addRecord('huabeiRecords', data);
          Toast.show('花呗记录已添加', 'success');
          renderHuabei();
        }
      });
    });

    content.querySelectorAll('.btn-mark-paid').forEach(btn => {
      btn.addEventListener('click', () => {
        DataManager.updateRecord('huabeiRecords', btn.getAttribute('data-id'), { paid: true });
        Toast.show('已标记为已还', 'success');
        renderHuabei();
      });
    });
  }


  // ============================================
  // 购买顾问模块
  // ============================================
  function renderPurchaseAdvisor() {
    const content = document.getElementById('app-content');
    const history = DataManager.get('purchaseRequests');

    content.innerHTML = `
      <div class="page purchase-page">
        <div class="page-header">
          <button class="btn btn-outline btn-sm" onclick="Router.navigate('finance')">&#8592; 返回</button>
          <h2>&#128722; 购买顾问</h2>
        </div>

        <div class="card purchase-intro-card">
          <div class="card-header"><span class="card-title">&#129504; 智能购买决策</span></div>
          <p class="card-desc">填写你想买的商品信息，系统将分析是否值得购买。如果建议不买，还会推荐替代品和对比分析。</p>
          <p class="card-note">分析维度：需求程度、预算匹配、使用频率、替代方案、紧急程度、性价比</p>
        </div>

        <button class="btn btn-primary btn-block" id="btn-new-purchase">开始新的购买咨询</button>

        <!-- 历史记录 -->
        <div class="card-list mt-16">
          <h3 class="section-title">历史咨询</h3>
          ${history.length === 0 ? '<div class="empty-state">暂无咨询记录</div>' :
            history.slice(-10).reverse().map(r => `
              <div class="card record-card purchase-history-card">
                <div class="record-header">
                  <span class="record-title">${escapeHtml(r.itemName)}</span>
                  <span class="tag tag-${r.status === 'reject' ? 'warning' : r.status === 'delay' ? 'caution' : 'good'}">
                    ${r.analysis?.recommendation || ''}
                  </span>
                </div>
                <div class="record-tags">
                  <span class="tag tag-expense">¥${r.price || 0}</span>
                  <span class="tag tag-category">${escapeHtml(r.category || '')}</span>
                  <span class="tag tag-date-small">${r.date || ''}</span>
                </div>
                ${r.analysis?.againstReasons?.length ? `
                  <div class="purchase-reasons">
                    ${r.analysis.againstReasons.map(reason => `<p class="reason-against">&#10007; ${escapeHtml(reason)}</p>`).join('')}
                  </div>` : ''}
              </div>
            `).join('')}
        </div>
      </div>
    `;

    document.getElementById('btn-new-purchase').addEventListener('click', () => {
      Modal.openForm({
        title: '购买咨询',
        fields: [
          { name: 'itemName', label: '商品名称', type: 'text', required: true, placeholder: '你想买什么？' },
          { name: 'price', label: '价格(元)', type: 'number', required: true, step: '0.01', placeholder: '0.00' },
          { name: 'category', label: '商品类别', type: 'select',
            options: ['电子产品', '护肤美容', '服饰鞋包', '书籍文具', '生活用品', '其他'] },
          { name: 'reason', label: '购买理由', type: 'textarea', required: true,
            placeholder: '为什么想买？详细描述你的理由...' },
          { name: 'urgency', label: '紧急程度', type: 'select',
            options: [{ value: 'low', label: '不急' }, { value: 'medium', label: '一般' }, { value: 'high', label: '很急' }] },
          { name: 'monthlyIncome', label: '本月收入(元)', type: 'number', placeholder: '不填则使用预算估算' }
        ],
        onConfirm: (data) => {
          data.price = parseFloat(data.price) || 0;
          data.monthlyIncome = parseFloat(data.monthlyIncome) || 0;
          const analysis = PurchaseAdvisor.analyze(data);
          PurchaseAdvisor.saveRequest(data, analysis);
          showPurchaseResult(data, analysis);
        }
      });
    });
  }

  function showPurchaseResult(request, analysis) {
    const statusColor = analysis.action === 'reject' ? 'warning' : analysis.action === 'delay' ? 'caution' : 'good';
    const statusIcon = analysis.action === 'reject' ? '&#10007;' : analysis.action === 'delay' ? '&#9888;' : '&#10003;';

    // 替代品列表
    let alternativesHtml = '';
    if (analysis.alternatives && analysis.alternatives.length > 0) {
      alternativesHtml = `
        <div class="card alternatives-card">
          <div class="card-header"><span class="card-title">&#128260; 替代品推荐</span></div>
          <p class="card-desc">${analysis.hasStrongDesire ? '我知道你很想买，如果确实有刚需，请认真考虑以下替代方案，能帮你省下不少钱：' : '如果确实有实际需求，可参考以下替代方案：'}</p>
          ${analysis.alternatives.map((alt, idx) => `
            <div class="alternative-item ${idx === 0 ? 'alt-top-pick' : ''}">
              <div class="alternative-header">
                <span class="alternative-name">${alt.name}${idx === 0 ? ' <span class="tag tag-good">推荐</span>' : ''}</span>
                <span class="tag tag-good">省 ¥${alt.savings}</span>
              </div>
              <p class="alternative-desc">${alt.desc}</p>
              <div class="alternative-price">
                <span class="price-original">原价 ¥${request.price}</span>
                <span class="price-suggested">建议 ¥${alt.suggestedPrice}</span>
                <span class="price-save-rate">省${(alt.saveRatio * 100).toFixed(0)}%</span>
              </div>
              <div class="alt-detail-grid">
                <div class="alt-detail"><span class="alt-detail-label">品质评估</span><span class="alt-detail-val">${alt.quality}</span></div>
                <div class="alt-detail"><span class="alt-detail-label">适合人群</span><span class="alt-detail-val">${alt.suitableFor}</span></div>
              </div>
              <div class="alt-pros-cons">
                <div class="alt-pros">
                  <span class="alt-pros-label">&#10003; 优点</span>
                  <ul>${alt.pros.map(p => `<li>${p}</li>`).join('')}</ul>
                </div>
                <div class="alt-cons">
                  <span class="alt-cons-label">&#10007; 缺点</span>
                  <ul>${alt.cons.map(c => `<li>${c}</li>`).join('')}</ul>
                </div>
              </div>
            </div>
          `).join('')}
        </div>
      `;
    }

    // 全面对比分析表 - 原商品 vs 所有替代品
    let comparisonHtml = '';
    if (analysis.alternatives && analysis.alternatives.length > 0) {
      const alts = analysis.alternatives;
      // 判断原商品是否推荐
      const origRecommend = analysis.action === 'approve' && !analysis.hasStrongDesire;
      // 计算最多展示的替代品数（含原商品最多5列，移动端可横向滚动）
      const showAlts = alts.slice(0, 3);

      comparisonHtml = `
        <div class="card comparison-card">
          <div class="card-header"><span class="card-title">&#128202; 全面对比分析</span></div>
          <p class="card-note">左右滑动查看完整对比 &rarr;</p>
          <div class="comparison-table-scroll">
            <div class="comparison-table-wide">
              <!-- 表头 -->
              <div class="cmp-row cmp-header">
                <div class="cmp-cell cmp-label">对比项</div>
                <div class="cmp-cell ${origRecommend ? 'cmp-best' : 'cmp-warn'}">
                  <div class="cmp-name">${escapeHtml(request.itemName)}</div>
                  <div class="cmp-price">¥${request.price}</div>
                  <span class="tag ${origRecommend ? 'tag-good' : 'tag-warning'}">${origRecommend ? '可考虑' : '不推荐'}</span>
                </div>
                ${showAlts.map((alt, i) => `
                  <div class="cmp-cell ${i === 0 ? 'cmp-best' : ''}">
                    <div class="cmp-name">${escapeHtml(alt.name)}</div>
                    <div class="cmp-price">¥${alt.suggestedPrice}</div>
                    <span class="tag ${i === 0 ? 'tag-good' : 'tag-normal'}">${i === 0 ? '推荐' : '备选'}</span>
                  </div>
                `).join('')}
              </div>
              <!-- 节省金额 -->
              <div class="cmp-row">
                <div class="cmp-cell cmp-label">节省金额</div>
                <div class="cmp-cell">-</div>
                ${showAlts.map(alt => `<div class="cmp-cell ${alt === showAlts[0] ? 'cmp-best' : ''}"><span class="amount-income">¥${alt.savings}</span></div>`).join('')}
              </div>
              <!-- 节省比例 -->
              <div class="cmp-row">
                <div class="cmp-cell cmp-label">节省比例</div>
                <div class="cmp-cell">-</div>
                ${showAlts.map(alt => `<div class="cmp-cell ${alt === showAlts[0] ? 'cmp-best' : ''}">${(alt.saveRatio * 100).toFixed(0)}%</div>`).join('')}
              </div>
              <!-- 品质评估 -->
              <div class="cmp-row">
                <div class="cmp-cell cmp-label">品质评估</div>
                <div class="cmp-cell">100%（全新）</div>
                ${showAlts.map(alt => `<div class="cmp-cell ${alt === showAlts[0] ? 'cmp-best' : ''}">${escapeHtml(alt.quality)}</div>`).join('')}
              </div>
              <!-- 核心优点 -->
              <div class="cmp-row">
                <div class="cmp-cell cmp-label">核心优点</div>
                <div class="cmp-cell">${origRecommend ? '全新正品、完整体验' : '全新正品、品牌溢价'}</div>
                ${showAlts.map(alt => `<div class="cmp-cell ${alt === showAlts[0] ? 'cmp-best' : ''}">${escapeHtml(alt.pros[0])}</div>`).join('')}
              </div>
              <!-- 主要缺点 -->
              <div class="cmp-row">
                <div class="cmp-cell cmp-label">主要缺点</div>
                <div class="cmp-cell">${origRecommend ? '支出较大' : '价格高、性价比低'}</div>
                ${showAlts.map(alt => `<div class="cmp-cell ${alt === showAlts[0] ? 'cmp-best' : ''}">${escapeHtml(alt.cons[0])}</div>`).join('')}
              </div>
              <!-- 适合人群 -->
              <div class="cmp-row">
                <div class="cmp-cell cmp-label">适合人群</div>
                <div class="cmp-cell">${origRecommend ? '预算充足、确有需求' : '预算充足、追求品牌'}</div>
                ${showAlts.map(alt => `<div class="cmp-cell ${alt === showAlts[0] ? 'cmp-best' : ''}">${escapeHtml(alt.suitableFor)}</div>`).join('')}
              </div>
              <!-- 购买渠道 -->
              <div class="cmp-row">
                <div class="cmp-cell cmp-label">购买渠道</div>
                <div class="cmp-cell">官方/旗舰店</div>
                ${showAlts.map((alt, i) => {
                  const channels = ['二手平台/官翻', '二手/闲鱼', '竞品店铺'];
                  return `<div class="cmp-cell ${i === 0 ? 'cmp-best' : ''}">${escapeHtml(channels[i] || '多渠道')}</div>`;
                }).join('')}
              </div>
              <!-- 售后保障 -->
              <div class="cmp-row">
                <div class="cmp-cell cmp-label">售后保障</div>
                <div class="cmp-cell">完整官方质保</div>
                ${showAlts.map((alt, i) => {
                  const warranties = ['官方质保/短期', '视渠道而定', '品牌质保'];
                  return `<div class="cmp-cell ${i === 0 ? 'cmp-best' : ''}">${escapeHtml(warranties[i] || '视情况')}</div>`;
                }).join('')}
              </div>
              <!-- 综合评分 -->
              <div class="cmp-row cmp-row-final">
                <div class="cmp-cell cmp-label">综合评分</div>
                <div class="cmp-cell">
                  <span class="tag ${origRecommend ? 'tag-good' : 'tag-warning'}">${origRecommend ? '★★★' : '★★'}</span>
                </div>
                ${showAlts.map((alt, i) => {
                  const stars = i === 0 ? '★★★★' : i === 1 ? '★★★' : '★★★';
                  return `<div class="cmp-cell ${i === 0 ? 'cmp-best' : ''}"><span class="tag tag-good">${stars}</span></div>`;
                }).join('')}
              </div>
            </div>
          </div>
        </div>
      `;
    }

    // 强烈欲望提示
    let desireWarningHtml = '';
    if (analysis.hasStrongDesire) {
      desireWarningHtml = `
        <div class="card desire-warning-card">
          <div class="card-header"><span class="card-title">&#9888;&#65039; 冲动消费预警</span></div>
          <p class="card-desc">检测到你对此商品有强烈的购买欲望。心理学研究表明，强烈的购物冲动通常源于多巴胺分泌，而非真实需求。</p>
          <p class="card-note">建议：请等待 72 小时，如果届时仍然觉得「必须买」，再参考上方替代品方案做出理性选择。</p>
        </div>
      `;
    }

    const content = `
      <div class="purchase-result">
        <div class="result-score-card card">
          <div class="result-score-icon ${statusColor}">${statusIcon}</div>
          <div class="result-score-text">
            <h3>${analysis.recommendation}</h3>
            <p class="card-note">不推荐度评分：${analysis.score}/100（越高越不建议买）</p>
          </div>
        </div>

        ${analysis.finalAdvice ? `
        <div class="card final-advice-card">
          <div class="card-header"><span class="card-title">&#128161; 综合建议</span></div>
          <p class="card-desc">${escapeHtml(analysis.finalAdvice)}</p>
        </div>` : ''}

        ${analysis.againstReasons.length > 0 ? `
        <div class="card">
          <div class="card-header"><span class="card-title">&#10007; 不建议购买的理由</span></div>
          <div class="reasons-list">
            ${analysis.againstReasons.map(reason => `<p class="reason-against">&#10007; ${escapeHtml(reason)}</p>`).join('')}
          </div>
        </div>` : ''}

        ${analysis.forReasons.length > 0 ? `
        <div class="card">
          <div class="card-header"><span class="card-title">&#10003; 支持购买的理由</span></div>
          <div class="reasons-list">
            ${analysis.forReasons.map(reason => `<p class="reason-for">&#10003; ${escapeHtml(reason)}</p>`).join('')}
          </div>
        </div>` : ''}

        ${desireWarningHtml}

        <div class="card">
          <div class="card-header"><span class="card-title">&#128202; 财务状况</span></div>
          <div class="finance-summary">
            <div class="finance-summary-item">
              <span class="finance-label">商品价格</span>
              <span class="finance-value amount-expense">¥${analysis.financeSummary.price}</span>
            </div>
            <div class="finance-summary-item">
              <span class="finance-label">占月收入</span>
              <span class="finance-value">${analysis.financeSummary.priceRatio}</span>
            </div>
            <div class="finance-summary-item">
              <span class="finance-label">本月已支出</span>
              <span class="finance-value amount-expense">¥${analysis.financeSummary.monthExpenses.toFixed(0)}</span>
            </div>
            <div class="finance-summary-item">
              <span class="finance-label">本月支出占比</span>
              <span class="finance-value">${analysis.financeSummary.monthSpentRatio}</span>
            </div>
            ${analysis.financeSummary.huabeiPending > 0 ? `
            <div class="finance-summary-item">
              <span class="finance-label">花呗待还</span>
              <span class="finance-value amount-expense">¥${analysis.financeSummary.huabeiPending.toFixed(0)}</span>
            </div>` : ''}
          </div>
        </div>

        ${alternativesHtml}
        ${comparisonHtml}

        <div class="purchase-actions">
          <button class="btn btn-default btn-block" id="btn-purchase-back">返回</button>
        </div>
      </div>
    `;

    Modal.open({
      title: '购买分析结果',
      content,
      hideFooter: true
    });

    setTimeout(() => {
      document.getElementById('btn-purchase-back')?.addEventListener('click', () => {
        Modal.close();
        renderPurchaseAdvisor();
      });
    }, 100);
  }


  // ============================================
  // 战略规划模块
  // ============================================
  function renderStrategy() {
    const content = document.getElementById('app-content');
    const milestones = DataManager.get('milestoneProgress');
    const fiveYear = DataManager.get('fiveYearPlan');
    const riskPlans = DataManager.get('riskPlans');

    content.innerHTML = `
      <div class="page strategy-page">
        <div class="page-header">
          <h2>&#9733; 战略规划</h2>
          <button class="btn btn-outline btn-sm" onclick="Router.navigate('settings')">&#9881;</button>
        </div>

        <!-- 计划体系 -->
        <div class="card">
          <div class="card-header"><span class="card-title">&#128203; 计划体系</span></div>
          <div class="strategy-nav">
            <button class="btn btn-outline btn-sm" onclick="Router.navigate('plan-daily')">&#128197; 日计划</button>
            <button class="btn btn-outline btn-sm" onclick="Router.navigate('plan-weekly')">&#128198; 周计划</button>
            <button class="btn btn-outline btn-sm" onclick="Router.navigate('plan-monthly')">&#128203; 月计划</button>
            <button class="btn btn-outline btn-sm" onclick="Router.navigate('plan-yearly')">&#127942; 年度计划</button>
          </div>
        </div>

        <!-- 总结复盘 -->
        <div class="card">
          <div class="card-header"><span class="card-title">&#128221; 总结复盘</span></div>
          <div class="strategy-nav">
            <button class="btn btn-outline btn-sm" onclick="Router.navigate('review-daily')">日复盘</button>
            <button class="btn btn-outline btn-sm" onclick="Router.navigate('review-weekly')">周复盘</button>
            <button class="btn btn-outline btn-sm" onclick="Router.navigate('review-monthly')">月复盘</button>
            <button class="btn btn-outline btn-sm" onclick="Router.navigate('review-yearly')">半年复盘</button>
          </div>
        </div>

        <!-- 快速入口 -->
        <div class="quick-links">
          <div class="quick-link" data-route="strategy-five-year">
            <span class="quick-link-icon">&#127942;</span>
            <span class="quick-link-label">五年计划</span>
          </div>
          <div class="quick-link" data-route="strategy-risk">
            <span class="quick-link-icon">&#9888;</span>
            <span class="quick-link-label">风险预案</span>
          </div>
          <div class="quick-link" data-route="strategy-five-year-detail">
            <span class="quick-link-icon">&#128200;</span>
            <span class="quick-link-label">五年计划详情</span>
          </div>
        </div>

        <!-- 里程碑 -->
        <div class="card">
          <div class="card-header">
            <span class="card-title">&#127937; 里程碑</span>
            <button class="btn btn-outline btn-sm" id="btn-add-milestone">+ 添加</button>
          </div>
          ${milestones.length === 0 ? '<div class="empty-state-sm">暂无里程碑</div>' :
            milestones.map(m => `
              <div class="card record-card milestone-card">
                <div class="record-header">
                  <span class="record-title">${escapeHtml(m.title || '未命名')}</span>
                  <span class="record-date">${m.targetDate || ''}</span>
                </div>
                <div class="progress-bar">
                  <div class="progress-fill" style="width:${m.progress || 0}%"></div>
                </div>
                <div class="record-tags">
                  <span class="tag tag-progress">${m.progress || 0}%</span>
                </div>
                ${m.milestones?.length ? `
                  <ul class="milestone-list">
                    ${m.milestones.map(ms => `
                      <li class="${ms.done ? 'done' : ''}">${ms.done ? '&#10003;' : '&#9744;'} ${escapeHtml(ms.text)}</li>
                    `).join('')}
                  </ul>` : ''}
              </div>
            `).join('')}
        </div>
      </div>
    `;

    document.getElementById('btn-add-milestone').addEventListener('click', () => {
      Modal.openForm({
        title: '添加里程碑',
        fields: [
          { name: 'title', label: '目标名称', type: 'text', required: true, placeholder: '如：保研成功' },
          { name: 'targetDate', label: '目标日期', type: 'date', required: true },
          { name: 'progress', label: '当前进度(%)', type: 'number', placeholder: '0', min: 0, max: 100 },
          { name: 'milestones', label: '关键节点(每行一个)', type: 'textarea', placeholder: '完成基础知识\n做完习题集\n模拟考试' }
        ],
        onConfirm: (data) => {
          data.progress = parseInt(data.progress) || 0;
          data.milestones = data.milestones
            ? data.milestones.split('\n').filter(Boolean).map(text => ({ text, done: false }))
            : [];
          DataManager.addRecord('milestoneProgress', data);
          Toast.show('里程碑已添加', 'success');
          renderStrategy();
        }
      });
    });

    content.querySelectorAll('.quick-link').forEach(link => {
      link.addEventListener('click', () => Router.navigate(link.getAttribute('data-route')));
    });
  }

  // 五年计划
  function renderFiveYearPlan() {
    const content = document.getElementById('app-content');
    const plans = DataManager.get('fiveYearPlan');
    const currentYear = new Date().getFullYear();

    content.innerHTML = `
      <div class="page">
        <div class="page-header">
          <button class="btn btn-outline btn-sm" onclick="Router.navigate('strategy')">&#8592; 返回</button>
          <h2>&#127942; 五年计划</h2>
          <button class="btn btn-primary btn-sm" id="btn-add-five-year">+ 添加</button>
        </div>

        ${plans.length === 0 ? '<div class="empty-state">暂无五年计划<br>建议按年规划：学业、职业、财务、健康、个人成长</div>' :
          plans.map(p => `
            <div class="card record-card">
              <div class="record-header">
                <span class="record-title">${escapeHtml(p.year || '')}年：${escapeHtml(p.title || '未命名')}</span>
                <span class="tag tag-${p.status === '完成' ? 'good' : p.status === '进行中' ? 'info' : 'normal'}">${p.status || '计划中'}</span>
              </div>
              ${p.goal ? `<p class="record-content">目标：${escapeHtml(p.goal)}</p>` : ''}
              ${p.actions ? `<p class="record-content">行动：${escapeHtml(p.actions)}</p>` : ''}
              <div class="progress-bar"><div class="progress-fill" style="width:${p.progress || 0}%"></div></div>
              <span class="tag tag-progress">${p.progress || 0}%</span>
            </div>
          `).join('')
        }
      </div>
    `;

    document.getElementById('btn-add-five-year').addEventListener('click', () => {
      Modal.openForm({
        title: '添加五年计划',
        fields: [
          { name: 'year', label: '年份', type: 'number', required: true, value: currentYear },
          { name: 'title', label: '年度主题', type: 'text', required: true, placeholder: '如：保研冲刺年' },
          { name: 'goal', label: '年度目标', type: 'textarea', placeholder: '今年要达成的目标' },
          { name: 'actions', label: '具体行动', type: 'textarea', placeholder: '每行一个行动项' },
          { name: 'progress', label: '当前进度(%)', type: 'number', min: 0, max: 100, placeholder: '0' },
          { name: 'status', label: '状态', type: 'select', options: ['计划中', '进行中', '完成', '暂停'] }
        ],
        onConfirm: (data) => {
          data.progress = parseInt(data.progress) || 0;
          DataManager.addRecord('fiveYearPlan', data);
          Toast.show('五年计划已添加', 'success');
          renderFiveYearPlan();
        }
      });
    });
  }

  // 风险预案
  function renderRiskPlans() {
    const content = document.getElementById('app-content');
    const plans = DataManager.get('riskPlans');

    content.innerHTML = `
      <div class="page">
        <div class="page-header">
          <button class="btn btn-outline btn-sm" onclick="Router.navigate('strategy')">&#8592; 返回</button>
          <h2>&#9888; 风险预案</h2>
          <button class="btn btn-primary btn-sm" id="btn-add-risk">+ 预案</button>
        </div>

        ${plans.length === 0 ? '<div class="empty-state">暂无风险预案<br>建议规划：健康风险、财务风险、学业风险、职业风险</div>' :
          plans.map(p => `
            <div class="card record-card">
              <div class="record-header">
                <span class="record-title">${escapeHtml(p.title)}</span>
                <span class="tag tag-${p.level === '高' ? 'warning' : p.level === '中' ? 'caution' : 'good'}">${p.level || '低'}风险</span>
              </div>
              ${p.scenario ? `<p class="record-content">风险场景：${escapeHtml(p.scenario)}</p>` : ''}
              ${p.plan ? `<p class="record-content">应对方案：${escapeHtml(p.plan)}</p>` : ''}
              ${p.trigger ? `<p class="record-note">触发条件：${escapeHtml(p.trigger)}</p>` : ''}
            </div>
          `).join('')
        }
      </div>
    `;

    document.getElementById('btn-add-risk').addEventListener('click', () => {
      Modal.openForm({
        title: '添加风险预案',
        fields: [
          { name: 'title', label: '风险名称', type: 'text', required: true, placeholder: '如：健康突发状况' },
          { name: 'level', label: '风险等级', type: 'select', options: ['高', '中', '低'] },
          { name: 'scenario', label: '风险场景', type: 'textarea', placeholder: '描述可能发生的情况' },
          { name: 'trigger', label: '触发条件', type: 'textarea', placeholder: '什么情况下启动预案' },
          { name: 'plan', label: '应对方案', type: 'textarea', placeholder: '具体的应对措施' }
        ],
        onConfirm: (data) => {
          DataManager.addRecord('riskPlans', data);
          Toast.show('风险预案已添加', 'success');
          renderRiskPlans();
        }
      });
    });
  }


  // ============================================
  // 计划子页面
  // ============================================
  function renderPlanPage(category, title, icon) {
    const content = document.getElementById('app-content');
    const plans = DataManager.get(category);

    content.innerHTML = `
      <div class="page plan-page">
        <div class="page-header">
          <button class="btn btn-outline btn-sm" onclick="Router.navigate('strategy')">&#8592; 返回</button>
          <h2>${icon} ${title}</h2>
          <button class="btn btn-primary btn-sm" id="btn-add-plan">+ 添加</button>
        </div>

        <div class="card-list" id="plan-list">
          ${plans.length === 0 ? `<div class="empty-state">暂无${title}，点击添加</div>` :
            plans.map(p => `
              <div class="card record-card plan-card">
                <div class="plan-check" data-id="${p.id}">${p.done ? '&#10003;' : '&#9744;'}</div>
                <div class="plan-content">
                  <span class="record-title ${p.done ? 'done' : ''}">${escapeHtml(p.title || '')}</span>
                  ${p.desc ? `<p class="record-note">${escapeHtml(p.desc)}</p>` : ''}
                  <div class="record-tags">
                    ${p.priority ? `<span class="tag tag-priority-${p.priority}">${p.priority === 'high' ? '高' : p.priority === 'medium' ? '中' : '低'}</span>` : ''}
                    ${p.date ? `<span class="tag tag-date-small">${p.date}</span>` : ''}
                  </div>
                </div>
                <button class="btn-delete" data-id="${p.id}">&#10007;</button>
              </div>
            `).join('')}
        </div>
      </div>
    `;

    document.getElementById('btn-add-plan').addEventListener('click', () => {
      Modal.openForm({
        title: `添加${title}`,
        fields: [
          { name: 'title', label: '计划内容', type: 'text', required: true, placeholder: '要做什么...' },
          { name: 'desc', label: '详细说明', type: 'textarea', placeholder: '补充描述（可选）' },
          { name: 'priority', label: '优先级', type: 'select',
            options: [{ value: 'high', label: '高' }, { value: 'medium', label: '中' }, { value: 'low', label: '低' }] },
          { name: 'date', label: '截止日期', type: 'date' }
        ],
        onConfirm: (data) => {
          data.done = false;
          DataManager.addRecord(category, data);
          Toast.show('计划已添加', 'success');
          renderPlanPage(category, title, icon);
        }
      });
    });

    content.querySelectorAll('.plan-check').forEach(el => {
      el.addEventListener('click', () => {
        const id = el.getAttribute('data-id');
        const plan = plans.find(p => p.id === id);
        if (plan) {
          DataManager.updateRecord(category, id, { done: !plan.done });
          renderPlanPage(category, title, icon);
        }
      });
    });

    content.querySelectorAll('.btn-delete').forEach(el => {
      el.addEventListener('click', () => {
        const id = el.getAttribute('data-id');
        Modal.open({
          title: '确认删除', content: '<p>确定要删除这条计划吗？</p>', type: 'danger',
          onConfirm: () => {
            DataManager.deleteRecord(category, id);
            Toast.show('已删除', 'info');
            renderPlanPage(category, title, icon);
          }
        });
      });
    });
  }

  function renderPlanDaily() { renderPlanPage('dailyPlans', '日计划', '&#128197;'); }
  function renderPlanWeekly() { renderPlanPage('weeklyPlans', '周计划', '&#128198;'); }
  function renderPlanMonthly() { renderPlanPage('monthlyPlans', '月计划', '&#128203;'); }
  function renderPlanYearly() { renderPlanPage('yearlyPlans', '年计划', '&#127942;'); }


  // ============================================
  // 总结复盘
  // ============================================
  function renderReviewPage(category, title, icon) {
    const content = document.getElementById('app-content');
    const reviews = DataManager.get(category);

    content.innerHTML = `
      <div class="page">
        <div class="page-header">
          <button class="btn btn-outline btn-sm" onclick="Router.navigate('strategy')">&#8592; 返回</button>
          <h2>${icon} ${title}</h2>
          <button class="btn btn-primary btn-sm" id="btn-add-review">+ 复盘</button>
        </div>

        <div class="card-list">
          ${reviews.length === 0 ? `<div class="empty-state">暂无${title}记录</div>` :
            reviews.slice(-10).reverse().map(r => `
              <div class="card record-card">
                <div class="record-header">
                  <span class="record-title">${r.date || ''}</span>
                  ${r.score ? `<span class="tag tag-progress">评分 ${r.score}/10</span>` : ''}
                </div>
                ${r.done ? `<p class="record-content"><strong>完成事项：</strong>${escapeHtml(r.done)}</p>` : ''}
                ${r.undone ? `<p class="record-content"><strong>未完成：</strong>${escapeHtml(r.undone)}</p>` : ''}
                ${r.improve ? `<p class="record-note"><strong>改进：</strong>${escapeHtml(r.improve)}</p>` : ''}
                ${r.reflection ? `<p class="record-note">${escapeHtml(r.reflection)}</p>` : ''}
              </div>
            `).join('')}
        </div>
      </div>
    `;

    document.getElementById('btn-add-review').addEventListener('click', () => {
      Modal.openForm({
        title: `添加${title}`,
        fields: [
          { name: 'date', label: '日期', type: 'date', value: new Date().toISOString().slice(0, 10), required: true },
          { name: 'done', label: '完成事项', type: 'textarea', placeholder: '完成了哪些事' },
          { name: 'undone', label: '未完成事项', type: 'textarea', placeholder: '哪些没做完' },
          { name: 'improve', label: '改进方向', type: 'textarea', placeholder: '下次如何改进' },
          { name: 'reflection', label: '心得反思', type: 'textarea', placeholder: '其他感悟' },
          { name: 'score', label: '自评(1-10)', type: 'number', min: 1, max: 10, placeholder: '7' }
        ],
        onConfirm: (data) => {
          data.score = parseInt(data.score) || 0;
          DataManager.addRecord(category, data);
          Toast.show('复盘已保存', 'success');
          renderReviewPage(category, title, icon);
        }
      });
    });
  }

  function renderReviewDaily()   { renderReviewPage('dailyReviews', '日复盘', '&#128197;'); }
  function renderReviewWeekly()  { renderReviewPage('weeklyReviews', '周复盘', '&#128198;'); }
  function renderReviewMonthly() { renderReviewPage('monthlyReviews', '月复盘', '&#128203;'); }
  function renderReviewYearly()  { renderReviewPage('yearlyReviews', '半年复盘', '&#127942;'); }


  // ============================================
  // 设置页面
  // ============================================
  function renderSettings() {
    const content = document.getElementById('app-content');
    const profile = DataManager.get('profile');
    const settings = DataManager.get('settings');

    content.innerHTML = `
      <div class="page settings-page">
        <div class="page-header">
          <button class="btn btn-outline btn-sm" onclick="Router.navigate('home')">&#8592; 返回</button>
          <h2>&#9881; 设置</h2>
        </div>

        <div class="card">
          <div class="card-header"><span class="card-title">&#128100; 个人信息</span></div>
          <div class="settings-list">
            <div class="settings-item"><span class="settings-label">昵称</span><span class="settings-value">${escapeHtml(profile.nickname || '未设置')}</span></div>
            <div class="settings-item"><span class="settings-label">体质</span><span class="settings-value">${escapeHtml(profile.constitution || '未设置')}</span></div>
            <div class="settings-item"><span class="settings-label">生日</span><span class="settings-value">${escapeHtml(profile.birthday || '未设置')}</span></div>
            <div class="settings-item"><span class="settings-label">身高</span><span class="settings-value">${profile.height || '-'}</span></div>
            <div class="settings-item"><span class="settings-label">体重</span><span class="settings-value">${profile.weight || '-'}</span></div>
          </div>
          <button class="btn btn-outline btn-sm btn-block mt-8" id="btn-edit-profile">编辑信息</button>
        </div>

        <div class="card">
          <div class="card-header"><span class="card-title">&#9881; 目标设置</span></div>
          <div class="settings-list">
            <div class="settings-item"><span class="settings-label">每日预算</span><span class="settings-value">¥${settings.dailyBudget}</span></div>
            <div class="settings-item"><span class="settings-label">热量目标</span><span class="settings-value">${settings.dailyCalorieTarget}千卡</span></div>
            <div class="settings-item"><span class="settings-label">饮水目标</span><span class="settings-value">${settings.dailyWaterTarget}杯</span></div>
            <div class="settings-item"><span class="settings-label">每周运动</span><span class="settings-value">${settings.weeklyExerciseGoal}次</span></div>
            <div class="settings-item"><span class="settings-label">每日学习</span><span class="settings-value">${settings.studyHourGoal}小时</span></div>
          </div>
          <button class="btn btn-outline btn-sm btn-block mt-8" id="btn-edit-goals">修改目标</button>
        </div>

        <div class="card">
          <div class="card-header"><span class="card-title">&#128190; 数据管理</span></div>
          <button class="btn btn-outline btn-sm btn-block mb-8" id="btn-export-data">导出数据</button>
          <button class="btn btn-outline btn-sm btn-block mb-8" id="btn-import-data">导入数据</button>
          <button class="btn btn-danger btn-sm btn-block" id="btn-clear-data">清除所有数据</button>
        </div>

        <div class="card">
          <div class="card-header"><span class="card-title">&#8505; 关于</span></div>
          <div class="settings-list">
            <div class="settings-item"><span class="settings-label">版本</span><span class="settings-value">v2.0.0</span></div>
            <div class="settings-item"><span class="settings-label">功能</span><span class="settings-value">学习/护肤/饮食/运动/财务/战略</span></div>
          </div>
        </div>
      </div>
    `;

    document.getElementById('btn-edit-profile').addEventListener('click', () => {
      Modal.openForm({
        title: '编辑个人信息',
        fields: [
          { name: 'nickname', label: '昵称', type: 'text', value: profile.nickname },
          { name: 'birthday', label: '生日', type: 'date', value: profile.birthday },
          { name: 'gender', label: '性别', type: 'select', value: profile.gender, options: ['男', '女'] },
          { name: 'height', label: '身高(cm)', type: 'number', value: profile.height },
          { name: 'weight', label: '体重(kg)', type: 'number', value: profile.weight },
          { name: 'constitution', label: '体质', type: 'select', value: profile.constitution,
            options: Object.keys(LinkageManager.constitutions) }
        ],
        onConfirm: (data) => {
          DataManager.set('profile.nickname', data.nickname);
          DataManager.set('profile.birthday', data.birthday);
          DataManager.set('profile.gender', data.gender);
          DataManager.set('profile.height', data.height);
          DataManager.set('profile.weight', data.weight);
          DataManager.set('profile.constitution', data.constitution);
          Toast.show('信息已更新', 'success');
          renderSettings();
        }
      });
    });

    document.getElementById('btn-edit-goals').addEventListener('click', () => {
      Modal.openForm({
        title: '修改目标设置',
        fields: [
          { name: 'dailyBudget', label: '每日预算(元)', type: 'number', value: settings.dailyBudget },
          { name: 'dailyCalorieTarget', label: '热量目标(千卡)', type: 'number', value: settings.dailyCalorieTarget },
          { name: 'dailyWaterTarget', label: '饮水目标(杯)', type: 'number', value: settings.dailyWaterTarget },
          { name: 'weeklyExerciseGoal', label: '每周运动(次)', type: 'number', value: settings.weeklyExerciseGoal },
          { name: 'studyHourGoal', label: '每日学习(小时)', type: 'number', value: settings.studyHourGoal }
        ],
        onConfirm: (data) => {
          DataManager.set('settings.dailyBudget', parseInt(data.dailyBudget) || 100);
          DataManager.set('settings.dailyCalorieTarget', parseInt(data.dailyCalorieTarget) || 2000);
          DataManager.set('settings.dailyWaterTarget', parseInt(data.dailyWaterTarget) || 8);
          DataManager.set('settings.weeklyExerciseGoal', parseInt(data.weeklyExerciseGoal) || 5);
          DataManager.set('settings.studyHourGoal', parseInt(data.studyHourGoal) || 4);
          Toast.show('目标已更新', 'success');
          renderSettings();
        }
      });
    });

    document.getElementById('btn-export-data').addEventListener('click', () => {
      const data = DataManager.exportData();
      const blob = new Blob([data], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `workbench_backup_${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
      Toast.show('数据已导出', 'success');
    });

    document.getElementById('btn-import-data').addEventListener('click', () => {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = '.json';
      input.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (ev) => {
          if (DataManager.importData(ev.target.result)) {
            Toast.show('数据导入成功', 'success');
            renderSettings();
          } else {
            Toast.show('导入失败，文件格式错误', 'error');
          }
        };
        reader.readAsText(file);
      });
      input.click();
    });

    document.getElementById('btn-clear-data').addEventListener('click', () => {
      Modal.open({
        title: '确认清除',
        content: '<p style="color:var(--color-danger)">此操作将删除所有数据，且无法恢复！确定继续吗？</p>',
        type: 'danger', confirmText: '确认清除',
        onConfirm: () => {
          DataManager.clear();
          Toast.show('所有数据已清除', 'info');
          Router.navigate('onboarding');
        }
      });
    });
  }

  return { init };
})();


// ============================================
// 9. 启动应用
// ============================================
document.addEventListener('DOMContentLoaded', () => {
  App.init();
});