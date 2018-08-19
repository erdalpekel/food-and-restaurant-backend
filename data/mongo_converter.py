import argparse
import re

parser = argparse.ArgumentParser(description="This script converts JSONs from https://next.json-generator.com to mongoimport compatible JSON. Pass your JSON file and it will place a compatible_restaurants.json in the directory.", formatter_class=argparse.RawTextHelpFormatter)
parser.add_argument("-s", type=argparse.FileType('r'), help="Filename to be passed")
args = parser.parse_args()

json_file = args.s

with open (json_file.name, 'r' ) as f:
    content = f.read()

# e.g. "coordinates": ["11.7", ... -> "coordinates": [11.7, ...
content_longitue_fixed = re.sub('\["([0-9]+\.{0,1}[0-9]*)"', r'[\1', content, flags = re.M)

# e.g. "coordinates": ..., "11.7"], ... -> "coordinates": ..., 11.7]
content_latitude_fixed = re.sub('"([0-9]+\.{0,1}[0-9]*)"]', r'\1]', content_longitue_fixed, flags = re.M)

content_price_fixed = re.sub('"price"\:[ \t]"([0-9]+\.{0,1}[0-9]*)"', r'"price":\1', content_latitude_fixed, flags = re.M)

with open('compatible_restaurants.json', 'w+') as f:
    f.write(content_price_fixed)