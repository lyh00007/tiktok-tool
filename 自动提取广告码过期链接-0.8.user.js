// ==UserScript==
// @name         自动提取广告码过期链接
// @namespace    http://tampermonkey.net/
// @version      1.1
// @description  通过红色状态点提取授权已过期的用户链接
// @author       @李懿恒
// @match        https://ads.tiktok.com/i18n/material/native?*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    // 创建浮动交互面板
    const panel = document.createElement('div');
    panel.style.position = 'fixed';
    panel.style.right = '20px';
    panel.style.top = '50%';
    panel.style.transform = 'translateY(-50%)';
    panel.style.width = '320px';
    panel.style.backgroundColor = '#fff';
    panel.style.border = '1px solid #ddd';
    panel.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
    panel.style.padding = '15px';
    panel.style.borderRadius = '8px';
    panel.style.zIndex = 99999;
    panel.style.fontFamily = 'Arial, sans-serif';

    // 面板标题
    const title = document.createElement('h3');
    title.textContent = '授权过期用户提取';
    title.style.margin = '0 0 15px 0';
    title.style.color = '#333';
    title.style.fontSize = '16px';
    title.style.display = 'flex';
    title.style.alignItems = 'center';
    title.style.justifyContent = 'space-between';

    // 收起按钮
    const toggleBtn = document.createElement('span');
    toggleBtn.textContent = '收起';
    toggleBtn.style.cursor = 'pointer';
    toggleBtn.style.background = '#ffc107';
    toggleBtn.style.color = '#000';
    toggleBtn.style.padding = '3px 8px';
    toggleBtn.style.borderRadius = '4px';
    toggleBtn.style.fontSize = '12px';

    title.appendChild(toggleBtn);
    panel.appendChild(title);

    // 内容区域
    const content = document.createElement('div');
    content.style.maxHeight = '400px';
    content.style.overflowY = 'auto';
    content.style.marginBottom = '15px';
    content.innerHTML = '<p style="color:#666;margin:0;text-align:center;">点击下方按钮开始提取</p>';
    panel.appendChild(content);

    // 操作按钮容器
    const btnContainer = document.createElement('div');
    btnContainer.style.display = 'flex';
    btnContainer.style.flexDirection = 'column';
    btnContainer.style.gap = '10px';

    // 提取按钮
    const extractBtn = document.createElement('button');
    extractBtn.textContent = '提取过期用户';
    extractBtn.style.background = '#1890ff';
    extractBtn.style.color = '#fff';
    extractBtn.style.border = 'none';
    extractBtn.style.padding = '8px 16px';
    extractBtn.style.borderRadius = '4px';
    extractBtn.style.cursor = 'pointer';
    extractBtn.style.fontWeight = 'bold';

    // 复制按钮
    const copyBtn = document.createElement('button');
    copyBtn.textContent = '一键复制所有';
    copyBtn.style.background = '#52c41a';
    copyBtn.style.color = '#fff';
    copyBtn.style.border = 'none';
    copyBtn.style.padding = '8px 16px';
    copyBtn.style.borderRadius = '4px';
    copyBtn.style.cursor = 'pointer';

    btnContainer.appendChild(extractBtn);
    btnContainer.appendChild(copyBtn);
    panel.appendChild(btnContainer);
    document.body.appendChild(panel);

    // 收起/展开功能
    let isExpanded = true;
    toggleBtn.addEventListener('click', () => {
        isExpanded = !isExpanded;
        content.style.display = isExpanded ? 'block' : 'none';
        btnContainer.style.display = isExpanded ? 'flex' : 'none';
        toggleBtn.textContent = isExpanded ? '收起' : '展开';
    });

    // 核心提取函数
    function findExpiredUsers() {
        content.innerHTML = '<p style="color:#666;text-align:center;">正在扫描页面...</p>';

        setTimeout(() => {
            const expiredUsers = [];
            const redDots = document.querySelectorAll('.status-dot[style*="rgb(244, 88, 88)"]');

            redDots.forEach(dot => {
                const row = dot.closest('tr.biz-table-row');
                if (row) {
                    const nickname = row.querySelector('.user-name')?.textContent?.trim();
                    const postId = row.querySelector('td.vi-table_1_column_3 .cell')?.textContent?.trim();

                    if (nickname && postId) {
                        expiredUsers.push({
                            nickname,
                            postId,
                            link: `https://www.tiktok.com/@${nickname}/video/${postId}`
                        });
                    }
                }
            });

            displayResults(expiredUsers);
        }, 1000);
    }

    // 显示结果
    function displayResults(users) {
        content.innerHTML = '';

        if (users.length === 0) {
            content.innerHTML = '<p style="color:#f5222d;text-align:center;">未找到过期用户</p>';
            return;
        }

        const countInfo = document.createElement('p');
        countInfo.textContent = `共找到 ${users.length} 个过期用户:`;
        countInfo.style.margin = '0 0 10px 0';
        countInfo.style.fontWeight = 'bold';
        content.appendChild(countInfo);

        const list = document.createElement('div');
        list.style.display = 'flex';
        list.style.flexDirection = 'column';
        list.style.gap = '8px';

        users.forEach((user, index) => {
            const item = document.createElement('div');
            item.style.display = 'flex';
            item.style.alignItems = 'center';
            item.style.padding = '8px';
            item.style.background = index % 2 === 0 ? '#fafafa' : '#fff';
            item.style.borderRadius = '4px';

            const num = document.createElement('span');
            num.textContent = `${index + 1}.`;
            num.style.marginRight = '8px';
            num.style.color = '#666';
            num.style.minWidth = '20px';

            const link = document.createElement('a');
            link.textContent = user.link;
            link.href = user.link;
            link.target = '_blank';
            link.style.flex = '1';
            link.style.overflow = 'hidden';
            link.style.textOverflow = 'ellipsis';
            link.style.whiteSpace = 'nowrap';
            link.style.color = '#1890ff';

            const copyBtn = document.createElement('button');
            copyBtn.textContent = '复制';
            copyBtn.style.marginLeft = '8px';
            copyBtn.style.padding = '2px 6px';
            copyBtn.style.background = '#d9d9d9';
            copyBtn.style.border = 'none';
            copyBtn.style.borderRadius = '2px';
            copyBtn.style.cursor = 'pointer';

            copyBtn.addEventListener('click', () => {
                navigator.clipboard.writeText(user.link);
                copyBtn.textContent = '✓';
                copyBtn.style.background = '#52c41a';
                copyBtn.style.color = '#fff';
                setTimeout(() => {
                    copyBtn.textContent = '复制';
                    copyBtn.style.background = '#d9d9d9';
                    copyBtn.style.color = '#000';
                }, 1500);
            });

            item.appendChild(num);
            item.appendChild(link);
            item.appendChild(copyBtn);
            list.appendChild(item);
        });

        content.appendChild(list);

        // 一键复制功能
        copyBtn.onclick = () => {
            const allLinks = users.map(u => u.link).join('\n');
            navigator.clipboard.writeText(allLinks).then(() => {
                copyBtn.textContent = '✓ 复制成功';
                copyBtn.style.background = '#52c41a';
                setTimeout(() => {
                    copyBtn.textContent = '一键复制所有';
                    copyBtn.style.background = '#52c41a';
                }, 2000);
            });
        };
    }

    // 点击提取按钮
    extractBtn.addEventListener('click', findExpiredUsers);

    // 自动监听表格变化
    const observer = new MutationObserver(() => {
        if (content.textContent.includes('点击下方按钮') ||
            content.textContent.includes('未找到')) {
            findExpiredUsers();
        }
    });

    observer.observe(document.body, {
        childList: true,
        subtree: true
    });
})();
