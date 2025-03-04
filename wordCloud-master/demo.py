# coding:utf-8
import os
import sys
import io
from os import path
import chnSegment
import plotWordcloud

# 设置默认编码为 utf-8
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

def clean_text(text):
    """
    过滤掉无法用 gbk 编码的字符
    """
    return text.encode('gbk', errors='ignore').decode('gbk')

if __name__ == '__main__':
    # 获取当前文件所在目录
    d = path.dirname(__file__) if "__file__" in locals() else os.getcwd()

    # 读取文件，使用 utf-8 编码，并处理可能的 BOM 字符
    try:
        with open(path.join(d, 'doc//alice.txt'), encoding='utf-8-sig') as f:
            text = f.read()
    except FileNotFoundError:
        print("文件未找到，请检查路径是否正确！")
        exit(1)
    except UnicodeDecodeError:
        print("文件编码错误，请确保文件是 UTF-8 编码！")
        exit(1)

    # 若是中文文本，则先进行分词操作
    try:
        text = chnSegment.word_segment(text)
        text = clean_text(text)  # 过滤掉无法编码的字符
    except Exception as e:
        print("分词时出错：", e)
        exit(1)

    # 生成词云
    try:
        plotWordcloud.generate_wordcloud(text)
    except Exception as e:
        print("生成词云时出错：", e)
        exit(1)