import requests

def search_tiktok_user(keyword):
    # 设置 URL 和请求参数
    url = "https://www.tiktok.com/api/search/user/full/"
    params = {
        "WebIdLastTime": "1734316718",
        "aid": "1988",
        "app_language": "zh-Hans",
        "app_name": "tiktok_web",
        "browser_language": "zh-CN",
        "browser_name": "Mozilla",
        "browser_online": "true",
        "browser_platform": "Win32",
        "browser_version": "5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Safari/537.36 Edg/133.0.0.0",
        "channel": "tiktok_web",
        "cookie_enabled": "true",
        "cursor": "0",
        "data_collection_enabled": "true",
        "device_id": "7448831591881262599",
        "device_platform": "web_pc",
        "focus_state": "true",
        "from_page": "search",
        "history_len": "10",
        "is_fullscreen": "false",
        "is_page_visible": "true",
        "keyword": keyword,  # 使用传入的 keyword 参数
        "odinId": "7446334354118968351",
        "os": "windows",
        "priority_region": "US",
        "referer": "",
        "region": "SG",
        "screen_height": "1080",
        "screen_width": "1920",
        "tz_name": "Asia/Shanghai",
        "user_is_login": "true",
        "web_search_code": '{"tiktok":{"client_params_x":{"search_engine":{"ies_mt_user_live_video_card_use_libra":1,"mt_search_general_user_live_card":1}},"search_server":{}}}',
        "webcast_language": "zh-Hans",
        "msToken": "NWXpz37ifO7AS_GCJjKYLdcYDCvL6mXgJaTjpumuTGJO7l7XeO7IuU5pzZVozSVHXkGo1-qpDmNv2x8zm52q1Iwi0HAnB9hVO_0CdQgLtcBRe8KdisyAyztZjhid-oMUdeRUdl_PFNwOkR2wKkZkAqzGDlxuIg==",
        "X-Bogus": "DFSzswVLJwTANjIHtDpekU/Rss97",
        "_signature": "_02B4Z6wo00001zBbLtwAAIDDCEgeWHsn1.MwWypAAKut59"
    }

    # 设置请求头，包括 Cookie
    headers = {
        "Cookie": "在这里输入你的cookie",
    }

    # 发起 GET 请求
    response = requests.get(url, params=params, headers=headers)

    # 检查请求是否成功
    if response.status_code == 200:
        data = response.json()
        # 获取第一个用户的 unique_id
        unique_id = data["user_list"][0]["user_info"]["unique_id"]
        return unique_id
    else:
        return {"error": "请求失败"}

def batch_search_tiktok_users(file_path, output_path):
    with open(file_path, 'r', encoding='utf-8') as file:
        # 读取文件中的昵称列表
        keywords = file.readlines()

    # 移除多余的空白字符
    keywords = [keyword.strip() for keyword in keywords]

    total = len(keywords)  # 总共要处理的昵称数
    with open(output_path, 'w', encoding='utf-8') as output_file:
        for index, keyword in enumerate(keywords, start=1):
            unique_id = search_tiktok_user(keyword)
            if unique_id:
                output_file.write(f"{unique_id}\n")
            else:
                output_file.write(f"请求失败\n")

            # 打印进度
            progress = (index / total) * 100
            print(f"处理进度: {index}/{total} ({progress:.2f}%)")

# 示例调用，文件位置记得更换
file_path = r"F:\python_project\tk工作相关\达人批量昵称转名称\昵称.txt"
output_path = r"F:\python_project\tk工作相关\达人批量昵称转名称\转换后的昵称.txt"
batch_search_tiktok_users(file_path, output_path)
