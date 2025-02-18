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
        "Cookie": "tt_chain_token=5BUjkyGPzeZfDX5ddyOV9w==; tiktok_webapp_theme=light; delay_guest_mode_vid=8; d_ticket=ba8bab940fd1c9b9bd4219174cb09c6d475d8; uid_tt=68daf4e42f3fa430480c1b7de1673e82cf30de29de466cdbf9c242babfe27352; uid_tt_ss=68daf4e42f3fa430480c1b7de1673e82cf30de29de466cdbf9c242babfe27352; sid_tt=189d6e99f79b4dc25b6c3b3c74044a8f; sessionid=189d6e99f79b4dc25b6c3b3c74044a8f; sessionid_ss=189d6e99f79b4dc25b6c3b3c74044a8f; store-idc=useast5; store-country-code=us; store-country-code-src=uid; tt-target-idc=useast5; tt-target-idc-sign=fY7ywMZpMgPQ5Umo44NpFZjwtINs1gPcIKlgS3xfx95YYr2bGBkthN3Bh150UYu2GlKscNcl5SynYMIPkGfzwPPxojLAiv7u3sQm9_hnptKF8Dv-wx94rvedFWjjTXOXi1221ntrPINae9tVmDeoVP_omS3xjVtc2Bjsr0k378N-33bCPn5QyrjqB_ugh--P3EvwoGuquo9i_qf2mOHDKnClrCKyUsz78bC8PDx5WUVW4ZvU6tRjpeQUzRUT73us_H4M5L_M3KeBjoaPeZoiPDhSLKmN_S_cQiv6HDjgdgRb8iUSZNoORKLs-dDv2Yb5CA7aexoNqN9Z337IR6IlOsII7-C8gtJZP7c1JKVkPoE-xxmM1sikw-h7alWV5OG4N971z_6q2Ee0bVb5PcaQEA9c8EbGOiMrRJ86DWVBi2Tra2u11L3rhw8_tkIf2L8QbbM9piNQbeidnzPWd4KjHWz88T3A_v8r3lgB-06VQshcs-Ugw1XElPjIJZmaoWrA; last_login_method=email; sid_guard=189d6e99f79b4dc25b6c3b3c74044a8f%7C1734316725%7C15551993%7CSat%2C+14-Jun-2025+02%3A38%3A38+GMT; sid_ucp_v1=1.0.0-KGI4NDZiMmYwMzAwYzZlNGIxZDMxYzJlMDkzOWRhZjg0YWQxZmExNWUKGgifiLLAyLSsq2cQtaX-ugYYsws4AUDqB0gEEAQaB3VzZWFzdDUiIDE4OWQ2ZTk5Zjc5YjRkYzI1YjZjM2IzYzc0MDQ0YThm; ssid_ucp_v1=1.0.0-KGI4NDZiMmYwMzAwYzZlNGIxZDMxYzJlMDkzOWRhZjg0YWQxZmExNWUKGgifiLLAyLSsq2cQtaX-ugYYsws4AUDqB0gEEAQaB3VzZWFzdDUiIDE4OWQ2ZTk5Zjc5YjRkYzI1YjZjM2IzYzc0MDQ0YThm; _ga=GA1.1.125834232.1734578586; _tt_enable_cookie=1; _uetvid=901585f0bdb811ef8bd3cb6dd1685dd7; _gtmeec=e30%3D; _fbp=fb.1.1734578596653.1144421387; _ga_BZBQ2QHQSP=GS1.1.1734578585.1.1.1734579478.0.0.789117666; _ttp=2qbYjTF863NoUS4x7M3dLjSK1zA; tiktok_webapp_lang=zh-Hans; tiktok_webapp_theme_source=auto; odin_tt=9c11c483640f97c7d3b7bb674b62644e4a479f7da70875c7d9ba824be1d6400e358788cc8a2c52b18e8da0533b6fd3a6431fc4b275b0316b279cb7ff62738f67a0d860c51d3b5b75d30ab526ef9cdea8; tt_csrf_token=TsIfJFij-aO6v0hnsMjg2Ads_JTyCRTycIfE; passport_fe_beating_status=true; ttwid=1%7COyCrlkTViMULrbeFgteqcFB674B6Hq9GZ-9VBAT2d7c%7C1739864252%7Cf26054272588074f368a8c7014d71f4e5337d2fe9022a5df2974541d0c58bdb1; ak_bmsc=972AAB7685CEF61704E2F79668E20ED8~000000000000000000000000000000~YAAQjTVDF6j2ThKVAQAANjwHGBrpyIPCxtNNU5+ZHUjXuNtJ8UJj297rsEYENKiXpNKAU5s0rg+O+VLpmIK20wJuQChIE7DNWyxDxZUOBDApPOWQ2XFUIhgmnLpgrguPj1x6MAqTEWIJKGGuMcVTgttZB1M0g6BvjXgPBi/F1u9mTy8Cxxpfsx4UveyZLjwv7S2tpE/jUodtC1VuF5qhVEQqb1wa7vwjOPEzk7cPmGK3S+4FTP8ineLePrZxJmmqj8EaN8sI2NhJReeIXMs/MSp3CY1BxD1WEu9hAM2PEaMgydid7YOTq39Qc9JmT6Eel7KFmumXtl4TQ93U746EsisN5M+jRLvNb+HhNe4/uobmhIjPz7AteEpc32QCNK97IhWyb7x1i/Z1; bm_sv=612403C5731B419FE1861F9DAF5DEC8A~YAAQjTVDF6n2ThKVAQAA4T4HGBqOym0wtliGpxWHDcNGKdgfchRLj7lvj1FVZIl+42nh7bh1/eUEFVLQdd0PsBqkubKvQFpMoiDdukZ+ttNjpTGuU7S5WoBNDcvaTcDGTEVjJL/HZK3KXYrGeH3OrEQfZ62dXRJRvLJl7pLyrCvX8TxslU05wtz1vyU6YSziJuG46gkGnQ1DsbNnxYYbHuRDlMCGP7rNXyri10V+OcdPQ1RQbGGJ6sz0+0BY7lzjJZoV4bA0MRfINyzLX5LKcGhZPpxhK9DEnz3ZYFDEsDOfbcklg7jmkmW6pS+aj1wNjOxg5LdrfTkMb8jD5HYbeIQXWsbWvZXmc2t0Ik+fCuJdXvhtCzQ==",
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

# 示例调用
file_path = r"F:\python_project\tk工作相关\达人批量昵称转名称\昵称.txt"
output_path = r"F:\python_project\tk工作相关\达人批量昵称转名称\转换后的昵称.txt"
batch_search_tiktok_users(file_path, output_path)