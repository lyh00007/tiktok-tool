// ==UserScript==
// @name         广告码生成视频链接
// @namespace    http://tampermonkey.net/
// @version      1.1
// @description  在广告码界面提取的时候，可以快速把广告码转换成视频链接填表，用于达人给了广告码没给视频链接
// @author       @李懿恒
// @match        https://ads.tiktok.com/i18n/material/native*
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
    title.textContent = '昵称快速提取';
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
    fetchButton.textContent = '生成链接';
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

    // 提取昵称和帖子ID的函数
    function extractNicknamesAndPostIds() {
        const rows = document.querySelectorAll('tr.vi-table__row.vi-table__row--striped');
        if (rows.length === 0) {
            contentContainer.textContent = '未找到任何数据！';
            return;
        }

        contentContainer.innerHTML = '';
        const allLinks = [];

        rows.forEach((row) => {
            const nicknameElement = row.querySelector('.user-name');
            const postIdElement = row.querySelector('.vi-table_1_column_3.is-left .cell');

            if (nicknameElement && postIdElement) {
                const nickname = nicknameElement.textContent.trim();
                const postId = postIdElement.textContent.trim();

                if (nickname && postId) {
                    const videoLink = `https://www.tiktok.com/@${nickname}/video/${postId}`;
                    const linkItem = document.createElement('div');
                    linkItem.style.display = 'flex';
                    linkItem.style.alignItems = 'center';
                    linkItem.style.marginBottom = '5px';

                    const linkText = document.createElement('span');
                    linkText.textContent = videoLink;
                    linkText.style.flexGrow = '1';
                    linkText.style.marginRight = '10px';
                    linkText.style.whiteSpace = 'nowrap';
                    linkText.style.overflow = 'hidden';
                    linkText.style.textOverflow = 'ellipsis';

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
                        navigator.clipboard.writeText(videoLink).then(() => {
                            copyButton.textContent = '已复制';
                            copyButton.style.backgroundColor = '#6c757d';
                            copyButton.style.cursor = 'default';
                        });
                    });

                    allLinks.push(videoLink);
                    linkItem.appendChild(linkText);
                    linkItem.appendChild(copyButton);
                    contentContainer.appendChild(linkItem);
                }
            }
        });

        copyAllButton.addEventListener('click', () => {
            const allLinksText = allLinks.join('\n');
            navigator.clipboard.writeText(allLinksText).then(() => {
                copyAllButton.textContent = '已复制所有链接';
                copyAllButton.style.backgroundColor = '#6c757d';
                copyAllButton.style.cursor = 'default';
            });
        });
    }

    fetchButton.addEventListener('click', extractNicknamesAndPostIds);

    // 修改防抖函数，增加一个更长的延迟来防止频繁触发
    let debounceTimeout;
    function debounce(fn, delay) {
        return function() {
            clearTimeout(debounceTimeout);
            debounceTimeout = setTimeout(fn, delay);
        };
    }

    // 使用 MutationObserver 监听 DOM 变化
    const observer = new MutationObserver(debounce(() => {
        extractNicknamesAndPostIds();
    }, 2000)); // 延迟2秒触发，避免过于频繁

    // 配置监听器，监听特定区域
    observer.observe(document.querySelector('table'), {
        childList: true,
        subtree: true,
    });

})();
