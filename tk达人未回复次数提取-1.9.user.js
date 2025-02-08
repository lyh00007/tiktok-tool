// ==UserScript==
// @name         tk达人未回复次数提取
// @namespace    http://tampermonkey.net/
// @version      1.9
// @description  提取并复制聊天时间，月份转换为数字，仅显示带时间的日期，并显示消息是否已读或未读，最后显示未回复次数，日期格式修改为 yyyy/M/d，输出格式修改为包含"未回复X次"
// @author       @李懿恒
// @match        https://affiliate.tiktokglobalshop.com/seller/im*
// @grant        none
// ==/UserScript==

(function () {
    'use strict';

    // 月份映射
    const monthMap = {
        Jan: '01', Feb: '02', Mar: '03', Apr: '04', May: '05', Jun: '06',
        Jul: '07', Aug: '08', Sep: '09', Oct: '10', Nov: '11', Dec: '12'
    };

    // 创建浮动面板
    const panel = document.createElement('div');
    panel.style = `
        position: fixed;
        right: 10px;
        top: 30%;
        transform: translateY(-50%);
        width: 250px;
        background-color: #fff;
        border: 1px solid #ccc;
        box-shadow: 0 2px 8px rgba(0,0,0,0.2);
        padding: 10px;
        border-radius: 5px;
        z-index: 9999;
    `;

    // 标题与收起按钮
    const header = document.createElement('div');
    header.style = `display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;`;

    const title = document.createElement('h4');
    title.textContent = '聊天日期提取';
    title.style = `margin: 0; font-size: 16px;`;

    const toggleButton = document.createElement('button');
    toggleButton.textContent = '收起';
    toggleButton.style = `padding: 2px 6px; cursor: pointer; background-color: #ffc107; border: none; border-radius: 3px; font-size: 12px;`;

    header.append(title, toggleButton);
    panel.appendChild(header);

    // 内容展示区
    const contentContainer = document.createElement('div');
    contentContainer.textContent = '点击“提取内容”获取日期';
    contentContainer.style = `font-size: 12px; max-height: 300px; overflow-y: auto; margin-bottom: 10px;`;
    panel.appendChild(contentContainer);

    // 提取按钮
    const fetchButton = document.createElement('button');
    fetchButton.textContent = '提取内容';
    fetchButton.style = `display: block; margin: 0 auto; padding: 5px 10px; cursor: pointer; background-color: #007bff; color: #fff; border: none; border-radius: 3px;`;
    panel.appendChild(fetchButton);

    // 一键复制按钮
    const copyAllButton = document.createElement('button');
    copyAllButton.textContent = '一键复制所有日期';
    copyAllButton.style = `display: block; margin: 10px auto 0; padding: 5px 10px; cursor: pointer; background-color: #28a745; color: #fff; border: none; border-radius: 3px;`;
    panel.appendChild(copyAllButton);

    // 添加面板到页面
    document.body.appendChild(panel);

    // 收起面板功能
    let isPanelVisible = true;
    toggleButton.addEventListener('click', () => {
        isPanelVisible = !isPanelVisible;
        const displayValue = isPanelVisible ? 'block' : 'none';
        contentContainer.style.display = displayValue;
        fetchButton.style.display = displayValue;
        copyAllButton.style.display = displayValue;
        toggleButton.textContent = isPanelVisible ? '收起' : '展开';
    });

    // 提取聊天时间及消息状态，并统计未回复次数
    function extractContent() {
        const timeElements = document.querySelectorAll('time.chatd-time');
        contentContainer.innerHTML = ''; // 清空旧内容

        if (timeElements.length === 0) {
            contentContainer.textContent = '未找到符合要求的日期！';
            return;
        }

        const dateStats = {}; // 用于统计每个日期的未回复次数

        timeElements.forEach((el) => {
            const originalTime = el.textContent.trim();
            const convertedDate = formatDate(originalTime);
            if (!convertedDate) return; // 过滤掉不符合格式的日期

            const statusElement = el.closest('.chatd-message').querySelector('svg');
            let status = '未读';

            // 检查是否是已读消息
            if (statusElement && statusElement.getAttribute('viewBox') === '0 0 48 48') {
                status = '已读';
            }

            // 如果是未读或已读消息，都认为是未回复一次
            if (!dateStats[convertedDate]) {
                dateStats[convertedDate] = { status: status, count: 1 }; // 每个日期只出现一次
            }
        });

        if (Object.keys(dateStats).length === 0) {
            contentContainer.textContent = '未找到符合要求的日期！';
            return;
        }

        // 展示并提供复制功能
        let allDatesText = ''; // 用于保存复制文本
        let totalCount = 0; // 用于保存所有未回复数量的总和

        Object.entries(dateStats).forEach(([date, { status, count }]) => {
            allDatesText += `${date} - ${status} `;
            totalCount += count; // 每个日期只加一次未回复次数
        });

        // 在所有日期后面追加“未回复X次”
        allDatesText += `未回复次数:${totalCount}次`;

        // 用双引号包裹整个文本
        allDatesText = `"${allDatesText}"`;

        // 显示到面板中
        contentContainer.textContent = allDatesText;

        // 更新一键复制按钮
        copyAllButton.onclick = null;
        copyAllButton.addEventListener('click', () => {
            navigator.clipboard.writeText(allDatesText).then(() => {
                copyAllButton.textContent = '已复制所有日期';
                copyAllButton.style.backgroundColor = '#6c757d';
                copyAllButton.style.cursor = 'default';
            });
        });
    }

    // 修改日期格式为 yyyy/M/d
    function formatDate(timeString) {
        const regex = /^([A-Za-z]+) (\d{1,2}), (\d{4}) (\d{1,2}):(\d{2}) (AM|PM)$/;
        const match = timeString.match(regex);

        if (!match) return null; // 没匹配到完整日期+时间则忽略

        const [, monthStr, day, year] = match;
        const month = monthMap[monthStr]; // 转换月份

        return `${year}/${month}/${day.padStart(2, '0')}`; // 日期格式修改为 yyyy/MM/dd
    }

    fetchButton.addEventListener('click', extractContent);
})();
