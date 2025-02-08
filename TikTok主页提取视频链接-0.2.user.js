// ==UserScript==
// @name         TikTok主页提取视频链接
// @namespace    http://tampermonkey.net/
// @version      0.2
// @description  提取TikTok视频链接并显示在前端界面，增加一键复制功能，用于爬虫一键爬取无水印视频
// @author       李懿恒
// @match        https://www.tiktok.com/@*
// @grant        GM_addStyle
// ==/UserScript==

(function() {
    'use strict';

    // 插入按钮到页面
    const button = document.createElement('button');
    button.textContent = '获取所有视频链接';
    button.style.position = 'fixed';
    button.style.top = '20px'; // 改为顶部
    button.style.right = '20px';
    button.style.padding = '10px 20px';
    button.style.backgroundColor = '#ff0050';
    button.style.color = '#fff';
    button.style.border = 'none';
    button.style.borderRadius = '5px';
    button.style.fontSize = '16px';
    button.style.cursor = 'pointer';
    document.body.appendChild(button);

    // 给按钮添加点击事件
    button.addEventListener('click', () => {
        const videoLinks = document.querySelectorAll('a[href^="https://www.tiktok.com/@"]');
        const linksArray = Array.from(videoLinks).map(link => link.href);

        // 创建一个弹出框显示视频链接
        const dialog = document.createElement('div');
        dialog.style.position = 'fixed';
        dialog.style.top = '0';
        dialog.style.left = '0';
        dialog.style.width = '100%';
        dialog.style.height = '100%';
        dialog.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
        dialog.style.display = 'flex';
        dialog.style.justifyContent = 'center';
        dialog.style.alignItems = 'center';
        dialog.style.zIndex = '9999';

        const content = document.createElement('div');
        content.style.backgroundColor = '#fff';
        content.style.padding = '20px';
        content.style.borderRadius = '10px';
        content.style.maxWidth = '600px';
        content.style.maxHeight = '80%';
        content.style.overflowY = 'auto';
        content.style.textAlign = 'left';

        // 创建“复制所有链接”按钮
        const copyButton = document.createElement('button');
        copyButton.textContent = '复制所有链接';
        copyButton.style.padding = '5px 10px';
        copyButton.style.backgroundColor = '#007bff';
        copyButton.style.color = '#fff';
        copyButton.style.border = 'none';
        copyButton.style.borderRadius = '5px';
        copyButton.style.cursor = 'pointer';

        // 复制所有链接到剪切板
        copyButton.addEventListener('click', () => {
            const textToCopy = linksArray.join('\n');
            navigator.clipboard.writeText(textToCopy)
                .then(() => {
                    alert('链接已复制到剪切板!');
                })
                .catch(err => {
                    alert('复制失败，请重试');
                });
        });

        // 创建关闭按钮
        const closeButton = document.createElement('button');
        closeButton.textContent = '关闭';
        closeButton.style.padding = '5px 10px';
        closeButton.style.backgroundColor = '#ff0050';
        closeButton.style.color = '#fff';
        closeButton.style.border = 'none';
        closeButton.style.borderRadius = '5px';
        closeButton.style.cursor = 'pointer';

        // 使用flex布局使按钮并排
        const buttonContainer = document.createElement('div');
        buttonContainer.style.display = 'flex';
        buttonContainer.style.justifyContent = 'space-between'; // 左右分布
        buttonContainer.style.marginBottom = '10px';  // 按钮间距

        buttonContainer.appendChild(copyButton);
        buttonContainer.appendChild(closeButton);

        const linksList = document.createElement('ul');
        linksArray.forEach(link => {
            const listItem = document.createElement('li');
            const a = document.createElement('a');
            a.href = link;
            a.textContent = link;
            a.target = '_blank';  // 在新标签页打开链接
            listItem.appendChild(a);
            linksList.appendChild(listItem);
        });

        content.appendChild(buttonContainer);  // 将按钮容器添加到内容中
        content.appendChild(linksList);
        dialog.appendChild(content);
        document.body.appendChild(dialog);

        // 给关闭按钮添加事件，关闭弹出框
        closeButton.addEventListener('click', () => {
            document.body.removeChild(dialog);
        });
    });
})();
