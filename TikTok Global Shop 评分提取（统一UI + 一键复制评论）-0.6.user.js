// ==UserScript==
// @name         TikTok  Shop 评分提取（一键复制评论）
// @namespace    http://tampermonkey.net/
// @version      0.6
// @description  提取 TikTok Global Shop 评分内容，支持一键复制所有内容和一键复制评论
// @author       李懿恒
// @match        https://seller.us.tiktokglobalshop.com/product/rating?shop_region=US
// @grant        none
// ==/UserScript==

(function () {
    'use strict';

    // 创建浮动交互面板
    const panel = document.createElement('div');
    panel.style.position = 'fixed';
    panel.style.right = '10px';
    panel.style.top = '50%';
    panel.style.transform = 'translateY(-50%)';
    panel.style.width = '300px'; // 稍微加宽
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
    title.textContent = '评分快速提取';
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
    contentContainer.textContent = '点击“提取评分”爬取内容';
    contentContainer.style.marginBottom = '10px';
    contentContainer.style.fontSize = '12px';
    contentContainer.style.maxHeight = '300px';
    contentContainer.style.overflowY = 'auto';
    panel.appendChild(contentContainer);

    // 提取按钮
    const fetchButton = document.createElement('button');
    fetchButton.textContent = '提取评分';
    fetchButton.style.padding = '5px 10px';
    fetchButton.style.cursor = 'pointer';
    fetchButton.style.backgroundColor = '#007bff';
    fetchButton.style.color = '#fff';
    fetchButton.style.border = 'none';
    fetchButton.style.borderRadius = '3px';
    fetchButton.style.display = 'block';
    fetchButton.style.margin = '0 auto';
    panel.appendChild(fetchButton);

    // 一键复制所有内容按钮
    const copyAllButton = document.createElement('button');
    copyAllButton.textContent = '一键复制所有内容';
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

    // 一键复制评论按钮
    const copyCommentsButton = document.createElement('button');
    copyCommentsButton.textContent = '一键复制评论';
    copyCommentsButton.style.padding = '5px 10px';
    copyCommentsButton.style.cursor = 'pointer';
    copyCommentsButton.style.backgroundColor = '#17a2b8';
    copyCommentsButton.style.color = '#fff';
    copyCommentsButton.style.border = 'none';
    copyCommentsButton.style.borderRadius = '3px';
    copyCommentsButton.style.display = 'block';
    copyCommentsButton.style.margin = '10px auto 0';
    copyCommentsButton.style.fontSize = '14px';
    panel.appendChild(copyCommentsButton);

    // 将面板添加到页面
    document.body.appendChild(panel);

    // 收起功能
    let isPanelVisible = true;
    toggleButton.addEventListener('click', () => {
        isPanelVisible = !isPanelVisible;
        contentContainer.style.display = isPanelVisible ? 'block' : 'none';
        fetchButton.style.display = isPanelVisible ? 'block' : 'none';
        copyAllButton.style.display = isPanelVisible ? 'block' : 'none';
        copyCommentsButton.style.display = isPanelVisible ? 'block' : 'none';
        toggleButton.textContent = isPanelVisible ? '收起' : '展开';
    });

    // 存储所有提取的内容和评论
    let allContent = '';
    let allComments = '';

    // 提取评分内容
    fetchButton.addEventListener('click', () => {
        // 清空之前的内容
        contentContainer.innerHTML = '';
        allContent = '';
        allComments = '';

        // 查找所有符合条件的元素
        const ratingItems = document.querySelectorAll('.ratingListItem-B1nrTf');
        if (ratingItems.length === 0) {
            contentContainer.textContent = '未找到评分内容，请确保页面已加载完成。';
        } else {
            ratingItems.forEach((item, index) => {
                // 提取各部分内容
                const userName = item.querySelector('.userNameText-liH8Yx')?.textContent || '无用户名';
                const ratingStars = item.querySelectorAll('.ratingStar-S5n4th svg.activeStar-ux5seX').length || 0;
                const reviewText = item.querySelector('.reviewText-Ee2y0w')?.textContent || '无评论';
                const orderId = item.querySelector('.productItemInfoOrderIdText-HupNQY')?.textContent || '无订单ID';
                const sellerReply = item.querySelector('.sellerReply-zEkCPf .replyText-DyMaxF')?.textContent || '无商家回复';
                const productId = item.querySelector('.productItemInfoProductId-VozR0D')?.textContent || '无商品ID';
                const productColor = item.querySelector('.productItemInfoSku-sFHEE8')?.textContent || '无商品颜色';
                const reviewTime = item.querySelector('.reviewTime-o_Ejvq span')?.textContent || '无日期';

                // 按指定格式拼接内容
                const formattedContent = `
用户名: ${userName}
评分: ${ratingStars} 星
评论: ${reviewText}
订单ID: ${orderId}
商家回复: ${sellerReply}
商品ID: ${productId}
商品颜色: ${productColor}
日期: ${reviewTime}
`;

                // 添加到所有内容中
                allContent += formattedContent + '\n\n';

                // 添加到所有评论中
                allComments += `${reviewText}\n\n`;

                // 创建内容容器
                const contentDiv = document.createElement('div');
                contentDiv.style.marginBottom = '10px';
                contentDiv.style.borderBottom = '1px solid #eee';
                contentDiv.style.paddingBottom = '10px';

                // 添加内容
                const content = document.createElement('pre'); // 使用 <pre> 保留格式
                content.textContent = formattedContent;
                content.style.whiteSpace = 'pre-wrap'; // 保留换行和空格

                // 将内容添加到容器中
                contentDiv.appendChild(content);
                contentContainer.appendChild(contentDiv);
            });
        }
    });

    // 一键复制所有内容
    copyAllButton.addEventListener('click', () => {
        if (allContent) {
            navigator.clipboard.writeText(allContent).then(() => {
                alert('所有内容已复制到剪贴板！');
            }).catch(err => {
                console.error('复制失败: ', err);
            });
        } else {
            alert('请先点击“提取评分”获取内容！');
        }
    });

    // 一键复制评论
    copyCommentsButton.addEventListener('click', () => {
        if (allComments) {
            navigator.clipboard.writeText(allComments).then(() => {
                alert('所有评论已复制到剪贴板！');
            }).catch(err => {
                console.error('复制失败: ', err);
            });
        } else {
            alert('请先点击“提取评分”获取内容！');
        }
    });

    // 监听页面变化（动态加载的内容）
    const observer = new MutationObserver(() => {
        // 如果评分内容加载完成，可以做一些额外操作
        const ratingItems = document.querySelectorAll('.ratingListItem-B1nrTf');
        if (ratingItems.length > 0) {
            console.log('评分内容已加载！');
        }
    });

    // 开始观察页面变化
    observer.observe(document.body, { childList: true, subtree: true });
})();