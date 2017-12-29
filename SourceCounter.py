#!/usr/bin/env python

import sys
import os
import os.path

if not len(sys.argv) >= 2:
    print('usage: SourceCount.py root_directory [-v]')
    exit()

root_dir = sys.argv[1]
verbose_enabled = len(sys.argv) > 2 and sys.argv[2] == '-v'
supported_langs = ['m', 'h', 'swift', 'c', 'cpp', 'storyboard', 'xib', 'plist'] # Of course, I'm an iOS programmer.
source_files = []
counts = {}

if verbose_enabled: print('Enumerating...\n')

for parent, dirs, files in os.walk(root_dir):
    for file in files:
        ext = os.path.splitext(file)[-1][1:]
        if ext in supported_langs:
            if verbose_enabled: print('Found \033[1;32;40m"%s"\033[0m' % file)
            source_files.append(parent + '/' + file)

if verbose_enabled: print('\nCounting...\n')

for file in source_files:
    f = open(file, 'r')
    flines = len(f.readlines())
    ext = os.path.splitext(file)[-1][1:]
    if ext in counts:
        counts[ext] += flines
    else:
        counts[ext] = flines
    f.close()

print('Source Counting Result:  ===========================\n')
total = 0
for lang in counts:
    count = counts[lang]
    total += count
    print('\033[1;31;40m%s:\033[0m \033[1;33;40m%d\033[0m lines' % (lang, count))
print('\n====================================================')
print('Total: \033[1;33;40m%d\033[0m lines, \033[1;33;40m%d\033[0m files\n\n' % (total, len(source_files)))
print('Thanks for using, bye!')
