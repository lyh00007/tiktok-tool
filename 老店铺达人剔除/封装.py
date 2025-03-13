import os
import pandas as pd
from tkinter import Tk, filedialog, messagebox, Label, Button, Entry, StringVar, Text, Scrollbar

# 创建主窗口
root = Tk()
root.title("达人去重神器")
root.geometry("600x400")

# 定义全局变量
new_file_path = StringVar()
directory_path = StringVar()
output_file_path = StringVar()

def select_new_file():
    file_path = filedialog.askopenfilename(title="请选择新达人列表文件", filetypes=[("Excel files", "*.xlsx")])
    if file_path:
        new_file_path.set(file_path)

def select_directory():
    dir_path = filedialog.askdirectory(title="请选择已有达人列表所在的目录")
    if dir_path:
        directory_path.set(dir_path)

def select_output_file():
    file_path = filedialog.asksaveasfilename(
        title="请选择保存剔除后达人列表的文件",
        defaultextension=".xlsx",
        filetypes=[("Excel files", "*.xlsx")]
    )
    if file_path:
        output_file_path.set(file_path)

def remove_existing_influencers():
    # 获取文件路径
    new_file = new_file_path.get()
    directory = directory_path.get()
    output_file = output_file_path.get()

    if not new_file or not directory or not output_file:
        messagebox.showerror("错误", "请选择所有必要的文件和目录！")
        return

    try:
        # 读取新达人列表
        new_df = pd.read_excel(new_file, header=None, skiprows=1, usecols=[0])
        new_df.columns = ['达人昵称']
        new_df = new_df.dropna()  # 过滤掉空值

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
                    df = df.dropna()  # 过滤掉空值
                    for influencer in df['达人昵称']:
                        if pd.notna(influencer):  # 确保达人昵称不是空值
                            if influencer in influencer_source:
                                if filename not in influencer_source[influencer]:  # 避免重复添加文件名
                                    influencer_source[influencer].append(filename)
                            else:
                                influencer_source[influencer] = [filename]
                except Exception as e:
                    messagebox.showwarning("警告", f"读取文件 {filename} 时出错：{e}")

        # 找出新文件中已经存在于已有达人文件中的达人
        removed_influencers = new_df[new_df['达人昵称'].isin(influencer_source.keys())]

        # 剔除已经存在的达人
        unique_df = new_df[~new_df['达人昵称'].isin(influencer_source.keys())]

        # 添加表头
        result_df = pd.DataFrame(['达人用户名（请勿删除此行。每行一个用户名，最多 100 位达人。）'])
        result_df = pd.concat([result_df, unique_df], ignore_index=True)

        # 保存剔除后的达人列表到新文件
        result_df.to_excel(output_file, index=False, header=False)

        # 显示被剔除的达人及其所在的文件
        result_text.delete(1.0, "end")  # 清空文本框
        if not removed_influencers.empty:
            result_text.insert("end", "以下达人已被剔除：\n")
            for influencer in removed_influencers['达人昵称']:
                if pd.notna(influencer):  # 确保达人昵称不是空值
                    source_files = influencer_source.get(influencer, [])
                    result_text.insert("end", f"达人昵称: {influencer}, 来源文件: {', '.join(source_files)}\n")
        else:
            result_text.insert("end", "没有需要剔除的达人。\n")

        messagebox.showinfo("完成", f"剔除后的达人列表已保存到 {output_file}")
    except Exception as e:
        messagebox.showerror("错误", f"处理过程中发生错误：{e}")

# 创建界面组件
Label(root, text="需要去重\n达人列表文件:").grid(row=0, column=0, padx=10, pady=10)
Entry(root, textvariable=new_file_path, width=40).grid(row=0, column=1, padx=10, pady=10)
Button(root, text="选择文件", command=select_new_file).grid(row=0, column=2, padx=10, pady=10)

Label(root, text="达人目录文件夹:").grid(row=1, column=0, padx=10, pady=10)
Entry(root, textvariable=directory_path, width=40).grid(row=1, column=1, padx=10, pady=10)
Button(root, text="选择目录", command=select_directory).grid(row=1, column=2, padx=10, pady=10)

Label(root, text="去重后存放路径:").grid(row=2, column=0, padx=10, pady=10)
Entry(root, textvariable=output_file_path, width=40).grid(row=2, column=1, padx=10, pady=10)
Button(root, text="选择文件", command=select_output_file).grid(row=2, column=2, padx=10, pady=10)

Button(root, text="开始处理", command=remove_existing_influencers).grid(row=3, column=1, pady=10)

# 创建文本框和滚动条
result_text = Text(root, height=10, width=70)
result_text.grid(row=4, column=0, columnspan=3, padx=10, pady=10)

scrollbar = Scrollbar(root, command=result_text.yview)
scrollbar.grid(row=4, column=3, sticky="ns")
result_text.config(yscrollcommand=scrollbar.set)

# 运行主循环
root.mainloop()