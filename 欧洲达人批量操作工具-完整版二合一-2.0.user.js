// ==UserScript==
// @name         欧洲达人批量操作工具-完整版二合一
// @namespace    http://tampermonkey.net/
// @version      2.0
// @description  批量选择和保存达人，支持分批次操作、避免重复、自动滚动和隐藏面板
// @author       You
// @match        https://affiliate.tiktokglobalshop.com/connection/creator*
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_addStyle
// @run-at       document-idle
// ==/UserScript==

(function() {
    'use strict';

    // 添加自定义样式
    GM_addStyle(`
        .batch-operator-container {
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 9999;
            background: white;
            padding: 15px;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
            font-family: Arial, sans-serif;
            width: 320px;
            transition: all 0.3s ease;
        }
        .batch-operator-container.collapsed {
            width: 40px;
            height: 40px;
            padding: 0;
            overflow: hidden;
        }
        .batch-operator-title {
            font-size: 16px;
            font-weight: bold;
            margin-bottom: 10px;
            color: #333;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        .batch-operator-tabs {
            display: flex;
            margin-bottom: 10px;
            border-bottom: 1px solid #ddd;
        }
        .batch-operator-tab {
            padding: 5px 10px;
            cursor: pointer;
            margin-right: 5px;
            border-radius: 4px 4px 0 0;
        }
        .batch-operator-tab.active {
            background: #1890ff;
            color: white;
        }
        .batch-operator-content {
            display: none;
        }
        .batch-operator-content.active {
            display: block;
        }
        .batch-operator-controls {
            display: flex;
            flex-direction: column;
            gap: 10px;
        }
        .batch-operator-btn {
            padding: 8px 12px;
            background: #1890ff;
            color: white;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            font-size: 14px;
            transition: background 0.2s;
        }
        .batch-operator-btn:hover {
            background: #40a9ff;
        }
        .batch-operator-info {
            margin-top: 10px;
            font-size: 14px;
            color: #666;
        }
        .batch-operator-input {
            padding: 8px;
            border: 1px solid #ddd;
            border-radius: 4px;
            font-size: 14px;
        }
        .batch-operator-checkbox {
            margin-right: 8px;
        }
        .batch-operator-label {
            display: flex;
            align-items: center;
            margin-bottom: 8px;
        }
        .batch-operator-reset {
            background: #ff4d4f;
        }
        .batch-operator-reset:hover {
            background: #ff7875;
        }
        .toggle-panel {
            cursor: pointer;
            width: 24px;
            height: 24px;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 4px;
            background: #f0f0f0;
        }
        .toggle-panel:hover {
            background: #e0e0e0;
        }
        .collapsed .batch-operator-title-text {
            display: none;
        }
        .collapsed .toggle-panel {
            margin: 8px auto;
        }
        .batch-operator-status {
            margin-top: 5px;
            font-size: 12px;
            color: #888;
        }
        .autoSave-highlight {
            box-shadow: 0 0 0 3px rgba(255, 0, 0, 0.5) !important;
            transition: box-shadow 0.3s ease;
        }
        .batch-operator-runtime {
            margin-top: 5px;
            font-size: 12px;
            color: #888;
        }
        .batch-operator-progress {
            margin-top: 5px;
            font-size: 12px;
            color: #888;
        }
    `);

    // 存储已选择达人的ID
    const STORAGE_KEY = 'selectedCreators';
    let selectedCreators = GM_getValue(STORAGE_KEY, []);
    let currentBatchIds = []; // 存储当前批次选择的达人ID

    // 自动保存相关变量
    let autoSaveConfig = {
        delayBetweenClicks: 2000,
        scrollIntoView: true,
        scrollBehavior: 'smooth',
        scrollOffset: 100,
        scrollCheckInterval: 1000,
        maxScrollAttempts: 3,
        maxRunTime: 30 * 60 * 1000
    };
    let autoSaveState = {
        currentIndex: 0,
        saveButtons: [],
        isRunning: false,
        timeoutId: null,
        scrollAttempts: 0,
        isWaitingForMore: false,
        startTime: null,
        runTimer: null
    };

    // 创建UI界面
    function createUI() {
        const container = document.createElement('div');
        container.className = 'batch-operator-container';
        container.innerHTML = `
            <div class="batch-operator-title">
                <span class="batch-operator-title-text">达人批量操作工具</span>
                <span class="toggle-panel" title="隐藏/显示面板">≡</span>
            </div>
            <div class="batch-operator-tabs">
                <div class="batch-operator-tab active" data-tab="select">批量选择</div>
                <div class="batch-operator-tab" data-tab="save">自动保存</div>
            </div>
            <div class="batch-operator-content active" id="select-tab">
                <div class="batch-operator-controls">
                    <div class="batch-operator-label">
                        <input type="checkbox" id="skipSelected" class="batch-operator-checkbox" checked>
                        <label for="skipSelected">跳过已选择的达人</label>
                    </div>
                    <div class="batch-operator-label">
                        <input type="checkbox" id="autoScroll" class="batch-operator-checkbox" checked>
                        <label for="autoScroll">自动滚动</label>
                    </div>
                    <input type="number" id="batchSize" class="batch-operator-input" value="50" min="1" placeholder="每批选择数量">
                    <button id="selectBatch" class="batch-operator-btn">选择下一批达人</button>
                    <button id="resetSelection" class="batch-operator-btn batch-operator-reset">重置选择记录</button>
                    <div class="batch-operator-info">
                        已选择总数: <span id="selectedCount">${selectedCreators.length}</span> 个达人
                    </div>
                    <div class="batch-operator-status" id="currentBatchInfo">当前批次: 0 个达人</div>
                </div>
            </div>
            <div class="batch-operator-content" id="save-tab">
                <div class="batch-operator-controls">
                    <div class="batch-operator-label">
                        <input type="checkbox" id="autoSaveSkipSaved" class="batch-operator-checkbox" checked>
                        <label for="autoSaveSkipSaved">跳过已保存的达人</label>
                    </div>
                    <div class="batch-operator-label">
                        <input type="checkbox" id="autoSaveAutoScroll" class="batch-operator-checkbox" checked>
                        <label for="autoSaveAutoScroll">自动滚动</label>
                    </div>
                    <input type="number" id="autoSaveDelay" class="batch-operator-input" value="2000" min="500" placeholder="点击间隔(毫秒)">
                    <button id="autoSaveStart" class="batch-operator-btn">开始自动保存</button>
                    <button id="autoSavePause" class="batch-operator-btn" disabled>暂停</button>
                    <button id="autoSaveStop" class="batch-operator-btn batch-operator-reset" disabled>停止</button>
                    <div class="batch-operator-runtime" id="autoSaveRuntime">运行时间: 00:00:00</div>
                    <div class="batch-operator-status" id="autoSaveStatus">准备就绪</div>
                    <div class="batch-operator-progress" id="autoSaveProgress">0/0</div>
                </div>
            </div>
        `;

        document.body.appendChild(container);

        // 添加事件监听
        document.getElementById('selectBatch').addEventListener('click', selectBatch);
        document.getElementById('resetSelection').addEventListener('click', resetSelection);
        document.getElementById('autoSaveStart').addEventListener('click', startAutoSave);
        document.getElementById('autoSavePause').addEventListener('click', pauseAutoSave);
        document.getElementById('autoSaveStop').addEventListener('click', stopAutoSave);

        // 添加面板折叠/展开功能
        const toggleBtn = container.querySelector('.toggle-panel');
        toggleBtn.addEventListener('click', function() {
            container.classList.toggle('collapsed');
            toggleBtn.title = container.classList.contains('collapsed') ? '显示面板' : '隐藏面板';
        });

        // 添加标签页切换功能
        const tabs = container.querySelectorAll('.batch-operator-tab');
        tabs.forEach(tab => {
            tab.addEventListener('click', function() {
                tabs.forEach(t => t.classList.remove('active'));
                this.classList.add('active');

                const tabId = this.getAttribute('data-tab') + '-tab';
                document.querySelectorAll('.batch-operator-content').forEach(content => {
                    content.classList.remove('active');
                });
                document.getElementById(tabId).classList.add('active');
            });
        });
    }

    // 批量选择相关函数
    function unselectCurrentBatch() {
        const rows = document.querySelectorAll('tr.sc-koXPp.jdpvwG.cursor-pointer');
        rows.forEach(row => {
            const checkbox = row.querySelector('input[type="checkbox"]');
            if (checkbox && checkbox.checked && currentBatchIds.includes(checkbox.value)) {
                checkbox.click();
            }
        });
        currentBatchIds = [];
        updateBatchInfo();
    }

    function updateBatchInfo() {
        const element = document.getElementById('currentBatchInfo');
        if (element) {
            element.textContent = `当前批次: ${currentBatchIds.length} 个达人`;
        }
    }

    function selectBatch() {
        // 先取消当前批次的选择
        unselectCurrentBatch();

        const batchSize = parseInt(document.getElementById('batchSize').value) || 50;
        const skipSelected = document.getElementById('skipSelected').checked;
        const autoScroll = document.getElementById('autoScroll').checked;

        // 获取所有可选择的达人行
        const rows = document.querySelectorAll('tr.sc-koXPp.jdpvwG.cursor-pointer');
        let selectedCount = 0;
        let skippedCount = 0;

        for (let i = 0; i < rows.length && selectedCount < batchSize; i++) {
            const row = rows[i];
            const checkbox = row.querySelector('input[type="checkbox"]');
            const creatorId = checkbox.value;

            if (!checkbox) continue;

            // 检查是否已选择过
            if (skipSelected && selectedCreators.includes(creatorId)) {
                skippedCount++;
                continue;
            }

            // 如果未选中，则选中
            if (!checkbox.checked) {
                checkbox.click();
                selectedCount++;
                currentBatchIds.push(creatorId);
                selectedCreators.push(creatorId);

                // 自动滚动到当前选中项
                if (autoScroll && selectedCount % 5 === 0) {
                    row.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
            }
        }

        // 保存选择记录
        GM_setValue(STORAGE_KEY, selectedCreators);

        // 更新UI显示
        const selectedCountElement = document.getElementById('selectedCount');
        if (selectedCountElement) {
            selectedCountElement.textContent = selectedCreators.length;
        }
        updateBatchInfo();

        // 显示通知
        alert(`已选择 ${selectedCount} 个达人${skippedCount > 0 ? `，跳过 ${skippedCount} 个已选择达人` : ''}`);
    }

    function resetSelection() {
        if (confirm('确定要重置所有选择记录吗？这将清除之前选择的所有达人记录。')) {
            // 取消当前批次的选择
            unselectCurrentBatch();

            selectedCreators = [];
            GM_setValue(STORAGE_KEY, []);
            const selectedCountElement = document.getElementById('selectedCount');
            if (selectedCountElement) {
                selectedCountElement.textContent = '0';
            }
            updateBatchInfo();
            alert('选择记录已重置');
        }
    }

    // 自动保存相关函数
    function refreshButtonList() {
        autoSaveState.saveButtons = getUnsavedButtons();
        autoSaveState.currentIndex = 0;
        updateProgress(0, autoSaveState.saveButtons.length);
    }

    function getUnsavedButtons() {
        return Array.from(document.querySelectorAll('button[data-e2e][data-tid="m4b_button"]'))
            .filter(btn => {
                const unsavedSvg = btn.querySelector('svg.alliance-icon-Unsaved');
                const savedSvg = btn.querySelector('svg.alliance-icon-Saved');
                return unsavedSvg !== null && savedSvg === null;
            });
    }

    function startAutoSave() {
        if (autoSaveState.isRunning) return;

        refreshButtonList();

        if (autoSaveState.saveButtons.length === 0) {
            updateStatus('没有找到未保存的达人');
            tryLoadMoreContent();
            return;
        }

        autoSaveState.isRunning = true;
        autoSaveState.scrollAttempts = 0;
        autoSaveState.startTime = new Date();
        updateButtonStates();
        updateStatus(`开始处理 (${autoSaveState.currentIndex + 1}/${autoSaveState.saveButtons.length})`);

        // 设置最大运行时间限制
        autoSaveState.runTimer = setTimeout(() => {
            updateStatus('已达到最大运行时间，自动停止');
            stopAutoSave();
        }, autoSaveConfig.maxRunTime);

        processNextButton();
    }

    function pauseAutoSave() {
        if (!autoSaveState.isRunning) return;

        autoSaveState.isRunning = false;
        if (autoSaveState.timeoutId) {
            clearTimeout(autoSaveState.timeoutId);
            autoSaveState.timeoutId = null;
        }
        updateButtonStates();
        updateStatus(`已暂停 (${autoSaveState.currentIndex + 1}/${autoSaveState.saveButtons.length})`);
    }

    function stopAutoSave() {
        autoSaveState.isRunning = false;
        autoSaveState.isWaitingForMore = false;
        autoSaveState.currentIndex = 0;

        if (autoSaveState.timeoutId) {
            clearTimeout(autoSaveState.timeoutId);
            autoSaveState.timeoutId = null;
        }

        if (autoSaveState.runTimer) {
            clearTimeout(autoSaveState.runTimer);
            autoSaveState.runTimer = null;
        }

        updateButtonStates();
        updateStatus('已停止');
        updateRunTime();

        // 移除所有高亮
        document.querySelectorAll('.autoSave-highlight').forEach(el => {
            el.style.boxShadow = '';
            el.classList.remove('autoSave-highlight');
        });
    }

    function processNextButton() {
        if (!autoSaveState.isRunning) return;

        // 更新运行时间显示
        updateRunTime();

        // 如果当前页处理完了，尝试加载更多
        if (autoSaveState.currentIndex >= autoSaveState.saveButtons.length) {
            if (autoSaveState.isWaitingForMore) return;

            updateStatus('当前页已处理完，尝试加载更多...');
            tryLoadMoreContent();
            return;
        }

        const button = autoSaveState.saveButtons[autoSaveState.currentIndex];
        updateStatus(`正在处理 ${autoSaveState.currentIndex + 1}/${autoSaveState.saveButtons.length}`);
        updateProgress(autoSaveState.currentIndex + 1, autoSaveState.saveButtons.length);

        // 滚动到元素位置
        if (autoSaveConfig.scrollIntoView) {
            const y = button.getBoundingClientRect().top + window.pageYOffset - autoSaveConfig.scrollOffset;
            window.scrollTo({
                top: y,
                behavior: autoSaveConfig.scrollBehavior
            });
        }

        // 高亮当前元素
        highlightElement(button);

        // 点击按钮
        autoSaveState.timeoutId = setTimeout(() => {
            button.click();
            console.log(`已点击第 ${autoSaveState.currentIndex + 1} 个按钮`);

            // 模拟人类操作的小延迟
            setTimeout(() => {
                removeHighlight(button);

                // 处理下一个按钮
                autoSaveState.currentIndex++;
                if (autoSaveState.isRunning) {
                    autoSaveState.timeoutId = setTimeout(processNextButton, autoSaveConfig.delayBetweenClicks);
                }
            }, 500);
        }, 1000);
    }

    function tryLoadMoreContent() {
        if (autoSaveState.scrollAttempts >= autoSaveConfig.maxScrollAttempts) {
            updateStatus('已达最大滚动尝试次数，停止处理');
            stopAutoSave();
            return;
        }

        autoSaveState.isWaitingForMore = true;
        autoSaveState.scrollAttempts++;

        // 滚动到底部
        window.scrollTo({
            top: document.body.scrollHeight,
            behavior: autoSaveConfig.scrollBehavior
        });

        // 等待新内容加载
        autoSaveState.timeoutId = setTimeout(() => {
            const prevButtonCount = autoSaveState.saveButtons.length;
            refreshButtonList();

            if (autoSaveState.saveButtons.length > prevButtonCount) {
                // 找到了新内容
                updateStatus(`发现 ${autoSaveState.saveButtons.length - prevButtonCount} 个新达人`);
                autoSaveState.isWaitingForMore = false;
                autoSaveState.scrollAttempts = 0;
                processNextButton();
            } else {
                // 没有新内容，继续尝试
                updateStatus(`等待新内容加载 (尝试 ${autoSaveState.scrollAttempts}/${autoSaveConfig.maxScrollAttempts})`);
                tryLoadMoreContent();
            }
        }, autoSaveConfig.scrollCheckInterval);
    }

    function highlightElement(element) {
        element.classList.add('autoSave-highlight');
        element.style.boxShadow = '0 0 0 3px rgba(255, 0, 0, 0.5)';
        element.style.transition = 'box-shadow 0.3s ease';
    }

    function removeHighlight(element) {
        element.classList.remove('autoSave-highlight');
        element.style.boxShadow = '';
    }

    function updateButtonStates() {
        const startBtn = document.getElementById('autoSaveStart');
        const pauseBtn = document.getElementById('autoSavePause');
        const stopBtn = document.getElementById('autoSaveStop');

        if (startBtn && pauseBtn && stopBtn) {
            startBtn.disabled = autoSaveState.isRunning;
            pauseBtn.disabled = !autoSaveState.isRunning;
            stopBtn.disabled = !autoSaveState.isRunning && autoSaveState.currentIndex === 0;
        }
    }

    function updateRunTime() {
        if (!autoSaveState.startTime) return;

        const runtimeElement = document.getElementById('autoSaveRuntime');
        if (!runtimeElement) return;

        const now = new Date();
        const diff = now - autoSaveState.startTime;
        const hours = Math.floor(diff / (1000 * 60 * 60)).toString().padStart(2, '0');
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)).toString().padStart(2, '0');
        const seconds = Math.floor((diff % (1000 * 60)) / 1000).toString().padStart(2, '0');

        runtimeElement.textContent = `运行时间: ${hours}:${minutes}:${seconds}`;
    }

    function updateStatus(text) {
        const statusElement = document.getElementById('autoSaveStatus');
        if (statusElement) {
            statusElement.textContent = text;
        }
    }

    function updateProgress(current, total) {
        const progressElement = document.getElementById('autoSaveProgress');
        if (progressElement) {
            progressElement.textContent = `${current}/${total}`;
        }
    }

    // 初始化
    createUI();
})();