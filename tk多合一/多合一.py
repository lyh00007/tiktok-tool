import os
import sys
import pandas as pd
from zipfile import ZipFile
import xml.etree.ElementTree as ET
from openpyxl import Workbook
from PyQt5.QtWidgets import (QApplication, QMainWindow, QWidget, QVBoxLayout, 
                            QHBoxLayout, QLabel, QLineEdit, QPushButton, 
                            QFileDialog, QMessageBox, QTabWidget, QTextEdit, 
                            QScrollArea, QGroupBox, QSpinBox)
from PyQt5.QtCore import Qt

class DataToolsApp(QMainWindow):
    def __init__(self):
        super().__init__()
        self.setWindowTitle("达人处理工具1.0.1")
        self.setGeometry(100, 100, 800, 600)
        
        self.initUI()
        
    def initUI(self):
        # 主窗口部件
        main_widget = QWidget()
        self.setCentralWidget(main_widget)
        main_layout = QVBoxLayout()
        
        # 创建标签页
        self.tabs = QTabWidget()
        
        # 创建三个标签页
        self.tab_extractor = QWidget()
        self.tab_splitter = QWidget()
        self.tab_dedupe = QWidget()
        
        # 添加到标签页
        self.tabs.addTab(self.tab_extractor, "ID提取工具")
        self.tabs.addTab(self.tab_splitter, "Excel分割工具")
        self.tabs.addTab(self.tab_dedupe, "达人去重工具")
        
        # 初始化各个标签页
        self.setup_extractor_tab()
        self.setup_splitter_tab()
        self.setup_dedupe_tab()
        
        # 添加到主布局
        main_layout.addWidget(self.tabs)
        main_widget.setLayout(main_layout)
    
    def setup_extractor_tab(self):
        layout = QVBoxLayout()
        
        # 输入文件夹选择
        input_group = QGroupBox("输入设置")
        input_layout = QVBoxLayout()
        
        hbox1 = QHBoxLayout()
        self.input_label = QLabel("输入文件夹:")
        self.input_path = QLineEdit()
        self.input_path.setPlaceholderText("请选择包含Excel文件的文件夹")
        self.input_button = QPushButton("浏览...")
        self.input_button.clicked.connect(self.select_input_folder)
        hbox1.addWidget(self.input_label)
        hbox1.addWidget(self.input_path)
        hbox1.addWidget(self.input_button)
        
        input_layout.addLayout(hbox1)
        input_group.setLayout(input_layout)
        
        # 输出文件选择
        output_group = QGroupBox("输出设置")
        output_layout = QVBoxLayout()
        
        hbox2 = QHBoxLayout()
        self.output_label = QLabel("输出文件:")
        self.output_path = QLineEdit()
        self.output_path.setPlaceholderText("请选择输出Excel文件路径")
        self.output_button = QPushButton("浏览...")
        self.output_button.clicked.connect(self.select_output_file)
        hbox2.addWidget(self.output_label)
        hbox2.addWidget(self.output_path)
        hbox2.addWidget(self.output_button)
        
        output_layout.addLayout(hbox2)
        output_group.setLayout(output_layout)
        
        # 执行按钮
        self.execute_button = QPushButton("开始提取达人ID")
        self.execute_button.clicked.connect(self.execute_extraction)
        
        # 日志输出
        self.log_text = QTextEdit()
        self.log_text.setReadOnly(True)
        
        # 添加到主布局
        layout.addWidget(input_group)
        layout.addWidget(output_group)
        layout.addWidget(self.execute_button)
        layout.addWidget(self.log_text)
        
        self.tab_extractor.setLayout(layout)
    
    def setup_splitter_tab(self):
        layout = QVBoxLayout()
        
        # 输入文件选择
        input_group = QGroupBox("输入设置")
        input_layout = QVBoxLayout()
        
        hbox1 = QHBoxLayout()
        self.split_input_label = QLabel("输入文件:")
        self.split_input_path = QLineEdit()
        self.split_input_path.setPlaceholderText("请选择要分割的Excel文件")
        self.split_input_button = QPushButton("浏览...")
        self.split_input_button.clicked.connect(self.select_split_input_file)
        hbox1.addWidget(self.split_input_label)
        hbox1.addWidget(self.split_input_path)
        hbox1.addWidget(self.split_input_button)
        
        input_layout.addLayout(hbox1)
        input_group.setLayout(input_layout)
        
        # 输出设置
        output_group = QGroupBox("输出设置")
        output_layout = QVBoxLayout()
        
        hbox2 = QHBoxLayout()
        self.split_output_label = QLabel("输出文件夹:")
        self.split_output_path = QLineEdit()
        self.split_output_path.setPlaceholderText("请选择输出文件夹")
        self.split_output_button = QPushButton("浏览...")
        self.split_output_button.clicked.connect(self.select_split_output_folder)
        hbox2.addWidget(self.split_output_label)
        hbox2.addWidget(self.split_output_path)
        hbox2.addWidget(self.split_output_button)
        
        hbox3 = QHBoxLayout()
        self.chunk_label = QLabel("每组数量:")
        self.chunk_spin = QSpinBox()
        self.chunk_spin.setRange(1, 1000)
        self.chunk_spin.setValue(50)
        hbox3.addWidget(self.chunk_label)
        hbox3.addWidget(self.chunk_spin)
        hbox3.addStretch()
        
        hbox4 = QHBoxLayout()
        self.prefix_label = QLabel("文件名前缀:")
        self.prefix_edit = QLineEdit()
        hbox4.addWidget(self.prefix_label)
        hbox4.addWidget(self.prefix_edit)
        
        hbox5 = QHBoxLayout()
        self.remark_label = QLabel("备注信息:")
        self.remark_edit = QLineEdit()
        self.remark_edit.setText("粉丝数: 6K-20K | 内容类型: 视频数据")
        hbox5.addWidget(self.remark_label)
        hbox5.addWidget(self.remark_edit)
        
        output_layout.addLayout(hbox2)
        output_layout.addLayout(hbox3)
        output_layout.addLayout(hbox4)
        output_layout.addLayout(hbox5)
        output_group.setLayout(output_layout)
        
        # 执行按钮
        self.split_button = QPushButton("开始分割")
        self.split_button.clicked.connect(self.start_split)
        
        # 日志输出
        self.split_log_text = QTextEdit()
        self.split_log_text.setReadOnly(True)
        
        # 添加到主布局
        layout.addWidget(input_group)
        layout.addWidget(output_group)
        layout.addWidget(self.split_button)
        layout.addWidget(self.split_log_text)
        
        self.tab_splitter.setLayout(layout)
    
    def setup_dedupe_tab(self):
        layout = QVBoxLayout()
        
        # 文件选择
        file_group = QGroupBox("文件选择")
        file_layout = QVBoxLayout()
        
        hbox1 = QHBoxLayout()
        self.dedupe_new_label = QLabel("新达人列表:")
        self.dedupe_new_path = QLineEdit()
        self.dedupe_new_path.setPlaceholderText("请选择需要去重的新达人列表")
        self.dedupe_new_button = QPushButton("浏览...")
        self.dedupe_new_button.clicked.connect(self.select_dedupe_new_file)
        hbox1.addWidget(self.dedupe_new_label)
        hbox1.addWidget(self.dedupe_new_path)
        hbox1.addWidget(self.dedupe_new_button)
        
        hbox2 = QHBoxLayout()
        self.dedupe_dir_label = QLabel("已有达人目录:")
        self.dedupe_dir_path = QLineEdit()
        self.dedupe_dir_path.setPlaceholderText("请选择已有达人列表所在目录")
        self.dedupe_dir_button = QPushButton("浏览...")
        self.dedupe_dir_button.clicked.connect(self.select_dedupe_directory)
        hbox2.addWidget(self.dedupe_dir_label)
        hbox2.addWidget(self.dedupe_dir_path)
        hbox2.addWidget(self.dedupe_dir_button)
        
        hbox3 = QHBoxLayout()
        self.dedupe_output_label = QLabel("输出文件:")
        self.dedupe_output_path = QLineEdit()
        self.dedupe_output_path.setPlaceholderText("请选择去重后保存的文件")
        self.dedupe_output_button = QPushButton("浏览...")
        self.dedupe_output_button.clicked.connect(self.select_dedupe_output_file)
        hbox3.addWidget(self.dedupe_output_label)
        hbox3.addWidget(self.dedupe_output_path)
        hbox3.addWidget(self.dedupe_output_button)
        
        file_layout.addLayout(hbox1)
        file_layout.addLayout(hbox2)
        file_layout.addLayout(hbox3)
        file_group.setLayout(file_layout)
        
        # 执行按钮
        self.dedupe_button = QPushButton("开始去重")
        self.dedupe_button.clicked.connect(self.remove_existing_influencers)
        
        # 结果输出
        self.dedupe_result_text = QTextEdit()
        self.dedupe_result_text.setReadOnly(True)
        
        # 添加到主布局
        layout.addWidget(file_group)
        layout.addWidget(self.dedupe_button)
        layout.addWidget(self.dedupe_result_text)
        
        self.tab_dedupe.setLayout(layout)
    
    # ID提取工具相关方法
    def select_input_folder(self):
        folder = QFileDialog.getExistingDirectory(self, "选择输入文件夹")
        if folder:
            self.input_path.setText(folder)
    
    def select_output_file(self):
        file, _ = QFileDialog.getSaveFileName(self, "选择输出文件", "", "Excel文件 (*.xlsx)")
        if file:
            if not file.endswith('.xlsx'):
                file += '.xlsx'
            self.output_path.setText(file)
    
    def log_message(self, message):
        self.log_text.append(message)
        self.log_text.ensureCursorVisible()
    
    def read_xlsx_data(self, path):
        """使用zipfile和xml解析Excel文件内容"""
        try:
            with ZipFile(path, 'r') as z:
                # 读取共享字符串表
                shared_strings = []
                if 'xl/sharedStrings.xml' in z.namelist():
                    root = ET.fromstring(z.read('xl/sharedStrings.xml'))
                    for si in root.findall('{http://schemas.openxmlformats.org/spreadsheetml/2006/main}si'):
                        text_parts = []
                        for t in si.iter('{http://schemas.openxmlformats.org/spreadsheetml/2006/main}t'):
                            text_parts.append(t.text or "")
                        shared_strings.append("".join(text_parts))

                # 读取第一个工作表
                sheet_name = 'xl/worksheets/sheet1.xml'
                if sheet_name not in z.namelist():
                    return None, None

                root = ET.fromstring(z.read(sheet_name))
                rows_data = []
                for row in root.iter('{http://schemas.openxmlformats.org/spreadsheetml/2006/main}row'):
                    row_data = []
                    for c in row.iter('{http://schemas.openxmlformats.org/spreadsheetml/2006/main}c'):
                        cell_type = c.get('t')
                        value_elem = c.find('{http://schemas.openxmlformats.org/spreadsheetml/2006/main}v')
                        if value_elem is None:
                            row_data.append("")
                        else:
                            value = value_elem.text
                            if cell_type == 's':  # 共享字符串
                                value = shared_strings[int(value)] if value and shared_strings else ""
                            row_data.append(value)
                    rows_data.append(row_data)
                
                # 跳过第一行（"数据导出自出海匠"），第二行作为表头
                if len(rows_data) < 2:
                    return None, None
                
                return rows_data[1], rows_data[2:]  # 返回表头和数据行（跳过第一行）
        except Exception as e:
            self.log_message(f"读取文件 {os.path.basename(path)} 时出错: {str(e)}")
            return None, None
    
    def execute_extraction(self):
        input_folder = self.input_path.text()
        output_file = self.output_path.text()
        
        if not input_folder or not output_file:
            QMessageBox.warning(self, "警告", "请先选择输入文件夹和输出文件路径！")
            return
        
        try:
            # 获取所有Excel文件
            excel_files = [f for f in os.listdir(input_folder) if f.endswith(('.xlsx', '.xls'))]
            if not excel_files:
                QMessageBox.warning(self, "警告", "输入文件夹中没有找到Excel文件！")
                return
            
            # 使用列表保持顺序，避免重复
            all_ids = []
            seen_ids = set()
            
            # 处理每个Excel文件
            for excel_file in excel_files:
                try:
                    file_path = os.path.join(input_folder, excel_file)
                    header, data = self.read_xlsx_data(file_path)
                    
                    if header is None:
                        self.log_message(f"警告: 文件 {excel_file} 格式不符合要求（需要至少两行数据）")
                        continue
                    
                    # 查找达人ID列
                    col_index = -1
                    for col_name in ["达人 ID", "达人ID"]:
                        if col_name in header:
                            col_index = header.index(col_name)
                            break
                    
                    if col_index == -1:
                        self.log_message(f"警告: 文件 {excel_file} 中找不到'达人 ID'列！")
                        continue
                    
                    # 提取达人ID，按原顺序添加，不重复
                    for row in data:
                        if col_index < len(row) and row[col_index]:
                            creator_id = str(row[col_index]).strip()
                            if creator_id and creator_id not in seen_ids:
                                all_ids.append(creator_id)
                                seen_ids.add(creator_id)
                    
                    self.log_message(f"已处理文件: {excel_file}，提取到 {len(all_ids)} 个唯一ID")
                    
                except Exception as e:
                    self.log_message(f"处理文件 {excel_file} 时出错: {str(e)}")
                    continue
            
            # 创建并保存输出文件
            if not all_ids:
                QMessageBox.warning(self, "警告", "没有找到任何达人ID！")
                return
            
            try:
                wb = Workbook()
                ws = wb.active
                ws.append(["达人用户名（请勿删除此行。每行一个用户名，最多 100 位达人。）"])
                for creator_id in all_ids:
                    ws.append([creator_id])
                wb.save(output_file)
                
                self.log_message(f"成功提取 {len(all_ids)} 个达人ID到 {output_file}")
                QMessageBox.information(self, "完成", f"成功提取 {len(all_ids)} 个达人ID到 {output_file}")
            except Exception as e:
                self.log_message(f"保存输出文件时出错: {str(e)}")
                QMessageBox.critical(self, "错误", f"保存输出文件时出错: {str(e)}")
            
        except Exception as e:
            self.log_message(f"处理过程中发生错误: {str(e)}")
            QMessageBox.critical(self, "错误", f"处理过程中发生错误: {str(e)}")
    
    # Excel分割工具相关方法
    def select_split_input_file(self):
        file, _ = QFileDialog.getOpenFileName(self, "选择输入文件", "", "Excel文件 (*.xlsx)")
        if file:
            self.split_input_path.setText(file)
            # 自动设置默认前缀为原文件名(不带扩展名)
            filename = os.path.splitext(os.path.basename(file))[0]
            self.prefix_edit.setText(filename)
    
    def select_split_output_folder(self):
        folder = QFileDialog.getExistingDirectory(self, "选择输出文件夹")
        if folder:
            self.split_output_path.setText(folder)
    
    def split_log_message(self, message):
        self.split_log_text.append(message)
        self.split_log_text.ensureCursorVisible()
    
    def start_split(self):
        # 获取输入值
        input_file = self.split_input_path.text()
        output_folder = self.split_output_path.text()
        chunk_size = self.chunk_spin.value()
        prefix = self.prefix_edit.text()
        remark = self.remark_edit.text()
        
        # 验证输入
        if not input_file:
            QMessageBox.warning(self, "警告", "请选择输入文件！")
            return
        if not output_folder:
            QMessageBox.warning(self, "警告", "请选择输出文件夹！")
            return
        
        self.split_log_message("开始处理...")
        try:
            df = pd.read_excel(input_file, header=None)
            usernames = df[0].tolist()[1:]  # 跳过标题行
            
            file_count = 0
            for i in range(0, len(usernames), chunk_size):
                wb = Workbook()
                ws = wb.active
                # 写入标题行
                ws.append(["达人用户名（请勿删除此行。每行一个用户名，最多 100 位达人。）", "备注"])
                # 写入统一备注
                ws.append(["", remark])
                
                # 写入用户名
                for username in usernames[i:i + chunk_size]:
                    ws.append([username, ""])
                
                file_count += 1
                # 生成文件名: 前缀_编号.xlsx
                output_file = os.path.join(output_folder, f"{prefix}_{file_count}.xlsx")
                wb.save(output_file)
                self.split_log_message(f"已生成: {output_file}")
            
            self.split_log_message(f"处理完成，共生成 {file_count} 个文件")
            QMessageBox.information(self, "完成", f"成功分割为 {file_count} 个文件！")
        except Exception as e:
            self.split_log_message(f"错误: {str(e)}")
            QMessageBox.critical(self, "错误", f"处理失败: {str(e)}")
    
    # 达人去重工具相关方法
    def select_dedupe_new_file(self):
        file, _ = QFileDialog.getOpenFileName(self, "选择新达人列表", "", "Excel文件 (*.xlsx)")
        if file:
            self.dedupe_new_path.setText(file)
    
    def select_dedupe_directory(self):
        folder = QFileDialog.getExistingDirectory(self, "选择已有达人目录")
        if folder:
            self.dedupe_dir_path.setText(folder)
    
    def select_dedupe_output_file(self):
        file, _ = QFileDialog.getSaveFileName(self, "选择输出文件", "", "Excel文件 (*.xlsx)")
        if file:
            if not file.endswith('.xlsx'):
                file += '.xlsx'
            self.dedupe_output_path.setText(file)
    
    def dedupe_log_message(self, message):
        self.dedupe_result_text.append(message)
        self.dedupe_result_text.ensureCursorVisible()
    
    def remove_existing_influencers(self):
        # 获取文件路径
        new_file = self.dedupe_new_path.text()
        directory = self.dedupe_dir_path.text()
        output_file = self.dedupe_output_path.text()

        if not new_file or not directory or not output_file:
            QMessageBox.warning(self, "警告", "请选择所有必要的文件和目录！")
            return

        try:
            # 读取新达人列表
            new_df = pd.read_excel(new_file, header=None, skiprows=1, usecols=[0])
            new_df.columns = ['达人昵称']
            new_df = new_df.dropna()  # 过滤掉空值

            # 初始化一个字典来存储每个达人及其所在的文件
            influencer_source = {}

            # 递归遍历目录下的所有.xlsx文件（包括子文件夹）
            for root, dirs, files in os.walk(directory):
                for filename in files:
                    # 排除临时文件（以~$开头的文件）
                    if filename.endswith('.xlsx') and not filename.startswith('~$') and filename != os.path.basename(new_file):
                        file_path = os.path.join(root, filename)
                        try:
                            df = pd.read_excel(file_path, header=None, skiprows=1, usecols=[0])
                            df.columns = ['达人昵称']
                            df = df.dropna()  # 过滤掉空值
                            for influencer in df['达人昵称']:
                                if pd.notna(influencer):  # 确保达人昵称不是空值
                                    if influencer in influencer_source:
                                        if filename not in influencer_source[influencer]:  # 避免重复添加文件名
                                            influencer_source[influencer].append(file_path)  # 存储完整路径
                                    else:
                                        influencer_source[influencer] = [file_path]
                            self.dedupe_log_message(f"已扫描文件: {file_path}")
                        except Exception as e:
                            self.dedupe_log_message(f"警告: 读取文件 {file_path} 时出错：{e}")

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
            self.dedupe_result_text.clear()
            if not removed_influencers.empty:
                self.dedupe_result_text.append("以下达人已被剔除：\n")
                for influencer in removed_influencers['达人昵称']:
                    if pd.notna(influencer):  # 确保达人昵称不是空值
                        source_files = influencer_source.get(influencer, [])
                        self.dedupe_result_text.append(f"达人昵称: {influencer}, 来源文件: {', '.join(source_files)}\n")
            else:
                self.dedupe_result_text.append("没有需要剔除的达人。\n")

            self.dedupe_result_text.append(f"\n处理完成，结果已保存到 {output_file}")
            QMessageBox.information(self, "完成", f"剔除后的达人列表已保存到 {output_file}")
        except Exception as e:
            self.dedupe_result_text.append(f"处理过程中发生错误：{e}")
            QMessageBox.critical(self, "错误", f"处理过程中发生错误：{e}")

if __name__ == "__main__":
    app = QApplication(sys.argv)
    window = DataToolsApp()
    window.show()
    sys.exit(app.exec_())