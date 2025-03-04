# coding:utf-8

import jieba

def word_segment(text):
    # 分词逻辑
    words = jieba.lcut(text)  # 使用 jieba 分词
    word_counts = {}
    for word in words:
        if word in word_counts:
            word_counts[word] += 1
        else:
            word_counts[word] = 1

    # 将结果写入文件（使用 utf-8 编码）
    with open('F:\python_project\词频统计\wordCloud-master\doc\词频统计.txt', 'w', encoding='utf-8') as f:
        for word, count in word_counts.items():
            f.write(f"{word},{count}\n")

    return ' '.join(words)  # 返回分词后的文本