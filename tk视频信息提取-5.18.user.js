// ==UserScript==
// @name         tk视频信息提取
// @namespace    http://tampermonkey.net/
// @version      5.18
// @description  tk主页提取标题标签播放时长等方便填表
// @author
// @match        https://www.tiktok.com/*
// @grant        GM_registerMenuCommand
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_getResourceText
// @grant        GM_addStyle
// @icon         https://iili.io/dy5xjOg.jpg
// @require      https://code.jquery.com/jquery-3.6.0.min.js
// @require      https://cdnjs.cloudflare.com/ajax/libs/toastify-js/1.12.0/toastify.min.js
// @resource     TOASTIFY_CSS https://cdn.jsdelivr.net/npm/toastify-js/src/toastify.min.css
// @downloadURL https://update.greasyfork.org/scripts/511957/TikTok%20%E5%B0%8F%E5%8A%A9%E6%89%8B.user.js
// @updateURL https://update.greasyfork.org/scripts/511957/TikTok%20%E5%B0%8F%E5%8A%A9%E6%89%8B.meta.js
// ==/UserScript==

(function() {
    'use strict';

    // 加载 Toastify.js 的 CSS
    const toastifyCSS = GM_getResourceText('TOASTIFY_CSS');
    GM_addStyle(toastifyCSS);

    // 现在可以使用 Toastify.js 了

    let currentUrl = window.location.href;
    let retryCount = 0;
    let dataDisplayed = false; // 新增标志位

    // 获取设置值，默认值为 false
    let autoShowDataPanel = GM_getValue('autoShowDataPanel', false);

    // 在脚本菜单中添加选项以设置是否自动弹出数据面板
    GM_registerMenuCommand('切换自动弹出数据面板', () => {
        autoShowDataPanel = !autoShowDataPanel;
        GM_setValue('autoShowDataPanel', autoShowDataPanel);
        alert(`自动弹出数据面板已${autoShowDataPanel ? '启用' : '禁用'}`);
    });

    // 注入按钮样式到页面
    function injectButtonStyles() {
        const styleElement = document.createElement('style');
        styleElement.type = 'text/css';
        styleElement.textContent = `
.button-87 {
  margin: 0px;
  padding: 10px 20px;
  text-align: center;
  text-transform: uppercase;
  transition: 0.5s;
  background-size: 200% auto;
  color: white;
  border-radius: 10px;
  display: block;
  border: 0px;
  font-weight: 700;
  box-shadow: 0px 0px 14px -7px #f09819;
  background-image: linear-gradient(45deg, #FF512F 0%, #F09819  51%, #FF512F  100%);
  cursor: pointer;
  user-select: none;
  -webkit-user-select: none;
  touch-action: manipulation;
}

.button-87:hover {
  background-position: right center;
  /* change the direction of the change here */
  color: #fff;
  text-decoration: none;
}

.button-87:active {
  transform: scale(0.95);
}
            `;
        document.head.appendChild(styleElement);
    }

    // 创建用于显示数据面板的按钮
    function createButton(parsedData) {
        const existingButton = document.querySelector('#tiktokDataButton');
        if (existingButton) {
            existingButton.remove();
        }

        // 创建新的按钮，使用您提供的样式类
        const button = document.createElement('button');
        button.id = 'tiktokDataButton';
        button.className = 'button-87';
        button.innerHTML = '🤓';
        button.style.position = 'fixed';
        button.style.top = '10px';
        button.style.right = '200px';
        button.style.zIndex = '10001';

        button.addEventListener('click', () => {
            toggleDataDisplay(parsedData);
        });

        document.body.appendChild(button);
        console.log('Button created and appended to the page.');

        createRefreshButton();
        injectButtonStyles(); // 注入样式
    }

    // 创建手动刷新数据的按钮
    function createRefreshButton() {
        const existingRefreshButton = document.querySelector('#tiktokRefreshButton');
        if (existingRefreshButton) {
            existingRefreshButton.remove();
        }

        const refreshButton = document.createElement('button');
        refreshButton.id = 'tiktokRefreshButton';
        refreshButton.className = 'button-87';
        refreshButton.innerHTML = '🔄 刷新数据';
        refreshButton.style.position = 'fixed';
        refreshButton.style.top = '10px';
        refreshButton.style.right = '280px';
        refreshButton.style.zIndex = '10001';

        refreshButton.addEventListener('click', () => {
            console.log('Manual refresh button clicked.');
            retryCount = 0;
            currentUrl = window.location.href;
            dataDisplayed = false; // 重置标志位
            extractStats(true);
        });

        document.body.appendChild(refreshButton);
    }

    // 切换数据面板的显示和隐藏
    function toggleDataDisplay(parsedData) {
        console.log('toggleDataDisplay called');
        let dataContainer = document.querySelector('#tiktokDataContainer');
        if (dataContainer) {
            dataContainer.style.transform = 'translateX(100%)';
            dataContainer.style.opacity = '0';
            setTimeout(() => {
                dataContainer.remove();
            }, 500);
            return;
        }

        dataContainer = document.createElement('div');
        dataContainer.id = 'tiktokDataContainer';
        dataContainer.style.transition = 'transform 0.5s ease-in-out, opacity 0.5s ease-in-out';
        dataContainer.style.transform = 'translateX(100%)';
        dataContainer.style.opacity = '0';
        dataContainer.style.position = 'fixed';
        dataContainer.style.top = '60px';
        dataContainer.style.right = '20px';
        dataContainer.style.width = '300px';
        dataContainer.style.maxHeight = '400px';
        dataContainer.style.overflowY = 'auto';
        dataContainer.style.backgroundColor = '#ffffff';
        dataContainer.style.border = '1px solid #ccc';
        dataContainer.style.borderRadius = '8px';
        dataContainer.style.boxShadow = '0px 0px 10px rgba(0, 0, 0, 0.1)';
        dataContainer.style.padding = '15px';
        dataContainer.style.zIndex = '10000';



        createJsonElement(parsedData, dataContainer);
        document.body.appendChild(dataContainer);
        setTimeout(() => {
            dataContainer.style.transform = 'translateX(0)';
            dataContainer.style.opacity = '1';
        }, 10);
    }

    // 创建用于显示数据的元素
    function createJsonElement(data, container) {
        const fields = ['diggCount', 'playCount', 'commentCount', 'shareCount', 'collectCount', 'createTime'];

        // 提取账户名，去掉 @ 符号
        const accountName = window.location.pathname.split('/')[1].replace('@', '');

        // Base64 编码的复制图标
        const base64CopyIcon = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAACXBIWXMAAAsTAAALEwEAmpwYAAAAYUlEQVR4nGNgGE7Am4GB4QkDA8N/MjFB8JgCw/8TNp4EheQCulvgTWacgILakxgLKImTR8RYAOP7kIhxBvWoBT6jQeQzmor+0zqjoYOhb8Fjahd26MCTTEtAhnsQY8HQAABVctFxfxXV5QAAAABJRU5ErkJggg==";

        // 获取视频当前播放时长和总时长
        const timeElement = document.querySelector('div.css-1cuqcrm-DivSeekBarTimeContainer.e1ya9dnw1');
        let currentTime = '00:00';
        let totalTime = '00:00';

        if (timeElement) {
            const timeText = timeElement.textContent.trim(); // 获取如 "00:30 / 00:35" 的文本
            const timeParts = timeText.split(' / ');
            if (timeParts.length === 2) {
                totalTime = timeParts[1].trim();   // 视频总时长 (右侧)
            }
        }
        // 将视频总时长转换为秒数
        const timeParts = totalTime.split(':');
        const minutes = parseInt(timeParts[0], 10);
        const seconds = parseInt(timeParts[1], 10);
        const totalSeconds = minutes * 60 + seconds;  // 计算总秒数

        // 创建账户名和复制图标
        const accountRow = document.createElement('div');
        accountRow.style.display = 'flex';
        accountRow.style.alignItems = 'center';
        accountRow.style.marginBottom = '5px';

        const accountNameElement = document.createElement('div');
        accountNameElement.style.fontWeight = 'bold';
        accountNameElement.style.fontSize = '20px';
        accountNameElement.textContent = `${accountName}`;

        const copyAccountIcon = document.createElement('img');
        copyAccountIcon.src = base64CopyIcon;
        copyAccountIcon.style.cursor = 'pointer';
        copyAccountIcon.style.width = '20px';
        copyAccountIcon.style.marginLeft = '10px';

        copyAccountIcon.addEventListener('click', (event) => {
            event.preventDefault();
            navigator.clipboard.writeText(accountName).then(() => {
                showNotification('已复制到剪贴板: ' + accountName);
            }).catch(err => {
                console.error('复制失败: ', err);
            });
        });

        accountRow.appendChild(accountNameElement);
        accountRow.appendChild(copyAccountIcon);
        container.appendChild(accountRow);

        // 处理播放量和发布时间
        // 处理播放量和发布时间
        let globalDateInfo = { dateStr: '', timeStr: '' };  // 用于存储日期和时间字符串

        if (data.hasOwnProperty('diggCount') || data.hasOwnProperty('createTime')) {
            // 播放量
            if (data.hasOwnProperty('diggCount')) {
                const playCountRow = document.createElement('div');
                playCountRow.style.display = 'flex';
                playCountRow.style.alignItems = 'center';
                playCountRow.style.marginBottom = '10px';

                const playCountText = document.createElement('span');
                playCountText.textContent = `视频总播放数: ${data.playCount}`; // 使用 playCount 的值
                playCountText.style.color = '#000';
                playCountRow.appendChild(playCountText);

                const playCountCopyIcon = document.createElement('img');
                playCountCopyIcon.src = base64CopyIcon;
                playCountCopyIcon.style.cursor = 'pointer';
                playCountCopyIcon.style.width = '20px';
                playCountCopyIcon.style.marginLeft = '10px';

                playCountCopyIcon.addEventListener('click', (event) => {
                    event.preventDefault();
                    navigator.clipboard.writeText(data.playCount).then(() => {
                        showNotification('已复制到剪贴板: ' + data.playCount);
                    }).catch(err => {
                        console.error('复制失败: ', err);
                    });
                });

                playCountRow.appendChild(playCountCopyIcon);
                container.appendChild(playCountRow);
            }

            // 发布时间
            if (data.hasOwnProperty('createTime') && data.createTime !== 0) {
                const date = new Date((data.createTime - 16 * 60 * 60) * 1000);

                const dateFormatter = new Intl.DateTimeFormat('en-US', {
                    year: 'numeric',
                    month: '2-digit',
                    day: '2-digit'
                });
                const timeFormatter = new Intl.DateTimeFormat('en-US', {
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit',
                    hour12: false
                });

                const dateStr = dateFormatter.format(date); // 例如：2024/12/10
                const timeStr = timeFormatter.format(date); // 例如：13:30:00

                globalDateInfo.dateStr = dateStr;  // 将日期字符串存储到全局变量
                globalDateInfo.timeStr = timeStr;  // 将时间字符串存储到全局变量

                // 视频发布时间
                const fullDateTimeRow = document.createElement('div');
                fullDateTimeRow.style.display = 'flex';
                fullDateTimeRow.style.alignItems = 'center';
                fullDateTimeRow.style.marginBottom = '10px';

                const fullDateTimeText = document.createElement('span');
                fullDateTimeText.textContent = `视频发布时间: ${timeStr}`;
                fullDateTimeText.style.color = '#000';
                fullDateTimeRow.appendChild(fullDateTimeText);

                const fullDateTimeCopyIcon = document.createElement('img');
                fullDateTimeCopyIcon.src = base64CopyIcon;
                fullDateTimeCopyIcon.style.cursor = 'pointer';
                fullDateTimeCopyIcon.style.width = '20px';
                fullDateTimeCopyIcon.style.marginLeft = '10px';

                fullDateTimeCopyIcon.addEventListener('click', (event) => {
                    event.preventDefault();
                    navigator.clipboard.writeText(timeStr).then(() => {
                        showNotification('已复制到剪贴板: ' + timeStr);
                    }).catch(err => {
                        console.error('复制失败: ', err);
                    });
                });

                fullDateTimeRow.appendChild(fullDateTimeCopyIcon);
                container.appendChild(fullDateTimeRow);

                // 视频发布日期
                const onlyDateRow = document.createElement('div');
                onlyDateRow.style.display = 'flex';
                onlyDateRow.style.alignItems = 'center';
                onlyDateRow.style.marginBottom = '10px';

                const onlyDateText = document.createElement('span');
                onlyDateText.textContent = `视频发布日期: ${dateStr}`;
                onlyDateText.style.color = '#000';
                onlyDateRow.appendChild(onlyDateText);

                const onlyDateCopyIcon = document.createElement('img');
                onlyDateCopyIcon.src = base64CopyIcon;
                onlyDateCopyIcon.style.cursor = 'pointer';
                onlyDateCopyIcon.style.width = '20px';
                onlyDateCopyIcon.style.marginLeft = '10px';

                onlyDateCopyIcon.addEventListener('click', (event) => {
                    event.preventDefault();
                    navigator.clipboard.writeText(dateStr).then(() => {
                        showNotification('已复制到剪贴板: ' + dateStr);
                    }).catch(err => {
                        console.error('复制失败: ', err);
                    });
                });

                onlyDateRow.appendChild(onlyDateCopyIcon);
                container.appendChild(onlyDateRow);
            }
        }


        // 提取标题和标签
        const titleElement = document.querySelector('h1[data-e2e="browse-video-desc"]');
        let title = '无'; // 默认标题为 "无"

        if (titleElement) {
            title = Array.from(titleElement.querySelectorAll('span[data-e2e="new-desc-span"]'))
                .map(span => span.textContent.trim())
                .join(' ');
            // 如果拼接后的标题仍然为空字符串，则将其设为 "无"
            if (!title.trim()) {
                title = '无';
            }
        }

        // 提取标签
        const tags = [];
        const tagElements = document.querySelectorAll('h1[data-e2e="browse-video-desc"] a[data-e2e="search-common-link"]');
        tagElements.forEach(tag => {
            tags.push(tag.textContent.trim());
        });

        // 创建标题显示
        const titleRow = document.createElement('div');
        titleRow.style.marginBottom = '10px';

        const titleElementDisplay = document.createElement('div');
        titleElementDisplay.textContent = `标题: ${title}`;
        titleRow.appendChild(titleElementDisplay);

        const copyTitleIcon = document.createElement('img');
        copyTitleIcon.src = base64CopyIcon;
        copyTitleIcon.style.cursor = 'pointer';
        copyTitleIcon.style.width = '20px';
        copyTitleIcon.style.marginLeft = '10px';

        copyTitleIcon.addEventListener('click', (event) => {
            event.preventDefault();
            navigator.clipboard.writeText(title).then(() => {
                showNotification('已复制到剪贴板: ' + title);
            }).catch(err => {
                console.error('复制失败: ', err);
            });
        });

        titleRow.appendChild(copyTitleIcon);
        container.appendChild(titleRow);

        // 创建标签显示
        const tagsRow = document.createElement('div');
        tagsRow.style.marginBottom = '10px';

        const tagsElement = document.createElement('div');
        tagsElement.textContent = `标签: ${tags.join(' ')}`;
        tagsRow.appendChild(tagsElement);

        const copyTagsIcon = document.createElement('img');
        copyTagsIcon.src = base64CopyIcon;
        copyTagsIcon.style.cursor = 'pointer';
        copyTagsIcon.style.width = '20px';
        copyTagsIcon.style.marginLeft = '10px';

        copyTagsIcon.addEventListener('click', (event) => {
            event.preventDefault();
            navigator.clipboard.writeText(tags.join(', ')).then(() => {
                showNotification('已复制到剪贴板: ' + tags.join(' '));
            }).catch(err => {
                console.error('复制失败: ', err);
            });
        });

        tagsRow.appendChild(copyTagsIcon);
        container.appendChild(tagsRow);

        // 添加音乐网址和复制功能
        // 添加音乐网址和复制功能
        const musicElement = document.querySelector('a.css-esfad-StyledLink.epjbyn1.link-a11y-focus');
        let musicUrl = '无音乐链接'; // 默认值为无音乐链接
        let musicText = '未知音乐'; // 默认值为未知音乐

        if (musicElement) {
            musicUrl = musicElement.href; // 获取音乐链接
            musicText = musicElement.querySelector('div.css-pvx3oa-DivMusicText.epjbyn3')?.textContent || '未知音乐';

            const musicRow = document.createElement('div');
            musicRow.style.display = 'flex';
            musicRow.style.alignItems = 'center';
            musicRow.style.marginBottom = '10px';

            const musicInfo = document.createElement('div');
            musicInfo.textContent = `音乐: ${musicText}`;
            musicInfo.style.color = '#000000';

            const musicLink = document.createElement('a');
            musicLink.href = musicUrl;
            musicLink.textContent = '点击播放音乐';
            musicLink.style.marginLeft = '10px';
            musicLink.style.color = '#1d9bf0';
            musicLink.style.textDecoration = 'none';
            musicLink.target = '_blank';

            const copyMusicIcon = document.createElement('img');
            copyMusicIcon.src = base64CopyIcon;
            copyMusicIcon.style.cursor = 'pointer';
            copyMusicIcon.style.width = '20px';
            copyMusicIcon.style.marginLeft = '10px';

            copyMusicIcon.addEventListener('click', (event) => {
                event.preventDefault();
                navigator.clipboard.writeText(musicUrl).then(() => {
                    showNotification('已复制到剪贴板: ' + musicUrl);
                }).catch(err => {
                    console.error('复制失败: ', err);
                });
            });

            musicRow.appendChild(musicInfo);
            musicRow.appendChild(musicLink);
            musicRow.appendChild(copyMusicIcon);
            container.appendChild(musicRow);
        } else {
            console.warn('未找到音乐信息元素');
        }

        // 创建视频播放时长和复制图标
        const timeRow = document.createElement('div');
        timeRow.style.display = 'flex';
        timeRow.style.alignItems = 'center';
        timeRow.style.marginBottom = '10px';

        const timeText = document.createElement('div');
        timeText.textContent = `播放时长: ${totalSeconds}`;

        const copyTimeIcon = document.createElement('img');
        copyTimeIcon.src = base64CopyIcon;
        copyTimeIcon.style.cursor = 'pointer';
        copyTimeIcon.style.width = '20px';
        copyTimeIcon.style.marginLeft = '10px';

        copyTimeIcon.addEventListener('click', (event) => {
            event.preventDefault();
            navigator.clipboard.writeText(`${totalSeconds}`).then(() => {
                showNotification('已复制到剪贴板: ' + `${totalSeconds}`);
            }).catch(err => {
                console.error('复制失败: ', err);
            });
        });

        timeRow.appendChild(timeText);
        timeRow.appendChild(copyTimeIcon);
        container.appendChild(timeRow);

        // 创建一键复制按钮
        const oneClickCopyButton = document.createElement('button');
        oneClickCopyButton.textContent = '点我一键复制';
        oneClickCopyButton.style.marginTop = '10px'; // 缩小按钮与其他元素的间距
        oneClickCopyButton.style.cursor = 'pointer'; // 鼠标指针变化，表明按钮可点击
        oneClickCopyButton.style.padding = '5px 10px'; // 缩小按钮内部填充
        oneClickCopyButton.style.fontSize = '12px'; // 缩小字体
        oneClickCopyButton.style.backgroundColor = '#28a745';
        oneClickCopyButton.style.color = 'white';
        oneClickCopyButton.style.border = 'none';
        oneClickCopyButton.style.borderRadius = '3px'; // 缩小圆角

        oneClickCopyButton.addEventListener('click', (event) => {
            event.preventDefault();

            // 拼接内容，包含音乐链接和日期、时间
            const content = `${globalDateInfo.dateStr}\t${globalDateInfo.timeStr}\t${accountName}\t@李懿恒\t原创\t${totalSeconds}\t${title}\t${tags.join(', ')}\t${musicUrl}\t${data.playCount}`;

            // 复制到剪贴板
            navigator.clipboard.writeText(content).then(() => {
                // 显示通知
                showNotification('已复制到剪贴板: ' + content);
            }).catch(err => {
                console.error('复制失败: ', err); // 输出失败的详细错误信息
                alert('复制失败，请检查浏览器权限设置或重新尝试');
            });
        });


        // 将按钮添加到容器的顶部
        container.prepend(oneClickCopyButton);
    }





    // 使用 MutationObserver 监听页面变化
    const observer = new MutationObserver(() => {
        const musicLinkElement = document.querySelector('a[aria-label*="Watch more videos with music"]');
        if (musicLinkElement) {
            const musicUrl = musicLinkElement.href;
            const musicName = musicLinkElement.querySelector('.css-pvx3oa-DivMusicText') ? musicLinkElement.querySelector('.css-pvx3oa-DivMusicText').textContent : '未知音乐';

            // 创建音乐显示区域
            const musicRow = document.createElement('div');
            musicRow.style.marginBottom = '10px';

            const musicText = document.createElement('div');
            musicText.textContent = `音乐: ${musicName} (${musicUrl})`;

            const copyMusicIcon = document.createElement('img');
            copyMusicIcon.src = base64CopyIcon;
            copyMusicIcon.style.cursor = 'pointer';
            copyMusicIcon.style.width = '20px';
            copyMusicIcon.style.marginLeft = '10px';

            copyMusicIcon.addEventListener('click', (event) => {
                event.preventDefault();
                navigator.clipboard.writeText(musicUrl).then(() => {
                    showNotification('已复制到剪贴板: ' + musicUrl);
                }).catch(err => {
                    console.error('复制失败: ', err);
                });
            });

            musicRow.appendChild(musicText);
            musicRow.appendChild(copyMusicIcon);
            container.appendChild(musicRow);

            // 停止监听器，防止重复操作
            observer.disconnect();
        }
    });

    // 配置观察器选项，监听 DOM 树的变化
    const config = { childList: true, subtree: true };

    // 开始监听
    observer.observe(document.body, config);

    // 提取视频统计信息
    function extractStats(isManual = false) {
        fetch(window.location.href)
            .then(response => response.text())
            .then(responseText => {
            const scriptMatch = responseText.match(/<script id="__UNIVERSAL_DATA_FOR_REHYDRATION__" type="application\/json">([\s\S]*?)<\/script>/);
            if (scriptMatch) {
                try {
                    const jsonData = JSON.parse(scriptMatch[1]);
                    console.log('Attempting to extract data from script tag:', jsonData);
                    const stats = findStats(jsonData);
                    if (stats) {
                        console.log('Video stats found:', stats);
                        extractFollowerCount(stats, () => {
                            if (autoShowDataPanel && !dataDisplayed) {
                                toggleDataDisplay(stats);
                                dataDisplayed = true;
                            }
                        });
                        if (isManual) {
                            showNotification('数据已成功刷新');
                        }
                    } else {
                        console.warn('No relevant stats found in the script tag.');
                    }
                } catch (e) {
                    console.error('Error parsing script tag:', e);
                }
            } else {
                console.warn('Script tag "__UNIVERSAL_DATA_FOR_REHYDRATION__" not found.');
                if (!isManual) {
                    retryExtractStats();
                }
            }
        });
    }

    // 重试提取数据
    function retryExtractStats() {
        if (retryCount < 5) {
            setTimeout(() => {
                console.log('Retrying data extraction...');
                retryCount++;
                extractStats();
            }, 2000);
        } else {
            console.warn('Max retry attempts reached. Data extraction failed.');
        }
    }

    // 提取粉丝数量
    function extractFollowerCount(stats, callback) {
        const userUrl = `https://www.tiktok.com/${window.location.pathname.split('/')[1]}`;

        fetch(userUrl)
            .then(response => response.text())
            .then(responseText => {
            const scriptMatch = responseText.match(/<script id="__UNIVERSAL_DATA_FOR_REHYDRATION__" type="application\/json">([\s\S]*?)<\/script>/);
            if (scriptMatch) {
                try {
                    const obj = JSON.parse(scriptMatch[1]);
                    const followerCount = findFollowerCount(obj);
                    if (followerCount !== null) {
                        stats.followerCount = followerCount;
                        createButton(stats);
                        if (typeof callback === 'function') {
                            callback();
                        }
                    } else {
                        console.warn('未找到粉丝计数。');
                    }
                } catch (error) {
                    console.error('解析 JSON 时出错:', error);
                }
            } else {
                console.log('未找到包含页面数据的 <script> 标签。');
            }
        })
            .catch(error => {
            console.error('请求用户页面时出错:', error);
        });
    }

    // 在页面加载完成后运行 extractStats
    window.addEventListener('load', () => {
        console.log('Page fully loaded, attempting to extract stats.');
        extractStats();
    });

    // 监听 URL 变化并重新运行 extractStats
    setInterval(() => {
        if (currentUrl !== window.location.href) {
            console.log('URL changed, attempting to extract stats again.');
            currentUrl = window.location.href;
            retryCount = 0;
            dataDisplayed = false; // 重置标志位
            extractStats();
        }
    }, 1000);

    // 查找视频统计信息
    function findStats(jsonData) {
        let result = null;
        function recursiveSearch(obj) {
            for (const key in obj) {
                if (typeof obj[key] === 'object' && obj[key] !== null) {
                    recursiveSearch(obj[key]);
                } else if ((key === 'diggCount' || key === 'playCount' || key === 'commentCount' || key === 'shareCount' || key === 'collectCount' || key === 'createTime') && obj[key] !== 0) {
                    if (!result) {
                        result = {};
                    }
                    result[key] = obj[key];
                }
            }
        }
        recursiveSearch(jsonData);
        return result;
    }

    // 查找粉丝数量
    function findFollowerCount(jsonData) {
        let followerCount = null;
        function recursiveSearch(obj) {
            for (const key in obj) {
                if (key === 'followerCount') {
                    followerCount = obj[key];
                    return;
                }
                if (typeof obj[key] === 'object' && obj[key] !== null) {
                    recursiveSearch(obj[key]);
                }
            }
        }
        recursiveSearch(jsonData);
        return followerCount;
    }

    // 显示通知
    function showNotification(message) {
        Toastify({
            text: message,
            duration: 3000,
            close: true,
            gravity: 'top', // `top` 或 `bottom`
            position: 'center', // `left`, `center` 或 `right`
            style: {
                background: getRandomGradientColor(),
                color: '#FFFFFF', // 可选，设置文字颜色为白色
                borderRadius: '5px',
            },
            stopOnFocus: true, // 鼠标悬停时停止关闭
        }).showToast();
    }

    // 获取随机的渐变颜色
    function getRandomGradientColor() {
        const gradients = [
            'linear-gradient(to right, #FF512F, #F09819)',
            'linear-gradient(to right, #00b09b, #96c93d)',
            'linear-gradient(to right, #ff5f6d, #ffc371)',
            'linear-gradient(to right, #2193b0, #6dd5ed)',
            'linear-gradient(to right, #cc2b5e, #753a88)',
            'linear-gradient(to right, #ee9ca7, #ffdde1)',
            'linear-gradient(to right, #b92b27, #1565C0)',
            'linear-gradient(to right, #373B44, #4286f4)',
            'linear-gradient(to right, #ff7e5f, #feb47b)',
            'linear-gradient(to right, #8360c3, #2ebf91)'
        ];
        return gradients[Math.floor(Math.random() * gradients.length)];
    }


})();
