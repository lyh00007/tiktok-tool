import os
import pandas as pd
from tkinter import Tk, filedialog

def select_file(title):
    root = Tk()
    root.withdraw()  # 隐藏主窗口
    file_path = filedialog.askopenfilename(title=title, filetypes=[("Excel files", "*.xlsx")])
    return file_path

def select_directory(title):
    root = Tk()
    root.withdraw()  # 隐藏主窗口
    directory_path = filedialog.askdirectory(title=title)
    return directory_path

def remove_existing_influencers(new_file, directory, output_file):
    # 读取新达人列表
    new_df = pd.read_excel(new_file, header=None, skiprows=1, usecols=[0])
    new_df.columns = ['达人昵称']

    # 初始化一个字典来存储每个达人及其所在的文件
    influencer_source = {}

    # 遍历目录下的所有.xlsx文件
    for filename in os.listdir(directory):
        # 排除临时文件（以~$开头的文件）
        if filename.endswith('.xlsx') and not filename.startswith('~$') and filename != os.path.basename(new_file):
            file_path = os.path.join(directory, filename)
            try:
                df = pd.read_excel(file_path, header=None, skiprows=1, usecols=[0])
                df.columns = ['达人昵称']
                for influencer in df['达人昵称']:
                    if influencer in influencer_source:
                        influencer_source[influencer].append(filename)
                    else:
                        influencer_source[influencer] = [filename]
            except Exception as e:
                print(f"读取文件 {filename} 时出错：{e}")

    # 找出新文件中已经存在于已有达人文件中的达人
    removed_influencers = new_df[new_df['达人昵称'].isin(influencer_source.keys())]

    # 剔除已经存在的达人
    unique_df = new_df[~new_df['达人昵称'].isin(influencer_source.keys())]

    # 保存剔除后的达人列表到新文件
    unique_df.to_excel(output_file, index=False, header=['达人昵称'])

    # 打印被剔除的达人及其所在的文件
    if not removed_influencers.empty:
        print("以下达人已被剔除：")
        for influencer in removed_influencers['达人昵称']:
            source_files = influencer_source.get(influencer, [])
            print(f"达人昵称: {influencer}, 来源文件: {', '.join(source_files)}")
    else:
        print("没有需要剔除的达人。")

    print(f"剔除后的达人列表已保存到 {output_file}")

# 手动选择新达人列表文件
new_file = select_file("请选择新达人列表文件")
if not new_file:
    print("未选择新达人列表文件，程序退出。")
    exit()

# 手动选择目录
directory = select_directory("请选择已有达人列表所在的目录")
if not directory:
    print("未选择目录，程序退出。")
    exit()

# 手动选择输出文件路径
output_file = filedialog.asksaveasfilename(
    title="请选择保存剔除后达人列表的文件",
    defaultextension=".xlsx",
    filetypes=[("Excel files", "*.xlsx")]
)
if not output_file:
    print("未选择输出文件路径，程序退出。")
    exit()

# 调用函数处理
remove_existing_influencers(new_file, directory, output_file)