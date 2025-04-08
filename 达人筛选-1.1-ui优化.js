// ==UserScript==
// @name         达人邀约名称批量
// @namespace    http://tampermonkey.net/
// @version      0.93
// @description  tk批量邀约达人使用，用于爬取表放置Excel中上传标签，ui优化
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
    panel.style.width = '280px';
    panel.style.height = 'auto';
    panel.style.backgroundColor = '#fff';
    panel.style.border = '1px solid #ccc';
    panel.style.boxShadow = '0 2px 8px rgba(0,0,0,0.2)';
    panel.style.padding = '15px';
    panel.style.overflowY = 'auto';
    panel.style.zIndex = 9999;
    panel.style.borderRadius = '8px';

    // 添加标题和收起按钮
    const header = document.createElement('div');
    header.style.display = 'flex';
    header.style.justifyContent = 'space-between';
    header.style.alignItems = 'center';
    header.style.marginBottom = '15px';

    const title = document.createElement('h4');
    title.textContent = '达人数据提取工具';
    title.style.margin = '0';
    title.style.fontSize = '16px';
    title.style.color = '#333';

    const toggleButton = document.createElement('button');
    toggleButton.textContent = '收起';
    toggleButton.style.padding = '3px 8px';
    toggleButton.style.cursor = 'pointer';
    toggleButton.style.backgroundColor = '#ffc107';
    toggleButton.style.color = '#000';
    toggleButton.style.border = 'none';
    toggleButton.style.borderRadius = '4px';
    toggleButton.style.fontSize = '12px';

    header.appendChild(title);
    header.appendChild(toggleButton);
    panel.appendChild(header);

    // 添加内容容器
    const contentContainer = document.createElement('div');
    contentContainer.textContent = '点击"提取数据"获取当前页面信息';
    contentContainer.style.marginBottom = '15px';
    contentContainer.style.fontSize = '13px';
    contentContainer.style.maxHeight = '350px';
    contentContainer.style.overflowY = 'auto';
    panel.appendChild(contentContainer);

    // 操作按钮容器
    const buttonContainer = document.createElement('div');
    buttonContainer.style.display = 'flex';
    buttonContainer.style.flexDirection = 'column';
    buttonContainer.style.gap = '10px';
    buttonContainer.style.marginTop = '15px';

    // 提取按钮
    const fetchButton = document.createElement('button');
    fetchButton.textContent = '提取数据';
    fetchButton.style.padding = '8px 12px';
    fetchButton.style.cursor = 'pointer';
    fetchButton.style.backgroundColor = '#007bff';
    fetchButton.style.color = '#fff';
    fetchButton.style.border = 'none';
    fetchButton.style.borderRadius = '4px';
    fetchButton.style.fontWeight = 'bold';
    buttonContainer.appendChild(fetchButton);

    // 一键复制昵称按钮
    const copyNicknamesButton = document.createElement('button');
    copyNicknamesButton.textContent = '复制所有昵称';
    copyNicknamesButton.style.padding = '8px 12px';
    copyNicknamesButton.style.cursor = 'pointer';
    copyNicknamesButton.style.backgroundColor = '#28a745';
    copyNicknamesButton.style.color = '#fff';
    copyNicknamesButton.style.border = 'none';
    copyNicknamesButton.style.borderRadius = '4px';
    buttonContainer.appendChild(copyNicknamesButton);

    // 一键复制筛选条件按钮
    const copyFiltersButton = document.createElement('button');
    copyFiltersButton.textContent = '复制筛选条件';
    copyFiltersButton.style.padding = '8px 12px';
    copyFiltersButton.style.cursor = 'pointer';
    copyFiltersButton.style.backgroundColor = '#17a2b8';
    copyFiltersButton.style.color = '#fff';
    copyFiltersButton.style.border = 'none';
    copyFiltersButton.style.borderRadius = '4px';
    buttonContainer.appendChild(copyFiltersButton);

    panel.appendChild(buttonContainer);

    // 将面板添加到页面
    document.body.appendChild(panel);

    // 收起功能
    let isPanelVisible = true;
    toggleButton.addEventListener('click', () => {
        isPanelVisible = !isPanelVisible;
        contentContainer.style.display = isPanelVisible ? 'block' : 'none';
        buttonContainer.style.display = isPanelVisible ? 'flex' : 'none';
        toggleButton.textContent = isPanelVisible ? '收起' : '展开';
    });

    // 提取数据的函数
    function extractData() {
        // 提取筛选条件
        const filterElements = document.querySelectorAll('.arco-tag-content .text');
        const filters = Array.from(filterElements).map(el => el.textContent.trim());

        // 提取昵称
        const nicknameElements = document.querySelectorAll('span[data-e2e="fbc99397-6043-1b37"]');
        const nicknames = Array.from(nicknameElements).map(el => el.textContent.trim());

        contentContainer.innerHTML = '';

        // 显示筛选条件
        if (filters.length > 0) {
            const filterSection = document.createElement('div');
            filterSection.style.marginBottom = '15px';

            const filterTitle = document.createElement('div');
            filterTitle.textContent = '当前筛选条件:';
            filterTitle.style.fontWeight = 'bold';
            filterTitle.style.marginBottom = '8px';
            filterTitle.style.color = '#555';
            filterSection.appendChild(filterTitle);

            const filterList = document.createElement('div');
            filterList.style.backgroundColor = '#f8f9fa';
            filterList.style.padding = '10px';
            filterList.style.borderRadius = '5px';
            filterList.style.border = '1px solid #eee';

            filters.forEach(filter => {
                const filterItem = document.createElement('div');
                filterItem.textContent = `• ${filter}`;
                filterItem.style.marginBottom = '5px';
                filterItem.style.fontSize = '13px';
                filterList.appendChild(filterItem);
            });

            filterSection.appendChild(filterList);
            contentContainer.appendChild(filterSection);
        } else {
            const noFilterMsg = document.createElement('div');
            noFilterMsg.textContent = '当前没有筛选条件';
            noFilterMsg.style.color = '#6c757d';
            noFilterMsg.style.marginBottom = '15px';
            noFilterMsg.style.fontStyle = 'italic';
            contentContainer.appendChild(noFilterMsg);
        }

        // 显示达人昵称
        if (nicknameElements.length > 0) {
            const nicknameSection = document.createElement('div');

            const nicknameTitle = document.createElement('div');
            nicknameTitle.textContent = `达人昵称 (${nicknames.length}个):`;
            nicknameTitle.style.fontWeight = 'bold';
            nicknameTitle.style.marginBottom = '8px';
            nicknameTitle.style.color = '#555';
            nicknameSection.appendChild(nicknameTitle);

            const nicknameList = document.createElement('div');
            nicknameList.style.maxHeight = '200px';
            nicknameList.style.overflowY = 'auto';
            nicknameList.style.padding = '5px';

            nicknames.forEach((nickname, index) => {
                const nicknameItem = document.createElement('div');
                nicknameItem.style.display = 'flex';
                nicknameItem.style.alignItems = 'center';
                nicknameItem.style.marginBottom = '5px';
                nicknameItem.style.padding = '5px';
                nicknameItem.style.backgroundColor = index % 2 === 0 ? '#f8f9fa' : '#fff';
                nicknameItem.style.borderRadius = '3px';

                const nicknameText = document.createElement('span');
                nicknameText.textContent = nickname;
                nicknameText.style.flexGrow = '1';
                nicknameText.style.marginRight = '10px';
                nicknameText.style.whiteSpace = 'nowrap';
                nicknameText.style.overflow = 'hidden';
                nicknameText.style.textOverflow = 'ellipsis';
                nicknameText.style.fontSize = '13px';

                const copyButton = document.createElement('button');
                copyButton.textContent = '复制';
                copyButton.style.padding = '2px 8px';
                copyButton.style.cursor = 'pointer';
                copyButton.style.backgroundColor = '#6c757d';
                copyButton.style.color = '#fff';
                copyButton.style.border = 'none';
                copyButton.style.borderRadius = '3px';
                copyButton.style.fontSize = '12px';

                copyButton.addEventListener('click', () => {
                    navigator.clipboard.writeText(nickname).then(() => {
                        copyButton.textContent = '✓';
                        setTimeout(() => {
                            copyButton.textContent = '复制';
                        }, 1000);
                    });
                });

                nicknameItem.appendChild(nicknameText);
                nicknameItem.appendChild(copyButton);
                nicknameList.appendChild(nicknameItem);
            });

            nicknameSection.appendChild(nicknameList);
            contentContainer.appendChild(nicknameSection);
        } else {
            const noNicknameMsg = document.createElement('div');
            noNicknameMsg.textContent = '未找到达人昵称';
            noNicknameMsg.style.color = '#dc3545';
            noNicknameMsg.style.fontWeight = 'bold';
            contentContainer.appendChild(noNicknameMsg);
        }

        // 一键复制昵称功能
        copyNicknamesButton.onclick = () => {
            if (nicknames.length > 0) {
                const allNicknamesText = nicknames.join('\n');
                navigator.clipboard.writeText(allNicknamesText).then(() => {
                    copyNicknamesButton.textContent = '✓ 已复制';
                    copyNicknamesButton.style.backgroundColor = '#6c757d';
                    setTimeout(() => {
                        copyNicknamesButton.textContent = '复制所有昵称';
                        copyNicknamesButton.style.backgroundColor = '#28a745';
                    }, 1500);
                });
            }
        };

        // 一键复制筛选条件功能
        copyFiltersButton.onclick = () => {
            if (filters.length > 0) {
                const filtersText = filters.join('\n');
                navigator.clipboard.writeText(filtersText).then(() => {
                    copyFiltersButton.textContent = '✓ 已复制';
                    copyFiltersButton.style.backgroundColor = '#6c757d';
                    setTimeout(() => {
                        copyFiltersButton.textContent = '复制筛选条件';
                        copyFiltersButton.style.backgroundColor = '#17a2b8';
                    }, 1500);
                });
            } else {
                copyFiltersButton.textContent = '无筛选条件';
                copyFiltersButton.style.backgroundColor = '#6c757d';
                setTimeout(() => {
                    copyFiltersButton.textContent = '复制筛选条件';
                    copyFiltersButton.style.backgroundColor = '#17a2b8';
                }, 1500);
            }
        };
    }

    fetchButton.addEventListener('click', extractData);
})();
