// ==UserScript==
// @name         自动提取广告码过期链接
// @namespace    http://tampermonkey.net/
// @version      0.8
// @description  提取授权已过期的用户昵称和帖子ID，并去重
// @author       @李懿恒
// @match        https://ads.tiktok.com/i18n/material/native?*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    // 创建浮动交互面板
    const panel = document.createElement('div');
    panel.style.position = 'fixed';
    panel.style.right = '10px';
    panel.style.top = '50%';
    panel.style.transform = 'translateY(-50%)';
    panel.style.width = '250px';
    panel.style.height = 'auto';
    panel.style.backgroundColor = '#fff';
    panel.style.border = '1px solid #ccc';
    panel.style.boxShadow = '0 2px 8px rgba(0,0,0,0.2)';
    panel.style.padding = '10px';
    panel.style.overflowY = 'auto';
    panel.style.zIndex = 9999;
    panel.style.borderRadius = '5px';

    // 添加标题和收起按钮
    const header = document.createElement('div');
    header.style.display = 'flex';
    header.style.justifyContent = 'space-between';
    header.style.alignItems = 'center';
    header.style.marginBottom = '10px';

    const title = document.createElement('h4');
    title.textContent = '授权已过期用户提取';
    title.style.margin = '0';
    title.style.fontSize = '16px';

    const toggleButton = document.createElement('button');
    toggleButton.textContent = '收起';
    toggleButton.style.padding = '2px 6px';
    toggleButton.style.cursor = 'pointer';
    toggleButton.style.backgroundColor = '#ffc107';
    toggleButton.style.color = '#000';
    toggleButton.style.border = 'none';
    toggleButton.style.borderRadius = '3px';
    toggleButton.style.fontSize = '12px';

    header.appendChild(title);
    header.appendChild(toggleButton);
    panel.appendChild(header);

    // 添加内容容器
    const contentContainer = document.createElement('div');
    contentContainer.textContent = '点击“提取昵称”爬取内容';
    contentContainer.style.marginBottom = '10px';
    contentContainer.style.fontSize = '12px';
    contentContainer.style.maxHeight = '300px';
    contentContainer.style.overflowY = 'auto';
    panel.appendChild(contentContainer);

    // 提取按钮
    const fetchButton = document.createElement('button');
    fetchButton.textContent = '提取授权已过期用户';
    fetchButton.style.padding = '5px 10px';
    fetchButton.style.cursor = 'pointer';
    fetchButton.style.backgroundColor = '#007bff';
    fetchButton.style.color = '#fff';
    fetchButton.style.border = 'none';
    fetchButton.style.borderRadius = '3px';
    fetchButton.style.display = 'block';
    fetchButton.style.margin = '0 auto';
    panel.appendChild(fetchButton);

    // 一键复制按钮
    const copyAllButton = document.createElement('button');
    copyAllButton.textContent = '一键复制所有链接';
    copyAllButton.style.padding = '5px 10px';
    copyAllButton.style.cursor = 'pointer';
    copyAllButton.style.backgroundColor = '#28a745';
    copyAllButton.style.color = '#fff';
    copyAllButton.style.border = 'none';
    copyAllButton.style.borderRadius = '3px';
    copyAllButton.style.display = 'block';
    copyAllButton.style.margin = '10px auto 0';
    copyAllButton.style.fontSize = '14px';
    panel.appendChild(copyAllButton);

    // 将面板添加到页面
    document.body.appendChild(panel);

    // 收起功能
    let isPanelVisible = true;
    toggleButton.addEventListener('click', () => {
        isPanelVisible = !isPanelVisible;
        contentContainer.style.display = isPanelVisible ? 'block' : 'none';
        fetchButton.style.display = isPanelVisible ? 'block' : 'none';
        copyAllButton.style.display = isPanelVisible ? 'block' : 'none';
        toggleButton.textContent = isPanelVisible ? '收起' : '展开';
    });

    // 使用 MutationObserver 监听 DOM 变化
    const observer = new MutationObserver(() => {
        // 调用提取授权已过期用户的函数
        extractExpiredUsers();
    });

    observer.observe(document.body, { childList: true, subtree: true });

    // 提取授权已过期用户的函数
    function extractExpiredUsers() {
        setTimeout(() => {
            const rows = document.querySelectorAll('tr.vi-table__row');
            if (rows.length === 0) {
                contentContainer.textContent = '未找到任何授权已过期的用户！';
                return;
            }

            contentContainer.innerHTML = '';
            const expiredUsersSet = new Set(); // 使用 Set 来去重

            rows.forEach((row) => {
                const statusElement = row.querySelector('.main-text');
                if (statusElement && statusElement.textContent.includes('授权已过期')) {
                    const nicknameElement = row.querySelector('.user-name');
                    const postIdElement = row.querySelector('.vi-table_1_column_3');

                    if (nicknameElement && postIdElement) {
                        const nickname = nicknameElement.textContent.trim();
                        const postId = postIdElement.textContent.trim();

                        const userLink = `https://www.tiktok.com/@${nickname}/video/${postId}`;

                        expiredUsersSet.add(userLink); // 添加到 Set 中，自动去重
                    }
                }
            });

            if (expiredUsersSet.size === 0) {
                contentContainer.textContent = '未找到任何授权已过期的用户！';
                return;
            }

            // 清空内容容器并显示去重后的用户链接
            expiredUsersSet.forEach((userLink) => {
                const userItem = document.createElement('div');
                userItem.style.display = 'flex';
                userItem.style.alignItems = 'center';
                userItem.style.marginBottom = '5px';

                const userText = document.createElement('span');
                userText.textContent = userLink;
                userText.style.flexGrow = '1';
                userText.style.marginRight = '10px';
                userText.style.whiteSpace = 'nowrap';
                userText.style.overflow = 'hidden';
                userText.style.textOverflow = 'ellipsis';

                const copyButton = document.createElement('button');
                copyButton.textContent = '复制';
                copyButton.style.padding = '2px 6px';
                copyButton.style.cursor = 'pointer';
                copyButton.style.backgroundColor = '#28a745';
                copyButton.style.color = '#fff';
                copyButton.style.border = 'none';
                copyButton.style.borderRadius = '3px';
                copyButton.style.fontSize = '12px';

                copyButton.addEventListener('click', () => {
                    navigator.clipboard.writeText(userLink).then(() => {
                        copyButton.textContent = '已复制';
                        copyButton.style.backgroundColor = '#6c757d';
                        copyButton.style.cursor = 'default';
                    });
                });

                contentContainer.appendChild(userItem);
                userItem.appendChild(userText);
                userItem.appendChild(copyButton);
            });

            copyAllButton.addEventListener('click', () => {
                const allUsersText = Array.from(expiredUsersSet).join('\n'); // 将 Set 转为数组并加入换行符
                navigator.clipboard.writeText(allUsersText).then(() => {
                    copyAllButton.textContent = '已复制所有链接';
                    copyAllButton.style.backgroundColor = '#6c757d';
                    copyAllButton.style.cursor = 'default';
                });
            });
        }, 2000); // 延迟2秒执行提取
    }

    fetchButton.addEventListener('click', extractExpiredUsers);
})();
