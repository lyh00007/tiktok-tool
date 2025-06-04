// ==UserScript==
// @name         达人昵称复制-增强版
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  在TikTok选品页面提取达人昵称，采用多种选择器策略提高稳定性
// @author       @李懿恒
// @match        https://affiliate.tiktokglobalshop.com/product/sample-request?shop_region=US
// @grant        GM_log
// @grant        GM_notification
// ==/UserScript==

(function() {
    'use strict';

    // 配置项
    const config = {
        maxRetry: 3, // 最大重试次数
        retryDelay: 1000, // 重试延迟(ms)
        selectors: [
            // 多种可能的昵称选择器，按优先级排列
            'div.sc-gFqAkR.dqkCPR', // 最新选择器
            'div.sc-dLMFU.hIQWEj', // 旧选择器
            'div[class*="truncate"][class*="text-neutral-text2"]', // 模糊匹配
            'div[data-e2e*="nickname"]', // 可能的data属性
            'div[class*="nickname"]' // 可能的类名
        ],
        debugMode: false // 调试模式
    };

    // 创建浮动面板
    const panel = createPanel();
    document.body.appendChild(panel);

    // 创建面板函数
    function createPanel() {
        const panel = document.createElement('div');
        panel.id = 'tiktok-nickname-extractor-panel';
        panel.style.cssText = `
            position: fixed;
            right: 10px;
            top: 50%;
            transform: translateY(-50%);
            width: 280px;
            max-height: 80vh;
            background-color: #fff;
            border: 1px solid #ddd;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            padding: 12px;
            z-index: 99999;
            font-family: -apple-system, BlinkMacSystemFont, sans-serif;
            overflow: hidden;
            display: flex;
            flex-direction: column;
        `;

        // 标题栏
        const header = document.createElement('div');
        header.style.cssText = `
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 12px;
            padding-bottom: 8px;
            border-bottom: 1px solid #eee;
        `;

        const title = document.createElement('h3');
        title.textContent = '达人昵称提取器';
        title.style.cssText = `
            margin: 0;
            font-size: 16px;
            font-weight: 600;
            color: #333;
        `;

        const toggleBtn = document.createElement('button');
        toggleBtn.textContent = '收起';
        toggleBtn.style.cssText = `
            padding: 4px 8px;
            background: #f0f0f0;
            border: none;
            border-radius: 4px;
            font-size: 12px;
            cursor: pointer;
            transition: all 0.2s;
        `;
        toggleBtn.onmouseover = () => toggleBtn.style.background = '#e0e0e0';
        toggleBtn.onmouseout = () => toggleBtn.style.background = '#f0f0f0';

        header.appendChild(title);
        header.appendChild(toggleBtn);
        panel.appendChild(header);

        // 内容区域
        const content = document.createElement('div');
        content.id = 'extractor-content';
        content.style.cssText = `
            flex: 1;
            overflow-y: auto;
            margin-bottom: 12px;
            padding: 8px;
            background: #f9f9f9;
            border-radius: 4px;
            font-size: 14px;
            color: #666;
            min-height: 100px;
            max-height: 300px;
        `;
        content.textContent = '点击"提取昵称"按钮开始提取达人昵称';
        panel.appendChild(content);

        // 操作按钮区域
        const actions = document.createElement('div');
        actions.style.cssText = `
            display: flex;
            flex-direction: column;
            gap: 8px;
        `;

        const extractBtn = createButton('提取昵称', '#1890ff', () => extractNicknames());
        const copyAllBtn = createButton('一键复制', '#52c41a', () => copyAllNicknames());
        copyAllBtn.disabled = true;

        actions.appendChild(extractBtn);
        actions.appendChild(copyAllBtn);
        panel.appendChild(actions);

        // 收起/展开功能
        let isExpanded = true;
        toggleBtn.addEventListener('click', () => {
            isExpanded = !isExpanded;
            content.style.display = isExpanded ? 'block' : 'none';
            actions.style.display = isExpanded ? 'flex' : 'none';
            toggleBtn.textContent = isExpanded ? '收起' : '展开';
            panel.style.height = isExpanded ? 'auto' : 'fit-content';
        });

        return panel;
    }

    // 创建按钮函数
    function createButton(text, color, onClick) {
        const btn = document.createElement('button');
        btn.textContent = text;
        btn.style.cssText = `
            padding: 8px 12px;
            background: ${color};
            color: white;
            border: none;
            border-radius: 4px;
            font-size: 14px;
            cursor: pointer;
            transition: all 0.2s;
            flex: 1;
        `;
        btn.onmouseover = () => btn.style.opacity = '0.8';
        btn.onmouseout = () => btn.style.opacity = '1';
        btn.addEventListener('click', onClick);
        return btn;
    }

    // 提取昵称主函数
    async function extractNicknames() {
        const content = document.getElementById('extractor-content');
        content.innerHTML = '<div style="text-align:center;padding:10px;">正在提取中...</div>';

        let nicknames = [];
        let retryCount = 0;

        while (retryCount < config.maxRetry && nicknames.length === 0) {
            if (retryCount > 0) {
                log(`尝试 #${retryCount + 1} 提取昵称...`);
                content.innerHTML += `<div>尝试 #${retryCount + 1} 提取昵称...</div>`;
                await delay(config.retryDelay);
            }

            nicknames = await tryExtractNicknames();
            retryCount++;
        }

        if (nicknames.length === 0) {
            content.innerHTML = '<div style="color:#f5222d;">未能提取到任何昵称，请确认页面已加载完成</div>';
            notify('提取失败', '未能找到任何达人昵称');
            return;
        }

        displayNicknames(nicknames);
        notify('提取完成', `成功提取 ${nicknames.length} 个达人昵称`);
    }

    // 尝试多种选择器提取昵称
    async function tryExtractNicknames() {
        const nicknames = new Set();

        for (const selector of config.selectors) {
            try {
                const elements = document.querySelectorAll(selector);
                if (elements.length === 0) continue;

                log(`尝试选择器 "${selector}" 找到 ${elements.length} 个元素`);

                elements.forEach(el => {
                    let nickname = el.textContent.trim();
                    if (nickname.startsWith('@')) {
                        nickname = nickname.substring(1);
                    }
                    if (nickname) {
                        nicknames.add(nickname);
                    }
                });

                if (nicknames.size > 0) {
                    log(`成功使用选择器 "${selector}" 提取到 ${nicknames.size} 个昵称`);
                    break;
                }
            } catch (error) {
                log(`选择器 "${selector}" 出错: ${error.message}`);
            }
        }

        // 如果常规选择器都失败，尝试基于表格行的启发式搜索
        if (nicknames.size === 0) {
            log('常规选择器失败，尝试启发式搜索...');
            const rows = document.querySelectorAll('tr.arco-table-tr');

            rows.forEach(row => {
                // 尝试找到包含 @ 符号的文本
                const textNodes = Array.from(row.querySelectorAll('*')).map(el => el.textContent.trim());
                const potentialNicknames = textNodes.filter(text => text.startsWith('@'));

                potentialNicknames.forEach(nickname => {
                    nicknames.add(nickname.substring(1));
                });
            });
        }

        return Array.from(nicknames);
    }

    // 显示提取到的昵称
    function displayNicknames(nicknames) {
        const content = document.getElementById('extractor-content');
        content.innerHTML = '';

        const count = document.createElement('div');
        count.textContent = `共找到 ${nicknames.length} 个达人昵称:`;
        count.style.cssText = 'margin-bottom:10px;font-weight:bold;color:#333;';
        content.appendChild(count);

        const list = document.createElement('div');
        list.style.cssText = 'display:flex;flex-direction:column;gap:4px;';

        nicknames.forEach((nickname, index) => {
            const item = document.createElement('div');
            item.style.cssText = 'display:flex;align-items:center;justify-content:space-between;padding:6px;background:#fff;border-radius:4px;border:1px solid #eee;';

            const text = document.createElement('span');
            text.textContent = `${index + 1}. @${nickname}`;
            text.style.cssText = 'flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;';

            const copyBtn = document.createElement('button');
            copyBtn.textContent = '复制';
            copyBtn.style.cssText = 'margin-left:8px;padding:2px 6px;font-size:12px;background:#1890ff;color:white;border:none;border-radius:2px;cursor:pointer;';
            copyBtn.addEventListener('click', () => {
                copyToClipboard(nickname);
                copyBtn.textContent = '已复制';
                copyBtn.style.background = '#52c41a';
                setTimeout(() => {
                    copyBtn.textContent = '复制';
                    copyBtn.style.background = '#1890ff';
                }, 2000);
            });

            item.appendChild(text);
            item.appendChild(copyBtn);
            list.appendChild(item);
        });

        content.appendChild(list);

        // 启用一键复制按钮
        const copyAllBtn = document.querySelector('#tiktok-nickname-extractor-panel button:nth-of-type(2)');
        copyAllBtn.disabled = false;
        copyAllBtn.onclick = () => copyAllNicknames(nicknames);
    }

    // 复制所有昵称
    function copyAllNicknames(nicknames) {
        if (!nicknames) {
            const items = document.querySelectorAll('#extractor-content div[style*="align-items:center"]');
            nicknames = Array.from(items).map(item =>
                item.textContent.replace(/^\d+\. @/, '').replace(/复制$/, '').trim()
            );
        }

        const text = nicknames.join('\n');
        copyToClipboard(text);

        const copyAllBtn = document.querySelector('#tiktok-nickname-extractor-panel button:nth-of-type(2)');
        copyAllBtn.textContent = '已复制!';
        copyAllBtn.style.background = '#52c41a';

        setTimeout(() => {
            copyAllBtn.textContent = '一键复制';
            copyAllBtn.style.background = '#52c41a';
        }, 2000);
    }

    // 复制到剪贴板
    function copyToClipboard(text) {
        const textarea = document.createElement('textarea');
        textarea.value = text;
        textarea.style.position = 'fixed';
        document.body.appendChild(textarea);
        textarea.select();

        try {
            document.execCommand('copy');
            log('复制成功: ' + (text.length > 50 ? text.substring(0, 50) + '...' : text));
        } catch (err) {
            log('复制失败: ' + err.message);
        }

        document.body.removeChild(textarea);
    }

    // 辅助函数
    function delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    function log(message) {
        if (config.debugMode) {
            GM_log(`[TikTok昵称提取器] ${message}`);
            console.log(`[TikTok昵称提取器] ${message}`);
        }
    }

    function notify(title, message) {
        if (typeof GM_notification !== 'undefined') {
            GM_notification({
                title: title,
                text: message,
                silent: true
            });
        }
    }
})();
