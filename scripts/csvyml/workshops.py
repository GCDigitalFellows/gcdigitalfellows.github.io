import yaml
import csv
import sys
import urllib2

# try:
#     if sys.argv[1]:
#         csvinfile = str(sys.argv[1])
# except:
#     print "no input argument given - using workshops.csv"
#     csvinfile = "workshops.csv"
# f = open(csvinfile, 'rt')

workshops_url = 'https://docs.google.com/spreadsheets/d/16RfbdrnDHhRgP2iZwNw6AVSyWy5VoKn0nB0CpyMa658/pub?gid=585110058&single=true&output=csv'
csvin = urllib2.urlopen(workshops_url).read().splitlines()

reader = csv.DictReader(csvin)
yamlout = []
for row in reader:
    yamlout.append(row)

try:
    if sys.argv[1]:
        yamloutfile = str(sys.argv[1])
except:
    print "no input argument given - using workshops.csv"
    yamloutfile = "workshops.yml"

with open(yamloutfile, 'w') as outfile:
    outfile.write( yaml.dump(yamlout, default_flow_style=False) )

print "Generated workshops.yml"

# pp = pprint.PrettyPrinter(indent=2)
# pp.pprint(yamlout)
