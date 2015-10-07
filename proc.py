
#!/usr/bin/python

import sys
import json
import re
import os


def main(argv):
    if len(argv) < 2:
        sys.exit('Usage: proc.py <inputfile>')
    preprocess(argv[1])
    extractJson()


def formatLine(line, lineSplitArr):
    regex = r"[\[\]\{\}]+"
    match = re.findall(regex, line)

    if match:
        firstIndex = line.index(match[0])
        lineSplitArr.append(line[0: firstIndex])
        lineSplitArr.append(line[firstIndex: firstIndex + 1])
        line = line[firstIndex + 1: len(line)]
        formatLine(line, lineSplitArr)
    else:
        lineSplitArr.append(line)


def preprocess(filename):
    f = open(filename, 'r')
    w = open('preprocessed.html', 'w')
    lineNumber = 0
    for line in f:
        lineNumber += 1
        if ('[' in line) or ('{' in line) or \
                (']' in line) or ('}' in line):
            lineSplitArr = []
            formatLine(line, lineSplitArr)
            for splitline in lineSplitArr:
                w.write(splitline)
                w.write('\n')
        else:
            w.write(line)
    w.close()
    f.close()


def extractJson():
    f = open('preprocessed.html', 'r')
    lineNumber = 0
    jsonStart = []
    jsonObj = []
    jsonObjs = []
    jsonStartChar = ""
    jsonEndChar = ""

    for line in f:
        lineNumber += 1

        if jsonStartChar:
            if jsonStartChar in line:
                jsonStart.append(jsonStartChar)
            elif jsonEndChar in line:
                if jsonStart:
                    jsonStart.pop()
                else:
                    jsonObj.append(line.rstrip())
                    jsonObjs.append(jsonObj)
                    jsonObj = []
                    jsonStartChar = ""
                    jsonEndChar = ""
            else:
                jsonObj.append(line.rstrip())
        else:
            if '[' in line:
                jsonStartChar = '['
                jsonEndChar = ']'
                jsonObj.append(line.rstrip())
            elif '{' in line:
                jsonStartChar = '{'
                jsonEndChar = '}'
                jsonObj.append(line.rstrip())

    if jsonStartChar:
        jsonObjs.append(jsonObj)

    for jobj in jsonObjs:
        jsonStr = ''
        for j in jobj:
            jsonStr += j
        print jsonStr

    f.close()
    os.remove("preprocessed.html")

main(sys.argv)
