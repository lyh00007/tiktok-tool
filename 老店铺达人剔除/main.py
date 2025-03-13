import os
import pandas as pd

def remove_existing_influencers(new_file, directory, output_file):
    # 读取新达人列表
    new_df = pd.read_excel(new_file, header=None, skiprows=1, usecols=[0])
    new_df.columns = ['达人昵称']

    # 初始化一个集合来存储所有已有达人
    existing_influencers = set()

    # 遍历目录下的所有.xlsx文件
    for filename in os.listdir(directory):
        if filename.endswith('.xlsx') and filename != os.path.basename(new_file):
            file_path = os.path.join(directory, filename)
            df = pd.read_excel(file_path, header=None, skiprows=1, usecols=[0])
            df.columns = ['达人昵称']
            existing_influencers.update(df['达人昵称'])

    # 找出新文件中已经存在于已有达人文件中的达人
    removed_df = new_df[new_df['达人昵称'].isin(existing_influencers)]

    # 剔除已经存在的达人
    unique_df = new_df[~new_df['达人昵称'].isin(existing_influencers)]

    # 保存剔除后的达人列表到新文件
    unique_df.to_excel(output_file, index=False, header=['达人昵称'])

    # 打印被剔除的达人列表
    if not removed_df.empty:
        print("以下达人已被剔除：")
        for influencer in removed_df['达人昵称']:
            print(influencer)
    else:
        print("没有需要剔除的达人。")

    print(f"剔除后的达人列表已保存到 {output_file}")

# 文件路径
new_file = 'E:\\桌面\\Super Browser\\TK-SILWIN(HK) LIMITED\\超级优质达人-49人.xlsx'  # 新达人列表文件路径
directory = 'E:\\桌面\\Super Browser\\TK-SILWIN(HK) LIMITED'  # 目录路径
output_file = 'E:\\桌面\\Super Browser\\TK-SILWIN(HK) LIMITED\\去重后达人列表.xlsx'  # 输出文件路径

# 调用函数处理
remove_existing_influencers(new_file, directory, output_file)