# coding: utf-8

import json
import sys

def convert(filename):
    name = ""
    result = []
    y = 0
    with open(filename) as cellsfile:
        lines = cellsfile.readlines()
        name = lines[0][7:-2] # They use \r\n…
        for line in lines[1:]:
            if line[0] != '!':
                x = 0
                for c in line[:-2]:
                    if c == '.':
                        x += 1
                    elif c == 'O':
                        x += 1
                        result.append([x, y])
                y += 1
    with open('%s.json' % filename, 'w') as jsonfile:
        json.dump(result, jsonfile)
    return (name, result)

if __name__ == '__main__':
    if len(sys.argv) > 2 and sys.argv[1] in ['-c', '--collect']:
        collection = {
            k: v for k,v in map(convert, sys.argv[2:])
        }
        with open('collection.json', 'w') as collectionfile:
            json.dump(collection, collectionfile, sort_keys=True)
    elif len(sys.argv) > 1:
        for filename in sys.argv[1:]:
            convert(filename)
    else:
        print('Usage: converter.py [-c or --collect] [filename 1] ... [filename n]')
