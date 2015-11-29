import yaml
import csv
import sys
import urllib2

# try:
#     if sys.argv[1]:
#         csvinfile = str(sys.argv[1])
# except:
#     print "no input argument given - using schedule.csv"
#     csvinfile = "schedule.csv"
# f = open(csvinfile, 'rt')

schedule_url = 'https://docs.google.com/spreadsheets/d/16RfbdrnDHhRgP2iZwNw6AVSyWy5VoKn0nB0CpyMa658/pub?gid=0&single=true&output=csv'
csvin = urllib2.urlopen(schedule_url).read().splitlines()

reader = csv.DictReader(csvin)
yamlout = []
for row in reader:
    if "Day" in row['Time']:
      yamlout.append({'day':row['Time'],'date':row['Session'],'timeslots':[] })
    else:
      if row['Track1']:
        yamlout[-1]['timeslots'].append({
          'time': row['Time'],
          'session': row['Session'],
          'title': row['Track1'],
          'room': row['Room'],
          'instructor': row['InstructorsTrack1'],
          'link': row['link1'],
          'track': 1
          })
      if row['Track2']:
        yamlout[-1]['timeslots'].append({
          'time': row['Time'],
          'session': row['Session'],
          'title': row['Track2'],
          'room': row['Room2'],
          'instructor': row['InstructorsTrack2'],
          'link': row['link2'],
          'track': 2
          })
      if row['Track1'] == '' and row['Track2'] == '':
        yamlout[-1]['timeslots'].append({
          'time': row['Time'],
          'session': row['Session'],
          'room': row['Room'],
          'track': 0
          })


try:
    if sys.argv[1]:
        yamloutfile = str(sys.argv[1])
except:
    print "no input argument given - using schedule.csv"
    yamloutfile = "schedule.yml"

with open(yamloutfile, 'w') as outfile:
    outfile.write( yaml.dump(yamlout, default_flow_style=False) )

print "Generated schedule.yml"

# pp = pprint.PrettyPrinter(indent=4)
# pp.pprint(yamlout)
