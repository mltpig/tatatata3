#!/usr/bin/python
# -*- coding:utf-8 -*-

import os
 
outer_path = 'Users/zhuzhiwei/Documents/work/study/game/ntd/assets/resources/icon/talent'
folderlist = os.listdir(outer_path)          #列举文件夹

i = 0
for item in folderlist:
    total_num_file = len(filelist)       #单个文件夹内图片的总数
    if item.endswith('.png'):
        src = os.path.join(os.path.abspath(outer_path), item)           #原图的地址
        dst = os.path.join(os.path.abspath(outer_path), str(item) + 'talent_' + str(i) + '.png')        #新图的地址（这里可以把str(folder) + '_' + str(i) + '.jpg'改成你想改的名称）
        try:
            os.rename(src, dst)
            print 'converting %s to %s ...' % (src, dst)
            i += 1
        except:
            continue
print 'total %d to rename & converted %d jpgs' % (total_num_file, i)