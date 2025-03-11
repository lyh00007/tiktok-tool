// ==UserScript==
// @name         达人邀约名称批量
// @namespace    http://tampermonkey.net/
// @version      0.9
// @description  tk批量邀约达人使用，用于爬取表放置Excel中上传标签
// @author       @李懿恒
// @match        https://affiliate.tiktokglobalshop.com/connection/creator?shop_region=US
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
    fetchButton.textContent = '提取昵称';
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
    copyAllButton.textContent = '一键复制所有昵称';
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

    // 提取昵称的函数
    function extractNicknames() {
        const nicknameElements = document.querySelectorAll('span[data-e2e="fbc99397-6043-1b37"]');
        if (nicknameElements.length === 0) {
            contentContainer.textContent = '未找到任何昵称！';
            return;
        }

        contentContainer.innerHTML = '';
        const allNicknames = [];

        nicknameElements.forEach((el) => {
            const nickname = el.textContent.trim();

            const nicknameItem = document.createElement('div');
            nicknameItem.style.display = 'flex';
            nicknameItem.style.alignItems = 'center';
            nicknameItem.style.marginBottom = '5px';

            const nicknameText = document.createElement('span');
            nicknameText.textContent = nickname;
            nicknameText.style.flexGrow = '1';
            nicknameText.style.marginRight = '10px';
            nicknameText.style.whiteSpace = 'nowrap';
            nicknameText.style.overflow = 'hidden';
            nicknameText.style.textOverflow = 'ellipsis';

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
                navigator.clipboard.writeText(nickname).then(() => {
                    copyButton.textContent = '已复制';
                    copyButton.style.backgroundColor = '#6c757d';
                    copyButton.style.cursor = 'default';
                });
            });

            allNicknames.push(nickname);
            nicknameItem.appendChild(nicknameText);
            nicknameItem.appendChild(copyButton);
            contentContainer.appendChild(nicknameItem);
        });

        copyAllButton.addEventListener('click', () => {
            const allNicknamesText = allNicknames.join('\n');
            navigator.clipboard.writeText(allNicknamesText).then(() => {
                copyAllButton.textContent = '已复制所有昵称';
                copyAllButton.style.backgroundColor = '#6c757d';
                copyAllButton.style.cursor = 'default';
            });
        });
    }

    fetchButton.addEventListener('click', extractNicknames);
})();